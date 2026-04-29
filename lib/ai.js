/**
 * 调用 AI API（带重试）
 * @param {Object} config - API 配置 { apiUrl, apiKey, model }
 * @param {string} prompt - 提示词
 * @param {number} retries - 重试次数
 * @returns {Promise<string>} AI 响应内容
 */
export async function callAI(config, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
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
        const errorBody = await response.text();
        // 如果是 500 错误且还有重试次数，等待后重试
        if (response.status === 500 && i < retries - 1) {
          console.log(`  ⚠️ API 繁忙，等待 3 秒后重试... (${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  ⚠️ 请求失败，等待 3 秒后重试... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}
