import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import WebSocket from 'ws';

async function loadWorkflowJson() {
  const filePath = path.join(process.cwd(), 'src/lib/workflow/workflow_api.json');
  const fileContent = await fs.readFile(filePath, 'utf8');
  const workflowData = JSON.parse(fileContent);
  
  // 生成随机种子值 (32位整数范围内)
  const randomSeed = Math.floor(Math.random() * 2147483647);
  
  // 更新节点3的seed值
  if (workflowData["3"] && workflowData["3"].inputs) {
    workflowData["3"].inputs.seed = randomSeed;
  }
  
  return workflowData;
}

async function waitForResult(ws: WebSocket, promptId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('等待结果超时'));
    }, 300000); // 5分钟超时

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'executing') {
          const execData = message.data;
          if (execData.node === null && execData.prompt_id === promptId) {
            clearTimeout(timeout);
            // 获取历史记录
            const history = await getHistory(promptId);
            // 获取图片数据
            const images = await processOutputImages(history);
            resolve(images);
          }
        }
      } catch (error) {
        console.error('处理 WebSocket 消息错误:', error);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function getHistory(promptId: string): Promise<any> {
  const response = await fetch(`http://127.0.0.1:8188/history/${promptId}`);
  if (!response.ok) {
    throw new Error('获取历史记录失败');
  }
  const data = await response.json();
  return data[promptId];
}

async function getImage(filename: string, subfolder: string, type: string): Promise<Buffer> {
  const params = new URLSearchParams({ filename, subfolder, type });
  const response = await fetch(`http://127.0.0.1:8188/view?${params}`);
  if (!response.ok) {
    throw new Error('获取图片失败');
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function processOutputImages(history: any): Promise<any> {
  const outputImages: Record<string, any[]> = {};
  
  for (const nodeId in history.outputs) {
    const nodeOutput = history.outputs[nodeId];
    const imagesOutput = [];
    
    if (nodeOutput.images) {
      for (const image of nodeOutput.images) {
        try {
          const imageData = await getImage(
            image.filename,
            image.subfolder,
            image.type
          );
          imagesOutput.push({
            data: imageData.toString('base64'),
            ...image
          });
        } catch (error) {
          console.error(`获取图片失败: ${image.filename}`, error);
        }
      }
    }
    outputImages[nodeId] = imagesOutput;
  }
  
  return outputImages;
}

export async function POST(request: Request) {
  try {
    // 生成随机的client_id
    const client_id = Math.random().toString(36).substring(2);
    
    // 加载工作流JSON
    const workflowData = await loadWorkflowJson();
    
    // 准备请求数据
    const prompt = {
      prompt: workflowData,
      client_id: client_id
    };

    // 发送请求到ComfyUI
    const response = await fetch('http://127.0.0.1:8188/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`ComfyUI 请求失败: ${response.status}`);
    }

    const result = await response.json();
    const promptId = result.prompt_id;

    // 建立 WebSocket 连接
    const ws = new WebSocket(`ws://127.0.0.1:8188/ws?clientId=${client_id}`);

    // 等待连接建立
    await new Promise((resolve) => {
      ws.on('open', resolve);
    });

    // 等待结果
    const images = await waitForResult(ws, promptId);

    // 关闭连接
    ws.close();
    
    // 返回结果
    return NextResponse.json({
      success: true,
      client_id,
      prompt_id: promptId,
      images
    });
    
  } catch (error) {
    console.error('ComfyUI API 错误:', error);
    return NextResponse.json(
      { error: '处理 ComfyUI 请求失败' },
      { status: 500 }
    );
  }
}