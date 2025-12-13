'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Send, ArrowLeft, Sparkles, Loader2, User, Database, BarChart3, RefreshCw } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type: 'text' | 'chart';
    html?: string;
    sqlQuery?: string;
    timestamp: Date;
}

const SUGGESTIONS = [
    "How many plants do I have in total?",
    "Show me plants that need watering",
    "What's the health status of my crops?",
    "Show me a chart of plants by field",
    "Which plants are at risk or critical?",
    "How many fields do I have?",
    "Show me a bar chart of plant types",
    "What notes have been added recently?",
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Simple markdown parser for bold text and headers
    const renderMarkdown = (text: string) => {
        // Split text into lines to handle headers and bullets
        const lines = text.split('\n');

        return lines.map((line, lineIndex) => {
            // Handle ### headers
            if (line.startsWith('### ')) {
                return <h3 key={lineIndex} className="font-bold text-base mt-3 mb-1 text-white">{line.slice(4)}</h3>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={lineIndex} className="font-bold text-lg mt-3 mb-1 text-white">{line.slice(3)}</h2>;
            }
            if (line.startsWith('# ')) {
                return <h1 key={lineIndex} className="font-bold text-xl mt-3 mb-1 text-white">{line.slice(2)}</h1>;
            }

            // Handle bullet points
            const isBullet = line.startsWith('- ') || line.startsWith('• ');
            const lineContent = isBullet ? line.slice(2) : line;

            // Replace **text** with bold within the line
            const parts = lineContent.split(/(\*\*.*?\*\*)/g);
            const renderedParts = parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIndex} className="font-bold">{part.slice(2, -2)}</strong>;
                }
                return part;
            });

            if (isBullet) {
                return <div key={lineIndex} className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>{renderedParts}</span></div>;
            }

            return <span key={lineIndex}>{renderedParts}{lineIndex < lines.length - 1 ? '\n' : ''}</span>;
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            type: 'text',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationHistory: messages.slice(-10).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response?.content || 'I apologize, but I could not process your request.',
                type: data.response?.type || 'text',
                html: data.response?.html,
                sqlQuery: data.response?.sqlQuery,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}. Please make sure the OPENAI_API_KEY is configured in the backend.`,
                type: 'text',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
            showToast('error', 'Failed to send message');
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        showToast('success', 'Chat cleared');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    Smart Farm AI
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                </h1>
                                <p className="text-slate-400 text-sm">Ask anything about your farm</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={clearChat}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Clear
                            </button>
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto py-6">
                <div className="max-w-4xl mx-auto px-6">
                    {messages.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30">
                                <Bot className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Smart Farm AI!</h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                I can help you with questions about your plants, fields, irrigation schedules, and farm statistics. I can even generate charts!
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                                {SUGGESTIONS.slice(0, 8).map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(suggestion)}
                                        className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-left hover:bg-slate-700/50 hover:border-violet-500/50 transition-all group"
                                    >
                                        <p className="text-sm text-slate-300 group-hover:text-white line-clamp-2">
                                            {suggestion}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                            : 'bg-gradient-to-br from-violet-500 to-purple-600'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="w-5 h-5 text-white" />
                                        ) : (
                                            <Bot className="w-5 h-5 text-white" />
                                        )}
                                    </div>

                                    <div
                                        className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''
                                            }`}
                                    >
                                        <div
                                            className={`inline-block rounded-2xl px-5 py-4 ${message.role === 'user'
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                : 'bg-slate-800 text-slate-100 border border-slate-700'
                                                }`}
                                        >
                                            {message.type === 'chart' && message.html ? (
                                                <div className="chat-chart">
                                                    <iframe
                                                        srcDoc={`
                                                            <!DOCTYPE html>
                                                            <html>
                                                            <head>
                                                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                                                <style>
                                                                    body { margin: 0; padding: 16px; font-family: sans-serif; background: white; }
                                                                    canvas { max-width: 100%; }
                                                                </style>
                                                            </head>
                                                            <body>${message.html}</body>
                                                            </html>
                                                        `}
                                                        className="w-full min-w-[400px] h-[350px] rounded-xl border-0 bg-white"
                                                        sandbox="allow-scripts"
                                                        title="Chart visualization"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {renderMarkdown(message.content)}
                                                </div>
                                            )}
                                        </div>

                                        {message.sqlQuery && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                <Database className="w-3 h-3" />
                                                <span className="font-mono truncate max-w-sm" title={message.sqlQuery}>
                                                    {message.sqlQuery.substring(0, 60)}...
                                                </span>
                                            </div>
                                        )}

                                        <p className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about your farm..."
                                disabled={isLoading}
                                className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 pr-12"
                            />
                        </div>
                        <button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        Ask about plants, fields, irrigation, statistics, or request charts and visualizations
                    </p>
                </div>
            </div>
        </div>
    );
}
