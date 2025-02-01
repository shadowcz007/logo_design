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

    const customerManager = new CustomerManager();
    const creativeDirector = new CreativeDirector();
    const graphicDesigner = new GraphicDesigner();
    const reviewer = new Reviewer();

    const designBrief = await customerManager.processRequirement(prompt);
    const creativeDirection = await creativeDirector.getDirection(designBrief);
    const logoUrl = await graphicDesigner.generateImage(creativeDirection, useComfyUI);
    const review = await reviewer.review(designBrief, creativeDirection, logoUrl);

    return NextResponse.json({
      description: marked.parse(creativeDirection),
      imageUrl: logoUrl,
      designBrief: marked.parse(designBrief),
      creativeDirection: marked.parse(creativeDirection),
      review: marked.parse(review)
    });
  } catch (error) {
    console.error('Logo Generation Error:', error);
    return NextResponse.json(
      { error: '生成Logo失败' },
      { status: 500 }
    );
  }
} 