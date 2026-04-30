# 食材养生公众号文章生成工具

## 快速开始

1. **安装 Node.js**：访问 https://nodejs.org/ 下载安装
2. **安装 Python 3**：访问 https://www.python.org/downloads/ 下载安装（图片生成需要）
3. **配置密钥**：用记事本打开 `config.json`，填入你的 ModelScope 访问令牌
4. **双击运行**：双击 `双击运行.bat` 启动程序
5. **选择选题**：按提示选择喜欢的选题序号
6. **获取成果**：打开 `outputs` 文件夹查看生成的文章和图片

## API 密钥申请

本工具使用 **ModelScope（魔塔）** 平台，一个密钥即可同时生成文字和图片。

### 申请步骤

1. 访问 https://modelscope.cn/ 注册账号
2. 点击右上角头像 → "我的" → "访问令牌"
3. 点击"新建访问令牌"，复制 Token
4. 填入 `config.json` 的 `apiKey` 和 `imageApiKey` 字段（可以是同一个）

> 💡 ModelScope 每天提供 **10000 Token 免费额度**，足够生成多篇图文。

### 可选：使用其他文字生成 API

如需使用其他平台生成文字（如 DeepSeek），可修改：
- `apiUrl` 和 `apiKey`：你的文字生成 API
- `imageApiKey`：保留 ModelScope 令牌（图片生成必需）

## 注意事项

- 本工具为本地运行，不会上传你的密钥到任何服务器
- 首次运行需要联网下载依赖（自动完成）
- 图片生成需要 Python 3，首次使用可能需要安装依赖：`pip install requests Pillow`
- 生成的文章建议适当修改后再发布，避免重复内容

---
**技术支持：闲鱼店铺 [你的店铺名]**
