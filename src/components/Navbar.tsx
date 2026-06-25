'use client';

import { useState } from 'react';
import { Bell, BarChart2, Settings, Layers, ChevronDown, User, LogOut, Key } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import MergePagesModal from './MergePagesModal';

export default function Navbar() {
  const { user, logout } = useAppContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-8">
          <div className="flex items-center cursor-pointer">
            <img src="/logo-nhu-hoa-v3.png" alt="Logo Như Hoa" className="h-8 w-8 mr-2 rounded-full object-cover shadow-sm" />
            <div className="font-bold text-xl text-[#0047AB]">NHƯ HOA</div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
              <BarChart2 className="w-4 h-4 mr-2" />
              Báo cáo
            </button>
            <button 
              onClick={() => setShowMergeModal(true)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Layers className="w-4 h-4 mr-2" />
              Gộp trang
            </button>
            <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 hover:bg-gray-100 p-1.5 rounded-md"
            >
              <img src={user?.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <User className="w-4 h-4 mr-2" /> Thông tin tài khoản
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Key className="w-4 h-4 mr-2" /> Đổi mật khẩu
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <MergePagesModal isOpen={showMergeModal} onClose={() => setShowMergeModal(false)} />
    </>
  );
}
