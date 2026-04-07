# LocalChat RAG —— 本地大模型智能对话平台

LocalChat RAG 是一个适合校招/应届前端开发岗位展示的 AI Web 项目。前端使用 React + Redux Toolkit + Tailwind CSS 构建类 ChatGPT 的对话体验，后端使用 FastAPI + Transformers + SentenceTransformers + FAISS 从本地 HuggingFace 模型目录加载能力，支持普通多轮对话、RAG 问答、知识库管理、模型参数配置与数据看板。

## 项目简介

- 面向前端求职场景设计，强调 React 工程能力、Redux 状态设计、组件封装、页面交互与前后端联调
- 支持从本地磁盘目录加载 HuggingFace 大模型与 Embedding 模型
- 支持文档上传、切分、向量化、FAISS 检索与引用展示
- 支持普通对话 / RAG 问答双模式切换

## 技术栈

### 前端
- React
- JavaScript
- Vite
- React Router
- Redux Toolkit + React Redux
- Tailwind CSS
- Axios
- React Hook Form
- ECharts
- ESLint + Prettier

### 后端
- Python
- FastAPI
- transformers
- torch
- sentence-transformers
- faiss-cpu
- uvicorn
- python-multipart
- pypdf

## 项目结构

```bash
AIChat/
├─ .env.example
├─ README.md
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  ├─ .eslintrc.cjs
│  ├─ .prettierrc
│  ├─ index.html
│  └─ src/
│     ├─ api/
│     ├─ assets/
│     ├─ components/
│     ├─ constants/
│     ├─ hooks/
│     ├─ layouts/
│     ├─ pages/
│     ├─ router/
│     ├─ store/
│     ├─ utils/
│     ├─ main.jsx
│     └─ styles.css
└─ backend/
   ├─ app.py
   ├─ config.py
   ├─ requirements.txt
   ├─ models/
   ├─ routes/
   ├─ services/
   ├─ utils/
   └─ data/
```

## 完整目录结构

```bash
AIChat
├─ .env.example
├─ README.md
├─ frontend
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  └─ src
│     ├─ api
│     │  ├─ auth.js
│     │  ├─ chat.js
│     │  ├─ client.js
│     │  ├─ knowledge.js
│     │  └─ settings.js
│     ├─ components
│     │  ├─ chat
│     │  │  ├─ ChatInput.jsx
│     │  │  ├─ ChatMessage.jsx
│     │  │  ├─ SessionList.jsx
│     │  │  └─ SourceReferenceCard.jsx
│     │  ├─ common
│     │  │  ├─ ConfirmDialog.jsx
│     │  │  ├─ EmptyState.jsx
│     │  │  ├─ LoadingSpinner.jsx
│     │  │  ├─ MarkdownRenderer.jsx
│     │  │  └─ ModelStatusBadge.jsx
│     │  ├─ knowledge
│     │  │  └─ UploadPanel.jsx
│     │  └─ settings
│     │     └─ SettingForm.jsx
│     ├─ constants
│     │  └─ index.js
│     ├─ hooks
│     │  ├─ useAutoScroll.js
│     │  ├─ useChat.js
│     │  ├─ useDebounce.js
│     │  ├─ useKnowledgeBase.js
│     │  ├─ useSession.js
│     │  ├─ useStreamChat.js
│     │  └─ useTheme.js
│     ├─ layouts
│     │  └─ AppLayout.jsx
│     ├─ pages
│     │  ├─ ChatPage.jsx
│     │  ├─ DashboardPage.jsx
│     │  ├─ ExceptionPage.jsx
│     │  ├─ KnowledgePage.jsx
│     │  ├─ LoginPage.jsx
│     │  ├─ NotFoundPage.jsx
│     │  └─ SettingsPage.jsx
│     ├─ router
│     │  └─ index.jsx
│     ├─ store
│     │  ├─ index.js
│     │  └─ slices
│     │     ├─ authSlice.js
│     │     ├─ chatSlice.js
│     │     ├─ knowledgeSlice.js
│     │     ├─ sessionSlice.js
│     │     ├─ settingsSlice.js
│     │     └─ uiSlice.js
│     ├─ utils
│     │  ├─ cn.js
│     │  ├─ format.js
│     │  └─ storage.js
│     ├─ main.jsx
│     └─ styles.css
└─ backend
   ├─ app.py
   ├─ config.py
   ├─ requirements.txt
   ├─ models
   │  ├─ __init__.py
   │  └─ schemas.py
   ├─ routes
   │  ├─ __init__.py
   │  ├─ auth.py
   │  ├─ chat.py
   │  ├─ knowledge.py
   │  ├─ sessions.py
   │  ├─ settings.py
   │  └─ stats.py
   ├─ services
   │  ├─ __init__.py
   │  ├─ knowledge_service.py
   │  ├─ model_service.py
   │  ├─ session_service.py
   │  └─ stats_service.py
   └─ utils
      ├─ __init__.py
      ├─ document.py
      └─ storage.py
```

