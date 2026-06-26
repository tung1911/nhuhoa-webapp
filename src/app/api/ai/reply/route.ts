import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, customerName, isAutoReply } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Xây dựng ngữ cảnh (Prompt)
    let systemPrompt = `Bạn là nhân viên chăm sóc khách hàng chuyên nghiệp của hệ thống Thẩm mỹ/Nha khoa/Da liễu Như Hoa.
Tên khách hàng là "${customerName || 'Quý khách'}".
Yêu cầu:
1. Trả lời thật ngắn gọn, tự nhiên, thân thiện và lịch sự.
2. Không xưng tôi, xưng là "dạ", "bác sĩ", hoặc "phòng khám". Gọi khách là "anh/chị" hoặc tên khách.
${isAutoReply ? '3. Vì bạn đang trả lời tự động, hãy ưu tiên xoa dịu, xin thông tin số điện thoại hoặc báo khách đợi một chút nhân viên sẽ vào hỗ trợ ngay.' : '3. Đưa ra câu trả lời đi thẳng vào vấn đề khách hỏi.'}`;

    // Chuyển đổi định dạng messages sang chuẩn OpenAI
    const openAIMessages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    messages.forEach((msg: any) => {
      openAIMessages.push({
        role: msg.sender === 'customer' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    let reply = '';
    
    try {
      // Dùng openrouter/free làm mặc định để tự động chọn model rảnh rỗi nhất
      const completion = await openai.chat.completions.create({
        model: 'openrouter/free',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 300,
      });
      reply = completion.choices[0]?.message?.content?.trim() || '';
    } catch (e: any) {
      // Dự phòng nếu model free bị quá tải (429) hoặc lỗi
      console.warn("Lỗi model chính, thử model dự phòng...", e.message);
      const fallbackCompletion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 300,
      });
      reply = fallbackCompletion.choices[0]?.message?.content?.trim() || '';
    }

    if (!reply) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json({ reply: reply });
  } catch (error: any) {
    console.error('OpenAI/OpenRouter API Error:', error);
    const keyPrefix = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) + '...' : 'NONE';
    return NextResponse.json({ error: `[Key: ${keyPrefix}] ${error.message}` }, { status: 500 });
  }
}
