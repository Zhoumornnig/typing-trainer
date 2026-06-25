# ⌨️ 打字训练 (Typing Trainer)

> 一个功能丰富的在线打字训练网站，帮助提升打字速度与准确率。支持多级题库、虚拟键盘、音乐播放、日间/夜间模式等。

**🌐 在线体验**：[https://zhoumornnig.github.io/typing-trainer/](https://zhoumornnig.github.io/typing-trainer/)

---

## ✨ 功能特性

### 🎯 核心打字
- **5 级题库**：基础英语、高中词汇、CET-4 词汇、CET-6 词汇、自定义题库
- **实时字符匹配**：正确字符显示绿色，错误字符红色背景，当前字符黄色高亮
- **撤回功能**：支持 `Backspace` 退格和 `Ctrl+Z` 撤销

### ⌨️ 虚拟键盘
- QWERTY 全键盘布局可视化
- **下一个按键发光提示**：待输入字符在键盘上自动高亮
- **击键反馈**：正确击键闪绿光，错误击键抖红

### 📊 实时统计
- **WPM**（每分钟字数）
- **准确率**（百分比，颜色分档：≥90% 绿 / ≥70% 黄 / <70% 红）
- **用时**（秒）
- **错误数** & **进度百分比**

### 🎨 外观定制
- **日间/夜间模式**：一键切换，全局 0.4s 平滑过渡动画
- **自定义背景图片**：支持 URL 输入或本地上传，覆盖整个网页背景
- **实时输入预览**：同步显示用户已输入的内容

### 🎵 音乐播放器
- 内置默认背景音乐，进入页面**自动播放 + 循环播放**
- 支持添加在线歌曲 URL 或上传本地音乐文件
- 播放列表面板可展开/收起

### 💾 数据持久化
- 所有设置自动保存至 `localStorage`：背景图片、自定义题库、主题偏好、播放列表
- 刷新页面或关闭浏览器后设置不丢失

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [React 19](https://react.dev/) | UI 框架 |
| [Vite 8](https://vite.dev/) | 构建工具 |
| CSS Variables | 主题系统（日间/夜间模式） |
| localStorage | 客户端数据持久化 |
| [GitHub Pages](https://pages.github.com/) | 部署平台 |

### 架构亮点
- **统一输入架构**：`keydown` 事件仅处理特殊键（Backspace / Ctrl+Z），`input` 事件统一处理所有字符输入，避免双重处理
- **IME 组合输入保护**：通过 `compositionstart`/`compositionend` 事件 + 同步 `useRef` 标记，防止输入法拼音干扰
- **CSS 变量主题系统**：所有组件颜色通过 CSS 自定义属性驱动，切换主题仅需切换 `body` class
- **`useMemo` 避免闭包陷阱**：题库合并对象使用 `useMemo` 缓存，防止每次渲染生成新引用导致副作用重触发

---

## 📁 项目结构

```
typing-trainer/
├── public/
│   └── music/
│       └── default.mp3          # 默认背景音乐
├── src/
│   ├── components/
│   │   ├── Keyboard.jsx         # 虚拟键盘组件
│   │   ├── Keyboard.css
│   │   ├── Stats.jsx            # 统计面板组件
│   │   ├── Stats.css
│   │   ├── Settings.jsx         # 设置弹窗（背景/题库）
│   │   ├── Settings.css
│   │   ├── MusicPlayer.jsx      # 音乐播放器
│   │   └── MusicPlayer.css
│   ├── App.jsx                  # 主应用（打字逻辑核心）
│   ├── App.css                  # 主样式
│   ├── index.css                # 全局样式 + CSS 变量定义
│   └── main.jsx                 # 入口文件
├── index.html
├── vite.config.js               # Vite 配置（含 GitHub Pages base 路径）
└── package.json
```

---

## 🚀 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/Zhoumornnig/typing-trainer.git
cd typing-trainer

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中打开 http://localhost:5173
```

### 其他命令

```bash
npm run build      # 生产构建
npm run preview    # 预览生产构建
```

---

## 📦 部署

项目通过 GitHub Pages 自动部署，`gh-pages` 分支托管构建产物。

```bash
# 构建 + 部署
npm run build
npx gh-pages -d dist
```

Vite 配置了条件 `base` 路径：
- 开发环境：`/`
- 生产环境：`/typing-trainer/`

---

## 📝 题库说明

| 等级 | 难度 | 内容特点 |
|------|------|----------|
| 🟢 基础 | 简单 | 日常英语短句，适合入门练习 |
| 🏫 高中 | 中等 | 高中英语常见话题，教育/环境/科技等 |
| 🎓 四级 | 较难 | CET-4 词汇量，涉及社会/经济/文化议题 |
| 📚 六级 | 困难 | CET-6 词汇量，学术化长难句 |
| ⭐ 自定义 | 任意 | 用户自行添加的练习文本 |

---

## 🎓 关于本项目

本项目是一个全栈实战练习项目，旨在通过实际开发提升前端工程能力，同时也是一款实用的打字训练工具。

---

## 📄 License

MIT
