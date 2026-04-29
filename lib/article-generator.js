import { callAI } from './ai.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 生成文章内容
 * @param {Object} config - API 配置
 * @param {string} title - 文章标题
 * @returns {Promise<string>} 文章正文内容
 */
export async function generateArticle(config, title) {
  let prompt = readFileSync(join(__dirname, '../prompts/article.md'), 'utf-8');
  prompt = prompt.replace('{{TITLE}}', title);

  const article = await callAI(config, prompt);
  return article;
}

/**
 * 从文章内容中提取图片需求
 * @param {string} content - 文章内容
 * @returns {Object} { cover: string[], food: {name, prompt}[], scene: {name, prompt}[] }
 */
export function parseImageRequirements(content) {
  const result = {
    cover: [],
    food: [],
    scene: []
  };

  // 解析 [封面图]
  const coverMatch = content.match(/\[封面图\]/g);
  if (coverMatch) {
    result.cover = coverMatch.map(() => '封面');
  }

  // 解析 [食材图：xxx]
  const foodRegex = /\[食材图：([^\]]+)\]/g;
  let match;
  while ((match = foodRegex.exec(content)) !== null) {
    result.food.push({
      name: match[1].trim(),
      prompt: match[1].trim()
    });
  }

  // 解析 [场景图：xxx]
  const sceneRegex = /\[场景图：([^\]]+)\]/g;
  while ((match = sceneRegex.exec(content)) !== null) {
    result.scene.push({
      name: match[1].trim(),
      prompt: match[1].trim()
    });
  }

  return result;
}
