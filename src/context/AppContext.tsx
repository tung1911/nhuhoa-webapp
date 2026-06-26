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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const name = params.get('name');
      const avatar = params.get('avatar');
      
      if (token && name) {
        const newUser: User = {
          id: 'fb_user_' + Date.now(),
          name: name,
          username: name,
          avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          role: 'Admin',
          accessToken: token
        };
        localStorage.setItem('mockUser', JSON.stringify(newUser));
        // Note: we'll clean up the URL in a quick useEffect
        return newUser;
      }
      const savedUser = localStorage.getItem('mockUser');
      if (savedUser) return JSON.parse(savedUser);
    }
    return null;
  });

  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const pagesRef = React.useRef<FacebookPage[]>([]);
  const processedMessageIdsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const fetchFacebookData = async (currentUser: User, skipAccountsFetch = false) => {
    try {
      let currentPages = [...pagesRef.current];
      
      if (!skipAccountsFetch) {
        let allAccounts: any[] = [];
        let url: string | null = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,picture,access_token&limit=100&access_token=${currentUser.accessToken}`;
        
        while (url) {
          const accountsResponse = await fetch(url);
          const accountsData = await accountsResponse.json();
          
          if (accountsData.error) {
            console.error("Facebook API Error:", accountsData.error);
            if (accountsData.error.code === 190) {
              logout();
              window.location.href = '/login';
            }
            break;
          }
          
          if (accountsData && accountsData.data) {
            allAccounts = [...allAccounts, ...accountsData.data];
            url = accountsData.paging?.next || null;
          } else {
            url = null;
          }
        }
        
        if (allAccounts.length > 0) {
          currentPages = allAccounts.map((p: any) => {
            const existing = pagesRef.current.find(cp => cp.id === p.id);
            if (existing) {
              return {
                ...existing,
                pageAccessToken: p.access_token,
                name: p.name,
                avatar: p.picture?.data?.url || `https://graph.facebook.com/${p.id}/picture?type=normal`
              };
            } else {
              return {
                id: p.id,
                name: p.name,
                avatar: p.picture?.data?.url || `https://graph.facebook.com/${p.id}/picture?type=normal`,
                isConnected: true,
                isVisible: false,
                isAiEnabled: false,
                pageAccessToken: p.access_token
              };
            }
          });
          setPages(currentPages);
        }
      }
      
      if (currentPages.length > 0) {
        let allConversations: Conversation[] = [];
        let allMessages: Message[] = [];
        let allCustomers: Customer[] = [];
        
        for (const page of currentPages) {
          if (!page.isVisible) continue;
          
          try {
            const convRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}/conversations?fields=id,updated_time,participants{id,name,picture},messages.limit(50){id,message,created_time,from}&limit=50&access_token=${page.pageAccessToken}`);
            const convData = await convRes.json();
            
            if (convData.error) {
              console.error("Facebook API Error (Conversations):", convData.error);
              continue;
            }
            
            if (convData && convData.data) {
              convData.data.forEach((conv: any) => {
                const customer = conv.participants?.data?.find((p: any) => p.id !== page.id);
                if (!customer) return;
                
                const customerName = customer.name;
                const customerId = customer.id;
                const realAvatarUrl = customer.picture?.data?.url;
                
                if (!allCustomers.some(c => c.id === customerId)) {
                  allCustomers.push({
                    id: customerId,
                    name: customerName,
                    avatar: realAvatarUrl || `https://graph.facebook.com/${customerId}/picture?type=normal&access_token=${page.pageAccessToken}`,
                    facebookLink: `https://facebook.com/${customerId}`
                  });
                }
                
                allConversations.push({
                  id: conv.id,
                  pageId: page.id,
                  customerId: customerId,
                  tags: [],
                  unread: false,
                  replied: conv.messages?.data?.[0]?.from?.id === page.id,
                  updatedAt: conv.updated_time,
                });
                
                if (conv.messages?.data && conv.messages.data.length > 0) {
                  const latestMsg = conv.messages.data[0];
                  const isLatestFromCustomer = latestMsg.from.id !== page.id;
                  const msgAgeMs = Date.now() - new Date(latestMsg.created_time).getTime();
                  
                  if (page.isAiEnabled && isLatestFromCustomer && msgAgeMs < 30000 && !processedMessageIdsRef.current.has(latestMsg.id)) {
                    processedMessageIdsRef.current.add(latestMsg.id);
                    
                    // Xử lý Auto Reply ngầm
                    const messageHistory = conv.messages.data.slice(0, 10).reverse().map((m: any) => ({
                      sender: m.from.id === page.id ? 'page' : 'customer',
                      text: m.message || ''
                    })).filter((m: any) => m.text);
                    
                    fetch('/api/ai/reply', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        messages: messageHistory,
                        customerName: customerName,
                        isAutoReply: true
                      })
                    }).then(res => res.json()).then(data => {
                      if (data.reply) {
                        fetch(`https://graph.facebook.com/v19.0/${page.id}/messages?access_token=${page.pageAccessToken}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            recipient: { id: customerId },
                            message: { text: data.reply },
                            messaging_type: "RESPONSE"
                          })
                        });
                      }
                    }).catch(err => console.error("Auto reply error:", err));
                  }

                  conv.messages.data.forEach((msg: any) => {
                    const isFromPage = msg.from.id === page.id;
                    
                    allMessages.push({
                      id: msg.id,
                      conversationId: conv.id,
                      senderId: isFromPage ? currentUser.id : customerId,
                      text: msg.message || '[Hình ảnh/Tệp đính kèm]',
                      timestamp: msg.created_time,
                      isAi: false
                    });
                  });
                }
              });
            }
          } catch (err) {
            console.error(`Error fetching conversations for page ${page.name}:`, err);
          }
        }
        
        if (allCustomers.length > 0) {
          setCustomers(prev => {
            const newCustomers = [...prev];
            allCustomers.forEach(c => {
              if (!newCustomers.some(existing => existing.id === c.id)) {
                newCustomers.push(c);
              }
            });
            return newCustomers;
          });
        }
        
        if (allConversations.length > 0) {
          setConversations(prevConvs => {
            return allConversations.map(newConv => {
              const oldConv = prevConvs.find(c => c.id === newConv.id);
              return oldConv ? { ...newConv, tags: oldConv.tags, unread: oldConv.unread } : newConv;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          });
        }
        
        if (allMessages.length > 0) {
          setMessages(allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        }
      }
    } catch (err) {
      console.error("Error in fetchFacebookData:", err);
    }
  };

  useEffect(() => {
    if (user?.accessToken) {
      // Gọi lần đầu, lấy toàn bộ thông tin
      fetchFacebookData(user, false);
      
      let tick = 0;
      // Quét mỗi 5 giây cho tin nhắn để đạt tốc độ "Real-time" tốt nhất
      const interval = setInterval(() => {
        tick++;
        // Cứ mỗi 12 ticks (60 giây), mới quét lại danh sách trang (/me/accounts) để tránh tốn quota
        const shouldFetchAccounts = tick % 12 === 0;
        fetchFacebookData(user, !shouldFetchAccounts);
      }, 5000);
      
      return () => clearInterval(interval);
    }
    // Không đưa pages vào dependency để tránh trigger lại khi fetch xong trang
  }, [user]);

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

  const sendMessage = async (text: string, isAi = false) => {
    if (!activeConversationId || !user) return;
    
    // Tìm conversation và page tương ứng để lấy pageAccessToken
    const conv = conversations.find(c => c.id === activeConversationId);
    if (!conv) return;
    
    const page = pages.find(p => p.id === conv.pageId);
    if (!page || !page.pageAccessToken) return;
    
    // Cập nhật UI trước (Optimistic UI update)
    const tempMessageId = `temp_m_${Date.now()}`;
    const newMessage: Message = {
      id: tempMessageId,
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
    
    try {
      // Gọi Graph API để gửi tin nhắn
      const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/messages?access_token=${page.pageAccessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: {
            id: conv.customerId
          },
          message: {
            text: text
          },
          messaging_type: "RESPONSE"
        }),
      });
      
      const data = await res.json();
      if (data.error) {
        console.error("Lỗi gửi tin nhắn:", data.error);
        // Nếu lỗi, có thể xóa tin nhắn tạm hoặc đánh dấu lỗi (tùy nhu cầu)
      }
    } catch (err) {
      console.error("Lỗi mạng khi gửi tin nhắn:", err);
    }
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