## 本地模型加载方式

项目不会调用 OpenAI、Claude 或任何在线闭源模型。后端会从本地 HuggingFace 目录直接加载：

```env
MODEL_PATH=./models/your_local_llm
EMBEDDING_MODEL_PATH=./models/your_local_embedding_model
```

在 `backend/services/model_service.py` 中，通过 `AutoTokenizer.from_pretrained(MODEL_PATH)` 和 `AutoModelForCausalLM.from_pretrained(MODEL_PATH)` 加载本地模型；在 `backend/services/knowledge_service.py` 中，通过 `SentenceTransformer(EMBEDDING_MODEL_PATH)` 加载本地 Embedding 模型。

## 如何配置 MODEL_PATH

1. 将根目录的 `.env.example` 复制为 `.env`
2. 按照你本机模型目录修改路径
3. 确认目录中包含 HuggingFace 模型文件，如 `config.json`、`tokenizer.json`、`model.safetensors`

示例：

```env
MODEL_PATH=D:/models/Qwen2.5-1.5B-Instruct
EMBEDDING_MODEL_PATH=D:/models/bge-small-zh-v1.5
VECTOR_DB_PATH=./backend/data/faiss
UPLOAD_DIR=./backend/data/uploads
MAX_NEW_TOKENS=512
TEMPERATURE=0.7
TOP_P=0.9
STREAMING_ENABLED=true
CHAT_API_BASE=http://127.0.0.1:8000
```

## 如何启动前端和后端

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

也可以使用：

```bash
cd backend
uvicorn app:app --reload
```

## 后端接口

### 聊天接口
- `POST /api/chat`
- `POST /api/chat/stream`
- `GET /api/sessions`
- `POST /api/sessions`
- `DELETE /api/sessions/{id}`

### RAG 接口
- `POST /api/knowledge/upload`
- `GET /api/knowledge/files`
- `DELETE /api/knowledge/files/{id}`
- `POST /api/knowledge/reindex`
- `POST /api/rag/query`

## RAG 流程说明

1. 在知识库页面上传 txt / md / pdf 文档
2. 后端解析文档文本内容
3. 使用滑窗切分策略拆成多个 Chunk
4. 使用本地 Embedding 模型将 Chunk 向量化
5. 将向量写入 FAISS 本地索引
6. 用户在对话页切换到 RAG 模式提问
7. 后端检索 Top-K 片段，拼接为 Prompt 上下文
8. 调用本地 LLM 生成回答
9. 返回回答正文和参考资料片段，前端进行引用展示

## Redux 状态管理设计说明

项目使用 Redux Toolkit 做多 slice 拆分：

- `authSlice`：登录状态、用户信息、本地持久化
- `chatSlice`：消息状态、对话模式、流式更新、停止生成
- `sessionSlice`：会话列表、新建会话、删除会话、切换会话
- `knowledgeSlice`：文档上传、文档列表、删除文档、重建索引
- `settingsSlice`：模型配置、Dashboard 数据
- `uiSlice`：主题模式与全局 UI 状态

设计重点：

- 使用 `createAsyncThunk` 管理异步请求
- 统一 loading / success / error 状态流转
- 页面通过 hooks 调用 store，降低组件耦合
- 流式输出只更新最后一条 assistant 消息，减少不必要重渲染

## 页面说明

- 登录页：表单校验、mock 登录、登录态持久化
- 主对话页：会话列表、消息区、模型状态、RAG 开关、流式问答
- 知识库页：文档上传、文档列表、文档详情、索引重建
- 模型设置页：查看与修改后端运行参数
- 数据看板页：会话总数、今日提问数、文档总数、RAG 调用、检索命中率
- 404 页面：兜底路由
- 异常页：承接路由层错误

## 性能优化说明

1. 路由懒加载：页面使用 `React.lazy + Suspense`
2. 输入防抖：封装 `useDebounce`，方便扩展搜索场景
3. 长列表优化：消息区和会话列表独立滚动，预留虚拟列表扩展点
4. 合理使用 `useMemo`：减少当前会话等重复计算
5. 避免无意义重复请求：按页面维度触发数据拉取
6. 流式更新减少重渲染：只增量更新最后一条消息内容

## 工程化亮点

- 前后端分离目录
- 统一 API 封装
- ESLint + Prettier
- 环境变量示例文件
- 空状态、加载态、异常态
- 模块化 FastAPI 服务拆分
- 可直接演示的本地模型 + RAG 闭环

## 常见问题

### 显存不足
- 优先使用更小的本地指令模型
- 尝试量化模型目录
- 将 `MAX_NEW_TOKENS` 降到 256 或更低

