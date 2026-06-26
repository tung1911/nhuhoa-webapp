'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Paperclip, Smile, Zap, Tag, MoreVertical, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MOCK_AI_SUGGESTIONS } from '@/lib/mock-data';

export default function ChatWindow() {
  const { 
    user,
    conversations, 
    messages, 
    customers, 
    pages, 
    activeConversationId, 
    setActiveConversationId,
    sendMessage,
    updateConversationTags
  } = useAppContext();
  
  const [inputText, setInputText] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const customer = activeConv ? customers.find(c => c.id === activeConv.customerId) : null;
  const page = activeConv ? pages.find(p => p.id === activeConv.pageId) : null;
  const convMessages = messages.filter(m => m.conversationId === activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  if (!activeConversationId || !activeConv || !customer) {
    return (
      <div className="hidden md:flex flex-1 flex-col bg-gray-50 items-center justify-center text-gray-400">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Send className="w-8 h-8 text-gray-400 ml-1" />
        </div>
        <p>Chọn một hội thoại để bắt đầu</p>
      </div>
    );
  }

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleAiSuggestion = async () => {
    if (!activeConv || !customer || isAiLoading) return;
    
    setIsAiLoading(true);
    setInputText('AI đang suy nghĩ...');
    
    try {
      const messageHistory = convMessages.slice(-10).map(m => ({
        sender: m.senderId === customer.id ? 'customer' : 'page',
        text: m.text
      }));

      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          customerName: customer.name,
          isAutoReply: false
        })
      });
      
      const data = await res.json();
      if (data.reply) {
        setInputText(data.reply);
      } else if (data.error) {
        setInputText('LỖI GOOGLE AI: ' + data.error);
      } else {
        setInputText('Lỗi không xác định từ AI');
      }
    } catch (err: any) {
      console.error(err);
      setInputText('LỖI KẾT NỐI: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const PREDEFINED_TAGS = [
    'mũi', 'cằm', 'mí', 'môi', 'đại phẫu', 
    'da liễu', 'nha khoa', 'đã có sđt', 
    'lan tele', 'hương tele'
  ];

  const toggleTag = (tag: string) => {
    if (!activeConv) return;
    const currentTags = activeConv.tags || [];
    
    // Normalize case to check properly (assuming tags are case-insensitive)
    const existingTagIndex = currentTags.findIndex(t => t.toLowerCase() === tag.toLowerCase());
    
    if (existingTagIndex >= 0) {
      // Remove
      const newTags = [...currentTags];
      newTags.splice(existingTagIndex, 1);
      updateConversationTags(activeConv.id, newTags);
    } else {
      // Add
      // Special logic: if "đã có sđt" is added, maybe remove "Chưa có SĐT"
      let newTags = [...currentTags, tag];
      if (tag === 'đã có sđt') {
        newTags = newTags.filter(t => t.toLowerCase() !== 'chưa có sđt');
      }
      updateConversationTags(activeConv.id, newTags);
    }
  };

  return (
    <div className={cn(
      "flex-col bg-white border-r border-gray-200",
      !activeConversationId ? "hidden md:flex flex-1" : "flex w-full md:flex-1"
    )}>
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 bg-white shrink-0">
        <div className="flex items-center">
          <button 
            className="md:hidden p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
            onClick={() => setActiveConversationId(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img 
            src={customer.avatar} 
            alt={customer.name} 
            className="w-10 h-10 rounded-full mr-3" 
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`;
            }}
          />
          <div>
            <h3 className="font-semibold text-gray-800">{customer.name}</h3>
            <div className="text-xs text-blue-600 flex items-center">
              <span className="w-3 h-3 bg-blue-600 text-white rounded-full inline-flex items-center justify-center text-[8px] mr-1">f</span>
              {page?.name}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <Tag className="w-4 h-4 mr-1.5" /> Gắn tag
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
        {convMessages.map((msg, index) => {
          const isCustomer = msg.senderId === customer.id;
          const isAi = msg.isAi;
          
          return (
            <div key={msg.id} className={cn("flex", isCustomer ? "justify-start" : "justify-end")}>
              {!isCustomer && (
                <div className="flex flex-col items-end max-w-[70%]">
                  <div className="flex items-center mb-1 space-x-2">
                    <span className="text-xs text-gray-500">{format(new Date(msg.timestamp), 'HH:mm')}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {isAi ? 'AI Assistant' : user?.name}
                    </span>
                    {isAi && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-bold">AI</span>}
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl", 
                    isAi ? "bg-blue-50 border border-blue-200 text-blue-900" : "bg-[#0047AB] text-white rounded-tr-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              )}
              
              {isCustomer && (
                <div className="flex flex-col items-start max-w-[70%]">
                  <div className="flex items-center mb-1 space-x-2">
                    <span className="text-xs font-medium text-gray-700">{customer.name}</span>
                    <span className="text-xs text-gray-500">{format(new Date(msg.timestamp), 'HH:mm')}</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm">
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2 mb-2">
          <button 
            onClick={handleAiSuggestion}
            disabled={isAiLoading}
            className="flex items-center px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100"
          >
            <Zap className="w-3.5 h-3.5 mr-1" fill="currentColor" />
            AI Chat
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-200">
            Gửi nhanh
          </button>
        </div>
        <div className="flex items-end bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#0047AB] focus-within:border-[#0047AB]">
          <div className="flex flex-col justify-end p-2 space-y-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 max-h-32 min-h-[44px] py-3 px-2 resize-none focus:outline-none text-sm"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 text-[#0047AB] hover:text-blue-800 disabled:text-gray-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Quick Tags Section */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-500 font-medium mr-1">Gắn tag nhanh:</span>
          {PREDEFINED_TAGS.map(tag => {
            const isApplied = activeConv.tags?.some(t => t.toLowerCase() === tag.toLowerCase());
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-2 py-1 text-[10px] sm:text-xs rounded border transition-colors cursor-pointer capitalize font-medium",
                  isApplied 
                    ? "bg-[#0047AB] text-white border-[#0047AB]" 
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
