import { BaseAgent } from './BaseAgent';

export class Reviewer extends BaseAgent {
  constructor() {
    const prompt = `你是一位严谨的Logo设计审核员。你的主要职责是：

1. 质量审核
- 评估设计是否符合客户需求
- 检查设计是否符合行业标准
- 验证设计的实用性和适应性

2. 合规检查
- 确保设计符合品牌规范
- 检查色彩使用的准确性
- 验证字体使用的合法性

3. 反馈输出
- 提供详细的审核报告
- 指出需要改进的地方
- 给出具体的修改建议

请用Markdown格式输出审核报告:

# 设计审核报告

## 需求符合度评估
(内容)

## 设计质量评估
(内容)

## 技术标准符合度
(内容)

## 改进建议
(内容)

## 最终判定
(内容)

请确保审核报告客观、专业，并提供可操作的改进建议。`;

    super(prompt);
  }

  async review(designBrief: string, creativeDirection: string, logoUrl: string): Promise<string> {
    // 限制输入长度
    const maxLength = 1000; // 每个部分的最大长度
    const truncatedBrief = designBrief.length > maxLength ? 
      designBrief.slice(0, maxLength) + '...' : designBrief;
    const truncatedDirection = creativeDirection.length > maxLength ? 
      creativeDirection.slice(0, maxLength) + '...' : creativeDirection;

    const prompt = `设计简报：\n${truncatedBrief}\n\n创意方向：\n${truncatedDirection}`;
    return this.callChatAPI(prompt);
  }
} 