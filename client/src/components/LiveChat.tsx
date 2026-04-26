import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

interface ChatMsg {
  id: string;
  content: string;
  messageType: string;
  userId: string;
  createdAt: string;
  deleted: boolean;
  user: { id: string; name: string; avatar?: string };
}

interface Props {
  roomId: string;
  embedded?: boolean;
}

export default function LiveChat({ roomId, embedded = false }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socket = socketService.connect();

  useEffect(() => {
    loadHistory();
    socket.emit('room:join', roomId);

    socket.on('chat:message', (msg: ChatMsg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('chat:deleted', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deleted: true } : m));
    });

    socket.on('chat:typing', ({ name }: { name: string }) => {
      setTyping(name);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(null), 2000);
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:deleted');
      socket.off('chat:typing');
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const data = await api.getChatHistory(roomId);
      setMessages(data);
    } catch {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await api.sendChatMessage(roomId, input.trim());
      setInput('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await api.deleteChatMessage(roomId, messageId);
    } catch {}
  };

  const handleTyping = () => {
    socket.emit('chat:typing', { roomId, userId: user?.id, name: user?.name });
  };

  const containerClass = embedded
    ? 'flex flex-col h-full'
    : 'space-y-6';

  return (
    <div className={containerClass}>
      {!embedded && (
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Chat</h1>
          <p className="text-gray-400">Real-time chat with persistent history</p>
        </div>
      )}

      <div className={`flex flex-col ${embedded ? 'h-full' : 'glass rounded-xl h-[600px]'}`}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.deleted) {
                return (
                  <div key={msg.id} className="text-gray-600 text-xs italic">
                    [message deleted]
                  </div>
                );
              }
              const isOwn = msg.userId === user?.id;
              return (
                <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {msg.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <span className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : ''}`}>
                      {msg.user.name}
                    </span>
                    <div className={`flex items-start gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-purple-600 text-white rounded-tr-sm'
                          : 'bg-black/60 text-gray-100 border border-purple-500/20 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      {(isOwn || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {typing && (
            <div className="text-gray-500 text-xs italic">{typing} is typing...</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-purple-500/30">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value); handleTyping(); }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
