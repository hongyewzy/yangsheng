# 食材养生公众号文章生成器 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一键生成食材养生公众号文章的 Node.js 命令行工具

**Architecture:** Node.js 脚本工具，调用 AI API 生成选题和文章，输出符合微信公众号格式规范的 HTML 文件

**Tech Stack:** Node.js, 原生 fetch API, 文件系统操作

---

## 文件结构

```
养生/
├── config.json              # API配置（url、key、model）
├── run.js                   # 主入口
├── lib/
│   ├── ai.js                # AI API调用封装
│   ├── topic-generator.js   # 选题生成器
│   ├── article-generator.js # 文章生成器
│   └── formatter.js         # HTML格式化
├── prompts/
│   ├── topic.md             # 选题生成提示词
│   └── article.md           # 文章生成提示词
└── outputs/                 # 输出目录（自动创建）
```

---

### Task 1: 项目初始化与配置

**Files:**
- Create: `package.json`
- Create: `config.json`

- [ ] **Step 1: 初始化 package.json**

```bash
npm init -y
```

- [ ] **Step 2: 创建配置文件模板**

创建 `config.json`:

```json
{
  "apiUrl": "YOUR_API_URL",
  "apiKey": "YOUR_API_KEY",
  "model": "YOUR_MODEL_NAME"
}
```

- [ ] **Step 3: 提交初始化**

```bash
git add package.json config.json
git commit -m "chore: 初始化项目配置"
```

---

### Task 2: AI API 调用模块

**Files:**
- Create: `lib/ai.js`
- Create: `test/ai.test.js`

- [ ] **Step 1: 写失败测试**

创建 `test/ai.test.js`:

```javascript
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
```

- [ ] **Step 2: 运行测试确认失败**

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js test/ai.test.js
```

Expected: FAIL - `callAI` 未定义

- [ ] **Step 3: 实现 AI 调用模块**

创建 `lib/ai.js`:

```javascript
/**
 * 调用 AI API
 * @param {Object} config - API 配置 { apiUrl, apiKey, model }
 * @param {string} prompt - 提示词
 * @returns {Promise<string>} AI 响应内容
 */
