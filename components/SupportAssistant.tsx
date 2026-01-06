
import React, { useState, useRef, useEffect } from 'react';
import { getAISupport } from '../services/geminiService';
import { User } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SupportAssistantProps {
  user: User;
}

const SupportAssistant: React.FC<SupportAssistantProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi ${user.name.split(' ')[0]}! I'm your BioPay HR assistant. How can I help you with your attendance or payroll today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await getAISupport(userMsg, { 
      userName: user.name, 
      userRole: user.role,
      lastLogin: new Date().toISOString()
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95 z-50 text-white"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 w-[350px] sm:w-[400px] h-[500px] bg-[var(--color-card)] rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-8 duration-300 border border-[var(--color-border)]">
          <div className="bg-[var(--color-sidebar)] p-4 flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">🤖</div>
             <div>
               <h4 className="font-bold text-white text-sm">BioPay HR Assistant</h4>
               <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Online • AI Support</p>
             </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg)]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-[var(--color-card)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)] rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-card)] px-4 py-3 rounded-2xl shadow-sm border border-[var(--color-border)] rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your salary..."
                className="flex-1 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportAssistant;
