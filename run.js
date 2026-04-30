import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { generateTopics } from './lib/topic-generator.js';
import { generateArticle } from './lib/article-generator.js';
import { formatToHTML } from './lib/formatter.js';
import { generateArticleImages } from './lib/image-generator.js';

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

    // 2. 用户选择（支持命令行参数或交互输入）
    let selectedIndex;
    if (process.argv[2]) {
      selectedIndex = parseInt(process.argv[2]) - 1;
    } else {
      const answer = await question('请选择一个选题（输入序号 1-6）：');
      selectedIndex = parseInt(answer) - 1;
    }

    if (selectedIndex < 0 || selectedIndex >= topics.length || isNaN(selectedIndex)) {
      console.log('❌ 无效选择，退出');
      rl.close();
      return;
    }

    const selectedTopic = topics[selectedIndex];
    console.log(`\n✅ 已选择：${selectedTopic}`);
    console.log('⏳ 正在生成文章（含图片标记）...\n');

    // 3. 生成文章（含图片标记）
    const articleContent = await generateArticle(config, selectedTopic);
    console.log('📄 文章生成完成，解析图片需求...\n');

    // 创建输出目录
    const safeFilename = selectedTopic.replace(/[\/\\?%*:|"<>]/g, '');
    const today = new Date().toISOString().split('T')[0];
    const outputDir = join(__dirname, 'outputs', today);
    mkdirSync(outputDir, { recursive: true });

    // 4. 根据文章内容生成对应图片
    // 如果 imageApiKey 未设置，使用 apiKey（统一使用 ModelScope）
    const imageApiKey = config.imageApiKey || config.apiKey;
    const imageResults = await generateArticleImages(selectedTopic, articleContent, outputDir, imageApiKey);

    // 5. 格式化为 HTML（嵌入 Base64 图片）
    console.log('🎨 正在生成HTML...\n');
    const html = formatToHTML(selectedTopic, imageResults.originalContent, {
      cover: imageResults.cover,
      food: imageResults.food,
      scene: imageResults.scene
    });

    // 保存选题池
    writeFileSync(
      join(outputDir, '选题池.md'),
      topics.map((t, i) => `${i + 1}. ${t}`).join('\n'),
      'utf-8'
    );

    // 保存文章 HTML
    writeFileSync(join(outputDir, `${safeFilename}.html`), html, 'utf-8');

    // 统计生成的图片
    const totalImages = Object.keys(imageResults.cover).length +
                        Object.keys(imageResults.food).length +
                        Object.keys(imageResults.scene).length;

    console.log(`\n✨ 完成！文件已保存到 outputs/${today}/`);
    console.log(`   - 选题池.md`);
    console.log(`   - ${safeFilename}.html`);
    console.log(`   - 共生成 ${totalImages} 张配图`);

    rl.close();
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    console.error(error.stack);
    rl.close();
    process.exit(1);
  }
}

main();
