'use client'

import { Button, Input, Tabs } from 'antd'
import { useState, useCallback } from 'react'
import { generateMockResponse } from '@/lib/mockData'

const { TextArea } = Input

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<{
    description: string;
    imageUrl: string;
    designBrief: any;
    creativeDirection: any;
    review: any;
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('text')

  // 修改 handleGenerate 函数的实现
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate logo');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      // 可以添加错误提示
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }, [])

  return (
    <main className="flex min-h-screen p-6">
      {/* 左侧输入区域 */}
      <div className="w-1/3 pr-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">输入您的LOGO需求</h2>
          <TextArea
            rows={6}
            value={prompt}
            onChange={handleInputChange}
            placeholder="请描述您想要的LOGO风格、颜色、元素等..."
            className="mb-4"
          />
          <Button 
            type="primary" 
            block 
            onClick={handleGenerate}
            loading={loading}
            disabled={!prompt.trim()}
          >
            生成LOGO
          </Button>
        </div>
      </div>

      {/* 右侧结果显示区域 */}
      <div className="w-2/3 border-l pl-6">
        <h2 className="text-xl font-bold mb-4">生成结果</h2>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          destroyInactiveTabPane={true}
          animated={false}
          items={[
            {
              key: 'brief',
              label: '设计简报',
              children: (
                <div className="min-h-[200px] p-4 bg-gray-50 rounded">
                  {result ? (
                    <div className="prose max-w-none" 
                         dangerouslySetInnerHTML={{ __html: result.designBrief }} />
                  ) : (
                    <div className="text-gray-400">请输入需求并点击生成按钮...</div>
                  )}
                </div>
              ),
            },
            {
              key: 'creative',
              label: '创意方向',
              children: (
                <div className="min-h-[200px] p-4 bg-gray-50 rounded">
                  {result ? (
                    <div className="prose max-w-none"
                         dangerouslySetInnerHTML={{ __html: result.creativeDirection }} />
                  ) : (
                    <div className="text-gray-400">请输入需求并点击生成按钮...</div>
                  )}
                </div>
              ),
            },
            {
              key: 'description',
              label: '设计说明',
              children: (
                <div className="min-h-[200px] p-4 bg-gray-50 rounded">
                  {result ? (
                    <div className="prose max-w-none"
                         dangerouslySetInnerHTML={{ __html: result.description }} />
                  ) : (
                    <div className="text-gray-400">请输入需求并点击生成按钮...</div>
                  )}
                </div>
              ),
            },
            {
              key: 'image',
              label: 'Logo预览',
              children: (
                <div className="min-h-[200px] p-4 bg-gray-50 rounded">
                  {result ? (
                    <img 
                      src={result.imageUrl} 
                      alt="Logo预览" 
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="text-gray-400">请输入需求并点击生成按钮...</div>
                  )}
                </div>
              ),
            },
            {
              key: 'review',
              label: '设计评审',
              children: (
                <div className="min-h-[200px] p-4 bg-gray-50 rounded">
                  {result ? (
                    <div className="prose max-w-none"
                         dangerouslySetInnerHTML={{ 
                           __html: typeof result.review === 'string' 
                             ? result.review 
                             : JSON.stringify(result.review, null, 2)
                         }} />
                  ) : (
                    <div className="text-gray-400">请输入需求并点击生成按钮...</div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

    </main>
  )
}
