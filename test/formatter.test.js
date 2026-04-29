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
  // 正文字号 18px（优化后更适合中老年阅读）
  expect(html).toContain('font-size: 18px');
  // 高亮颜色
  expect(html).toContain('#d4237a');
});

test('formatToHTML 应该正确处理【】高亮标记', () => {
  const html = formatToHTML('测试标题', '这是【重点内容】需要高亮');

  expect(html).toContain('#d4237a');
  expect(html).toContain('重点内容');
});
