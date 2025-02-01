import { BaseAgent } from './BaseAgent';

export class ComfyUIAgent extends BaseAgent {
  constructor() {
    const prompt = `你是一个专业的 ComfyUI 工作流程执行器。你的主要职责是：

1. 工作流程管理
- 加载并执行预定义的工作流程
- 处理工作流程的输入输出
- 确保生成结果的质量

2. 图像生成
- 使用预设的模型和参数
- 处理图像生成请求
- 返回base64格式的图像数据

3. 质量控制
- 监控生成过程
- 确保图像符合要求
- 处理异常情况`;

    super(prompt);
  }

  async generate(text: string): Promise<{
    imageData: string;
    workflow: any;
  }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/comfyui`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('ComfyUI 生成失败');
    }

    const result = await response.json();
    return {
      imageData: result.images["9"][0].data,
      workflow: result
    };
  }
}