### 模型路径错误
- 检查 `.env` 中 `MODEL_PATH` 和 `EMBEDDING_MODEL_PATH`
- 确认目录存在且文件齐全
- Windows 下建议使用正斜杠或双反斜杠

### 文档解析失败
- 扫描版 PDF 可能无法直接提取文本
- 建议优先上传 txt 或 md

### 检索不到结果
- 上传文档后执行“重建索引”
- 检查 Embedding 模型是否加载成功
- 确认 FAISS 索引目录可写

## 后续扩展方向

- 增加数据库持久化
- 增加多模型切换和模型预热
- 增加消息导出与会话搜索
- 增加埋点分析和真实检索命中统计
- 增加长列表虚拟滚动
- 增加权限体系与真实鉴权

## 项目亮点

- 真实调用本地 HuggingFace 模型，而非在线 API
- 支持普通对话与 RAG 问答双模式
- 既能展示前端中后台工程能力，也能展示 AI 应用开发理解
- 具备较强的简历可讲解性、产品真实感和工程完整度

## 简历项目描述

1. 主导搭建基于 React、JavaScript、Vite 与 Redux Toolkit 的本地 AI 对话平台，完成登录、会话管理、知识库管理、模型设置、数据看板等 6 类页面开发，实现类 ChatGPT 的多轮对话体验。
2. 设计并拆分 `auth/chat/session/knowledge/settings/ui` 六大状态切片，基于 `createAsyncThunk` 管理异步请求与状态流转，支持流式消息增量更新、停止生成与历史会话切换，提升复杂交互场景下的可维护性。
3. 联调 FastAPI + Transformers + SentenceTransformers + FAISS 本地后端服务，完成 HuggingFace 本地模型加载、文档切分、向量化检索与 RAG 问答闭环，实现普通对话与知识库问答双模式切换。
4. 落地路由懒加载、统一 API 封装、React Hook Form 表单校验、暗黑模式、Markdown 渲染、代码高亮与 ECharts 数据看板，形成具备真实业务感与工程化规范的求职级项目作品。

## 最值得讲的 10 个技术亮点

1. React 项目如何按页面、组件、hooks、store、api 分层组织
2. Redux Toolkit 如何管理复杂的 AI 对话和知识库状态
3. 流式消息为什么采用“最后一条 assistant 消息增量更新”
4. 前端如何承接普通对话与 RAG 问答双模式切换
5. FastAPI 如何为前端提供本地模型调用与配置中心能力
6. HuggingFace 本地模型如何从磁盘目录直接加载
7. 文档上传、切分、向量化、FAISS 检索的完整 RAG 链路
8. 引用来源和相关度展示如何增强回答可解释性
9. 数据看板如何提高项目的简历价值与业务感
10. 路由懒加载、请求收敛、滚动体验和流式渲染优化

## 面试官可能追问的 12 个问题与回答思路

1. 为什么这个项目适合前端求职？
回答思路：突出页面复杂度、状态管理、交互细节、组件封装与前后端联调，而不是只讲模型本身。

2. 为什么选择 Redux Toolkit？
回答思路：会话、消息、知识库、设置之间存在共享状态，RTK 能减少模板代码并统一异步状态流。

3. 流式对话是怎么实现的？
回答思路：后端用 `StreamingResponse + TextIteratorStreamer`，前端用 `fetch + ReadableStream` 按块读取并 dispatch 增量更新。

4. 为什么要做会话管理？
回答思路：这是 AI 产品的真实业务能力，也能体现历史记录管理、上下文连续性和 UI 列表状态切换。

5. RAG 为什么要切 Chunk？
回答思路：原文往往太长，切块后才能进行高效向量检索并命中局部相关内容。

6. FAISS 在这里的作用是什么？
回答思路：它负责本地向量索引和相似度搜索，适合离线演示和本地部署场景。

7. 如果模型显存占用太高怎么办？
回答思路：换小模型、量化模型、降低 `max_new_tokens`，并在 README 提供部署建议。

8. 为什么要单独做模型设置页？
回答思路：这能体现“前端配置面板 + 后端运行参数管理”的中后台能力，更贴近真实业务系统。

9. 你做了哪些性能优化？
回答思路：路由懒加载、按需请求、流式增量更新、局部 memo 化、预留虚拟滚动扩展点。

10. Markdown 渲染的意义是什么？
回答思路：AI 输出经常包含代码块、列表和强调文本，Markdown 渲染能显著提升产品可用性。

11. 为什么这个项目不是单纯的 demo？
回答思路：因为它具备真实本地模型调用、文档检索、后台配置、统计看板和完整页面体系。

12. 如果继续扩展，你下一步会做什么？
回答思路：数据库持久化、多模型切换、埋点统计、真实检索评估、虚拟滚动、用户权限体系。
