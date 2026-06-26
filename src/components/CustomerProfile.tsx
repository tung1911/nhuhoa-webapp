'use client';

import { useState } from 'react';
import { ExternalLink, Phone } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import MotivationQuote from './MotivationQuote';

export default function CustomerProfile() {
  const { conversations, customers, pages, activeConversationId } = useAppContext();

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const customer = activeConv ? customers.find(c => c.id === activeConv.customerId) : null;
  const page = activeConv ? pages.find(p => p.id === activeConv.pageId) : null;

  if (!activeConversationId || !activeConv || !customer) {
    return (
      <div className="w-80 bg-white p-6 flex flex-col shrink-0 border-l border-gray-200">
        <MotivationQuote />
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto">
      <div className="p-6 flex flex-col items-center border-b border-gray-100">
        <img src={customer.avatar} alt={customer.name} className="w-20 h-20 rounded-full mb-3 shadow-sm border border-gray-100" />
        <h2 className="text-lg font-bold text-gray-800">{customer.name}</h2>
      </div>

      <div className="p-5 space-y-5 flex-1">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nguồn</h4>
          <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">f</span>
            {page?.name}
          </div>
          <a 
            href={customer.facebookLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 break-all"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="truncate">{customer.facebookLink}</span>
          </a>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Số điện thoại</h4>
          <div className="flex items-center text-sm text-gray-700">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            {customer.phone ? (
              <span className="font-medium">{customer.phone}</span>
            ) : (
              <span className="text-gray-400 italic">Chưa có</span>
            )}
          </div>
        </div>

        <MotivationQuote />
      </div>
    </div>
  );
}
