import { NextResponse } from 'next/server'

// 定义响应类型
interface LogoResponse {
  description: string;
  imageUrl: string;
}

// 创意总监Agent调用
async function getCreativeDirection(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "THUDM/glm-4-9b-chat", // 使用适合的模型
        messages: [
          {
            role: "system",
            content: "You are a Creative Director specialized in logo design. Provide concise, creative English descriptions for logo designs based on client requirements. Focus on key visual elements, style, and symbolism."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Creative Director API Error:', error);
    throw new Error('Failed to get creative direction');
  }
}

// 设计师Agent调用
async function generateLogoImage(creativeDescription: string): Promise<string> {
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: `Create a professional logo design: ${creativeDescription}. Minimalist, modern, vector style logo.`,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Designer API Error:', error);
    throw new Error('Failed to generate logo image');
  }
}

// API路由处理函数
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 1. 获取创意方向
    const creativeDirection = await getCreativeDirection(prompt);
    
    // 2. 生成Logo图片
    const logoImageUrl = await generateLogoImage(creativeDirection);

    // 3. 返回结果
    const response: LogoResponse = {
      description: creativeDirection,
      imageUrl: logoImageUrl
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Logo Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate logo' },
      { status: 500 }
    );
  }
} 