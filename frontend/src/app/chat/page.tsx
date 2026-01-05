'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { chatWithAI } from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 自動轉到最下方
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // 取得過去的對話歷史 (最近 6 則避免 context 過長)
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const data = await chatWithAI(userMsg, history);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `抱歉，系統發生錯誤：${error.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            FOOD TRACE
                        </span>
                    </Link>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        AI Assistant
                    </span>
                </div>
                <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    返回首頁
                </Link>
            </header>

            {/* Chat Container */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-4 overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-neutral-800"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Refine 8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">智慧食材助手</h2>
                                <p className="text-sm mt-1">您可以詢問關於食材產地、批號、檢驗結果等問題</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 max-w-md">
                                {["目前有哪些食材？", "誰是供應商？", "芒果的檢驗細節為何？"].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setInput(q)}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-tl-none shadow-xl'
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center shadow-xl">
                                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-4 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-4xl mx-auto flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="輸入您的問題..."
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-neutral-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium"
                    >
                        {isLoading ? '處理中...' : '發送'}
                    </button>
                </form>
                <p className="text-[10px] text-center text-white mt-2">
                    AI 助手基於目前資料庫內容回答，僅供參考。
                </p>
            </footer>
        </div>
    );
}
