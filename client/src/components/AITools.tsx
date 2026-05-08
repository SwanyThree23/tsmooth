import { useState } from 'react';
import {
  MessageSquare, Video, Mic, FileText, Zap, Send, Play,
  User, Bot, Loader, Volume2
} from 'lucide-react';
import { api } from '../services/api';

type Tab = 'chat' | 'heygen' | 'elevenlabs' | 'wisprflow' | 'llmlingua';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AITools() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Chat state
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatMessage, setChatMessage] = useState('');

  // HeyGen state
  const [heygenScript, setHeygenScript] = useState('');
  const [heygenAvatar, setHeygenAvatar] = useState('avatar-1');
  const [heygenVideoUrl, setHeygenVideoUrl] = useState('');

  // ElevenLabs state
  const [elevenLabsText, setElevenLabsText] = useState('');
  const [elevenLabsVoice, setElevenLabsVoice] = useState('voice-1');
  const [elevenLabsAudioUrl, setElevenLabsAudioUrl] = useState('');

  // WisprFlow state
  const [wisprFlowAudioUrl, setWisprFlowAudioUrl] = useState('');
  const [wisprFlowTranscription, setWisprFlowTranscription] = useState('');

  // LLMLingua state
  const [llmLinguaText, setLlmLinguaText] = useState('');
  const [llmLinguaRatio, setLlmLinguaRatio] = useState(0.5);
  const [llmLinguaCompressed, setLlmLinguaCompressed] = useState('');

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage: Message = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      setLoading(true);
      const response = await api.chat(chatMessage, chatHistory);
      const assistantMessage: Message = { role: 'assistant', content: response.message };
      setChatHistory(prev => [...prev, assistantMessage]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleHeyGenGenerate = async () => {
    if (!heygenScript.trim()) {
      setError('Please enter a script');
      return;
    }

    try {
      setLoading(true);
      const response = await api.generateHeyGenVideo(heygenScript, heygenAvatar);
      setHeygenVideoUrl(response.videoUrl);
      showSuccess('Video generated successfully');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  const handleElevenLabsGenerate = async () => {
    if (!elevenLabsText.trim()) {
      setError('Please enter text');
      return;
    }

    try {
      setLoading(true);
      const response = await api.generateElevenLabsVoice(elevenLabsText, elevenLabsVoice);
      setElevenLabsAudioUrl(response.audioUrl);
      showSuccess('Voice generated successfully');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate voice');
    } finally {
      setLoading(false);
    }
  };

  const handleWisprFlowTranscribe = async () => {
    if (!wisprFlowAudioUrl.trim()) {
      setError('Please enter audio URL');
      return;
    }

    try {
      setLoading(true);
      const response = await api.transcribeWisprFlow(wisprFlowAudioUrl);
      setWisprFlowTranscription(response.transcription);
      showSuccess('Transcription completed');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe');
    } finally {
      setLoading(false);
    }
  };

  const handleLLMLinguaCompress = async () => {
    if (!llmLinguaText.trim()) {
      setError('Please enter text');
      return;
    }

    try {
      setLoading(true);
      const response = await api.compressLLMLingua(llmLinguaText, llmLinguaRatio);
      setLlmLinguaCompressed(response.compressed);
      showSuccess('Text compressed successfully');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'chat', label: 'OpenRouter Chat', icon: MessageSquare },
    { id: 'heygen', label: 'HeyGen Video', icon: Video },
    { id: 'elevenlabs', label: 'ElevenLabs Voice', icon: Mic },
    { id: 'wisprflow', label: 'WisprFlow Transcribe', icon: FileText },
    { id: 'llmlingua', label: 'LLMLingua Compress', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Zap className="w-8 h-8 mr-3 text-purple-500" />
          AI Tools
        </h1>
        <p className="text-gray-400 mt-1">Powerful AI tools for content creation</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-3 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        {/* OpenRouter Chat */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-900/50 rounded-lg">
              {chatHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p>Start a conversation with AI</p>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Bot className="w-5 h-5 text-purple-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-2xl p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="bg-gray-800 text-gray-200 p-4 rounded-lg">
                    <Loader className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={loading || !chatMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* HeyGen Video */}
        {activeTab === 'heygen' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Script
              </label>
              <textarea
                value={heygenScript}
                onChange={(e) => setHeygenScript(e.target.value)}
                rows={6}
                placeholder="Enter your video script..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avatar Selection
              </label>
              <select
                value={heygenAvatar}
                onChange={(e) => setHeygenAvatar(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="avatar-1">Professional Male</option>
                <option value="avatar-2">Professional Female</option>
                <option value="avatar-3">Casual Male</option>
                <option value="avatar-4">Casual Female</option>
              </select>
            </div>

            <button
              onClick={handleHeyGenGenerate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Video</span>
                </>
              )}
            </button>

            {heygenVideoUrl && (
              <div className="mt-4">
                <h3 className="text-white font-medium mb-2">Generated Video</h3>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video src={heygenVideoUrl} controls className="w-full h-full" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ElevenLabs Voice */}
        {activeTab === 'elevenlabs' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text to Convert
              </label>
              <textarea
                value={elevenLabsText}
                onChange={(e) => setElevenLabsText(e.target.value)}
                rows={6}
                placeholder="Enter text to convert to speech..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice Selection
              </label>
              <select
                value={elevenLabsVoice}
                onChange={(e) => setElevenLabsVoice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="voice-1">Male - Deep</option>
                <option value="voice-2">Male - Young</option>
                <option value="voice-3">Female - Professional</option>
                <option value="voice-4">Female - Friendly</option>
              </select>
            </div>

            <button
              onClick={handleElevenLabsGenerate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Generate Voice</span>
                </>
              )}
            </button>

            {elevenLabsAudioUrl && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-medium mb-2">Generated Audio</h3>
                <audio src={elevenLabsAudioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* WisprFlow Transcription */}
        {activeTab === 'wisprflow' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio URL
              </label>
              <input
                type="url"
                value={wisprFlowAudioUrl}
                onChange={(e) => setWisprFlowAudioUrl(e.target.value)}
                placeholder="https://example.com/audio.mp3"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleWisprFlowTranscribe}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Transcribing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Transcribe Audio</span>
                </>
              )}
            </button>

            {wisprFlowTranscription && (
              <div className="mt-4">
                <h3 className="text-white font-medium mb-2">Transcription</h3>
                <div className="p-4 bg-gray-800/50 rounded-lg text-gray-200">
                  {wisprFlowTranscription}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LLMLingua Compression */}
        {activeTab === 'llmlingua' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text to Compress
              </label>
              <textarea
                value={llmLinguaText}
                onChange={(e) => setLlmLinguaText(e.target.value)}
                rows={6}
                placeholder="Enter text to compress..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Compression Ratio: {llmLinguaRatio.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={llmLinguaRatio}
                onChange={(e) => setLlmLinguaRatio(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Less compression</span>
                <span>More compression</span>
              </div>
            </div>

            <button
              onClick={handleLLMLinguaCompress}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Compress Text</span>
                </>
              )}
            </button>

            {llmLinguaCompressed && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Original</h3>
                    <span className="text-sm text-gray-400">{llmLinguaText.length} chars</span>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-gray-200 max-h-40 overflow-y-auto">
                    {llmLinguaText}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Compressed</h3>
                    <span className="text-sm text-green-400">{llmLinguaCompressed.length} chars</span>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-gray-200 max-h-40 overflow-y-auto">
                    {llmLinguaCompressed}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
