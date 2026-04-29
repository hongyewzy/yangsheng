import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELSCOPE_API_KEY = 'XXX';

/**
 * 生成图片
 * @param {string} prompt - 图片提示词
 * @param {string} outputPath - 输出路径
 * @param {number} width - 宽度，默认 1280
 * @param {number} height - 高度，默认 720 (16:9)
 * @returns {Promise<string>} 生成的图片路径
 */
export async function generateImage(prompt, outputPath, width = 1280, height = 720) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, MODELSCOPE_API_KEY };
    const scriptPath = 'C:/Users/10012085/.claude/skills/zimage-skill/generate.py';

    const proc = spawn('python', [scriptPath, prompt, outputPath, String(width), String(height)], { env });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`图片生成失败: ${errorOutput}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 根据图片需求数组生成图片
 * @param {Array} imageRequirements - 图片需求 [{name, prompt}, ...]
 * @param {string} type - 类型 'food' | 'scene' | 'cover'
 * @param {string} outputDir - 输出目录
 * @param {string} baseTitle - 基础标题
 * @returns {Promise<Object>} 生成的图片映射 { "名称": "路径" }
 */
async function generateImagesFromRequirements(imageRequirements, type, outputDir, baseTitle) {
  const results = {};

  for (const req of imageRequirements) {
    const safeName = req.name.replace(/[\/\\?%*:|"<>]/g, '');
    const filename = `${type}_${safeName}.jpg`;
    const outputPath = join(outputDir, filename);

    let prompt;
    if (type === 'food') {
      // 食材图提示词 - 针对中老年受众，高质量暖色调，实物感强，无文字
      prompt = `高清美食摄影，实物拍摄新鲜${req.prompt}，中国传统养生滋补食材，画面清晰真实，温暖金黄色调，家庭餐桌氛围，适合中老年审美，8K画质，真实光泽感，食欲感强，居中构图，纯画面无任何文字`;
    } else if (type === 'scene') {
      // 场景图提示词 - 针对中老年受众，温馨居家氛围，无文字
      prompt = `中国家庭厨房场景，一位慈祥的阿姨正在${req.prompt}，温馨居家氛围，传统养生美食烹饪，暖黄色灯光，画面温馨幸福，柔和色调，电影质感，适合中老年观看，8K画质，真实生活感，纯画面无任何文字`;
    } else {
      // 封面图提示词 - 吸引眼球，吉祥喜庆，无文字
      prompt = `微信公众号文章封面图，${baseTitle}，中国传统养生风格，吉祥喜庆色彩，温暖橙色红色调，大气设计，适合中老年审美，高品质商业摄影，中国结、灯笼等传统元素，节日氛围，视觉冲击力强，纯画面无任何文字`;
    }

    try {
      console.log(`  🖼️  生成${type}图: ${req.name}...`);
      const resultPath = await generateImage(prompt, outputPath);
      results[req.name] = resultPath;
      console.log(`  ✅ ${req.name} 完成\n`);
    } catch (e) {
      console.log(`  ⚠️ ${req.name} 失败: ${e.message}\n`);
    }
  }

  return results;
}

/**
 * 从文章内容中智能提取图片需求
 * @param {string} content - 文章内容
 * @returns {Object} { cover: string[], food: {name, prompt}[], scene: {name, prompt}[] }
 */
function parseImageRequirements(content) {
  const result = {
    cover: [],
    food: [],
    scene: []
  };

  // 始终添加一个封面图
  result.cover.push({ name: '封面', prompt: '封面' });

  // 从文章中提取常见的养生食材
  const foodKeywords = [
    '蜂蜜', '枸杞', '红枣', '黑豆', '红豆', '薏米', '山楂', '菊花',
    '柠檬', '生姜', '大蒜', '洋葱', '木耳', '银耳', '莲子', '百合',
    '核桃', '花生', '芝麻', '燕麦', '小米', '糯米', '玉米', '红薯',
    '山药', '土豆', '胡萝卜', '南瓜', '冬瓜', '黄瓜', '西红柿', '茄子',
    '苹果', '梨', '香蕉', '橙子', '柚子', '葡萄', '西瓜', '桃子',
    '猪肉', '鸡肉', '牛肉', '羊肉', '鱼肉', '鸡蛋', '鸭蛋', '牛奶',
    '豆腐', '豆浆', '酸奶', '绿茶', '红茶', '普洱', '玫瑰', '桂花',
    '陈皮', '桂圆', '荔枝', '菠萝', '猕猴桃', '火龙果', '芒果', '椰子',
    '芡实', '茯苓', '黄芪', '党参', '当归', '川芎', '白术', '甘草',
    '艾叶', '花椒', '红糖', '醋', '盐', '香油', '葱', '香菜'
  ];

  // 从文章中提取烹饪/场景关键词
  const sceneKeywords = [
    '泡水', '煮粥', '炖汤', '熬汤', '炒菜', '蒸', '煮', '炖', '煲',
    '泡茶', '冲泡', '焖', '煎', '炸', '烤', '酿', '拌', '炒',
    '泡脚', '按摩', '针灸', '拔罐', '刮痧', '热敷', '熬制', '研磨'
  ];

  const lowerContent = content;

  // 检测食材
  const foundFoods = new Set();
  for (const food of foodKeywords) {
    if (lowerContent.includes(food)) {
      foundFoods.add(food);
    }
  }

  // 检测场景
  const foundScenes = new Set();
  for (const scene of sceneKeywords) {
    if (lowerContent.includes(scene)) {
      foundScenes.add(scene);
    }
  }

  // 转换为图片需求格式
  result.food = Array.from(foundFoods).slice(0, 5).map(name => ({
    name,
    prompt: name
  }));

  result.scene = Array.from(foundScenes).slice(0, 3).map(name => ({
    name,
    prompt: name
  }));

  return result;
}

/**
 * 根据文章内容和标题生成配图
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容（含图片标记）
 * @param {string} outputDir - 输出目录
 * @returns {Promise<Object>} { cover: {}, food: {}, scene: {} }
 */
export async function generateArticleImages(title, content, outputDir) {
  console.log('🖼️  正在分析图片需求...\n');

  // 解析图片需求（使用本地函数）
  const imageReqs = parseImageRequirements(content);

  const results = {
    cover: {},
    food: {},
    scene: {},
    content: content
  };

  const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, '');

  // 1. 生成封面图（如果没有指定，则用默认）
  if (imageReqs.cover.length === 0) {
    // 默认封面图
    imageReqs.cover.push({ name: '默认封面', prompt: title });
  }

  const coverResults = await generateImagesFromRequirements(
    imageReqs.cover,
    'cover',
    outputDir,
    title
  );
  results.cover = coverResults;

  // 2. 生成食材图
  if (imageReqs.food.length > 0) {
    const foodResults = await generateImagesFromRequirements(
      imageReqs.food,
      'food',
      outputDir,
      title
    );
    results.food = foodResults;
  }

  // 3. 生成场景图
  if (imageReqs.scene.length > 0) {
    const sceneResults = await generateImagesFromRequirements(
      imageReqs.scene,
      'scene',
      outputDir,
      title
    );
    results.scene = sceneResults;
  }

  // 4. 清理文章中的图片标记（用于显示）
  let cleanContent = content;
  cleanContent = cleanContent.replace(/\[封面图\]/g, '');
  cleanContent = cleanContent.replace(/\[食材图：[^\]]+\]/g, '');
  cleanContent = cleanContent.replace(/\[场景图：[^\]]+\]/g, '');
  results.content = cleanContent;

  console.log(`✅ 图片生成完成，共 ${Object.keys(results.cover).length + Object.keys(results.food).length + Object.keys(results.scene).length} 张\n`);

  // 返回原始内容（含标记）用于formatter替换
  results.originalContent = content;

  return results;
}
