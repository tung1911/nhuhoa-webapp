'use client';

import { useState, useEffect } from 'react';
import { Quote, Heart } from 'lucide-react';

const quotes = [
  "Làm việc bằng cái tâm, kết quả sẽ xứng tầm.",
  "Mỗi lời tư vấn tận tình là một hạt mầm gieo sự tin tưởng.",
  "Chăm sóc khách hàng không phải là một bộ phận, đó là toàn bộ công ty.",
  "Nụ cười của khách hàng chính là thước đo thành công của bạn.",
  "Hãy đối xử với khách hàng như những người thân yêu nhất của bạn."
];

export default function MotivationQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Thay đổi mỗi 15 phút (900000 ms)
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 900000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 bg-black text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Quote className="w-16 h-16" />
      </div>
      <div className="relative z-10">
        <Heart className="w-4 h-4 text-red-500 mb-3" fill="currentColor" />
        <p className="text-sm leading-relaxed italic font-medium">
          "{quotes[quoteIndex]}"
        </p>
      </div>
    </div>
  );
}
