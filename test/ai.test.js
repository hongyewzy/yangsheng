import { callAI } from '../lib/ai.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 读取真实配置
const config = JSON.parse(readFileSync(join(__dirname, '../config.json'), 'utf-8'));

test('callAI 应该返回 AI 响应内容', async () => {
  const result = await callAI(config, '请说"测试成功"');
  expect(typeof result).toBe('string');
  expect(result.length).toBeGreaterThan(0);
}, 30000);
