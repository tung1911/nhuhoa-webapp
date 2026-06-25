export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface Conversation {
  id: string;
  customerId: string;
  pageId: string;
  tags: string[];
  unread: boolean;
  replied: boolean;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  facebookLink: string;
  phone?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  isVisible: boolean;
  isAiEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar: string;
}
