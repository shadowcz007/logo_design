interface LogoResponse {
  description: string;
  imageUrl: string;
}

export const generateMockResponse = (prompt: string): LogoResponse => {
  return {
    description: `基于您的需求："${prompt}"\n\n建议的LOGO设计方案：\n
1. 主要设计元素：采用简约现代的几何图形
2. 配色方案：使用深蓝色(#1a365d)和银灰色(#718096)
3. 字体选择：无衬线字体，突出科技感
4. 设计理念：通过简洁的线条传达专业性和创新精神
5. 应用建议：适合在各种尺寸下保持清晰度，特别适合数字化场景`,
    imageUrl: 'https://via.placeholder.com/400x400/1a365d/ffffff?text=Logo+Preview'
  };
}; 