'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function InboxList() {
  const { conversations, messages, customers, pages, activeConversationId, setActiveConversationId, activeFilter, dateRange } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc page đang hiển thị
  const visiblePageIds = pages.filter(p => p.isVisible).map(p => p.id);

  let filteredConversations = conversations.filter(c => visiblePageIds.includes(c.pageId));

  if (activeFilter === 'unread') {
    filteredConversations = filteredConversations.filter(c => c.unread);
  } else if (activeFilter === 'unreplied') {
    filteredConversations = filteredConversations.filter(c => !c.replied);
  } else if (activeFilter === 'nophone') {
    filteredConversations = filteredConversations.filter(c => c.tags.includes('Chưa có SĐT'));
  }

  if (dateRange.from) {
    const fromDate = new Date(dateRange.from).getTime();
    filteredConversations = filteredConversations.filter(c => new Date(c.updatedAt).getTime() >= fromDate);
  }

  if (dateRange.to) {
    // Add 1 day to include the entire 'to' date
    const toDate = new Date(dateRange.to).getTime() + 86400000;
    filteredConversations = filteredConversations.filter(c => new Date(c.updatedAt).getTime() <= toDate);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredConversations = filteredConversations.filter(c => {
      const customer = customers.find(cust => cust.id === c.customerId);
      const page = pages.find(p => p.id === c.pageId);
      const lastMsg = messages.filter(m => m.conversationId === c.id).pop();
      return (
        customer?.name.toLowerCase().includes(term) ||
        customer?.phone?.includes(term) ||
        page?.name.toLowerCase().includes(term) ||
        c.tags.some(t => t.toLowerCase().includes(term)) ||
        lastMsg?.text.toLowerCase().includes(term)
      );
    });
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex-col h-full shrink-0",
      activeConversationId ? "hidden md:flex md:w-80" : "flex w-full md:w-80"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm hội thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0047AB]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map(conv => {
          const customer = customers.find(c => c.id === conv.customerId);
          const page = pages.find(p => p.id === conv.pageId);
          const convMsgs = messages.filter(m => m.conversationId === conv.id);
          const lastMsg = convMsgs[convMsgs.length - 1];
          const isActive = activeConversationId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={cn(
                "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative",
                isActive ? "bg-blue-50 border-l-4 border-l-[#0047AB]" : "border-l-4 border-l-transparent"
              )}
            >
              {conv.unread && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              )}
              
              <div className="flex items-start space-x-3">
                <img 
                  src={customer?.avatar} 
                  alt={customer?.name} 
                  className="w-10 h-10 rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || 'User')}&background=random`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className={cn("text-sm truncate", conv.unread ? "font-bold text-gray-900" : "font-medium text-gray-800")}>
                      {customer?.name}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                  
                  <div className="text-xs text-blue-600 mt-0.5 truncate flex items-center">
                    <span className="w-3 h-3 bg-blue-600 text-white rounded-full inline-flex items-center justify-center text-[8px] mr-1">f</span>
                    {page?.name}
                  </div>
                  
                  <p className={cn("text-xs mt-1 truncate", conv.unread ? "font-semibold text-gray-800" : "text-gray-500")}>
                    {lastMsg?.senderId === 'ai' ? 'AI: ' : lastMsg?.senderId === 'c1' ? '' : 'Bạn: '}
                    {lastMsg?.text}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conv.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredConversations.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            Không tìm thấy hội thoại nào.
          </div>
        )}
      </div>
    </div>
  );
}
