# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

食材养生公众号文章生成工具。从选题生成到文章输出全自动化，包括：
1. AI 生成 6 个养生选题
2. 用户选择后生成完整文章（含图片标记）
3. 自动识别文章中食材和场景，调用 ModelScope 生成配图
4. 输出微信公众号格式 HTML（Base64 图片嵌入）

## 常用命令

```bash
# 交互式运行（会提示选择选题）
node run.js

# 非交互运行，直接选择第 N 个选题
node run.js 1

# 运行测试
npm test
```

## 架构

```
run.js          # 主入口，流程编排（选题→文章→图片→HTML）
lib/
  ai.js                    # 调用讯飞星火 API（带重试）
  topic-generator.js       # 选题生成
  article-generator.js     # 文章生成 + 图片标记解析
  image-generator.js       # 调用 zimage-skill 生成图片
  formatter.js             # 转换为公众号 HTML
prompts/
  topic.md     # 选题提示词
  article.md   # 文章提示词
config.json    # API 配置（含密钥）
```

## 工作流

1. `generateTopics()` → 调用 AI 生成 6 个选题
2. 用户选择 → `generateArticle()` → 生成文章（带 `[食材图：xxx]` 标记）
3. `generateArticleImages()` → 解析文章关键词，调用 `zimage-skill` 生成图片
4. `formatToHTML()` → 嵌入 Base64 图片，输出公众号 HTML

## 注意事项

- `config.json` 含 API 密钥，勿提交到公开仓库
- 图片生成依赖 `C:/Users/10012085/.claude/skills/zimage-skill/generate.py`
- 输出文件保存到 `outputs/YYYY-MM-DD/` 目录
