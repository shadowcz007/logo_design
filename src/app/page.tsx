'use client'

import { Button, Input, Tabs } from 'antd'
import { useState, useCallback } from 'react'
import { generateMockResponse } from '@/lib/mockData'

const { TextArea } = Input

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<{ description: string; imageUrl: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('text')

  // 修改 handleGenerate 函数的实现
  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      return
    }
    setLoading(true)
    
    // 模拟API调用延迟
    setTimeout(() => {
      const mockResult = generateMockResponse(prompt)
      setResult(mockResult)
      setLoading(false)
    }, 1500)
  }, [prompt]) // 只依赖 prompt

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
              key: 'text',
              label: '文本描述',
              children: (
                <div className="min-h-[200px] p-4 bg-gray-50 rounded">
                  {result ? (
                    <div className="whitespace-pre-line">{result.description}</div>
                  ) : (
                    <div className="text-gray-400">请输入需求并点击生成按钮...</div>
                  )}
                </div>
              ),
            },
            {
              key: 'image',
              label: '图像预览',
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
          ]}
        />
      </div>

    </main>
  )
}
