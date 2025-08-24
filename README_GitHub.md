# 🌟 智能多语言翻译助手

一个美观的网页版翻译工具，支持中文到英文和粤语的翻译，并提供高质量的语音朗读功能。

## ✨ 特色功能

- 🌐 **多引擎翻译**: 支持 DeepSeek、腾讯翻译、百度翻译、OpenAI
- 🎙️ **智能语音**: 优化的粤语和英文语音朗读
- 🌌 **酷炫界面**: 星空背景 + 现代化UI设计
- 📱 **响应式设计**: 完美适配手机和桌面
- 🔐 **隐私保护**: API密钥仅本地存储

## 🚀 在线体验

[点击这里在线使用](https://chenasir.github.io/language-translator/) 

## 📦 本地部署

### 方法1: 直接打开
```bash
git clone https://github.com/chenasir/language-translator.git
cd language-translator
# 直接双击 index.html 即可使用
```

### 方法2: 本地服务器
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js (需要腾讯翻译功能)
npm install
node backend-server.js
```

然后访问 `http://localhost:8000`

## 🔧 API配置指南

### DeepSeek (推荐 - 最佳粤语翻译)
1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册账号并获取API密钥
3. 在工具中选择"DeepSeek"并输入：`sk-xxxxx`

### 腾讯翻译 (免费额度最大)
1. 访问 [腾讯云](https://cloud.tencent.com/)
2. 开通翻译服务并获取密钥
3. 在工具中选择"腾讯翻译"并输入：`SecretId|SecretKey`

### 百度翻译 (极快且稳定)
1. 访问 [百度翻译开放平台](https://fanyi-api.baidu.com/)
2. 注册并创建应用获取APP ID和KEY
3. 在工具中选择"百度翻译"并输入：`APP_ID|APP_KEY`

### OpenAI (AI翻译)
1. 访问 [OpenAI平台](https://platform.openai.com/)
2. 获取API密钥
3. 在工具中选择"OpenAI"并输入：`sk-xxxxx`

## 💰 费用对比

| 服务商 | 价格 | 免费额度 | 特色 |
|--------|------|----------|------|
| **DeepSeek** | ¥1.33/1M tokens | 每日免费额度 | 🏆 最佳粤语翻译 |
| **腾讯翻译** | ¥58/1M字符 | 每月500万字符 | 💰 免费额度最大 |
| **百度翻译** | ¥49/1M字符 | 每月5万字符 | ⚡ 速度最快 |
| **OpenAI** | $0.15-0.6/1M tokens | $5赠送额度 | 🤖 AI翻译最智能 |

## 🎙️ 语音优化

### 获得最佳粤语发音效果：
- **Windows**: 安装"中文(香港特别行政区)"语言包
- **Mac**: 下载"粤语"语音引擎
- **Chrome**: 启用语音API增强功能

### 语音测试
点击界面中的"🎵 测试语音引擎"按钮，查看系统可用的语音选项。

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **UI**: 原生CSS动画 + 粒子效果
- **语音**: Web Speech API
- **后端**: Node.js + Express (腾讯翻译代理)
- **API**: RESTful API调用

## 📁 项目结构

```
language-translator/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 核心逻辑
├── backend-server.js   # 后端代理服务器
├── package.json        # 前端依赖
├── README.md          # 说明文档
└── docs/              # API获取指南
    ├── DeepSeek_API_获取指南.md
    ├── 百度翻译API_获取指南.md
    └── 腾讯翻译API_获取指南.md
```

## 🔒 隐私说明

- ✅ API密钥仅在浏览器本地存储
- ✅ 不会上传任何个人信息到服务器
- ✅ 翻译内容直接发送给对应API服务商
- ✅ 支持无痕浏览模式

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## ⭐ Star History

如果这个项目对你有帮助，请给个Star支持一下！⭐

## 📞 联系方式

- 📧 Email: 联系方式请通过GitHub
- 🐛 Issues: [GitHub Issues](https://github.com/chenasir/language-translator/issues)

---

<div align="center">

**🌟 智能翻译，让沟通无界限！🌟**

Made with ❤️ by [chenasir](https://github.com/chenasir)

</div>
