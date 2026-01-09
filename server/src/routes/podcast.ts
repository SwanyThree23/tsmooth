import { Router, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

interface PodcastSource {
  type: 'pdf' | 'website' | 'document' | 'youtube';
  url?: string;
  content?: string;
  title: string;
}

// Store podcast sources (in production, use database)
const podcastSources = new Map<string, PodcastSource[]>();

// Add source
router.post('/sources', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, url, content, title } = req.body;

    if (!type || !title) {
      throw createError('Type and title are required', 400);
    }

    const userId = req.user!.id;
    const sources = podcastSources.get(userId) || [];

    sources.push({ type, url, content, title });
    podcastSources.set(userId, sources);

    res.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
});

// Get sources
router.get('/sources', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sources = podcastSources.get(userId) || [];

    res.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
});

// Generate podcast
router.post('/generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { host1, host2, duration, sources } = req.body;

    if (!host1 || !host2 || !duration) {
      throw createError('Host names and duration are required', 400);
    }

    const userId = req.user!.id;
    const podcastSourcesData = sources || podcastSources.get(userId) || [];

    if (podcastSourcesData.length === 0) {
      throw createError('No sources provided', 400);
    }

    // Step 1: Generate script using AI
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw createError('OpenRouter API key not configured', 500);
    }

    const prompt = `Create a ${duration}-minute podcast script between two hosts: ${host1} and ${host2}.

Sources:
${podcastSourcesData.map((s: PodcastSource) => `- ${s.title} (${s.type}): ${s.url || s.content || ''}`).join('\n')}

Format the script as a natural conversation with clear speaker labels. Make it engaging and informative.`;

    const scriptResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tsmooth-productions.com',
        'X-Title': 'T-Smooth Productions',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!scriptResponse.ok) {
      throw createError('Failed to generate script', 500);
    }

    const scriptData = await scriptResponse.json();
    const script = scriptData.choices[0]?.message?.content || '';

    res.json({
      success: true,
      data: {
        script,
        hosts: { host1, host2 },
        duration,
        sources: podcastSourcesData,
        status: 'generated',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
