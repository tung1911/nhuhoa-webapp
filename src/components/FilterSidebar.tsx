'use client';

import { Calendar as CalendarIcon, FilterX } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export default function FilterSidebar() {
  const { conversations, activeFilter, setActiveFilter, dateRange, setDateRange } = useAppContext();

  // Tính toán số lượng
  const unreadCount = conversations.filter(c => c.unread).length;
  const unrepliedCount = conversations.filter(c => !c.replied).length;
  const noPhoneCount = conversations.filter(c => c.tags.includes('Chưa có SĐT')).length;

  const filters = [
    { id: 'unread', label: 'Chưa đọc', count: unreadCount, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'unreplied', label: 'Khách hàng chưa rep', count: unrepliedCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'nophone', label: 'Chưa có SĐT', count: noPhoneCount, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-4 border-b border-gray-200 font-semibold text-gray-700">Bộ lọc</div>
      
      <div className="p-4 space-y-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-colors",
              activeFilter === f.id ? "border-[#0047AB] bg-blue-50 text-[#0047AB]" : "border-gray-200 hover:bg-gray-50 text-gray-700"
            )}
          >
            <div className="flex items-center">
              <span className={cn("w-2 h-2 rounded-full mr-2", f.bg, "border", f.color.replace('text', 'border'))}></span>
              {f.label}
            </div>
            <span className={cn("px-2 py-0.5 rounded-full text-xs", f.bg, f.color)}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Lọc theo thời gian</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Từ ngày</label>
            <div className="relative">
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#0047AB]" 
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-2.5 top-2" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Đến ngày</label>
            <div className="relative">
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#0047AB]" 
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-2.5 top-2" />
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button 
              onClick={() => { /* State is already updated, this button can just trigger a visual effect or do nothing since filtering is reactive, but for UX we can keep it */ }}
              className="flex-1 bg-[#0047AB] text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800"
            >
              Áp dụng
            </button>
            <button 
              onClick={() => {
                setActiveFilter(null);
                setDateRange({ from: '', to: '' });
              }}
              className="p-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
              title="Xóa bộ lọc"
            >
              <FilterX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
