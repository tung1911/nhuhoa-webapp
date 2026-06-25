import { Customer, FacebookPage, Conversation, Message, User } from '@/types';

export const mockUser: User = {
  id: 'u1',
  name: 'Phạm Thanh Tùng',
  username: 'phamthanhtung',
  role: 'Quản trị viên',
  avatar: 'https://i.pravatar.cc/150?u=u1',
};

export const mockPages: FacebookPage[] = [
  { id: 'p1', name: 'Page Nâng mũi Như Hoa', isVisible: true, isAiEnabled: true, avatar: '', isConnected: true },
  { id: 'p2', name: 'Page Da liễu Như Hoa', isVisible: true, isAiEnabled: false, avatar: '', isConnected: true },
  { id: 'p3', name: 'Page Nha khoa Như Hoa', isVisible: true, isAiEnabled: true, avatar: '', isConnected: true },
  { id: 'p4', name: 'Spa Như Hoa', isVisible: true, isAiEnabled: false, avatar: '', isConnected: true },
  { id: 'p5', name: 'Tuyển dụng Như Hoa', isVisible: false, isAiEnabled: false, avatar: '', isConnected: true },
];

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Lan Anh',
    avatar: 'https://i.pravatar.cc/150?u=c1',
    facebookLink: 'https://www.facebook.com/lananh.nguyen.92123',
  },
  {
    id: 'c2',
    name: 'Minh Quân',
    avatar: 'https://i.pravatar.cc/150?u=c2',
    facebookLink: 'https://www.facebook.com/minhquan',
  },
  {
    id: 'c3',
    name: 'Thu Hà',
    avatar: 'https://i.pravatar.cc/150?u=c3',
    facebookLink: 'https://www.facebook.com/thuha',
    phone: '0987654321',
  },
  {
    id: 'c4',
    name: 'Quỳnh Chi',
    avatar: 'https://i.pravatar.cc/150?u=c4',
    facebookLink: 'https://www.facebook.com/quynhchi',
  },
  {
    id: 'c5',
    name: 'Hoàng Nam',
    avatar: 'https://i.pravatar.cc/150?u=c5',
    facebookLink: 'https://www.facebook.com/hoangnam',
  },
  {
    id: 'c6',
    name: 'Thúy Kiều',
    avatar: 'https://i.pravatar.cc/150?u=c6',
    facebookLink: 'https://www.facebook.com/thuykieu',
  },
  {
    id: 'c7',
    name: 'Văn Toàn',
    avatar: 'https://i.pravatar.cc/150?u=c7',
    facebookLink: 'https://www.facebook.com/vantoan',
  },
  {
    id: 'c8',
    name: 'Bích Phương',
    avatar: 'https://i.pravatar.cc/150?u=c8',
    facebookLink: 'https://www.facebook.com/bichphuong',
  },
  {
    id: 'c9',
    name: 'Trần Cảnh',
    avatar: 'https://i.pravatar.cc/150?u=c9',
    facebookLink: 'https://www.facebook.com/trancanh',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    customerId: 'c1',
    pageId: 'p1',
    tags: ['Mũi', 'Có SĐT'], // Data mismatch: 'Có SĐT' but phone is missing. Oh wait user said SĐT: Chưa có but Tag: Có SĐT. 
    unread: true,
    replied: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'conv2',
    customerId: 'c2',
    pageId: 'p3',
    tags: ['Răng', 'Chưa có SĐT'],
    unread: false,
    replied: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'conv3',
    customerId: 'c3',
    pageId: 'p2',
    tags: ['Mụn', 'Có SĐT'],
    unread: false,
    replied: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'conv4',
    customerId: 'c4',
    pageId: 'p1',
    tags: ['Mũi', 'Đại phẫu'],
    unread: true,
    replied: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'conv5',
    customerId: 'c5',
    pageId: 'p3',
    tags: ['Răng', 'Chưa có SĐT'],
    unread: false,
    replied: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 ngày trước
  },
  {
    id: 'conv6',
    customerId: 'c6',
    pageId: 'p1',
    tags: ['Mũi', 'Có SĐT'],
    unread: false,
    replied: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 ngày trước
  },
  {
    id: 'conv7',
    customerId: 'c7',
    pageId: 'p2',
    tags: ['Mụn'],
    unread: true,
    replied: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 ngày trước
  },
  {
    id: 'conv8',
    customerId: 'c8',
    pageId: 'p4', // Spa
    tags: ['Spa', 'Chưa có SĐT'],
    unread: true,
    replied: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'conv9',
    customerId: 'c9',
    pageId: 'p5', // Tuyển dụng
    tags: ['Tuyển dụng'],
    unread: false,
    replied: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    conversationId: 'conv1',
    senderId: 'c1',
    text: 'Mũi em hơi thấp, nâng mũi bên mình giá bao nhiêu ạ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'm2',
    conversationId: 'conv2',
    senderId: 'c2',
    text: 'Bọc răng sứ giá bao nhiêu ạ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: 'm2_1',
    conversationId: 'conv2',
    senderId: 'u1',
    text: 'Chào bạn, chi phí bọc răng sứ dao động từ 1 - 8 triệu/răng tuỳ loại. Bạn có thể cho mình xin SĐT để chuyên viên tư vấn kỹ hơn nhé.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'm3',
    conversationId: 'conv3',
    senderId: 'c3',
    text: 'Da em bị mụn ẩn, tư vấn giúp em.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'm4',
    conversationId: 'conv4',
    senderId: 'c4',
    text: 'Em muốn đặt lịch tư vấn ạ.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'm5',
    conversationId: 'conv5',
    senderId: 'c5',
    text: 'Nhổ răng khôn có đau không ạ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'm6',
    conversationId: 'conv6',
    senderId: 'c6',
    text: 'Cho mình xem bảng giá nâng mũi bọc sụn.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'm7',
    conversationId: 'conv7',
    senderId: 'c7',
    text: 'Trị mụn thâm liệu trình bao lâu?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'm8',
    conversationId: 'conv8',
    senderId: 'c8',
    text: 'Tắm trắng phi thuyền bên mình đang có khuyến mãi không?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'm9',
    conversationId: 'conv9',
    senderId: 'c9',
    text: 'Em muốn ứng tuyển vị trí tư vấn viên ạ.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const MOCK_AI_SUGGESTIONS = [
  'Dạ chào bạn, bạn đã từng nâng mũi hay tiêm filler mũi lần nào chưa ạ? Bạn có thể cho bên mình xin số điện thoại để chuyên viên gọi điện tư vấn chi tiết hơn nhé!',
  'Dạ hiện tại bên em chưa có báo giá chính xác do chưa thăm khám trực tiếp. Mình có muốn đặt lịch hẹn với bác sĩ không ạ?',
  'Dạ chào bạn, bạn ở khu vực nào ạ? Bạn muốn tư vấn online trước hay muốn đặt lịch qua trực tiếp cơ sở bên mình ạ?',
];
