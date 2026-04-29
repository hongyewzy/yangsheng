import { generateArticle } from '../lib/article-generator.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('generateArticle 应该返回完整的文章内容', async () => {
  const config = JSON.parse(readFileSync(join(__dirname, '../config.json'), 'utf-8'));
  const title = '睡前吃3颗桂圆，睡眠越来越好';
  const article = await generateArticle(config, title);

  expect(typeof article).toBe('string');
  expect(article.length).toBeGreaterThan(200);
  // 应包含关键部分
  expect(article).toContain('养生小贴士');
}, 60000);
