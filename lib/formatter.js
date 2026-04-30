import { readFileSync } from 'fs';

/**
 * 将图片转换为 Base64 编码
 * @param {string} imagePath - 图片路径
 * @returns {string|null} Base64 编码或 null
 */
function imageToBase64(imagePath) {
  try {
    const imageBuffer = readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${ext};base64,${base64}`;
  } catch (e) {
    console.log(`  ⚠️ 读取图片失败: ${imagePath}`);
    return null;
  }
}

/**
 * 将文章内容格式化为符合微信公众号规范的 HTML
 * @param {string} title - 文章标题
 * @param {string} content - 文章正文
 * @param {Object} images - 图片对象 { cover: {}, food: {}, scene: {} }
 * @returns {string} 完整的 HTML 文件内容
 */
export function formatToHTML(title, content, images = {}) {
  let formattedContent = content;

  // 1. 清理所有图片标记
  formattedContent = formattedContent.replace(/\[封面图\]/g, '');
  formattedContent = formattedContent.replace(/【?食材图：([^】\]]+)】?/g, '');
  formattedContent = formattedContent.replace(/【?场景图：([^】\]]+)】?/g, '');
  // 清理空的 []
  formattedContent = formattedContent.replace(/\[\]/g, '');

  // 处理【】高亮标记
  formattedContent = formattedContent.replace(/【(.+?)】/g, (match, text) => {
    return `<span style="font-weight: bold; color: #d4237a;">${text}</span>`;
  });

  // 处理 **粗体** Markdown 格式
  formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, (match, text) => {
    return `<span style="font-weight: bold;">${text}</span>`;
  });

  // 2. 按段落分割
  const paragraphs = formattedContent.split('\n').filter(p => p.trim());
  const resultLines = [];

  // 追踪已插入的图片
  const insertedFoods = new Set();
  const insertedScenes = new Set();
  let lastImagePosition = -1;  // 记录上次插入图片的位置

  // 封面图
  const coverImageKeys = Object.keys(images.cover || {});
  let coverInserted = false;

  for (let paraIndex = 0; paraIndex < paragraphs.length; paraIndex++) {
    const para = paragraphs[paraIndex];
    // 跳过空段落
    if (!para.trim()) continue;

    // 记录当前段落索引
    const currentPosition = paraIndex;

    resultLines.push(para);

    // 检查是否需要插入图片（与上次图片间隔至少2段）
    const canInsertImage = currentPosition - lastImagePosition >= 2;

    // 在第一段文字后插入封面图（仅当没有其他图片紧邻时）
    if (!coverInserted && coverImageKeys.length > 0 && para.includes('。') && canInsertImage) {
      const firstCoverKey = coverImageKeys[0];
      const coverBase64 = imageToBase64(images.cover[firstCoverKey]);
      if (coverBase64) {
        resultLines.push(`<img src="${coverBase64}" style="max-width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; display: block; margin: 20px auto;">`);
        resultLines.push(`<p class="img-caption"></p>`);
        coverInserted = true;
        lastImagePosition = currentPosition;
      }
    }

    // 自动在食材首次出现后插入对应图片（间隔检查）
    const foodImages = images.food || {};
    for (const [name, imagePath] of Object.entries(foodImages)) {
      if (!insertedFoods.has(name) && para.includes(name) && canInsertImage) {
        const base64 = imageToBase64(imagePath);
        if (base64) {
          resultLines.push(`<img src="${base64}" alt="${name}" style="max-width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; display: block; margin: 20px auto;">`);
          resultLines.push(`<p class="img-caption">${name}</p>`);
          insertedFoods.add(name);
          lastImagePosition = currentPosition;
          break;  // 每段只插入一张图片
        }
      }
    }

    // 自动在场景首次出现后插入对应图片（间隔检查）
    const sceneImages = images.scene || {};
    for (const [name, imagePath] of Object.entries(sceneImages)) {
      if (!insertedScenes.has(name) && para.includes(name) && canInsertImage) {
        const base64 = imageToBase64(imagePath);
        if (base64) {
          resultLines.push(`<img src="${base64}" alt="${name}" style="max-width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; display: block; margin: 20px auto;">`);
          resultLines.push(`<p class="img-caption">${name}</p>`);
          insertedScenes.add(name);
          lastImagePosition = currentPosition;
          break;  // 每段只插入一张图片
        }
      }
    }
  }

  // 如果没有封面图但有图片，添加封面
  if (!coverInserted && coverImageKeys.length > 0) {
    const firstCoverKey = coverImageKeys[0];
    const coverBase64 = imageToBase64(images.cover[firstCoverKey]);
    if (coverBase64) {
      resultLines.unshift(`<img src="${coverBase64}" style="max-width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; display: block; margin: 20px auto;">`);
      resultLines.unshift(`<p class="img-caption"></p>`);
    }
  }

  // 包装段落 - 简单包装 img 和普通文字
  const wrappedParagraphs = resultLines.map(line => {
    const trimmed = line.trim();
    // 如果是图片或已包含 p/img 标签
    if (trimmed.startsWith('<img') || trimmed.startsWith('<p')) {
      return trimmed;
    }
    // 养生小贴士标题
    if (trimmed.startsWith('养生小贴士')) {
      return `<p style="margin: 30px 0 15px; font-size: 19px; font-weight: bold; color: #c9553d; border-left: 4px solid #c9553d; padding-left: 12px;">${trimmed}</p>`;
    }
    // 养生小贴士内容（编号列表）
    if (/^\d+\./.test(trimmed)) {
      return `<p style="margin: 8px 0; padding-left: 20px; color: #555;">${trimmed}</p>`;
    }
    // 结尾互动
    if (trimmed.includes('欢迎') || trimmed.includes('转发') || trimmed.includes('评论')) {
      return `<p style="margin: 30px 0 20px; padding: 20px; background: #fdf6f0; border-radius: 8px; text-align: center; color: #c9553d; font-size: 16px;">${trimmed}</p>`;
    }
    // 普通文字段落 - 增大字号和行距
    return `<p style="margin: 0 0 24px; font-size: 18px; line-height: 2.2; color: #333;">${trimmed}</p>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { background: #f8f5f2; padding: 30px 15px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .copy-btn { display: block; margin: 0 auto 25px; padding: 14px 40px; background: linear-gradient(135deg, #c9553d 0%, #a83d2a 100%); color: #fff; border: none; border-radius: 30px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(201, 85, 61, 0.3); transition: all 0.3s ease; }
    .copy-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(201, 85, 61, 0.4); }
    .tip { text-align: center; color: #888; font-size: 14px; margin-bottom: 25px; }
    #wechat-content { background: #fff; border-radius: 12px; padding: 30px 20px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
    #wechat-content img { max-width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; display: block; margin: 25px auto; }
    #wechat-content .img-caption { text-align: center; color: #999; font-size: 13px; margin: -15px 0 30px; }
    @media (max-width: 480px) {
      body { padding: 15px 10px; }
      #wechat-content { padding: 20px 15px; }
      .copy-btn { padding: 12px 30px; font-size: 15px; }
    }
  </style>
</head>
<body>

<div class="container">
  <button class="copy-btn" onclick="copyContent()">一键复制全文</button>
  <p class="tip">复制后请手动在公众号后台上传图片</p>

  <div id="wechat-content">
    <h1 style="margin: 0 0 25px; text-align: center; font-size: 24px; font-weight: 700; color: #222; line-height: 1.5; font-family: 'Noto Serif SC', 'Songti SC', serif;">${title}</h1>
    <p style="margin: 0 0 20px; text-align: center; font-size: 14px; color: #999;">踏雪登山海</p>

    ${wrappedParagraphs}
  </div>
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
  alert('复制成功！请手动在公众号后台上传图片。');
  selection.removeAllRanges();
}
</script>

</body>
</html>`;
}
