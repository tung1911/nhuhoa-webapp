import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';


export async function POST(req: Request) {
  try {
    const { messages, customerName, isAutoReply } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Xây dựng ngữ cảnh (Prompt)
    let promptText = `Bạn là nhân viên chăm sóc khách hàng chuyên nghiệp của hệ thống Thẩm mỹ/Nha khoa/Da liễu Như Hoa.
Tên khách hàng là "${customerName || 'Quý khách'}".
Hãy đọc lịch sử trò chuyện dưới đây và viết tiếp 1 câu trả lời của nhân viên.
Yêu cầu:
1. Trả lời thật ngắn gọn, tự nhiên, thân thiện và lịch sự.
2. Không xưng tôi, xưng là "dạ", "bác sĩ", hoặc "phòng khám". Gọi khách là "anh/chị" hoặc tên khách.
${isAutoReply ? '3. Vì bạn đang trả lời tự động, hãy ưu tiên xoa dịu, xin thông tin số điện thoại hoặc báo khách đợi một chút nhân viên sẽ vào hỗ trợ ngay.' : '3. Đưa ra câu trả lời đi thẳng vào vấn đề khách hỏi.'}

Lịch sử trò chuyện:
`;

    messages.forEach((msg: any) => {
      promptText += `${msg.sender === 'customer' ? customerName : 'Nhân viên'}: ${msg.text}\n`;
    });
    
    promptText += `\nNhân viên:`;

    let text = '';
    try {
      const result = await model.generateContent(promptText);
      const response = await result.response;
      text = response.text().trim();
    } catch (modelError: any) {
      if (modelError.message && modelError.message.includes('404')) {
        // Fallback to older gemini-pro
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await fallbackModel.generateContent(promptText);
        const response = await result.response;
        text = response.text().trim();
      } else {
        throw modelError;
      }
    }

    return NextResponse.json({ reply: text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const keyPrefix = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'NONE';
      return NextResponse.json({ error: `[Key: ${keyPrefix}] ${error.message}` }, { status: 500 });
    }
}
