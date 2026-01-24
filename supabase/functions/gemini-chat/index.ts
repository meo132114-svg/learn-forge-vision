import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  messages: { role: string; content: string }[];
  systemPrompt?: string;
  context?: {
    hollandResults?: any;
    bigFiveResults?: any;
    roadmap?: any;
    universities?: any[];
    testResults?: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, systemPrompt, context }: RequestBody = await req.json();

    // Build system instruction based on context
    let fullSystemPrompt = systemPrompt || `Bạn là trợ lý AI hướng nghiệp thông minh của Future Me AI. 
Nhiệm vụ của bạn là:
1. Phân tích kết quả test Holland Code và Big Five (OCEAN) 
2. Tư vấn ngành học và trường đại học phù hợp
3. Xây dựng và điều chỉnh lộ trình học tập cá nhân hóa
4. Hỗ trợ học sinh/sinh viên phát triển bản thân

QUAN TRỌNG: 
- TUYỆT ĐỐI KHÔNG hiển thị ID ngành học (ví dụ: ID_001, NGANH_002) trong câu trả lời
- CHỈ hiển thị Tên ngành và mô tả, không bao giờ đề cập đến ID nội bộ
- Trả lời bằng tiếng Việt, thân thiện và dễ hiểu.`;

    // Add context to system prompt
    if (context?.hollandResults) {
      fullSystemPrompt += `\n\nKết quả Holland Code của người dùng: ${JSON.stringify(context.hollandResults)}`;
    }
    if (context?.bigFiveResults) {
      fullSystemPrompt += `\n\nKết quả Big Five (OCEAN) của người dùng: ${JSON.stringify(context.bigFiveResults)}`;
    }
    if (context?.testResults) {
      fullSystemPrompt += `\n\nKết quả test của người dùng: ${JSON.stringify(context.testResults)}`;
    }
    if (context?.universities && context.universities.length > 0) {
      // Remove IDs before sending to AI
      const cleanedUniversities = context.universities.slice(0, 50).map((u: any) => ({
        tenTruong: u['Tên trường'],
        tenNganh: u['Tên ngành'],
        diemChuan: u['điểm chuẩn 2025'],
        toHop: u['Tổ hợp'],
        phuongThuc: u['Phương thức xét tuyển'],
      }));
      fullSystemPrompt += `\n\nDữ liệu trường đại học để tham khảo (CHỈ gợi ý từ danh sách này, KHÔNG đề cập ID): ${JSON.stringify(cleanedUniversities)}`;
    }
    if (context?.roadmap) {
      fullSystemPrompt += `\n\nLộ trình hiện tại của người dùng: ${JSON.stringify(context.roadmap)}`;
    }

    // Convert messages to OpenAI-compatible format
    const chatMessages = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: chatMessages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Đã vượt quá giới hạn yêu cầu, vui lòng thử lại sau.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Cần nạp thêm credits, vui lòng liên hệ quản trị viên.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text from response
    const aiResponse = data.choices?.[0]?.message?.content || 
      'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in gemini-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
