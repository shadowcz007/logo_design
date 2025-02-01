import { NextResponse } from 'next/server'
import { CustomerManager, CreativeDirector, GraphicDesigner, Reviewer } from '@/lib/prompts'
import { marked } from 'marked'

// 定义响应类型
interface LogoResponse {
  description: string;
  imageUrl: string;
  designBrief: string;
  creativeDirection: string;
  review: string;
}

// 客户经理处理需求
async function processCustomerRequirement(prompt: string): Promise<string> {
  try {
    const customerManager = new CustomerManager();
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "THUDM/glm-4-9b-chat",
        messages: [
          {
            role: "system",
            content: customerManager.getSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Customer Manager Error:', error);
    throw new Error('Failed to process customer requirement');
  }
}

// 创意总监生成方案
async function getCreativeDirection(designBrief: string): Promise<string> {
  try {
    const creativeDirector = new CreativeDirector();
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "THUDM/glm-4-9b-chat",
        messages: [
          {
            role: "system",
            content: creativeDirector.getSystemPrompt()
          },
          {
            role: "user",
            content: designBrief
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Creative Director Error:', error);
    throw new Error('Failed to get creative direction');
  }
}

// 设计师生成Logo
async function generateLogoImage(creativeDirection: string): Promise<string> {
  try {
    const graphicDesigner = new GraphicDesigner();
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: `${graphicDesigner.getSystemPrompt()}\n\nDesign based on: ${creativeDirection}`,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Designer Error:', error);
    throw new Error('Failed to generate logo image');
  }
}

// 审核员评审
async function reviewDesign(
  designBrief: string, 
  creativeDirection: string, 
  logoUrl: string
): Promise<string> {
  try {
    const reviewer = new Reviewer();
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "THUDM/glm-4-9b-chat",
        messages: [
          {
            role: "system",
            content: reviewer.getSystemPrompt()
          },
          {
            role: "user",
            content: `设计简报：\n${designBrief}\n\n创意方向：\n${creativeDirection}\n\nLogo预览：${logoUrl}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Reviewer Error:', error);
    throw new Error('Failed to review design');
  }
}

// API路由处理函数
export async function POST(request: Request) {
  try {
    const { prompt, useComfyUI } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '需要提供设计需求' },
        { status: 400 }
      );
    }

    if (useComfyUI) {
      // 使用 ComfyUI 生成图片
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/comfyui`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('ComfyUI API 调用失败');
      }
      
      const result = await response.json();
      
      // 转换结果格式以匹配原有接口
      const logoResponse: LogoResponse = {
        description: marked.parse(`# ComfyUI 生成结果\n\n使用 ComfyUI 生成的图片`),
        imageUrl: `data:image/png;base64,${result.images["9"][0].data}`, // 假设节点8是输出图片的节点
        designBrief: marked.parse(`# 设计简报\n\n使用 ComfyUI 工作流程生成`),
        creativeDirection: marked.parse(`# 创意方向\n\n基于 ComfyUI 模型生成`),
        review: marked.parse(`# 设计评审\n\n由 ComfyUI 自动生成的图片`)
      };

      return NextResponse.json(logoResponse);
    } else {
      // 原有的生成逻辑
      const designBrief = await processCustomerRequirement(prompt);
      const creativeDirection = await getCreativeDirection(designBrief);
      const logoUrl = await generateLogoImage(creativeDirection);
      const review = await reviewDesign(designBrief, creativeDirection, logoUrl);

      return NextResponse.json({
        description: marked.parse(creativeDirection),
        imageUrl: logoUrl,
        designBrief: marked.parse(designBrief),
        creativeDirection: marked.parse(creativeDirection),
        review: marked.parse(review)
      });
    }
  } catch (error) {
    console.error('Logo Generation Error:', error);
    return NextResponse.json(
      { error: '生成Logo失败' },
      { status: 500 }
    );
  }
} 