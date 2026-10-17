# 🏡 祺鑫·柴狐小屋 | Chai & Fox Home

一个私人创作的卡通家庭生活模拟游戏：黑柴马嘉祺、橘狐丁程鑫与他们的小鸡孩子 Victoria。

## 当前状态

本工程从 **V0.3 离线试玩版**拆分而来，保留：
- 一家三口已确认的统一漫改角色立绘（`assets/characters`）
- 四个房间、小鸡地板移动、可点击家具
- 浇花、做可可、找星星小游戏、地毯配色
- 童年 LV.1–10、地图探索、家庭事件与浏览器本地存档
- 心事投递箱：本地写信、手动复制到 ChatGPT、收藏回信（**尚无自动 AI 接口**）

这不是最终游戏，故事系统和 NPC 自主性仍处于原型阶段。

## 最简单的运行方式（Mac / Windows）

### 本地预览

将整个项目文件夹解压出来。在文件夹中打开终端，运行：

```bash
python3 -m http.server 8000
```

然后用浏览器访问： http://localhost:8000

如果系统没有 Python，可以在 VS Code 安装 Live Server 扩展，或者直接双击 `index.html`（部分浏览器的存储行为可能不同）。

不需要任何 API 密钥、数据库、npm 安装或付费服务，就可以体验 V0.3 现有内容。

### 修改游戏

推荐在 **Codex** 中打开本文件夹（本地 Codex），或创建一个**私人 GitHub 仓库**上传本项目文件后，在 Codex Cloud 选择该仓库作为环境。建议把此文件夹里的文件直接放在仓库根目录（不要多套一层）。

首次交给 Codex 的任务见 [`docs/CODEX_FIRST_TASK.md`](docs/CODEX_FIRST_TASK.md)。角色、玩法和剧情规则见 [`AGENTS.md`](AGENTS.md)。

## 文件夹说明

```text
index.html                网页结构
styles.css                样式与手机布局
app.js                    游戏状态、事件、小游戏与心事投递箱逻辑
assets/characters/*.png   已确认的三位角色游戏素材
docs/                    策划案、后续开发任务、AI 安全设计
tests/                   浏览器自动化冒烟测试
archive/                 V0.3 原始单文件备份
AGENTS.md                 给 Codex 的协作规则
```

## 隐私和 AI

心事信件仅保存在当前浏览器的 `localStorage`，不是加密存储；在共享电脑上不要填写不希望他人看到的敏感信息。清除站点数据会使其丢失。**不要把真实心事或账号/API 密钥提交到 GitHub。**

未来接真正的 AI 对话时，必须用服务端代理密钥，在用户明确点击发送之后才传输信件，并提供删除、数据说明与可退出的离线模式。不要在前端文件写入 `OPENAI_API_KEY`。详见 [`docs/AI_MAILBOX.md`](docs/AI_MAILBOX.md)。

## 运行测试（可选）

安装 Playwright 的 Python 绑定及 Chromium 浏览器后执行：

```bash
pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/smoke.py
```

> 工程尚未正式部署，网页游戏中的马嘉祺和丁程鑫均为明确的**虚构卡通角色扮演**，不是现实人物本人的通信或发言。
