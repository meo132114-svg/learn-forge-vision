import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Sparkles, Loader2, GraduationCap, Map, Brain, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { HollandResults } from './HollandTest';
import type { Roadmap } from './RoadmapBuilder';
import type { BigFiveResults } from './BigFiveTest';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  hollandResults: HollandResults | null;
  bigFiveResults?: BigFiveResults | null;
  roadmap: Roadmap | null;
  onRequestRoadmap?: () => void;
  initialMessage?: string;
}

const PROMPT_STARTERS = [
  { 
    icon: <Brain className="w-4 h-4" />,
    label: 'Phân tích kết quả test', 
    message: 'Hãy phân tích chi tiết kết quả Holland Code và Big Five của tôi, và đưa ra nhận xét tổng hợp về tính cách nghề nghiệp.' 
  },
  { 
    icon: <GraduationCap className="w-4 h-4" />,
    label: 'Gợi ý trường đại học', 
    message: 'Dựa trên kết quả test của tôi, hãy gợi ý các ngành học và trường đại học phù hợp ở Việt Nam.' 
  },
  { 
    icon: <Map className="w-4 h-4" />,
    label: 'Xây dựng lộ trình', 
    message: 'Giúp tôi xây dựng lộ trình học tập để đạt được mục tiêu nghề nghiệp.' 
  },
  { 
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'Tư vấn nghề nghiệp', 
    message: 'Tôi đang phân vân giữa nhiều ngành nghề. Hãy giúp tôi phân tích ưu nhược điểm.' 
  },
];

export const AIChat: React.FC<AIChatProps> = ({ 
  hollandResults, 
  bigFiveResults,
  roadmap, 
  onRequestRoadmap,
  initialMessage 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation from database
  useEffect(() => {
    if (user) {
      loadConversation();
    } else {
      // Show welcome message for non-logged in users
      if (messages.length === 0) {
        showWelcomeMessage();
      }
    }
  }, [user]);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && !initialMessageSent.current && messages.length > 0) {
      initialMessageSent.current = true;
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, messages.length]);

  const loadConversation = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('chat_type', 'advisor')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setConversationId(data.id);
        const loadedMessages = (data.messages as any[]).map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(loadedMessages);
      } else {
        showWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      showWelcomeMessage();
    }
  };

  const showWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! 👋 Tôi là trợ lý AI hướng nghiệp của Future Me AI.

Tôi có thể giúp bạn:
- 🎯 **Phân tích kết quả Holland Code & Big Five**
- 🎓 **Gợi ý trường đại học và ngành học phù hợp**
- 📚 **Xây dựng lộ trình học tập cá nhân hóa**
- 💡 **Tư vấn nghề nghiệp dựa trên tính cách**

${hollandResults ? '✅ Tôi thấy bạn đã có kết quả Holland. Hãy hỏi tôi bất cứ điều gì!' : 'Bạn có thể làm bài test Holland hoặc chat trực tiếp với tôi!'}`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const saveConversation = async (newMessages: Message[]) => {
    if (!user) return;
    try {
      const messagesToSave = newMessages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      }));

      if (conversationId) {
        await supabase
          .from('chat_conversations')
          .update({ messages: messagesToSave as any })
          .eq('id', conversationId);
      } else {
        const { data } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            chat_type: 'advisor',
            messages: messagesToSave as any,
          })
          .select('id')
          .single();
        
        if (data) {
          setConversationId(data.id);
        }
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const { data } = await supabase
        .from('CÁC TRƯỜNG ĐẠI HỌC')
        .select('*')
        .limit(100);
      return data || [];
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Fetch universities for RAG
      const universities = await fetchUniversities();

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          messages: newMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            hollandResults,
            bigFiveResults,
            roadmap,
            universities,
          }
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Xin lỗi, tôi không thể trả lời lúc này.',
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveConversation(updatedMessages);
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Lỗi kết nối với AI. Vui lòng thử lại.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    setMessages([]);
    setConversationId(null);
    initialMessageSent.current = false;
    if (user && conversationId) {
      await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);
    }
    showWelcomeMessage();
  };

  const renderContent = (content: string) => {
    // Simple markdown rendering
    return content.split('\n').map((line, i) => {
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) => 
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[600px] glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">AI Tư Vấn Hướng Nghiệp</h3>
          <p className="text-xs text-muted-foreground">Kết nối với Gemini AI</p>
        </div>
        <div className="flex items-center gap-2">
          {hollandResults && (
            <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
              Holland ✓
            </span>
          )}
          {bigFiveResults && (
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
              Big Five ✓
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={clearConversation}>
            Xóa chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 animate-fade-in ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {renderContent(message.content)}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="chat-bubble-ai flex gap-1.5 py-4">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Starters */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {PROMPT_STARTERS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.message)}
              className="px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-xs rounded-full transition-colors flex items-center gap-1.5"
            >
              {prompt.icon}
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/30">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            rows={1}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="shrink-0 rounded-xl h-12 w-12"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
