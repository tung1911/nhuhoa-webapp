'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Customer, FacebookPage, Message, User } from '@/types';
import { mockConversations, mockCustomers, mockMessages, mockPages, mockUser } from '@/lib/mock-data';

interface AppState {
  user: User | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  pages: FacebookPage[];
  togglePageVisibility: (id: string) => void;
  togglePageAi: (id: string) => void;
  conversations: Conversation[];
  messages: Message[];
  customers: Customer[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (text: string, isAi?: boolean) => void;
  updateConversationTags: (convId: string, tags: string[]) => void;
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>(mockPages);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, pass: string) => {
    if (username === 'phamthanhtung' && pass === '123456789') {
      setUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  const togglePageVisibility = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p));
  };

  const togglePageAi = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, isAiEnabled: !p.isAiEnabled } : p));
  };

  const handleSetActiveConversationId = (id: string | null) => {
    setActiveConversationId(id);
    if (id) {
      setConversations(prev => prev.map(c => 
        c.id === id && c.unread ? { ...c, unread: false } : c
      ));
    }
  };

  const sendMessage = (text: string, isAi = false) => {
    if (!activeConversationId || !user) return;
    
    const newMessage: Message = {
      id: `m_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: isAi ? 'ai' : user.id,
      text,
      timestamp: new Date().toISOString(),
      isAi,
    };
    
    setMessages([...messages, newMessage]);
    
    setConversations(conversations.map(c => 
      c.id === activeConversationId ? { ...c, replied: true, updatedAt: new Date().toISOString() } : c
    ));
  };

  const updateConversationTags = (convId: string, tags: string[]) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, tags } : c));
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      pages, togglePageVisibility, togglePageAi,
      conversations, messages, customers,
      activeConversationId, setActiveConversationId: handleSetActiveConversationId,
      sendMessage, updateConversationTags,
      activeFilter, setActiveFilter,
      dateRange, setDateRange
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
