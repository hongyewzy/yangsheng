import { generateTopics } from '../lib/topic-generator.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('generateTopics 应该返回 6 个选题', async () => {
  const config = JSON.parse(readFileSync(join(__dirname, '../config.json'), 'utf-8'));
  const topics = await generateTopics(config);

  expect(Array.isArray(topics)).toBe(true);
  expect(topics.length).toBe(6);
  topics.forEach(topic => {
    expect(typeof topic).toBe('string');
    expect(topic.length).toBeGreaterThan(5);
  });
}, 60000);
