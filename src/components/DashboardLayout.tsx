'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Navbar from './Navbar';
import FilterSidebar from './FilterSidebar';
import InboxList from './InboxList';
import ChatWindow from './ChatWindow';
import CustomerProfile from './CustomerProfile';

export default function DashboardLayout() {
  const { user } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  if (!mounted || !user) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden text-gray-900">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <FilterSidebar />
        <InboxList />
        <ChatWindow />
        <CustomerProfile />
      </div>
    </div>
  );
}
