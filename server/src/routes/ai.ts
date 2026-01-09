import { Router, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// OpenRouter Chat
router.post('/chat', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      throw createError('Message is required', 400);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw createError('OpenRouter API key not configured', 500);
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant for T-Smooth Productions. You help with creative production, video editing, streaming, and project management tasks.',
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tsmooth-productions.com',
        'X-Title': 'T-Smooth Productions',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw createError(`OpenRouter API error: ${error}`, response.status);
    }

    const data = await response.json();

    res.json({
      success: true,
      data: {
        message: data.choices[0]?.message?.content || 'No response',
        usage: data.usage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// HeyGen Video Generation
router.post('/heygen/generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { script, avatar } = req.body;

    if (!script) {
      throw createError('Script is required', 400);
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw createError('HeyGen API key not configured', 500);
    }

    // Note: This is a simplified version. Actual HeyGen API may differ
    const response = await fetch('https://api.heygen.com/v1/video.generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatar || 'default',
          },
          voice: {
            type: 'text',
            input_text: script,
          },
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw createError(`HeyGen API error: ${error}`, response.status);
    }

    const data = await response.json();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ElevenLabs Text-to-Speech
router.post('/elevenlabs/generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      throw createError('Text is required', 400);
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw createError('ElevenLabs API key not configured', 500);
    }

    const voice = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Bella)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw createError(`ElevenLabs API error: ${error}`, response.status);
    }

    // Return audio as base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.json({
      success: true,
      data: {
        audio: base64Audio,
        mimeType: 'audio/mpeg',
      },
    });
  } catch (error) {
    next(error);
  }
});

// WisprFlow Transcription
router.post('/wisprflow/transcribe', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { audioUrl } = req.body;

    if (!audioUrl) {
      throw createError('Audio URL is required', 400);
    }

    const apiKey = process.env.WISPRFLOW_API_KEY;
    if (!apiKey) {
      throw createError('WisprFlow API key not configured', 500);
    }

    // Note: This is a simplified version. Actual API may differ
    const response = await fetch('https://api.wisprflow.ai/v1/transcribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw createError(`WisprFlow API error: ${error}`, response.status);
    }

    const data = await response.json();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// LLMLingua Compression
router.post('/llmlingua/compress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, ratio } = req.body;

    if (!text) {
      throw createError('Text is required', 400);
    }

    const compressionRatio = ratio || 0.5;

    // Simulate compression (in production, this would call actual LLMLingua API or library)
    const words = text.split(/\s+/);
    const targetLength = Math.floor(words.length * compressionRatio);
    const compressed = words.slice(0, targetLength).join(' ') + '...';

    const originalTokens = Math.ceil(text.length / 4); // Rough estimate
    const compressedTokens = Math.ceil(compressed.length / 4);
    const tokensSaved = originalTokens - compressedTokens;

    res.json({
      success: true,
      data: {
        original: text,
        compressed,
        originalTokens,
        compressedTokens,
        tokensSaved,
        compressionRatio: compressedTokens / originalTokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