export async function callAI(config, prompt) {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

- [ ] **Step 4: 安装测试依赖并运行测试**

```bash
npm install --save-dev jest
```

修改 `package.json` 添加:

```json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/ai.js test/ai.test.js package.json package-lock.json
git commit -m "feat: 实现 AI API 调用模块"
```

---

### Task 3: 选题生成器模块

**Files:**
- Create: `prompts/topic.md`
- Create: `lib/topic-generator.js`
- Create: `test/topic-generator.test.js`

- [ ] **Step 1: 创建选题提示词模板**

创建 `prompts/topic.md`:

```markdown
你是一个专注于"食材养生"领域的公众号内容策划专家。

请生成 6 个食材养生领域的爆款选题，要求：

1. 标题公式：数字 + 食材/动作 + 效果
2. 目标人群：中老年养生群体
3. 风格：口语化、接地气、有吸引力
4. 每个选题独占一行，不要编号

示例选题：
- 睡前吃3颗这个，血管干净人轻松
- 这5种食物是"天然消炎药"，厨房里就有
- 每天2片它，肝脏越来越干净

现在请生成6个食材养生选题：
```

- [ ] **Step 2: 写失败测试**

创建 `test/topic-generator.test.js`:

```javascript
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
```

- [ ] **Step 3: 运行测试确认失败**

```bash
npm test test/topic-generator.test.js
```

Expected: FAIL - `generateTopics` 未定义

- [ ] **Step 4: 实现选题生成器**

创建 `lib/topic-generator.js`:

```javascript
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
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npm test test/topic-generator.test.js
```

Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add prompts/topic.md lib/topic-generator.js test/topic-generator.test.js
git commit -m "feat: 实现选题生成器模块"
```

---

### Task 4: 文章生成器模块

**Files:**
- Create: `prompts/article.md`
- Create: `lib/article-generator.js`
- Create: `test/article-generator.test.js`

- [ ] **Step 1: 创建文章提示词模板**

创建 `prompts/article.md`:

```markdown
你是一个食材养生领域的公众号内容创作者，擅长写中老年群体喜欢的养生文章。

请根据以下选题，写一篇食材养生文章：

**选题：** {{TITLE}}

**要求：**

1. **导语**（1段）：用场景或痛点引入，引起共鸣

2. **正文**（4-6段）：
   - 介绍食材的营养价值和功效
   - 具体的食用方法和注意事项
   - 口语化表达，多用"你""我们"
   - 每段不超过3行，重点句子用【】标注

3. **养生小贴士**：3条实用的养生建议

4. **结尾互动**：引导读者留言分享经验

**风格要求：**
- 口语化、接地气
- 避免专业术语，用通俗语言解释
- 适当使用感叹号增强语气
- 真诚、温暖、有亲和力

请直接输出文章内容，不要输出标题：
```

- [ ] **Step 2: 写失败测试**

创建 `test/article-generator.test.js`:

```javascript
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
```

- [ ] **Step 3: 运行测试确认失败**

```bash
npm test test/article-generator.test.js
```

Expected: FAIL - `generateArticle` 未定义

- [ ] **Step 4: 实现文章生成器**

创建 `lib/article-generator.js`:

```javascript
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
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npm test test/article-generator.test.js
```

Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add prompts/article.md lib/article-generator.js test/article-generator.test.js
git commit -m "feat: 实现文章生成器模块"
```

---

### Task 5: HTML 格式化模块

**Files:**
- Create: `lib/formatter.js`
- Create: `test/formatter.test.js`

- [ ] **Step 1: 写失败测试**

创建 `test/formatter.test.js`:

```javascript
import { formatToHTML } from '../lib/formatter.js';

test('formatToHTML 应该生成符合公众号规范的 HTML', () => {
  const title = '睡前吃3颗桂圆，睡眠越来越好';
  const content = `现在很多人都有睡眠问题。

【桂圆】是一种很好的养生食材。

养生小贴士：
1. 睡前泡脚
2. 保持规律作息`;

  const html = formatToHTML(title, content);

  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toContain(title);
  // 使用 span 标签实现加粗，符合公众号规范
  expect(html).toContain('font-weight: bold');
  // 包含复制按钮
  expect(html).toContain('复制成功');
  // 正文字号 17px
  expect(html).toContain('font-size: 17px');
  // 高亮颜色
  expect(html).toContain('#d4237a');
});

test('formatToHTML 应该正确处理【】高亮标记', () => {
  const html = formatToHTML('测试标题', '这是【重点内容】需要高亮');

  expect(html).toContain('#d4237a');
  expect(html).toContain('重点内容');
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test test/formatter.test.js
```

Expected: FAIL - `formatToHTML` 未定义

- [ ] **Step 3: 实现 HTML 格式化**

创建 `lib/formatter.js`:

```javascript
/**
 * 将文章内容格式化为符合微信公众号规范的 HTML
 * @param {string} title - 文章标题
 * @param {string} content - 文章正文
 * @returns {string} 完整的 HTML 文件内容
 */
export function formatToHTML(title, content) {
  // 处理【】高亮标记
  let formattedContent = content.replace(/【(.+?)】/g, (match, text) => {
    return `<span style="font-weight: bold; color: #d4237a;">${text}</span>`;
  });

  // 按段落分割并包装
  const paragraphs = formattedContent
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      // 如果已经被 span 包裹，直接用 p 包装
      if (line.includes('<span')) {
        return `<p style="margin: 0 0 20px;">${line}</p>`;
      }
      return `<p style="margin: 0 0 20px;">${line}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { background: #f5f5f5; padding: 20px; }
    .copy-btn { display: block; margin: 20px auto; padding: 10px 30px; background: #07c160; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
  </style>
</head>
<body>

<button class="copy-btn" onclick="copyContent()">点击复制文章内容</button>

<div id="wechat-content" style="max-width: 580px; margin: 0 auto; background: #fff; padding: 20px 15px; font-family: -apple-system-font, BlinkMacSystemFont, 'Helvetica Neue', PingFang SC, sans-serif; font-size: 17px; color: #3e3e3e; line-height: 2;">

  <p style="margin: 0 0 25px; text-align: center; font-size: 22px; font-weight: bold; color: #3e3e3e;">${title}</p>

  ${paragraphs}

</div>

<script>
function copyContent() {
  const content = document.getElementById('wechat-content');
  const range = document.createRange();
  range.selectNodeContents(content);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  alert('复制成功！');
  selection.removeAllRanges();
}
</script>

</body>
</html>`;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test test/formatter.test.js
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/formatter.js test/formatter.test.js
git commit -m "feat: 实现 HTML 格式化模块"
```

---

### Task 6: 主入口脚本

**Files:**
- Create: `run.js`

- [ ] **Step 1: 实现主入口脚本**

创建 `run.js`:

```javascript
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { generateTopics } from './lib/topic-generator.js';
import { generateArticle } from './lib/article-generator.js';
import { formatToHTML } from './lib/formatter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  try {
    // 读取配置
    const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));

    console.log('🚀 开始生成选题...\n');

    // 1. 生成选题
    const topics = await generateTopics(config);

    console.log('📝 今日选题：\n');
    topics.forEach((topic, index) => {
      console.log(`  ${index + 1}. ${topic}`);
    });
    console.log('');

    // 2. 用户选择
    const answer = await question('请选择一个选题（输入序号 1-6）：');
    const selectedIndex = parseInt(answer) - 1;

    if (selectedIndex < 0 || selectedIndex >= topics.length || isNaN(selectedIndex)) {
      console.log('❌ 无效选择，退出');
      rl.close();
      return;
    }

    const selectedTopic = topics[selectedIndex];
    console.log(`\n✅ 已选择：${selectedTopic}`);
    console.log('⏳ 正在生成文章...\n');

    // 3. 生成文章
    const articleContent = await generateArticle(config, selectedTopic);

    // 4. 格式化为 HTML
    const html = formatToHTML(selectedTopic, articleContent);

    // 5. 保存文件
    const today = new Date().toISOString().split('T')[0];
    const outputDir = join(__dirname, 'outputs', today);
    mkdirSync(outputDir, { recursive: true });

    // 保存选题池
    writeFileSync(
      join(outputDir, '选题池.md'),
      topics.map((t, i) => `${i + 1}. ${t}`).join('\n'),
      'utf-8'
    );

    // 保存文章 HTML
    const safeFilename = selectedTopic.replace(/[\/\\?%*:|"<>]/g, '');
    writeFileSync(join(outputDir, `${safeFilename}.html`), html, 'utf-8');

    console.log(`\n✨ 完成！文件已保存到 outputs/${today}/`);
    console.log(`   - 选题池.md`);
    console.log(`   - ${safeFilename}.html`);

    rl.close();
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: 手动测试运行**

```bash
node run.js
```

Expected:
1. 输出6个选题
2. 等待用户输入
3. 生成文章并保存到 outputs/日期/ 目录

- [ ] **Step 3: 提交**

```bash
git add run.js
git commit -m "feat: 实现主入口脚本"
```

---

### Task 7: 创建 outputs 目录和 .gitkeep

**Files:**
- Create: `outputs/.gitkeep`

- [ ] **Step 1: 创建输出目录**

```bash
mkdir -p outputs
touch outputs/.gitkeep
```

- [ ] **Step 2: 更新 .gitignore**

创建 `.gitignore`:

```
node_modules/
outputs/*
!outputs/.gitkeep
```

- [ ] **Step 3: 提交**

```bash
git add outputs/.gitkeep .gitignore
git commit -m "chore: 添加输出目录和 gitignore"
```

---

## 自检清单

- [x] 所有需求都有对应任务
- [x] 每个步骤都有具体代码
- [x] 测试先行（TDD）
- [x] 无占位符（TBD、TODO）
- [x] 类型和方法名在所有任务中保持一致
