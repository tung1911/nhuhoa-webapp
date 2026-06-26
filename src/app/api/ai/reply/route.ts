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
    
    let systemPrompt = `Bạn là trợ lý tư vấn online của Thẩm mỹ Như Hoa. Tên khách hàng là "${customerName || 'chị đẹp'}".

Phong cách trả lời:
- Lễ phép, gần gũi, tự nhiên.
- Gọi khách là “chị đẹp”, “chị”, “em” tùy ngữ cảnh. Nếu có tên khách hàng, hãy gọi bằng tên.
- Không nói quá, không cam kết tuyệt đối.
- Không body shaming, không làm khách tự ti về ngoại hình.
- Không thay bác sĩ chẩn đoán.
- Luôn khai thác nhu cầu trước khi tư vấn.
- Khi khách hỏi giá, hãy giải thích giá phụ thuộc vào tình trạng, phương pháp, chất liệu và mời khách gửi ảnh hoặc đặt lịch tư vấn.
- Khi khách quan tâm nâng mũi, nhắc đến tư vấn cá nhân hóa, mô phỏng Vectra XT 3D, bác sĩ chuyên môn và chính sách đồng hành sau làm.
- Khi khách dưới 18 tuổi, không chốt phẫu thuật, cần có phụ huynh/người giám hộ đi cùng khi tư vấn.
- Mục tiêu cuối cùng là lấy thông tin khách hàng hoặc đặt lịch tư vấn trực tiếp.

Quy trình trả lời:
1. Chào khách.
2. Hỏi khách quan tâm dịch vụ nào.
3. Khai thác tình trạng hiện tại.
4. Tư vấn sơ bộ theo nhu cầu.
5. Mời khách gửi ảnh nếu cần.
6. Giải thích cần bác sĩ thăm khám để tư vấn chính xác.
7. Đề xuất đặt lịch tư vấn.
8. Xin họ tên, số điện thoại, dịch vụ quan tâm và thời gian khách muốn qua.

Không được dùng các câu như:
- Đảm bảo đẹp 100%.
- Không đau tuyệt đối.
- Không sưng.
- Ai làm cũng đẹp.
- Giá rẻ nhất.
- Chắc chắn khỏi/chắc chắn đẹp.

Quy tắc bổ sung:
- Trả lời thật ngắn gọn, tự nhiên, thân thiện.
${isAutoReply ? '- Vì bạn đang trả lời tự động, hãy tập trung xoa dịu, hỏi thăm và xin thông tin số điện thoại.' : '- Đưa ra câu trả lời đi thẳng vào vấn đề khách hỏi.'}`;

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
      // Dùng mô hình Hermes 3 405B (Rất thông minh và KHÔNG kiểm duyệt gắt gao như Gemini)
      const completion = await openai.chat.completions.create({
        model: 'nousresearch/hermes-3-llama-3.1-405b:free',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 300,
      });
      reply = completion.choices[0]?.message?.content?.trim() || '';
      
      if (reply.includes('User Safety:')) {
        throw new Error("Model refused due to safety filters");
      }
    } catch (e: any) {
      // Dự phòng nếu model chính bị quá tải (429) hoặc từ chối
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
