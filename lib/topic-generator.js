import { callAI } from './ai.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 生成食材养生选题
 * @param {Object} config - API 配置
 * @returns {Promise<string[]>} 6个选题数组
 */
export async function generateTopics(config) {
  const prompt = readFileSync(join(__dirname, '../prompts/topic.md'), 'utf-8');
  const response = await callAI(config, prompt);

  // 解析响应，按行分割，过滤空行
  const topics = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    // 移除可能的编号前缀（如 "1. "、"2. "）
    .map(line => line.replace(/^\d+[\.\、\s]+/, ''))
    .slice(0, 6);

  return topics;
}
