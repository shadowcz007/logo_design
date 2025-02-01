import { CustomerManager, CreativeDirector, GraphicDesigner, Reviewer } from '../';

describe('Logo设计智能体测试', () => {
  beforeAll(() => {
    // 确保测试环境设置正确
    process.env.NODE_ENV = 'test';
  });

  test('完整Logo设计流程测试', async () => {
    const customerManager = new CustomerManager();
    const creativeDirector = new CreativeDirector();
    const graphicDesigner = new GraphicDesigner();
    const reviewer = new Reviewer();

    const input = "需要一个科技公司的logo";
    const designBrief = await customerManager.processRequirement(input);
    
    expect(designBrief).toContain('设计需求分析报告');
    expect(designBrief).toContain('设计偏好');
    expect(designBrief).toContain('核心元素');
  });

  test('特殊场景测试 - 极简需求', async () => {
    const customerManager = new CustomerManager();
    const minimalInput = "需要一个简单的黑色字母logo，只写公司名称XYZ";
    const designBrief = await customerManager.processRequirement(minimalInput);
    
    expect(designBrief).toContain('设计需求分析报告');
    expect(designBrief).toContain('设计偏好');
    expect(designBrief).toContain('核心元素');
  });

  test('特殊场景测试 - 复杂需求', async () => {
    const customerManager = new CustomerManager();
    const complexInput = `
      我们是一家综合性企业，需要一个能够在不同场景下使用的logo：
      1. 需要能在黑白打印时清晰可见
      2. 要包含中英文企业名称
      3. 要体现传统与现代的结合
      4. 需要考虑在各种尺寸下的表现
      5. 要有象征性的图形元素
    `;
    const designBrief = await customerManager.processRequirement(complexInput);
    
    expect(designBrief).toContain('设计需求分析报告');
    expect(designBrief).toContain('设计偏好');
    expect(designBrief).toContain('核心元素');
  });
}); 