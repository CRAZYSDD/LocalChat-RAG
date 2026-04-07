# LocalChat RAG

LocalChat RAG 是一个本地大模型智能对话平台，支持普通多轮对话、基于本地知识库的 RAG 问答、文档上传与向量检索、模型运行参数配置以及数据看板展示。

项目采用前后端分离架构。前端使用 React、Redux Toolkit、Tailwind CSS 和 ECharts 构建交互界面；后端使用 FastAPI、Transformers、SentenceTransformers 和 FAISS 调用本地 HuggingFace 模型与本地向量库。项目不依赖 OpenAI、Claude 或其他在线闭源模型 API。

## 功能特性

- 支持登录状态持久化的基础登录页
- 支持普通多轮 AI 对话
- 支持流式输出、停止生成、重新生成、复制回答
- 支持会话新建、切换、重命名、删除和导出
- 支持普通对话 / RAG 问答模式切换
- 支持 Markdown 渲染和代码高亮
- 支持上传 txt、md、pdf 文档
- 支持文档解析、Chunk 切分、本地 Embedding 向量化
- 支持使用 FAISS 构建本地向量索引
- 支持 RAG 检索结果引用展示
- 支持模型路径、最大生成长度、temperature、top_p、重复惩罚、流式输出配置
- 支持模型加载状态和错误诊断提示
- 支持基于真实会话、消息和知识库数据的数据看板
- 支持暗黑模式和响应式布局

## 技术栈

### 前端

- React
- JavaScript
- Vite
- React Router
- Redux Toolkit
- React Redux
- Tailwind CSS
- Axios
- React Hook Form
- ECharts
- ESLint
- Prettier

### 后端

- Python
- FastAPI
- Uvicorn
- Transformers
- Torch
- SentenceTransformers
- FAISS CPU
- python-multipart
- pypdf
- python-dotenv

## 项目结构

```bash
AIChat/
├─ .env.example
├─ .gitignore
├─ README.md
├─ backend/
│  ├─ app.py
│  ├─ config.py
│  ├─ requirements.txt
│  ├─ models/
│  │  ├─ __init__.py
│  │  └─ schemas.py
│  ├─ routes/
│  │  ├─ __init__.py
│  │  ├─ auth.py
│  │  ├─ chat.py
│  │  ├─ knowledge.py
│  │  ├─ sessions.py
│  │  ├─ settings.py
│  │  └─ stats.py
│  ├─ services/
│  │  ├─ __init__.py
│  │  ├─ knowledge_service.py
│  │  ├─ model_service.py
│  │  ├─ session_service.py
│  │  └─ stats_service.py
│  └─ utils/
│     ├─ __init__.py
│     ├─ document.py
│     └─ storage.py
└─ frontend/
   ├─ index.html
   ├─ package.json
   ├─ vite.config.js
   ├─ tailwind.config.js
   ├─ postcss.config.js
   └─ src/
      ├─ api/
      ├─ components/
      ├─ constants/
      ├─ hooks/
      ├─ layouts/
      ├─ pages/
      ├─ router/
      ├─ store/
      ├─ utils/
      ├─ main.jsx
      └─ styles.css
```

## 环境变量

复制 `.env.example` 为 `.env`，然后根据本机模型路径修改配置。

```bash
copy .env.example .env
```

示例：

```env
MODEL_PATH=C:/Users/70787/.cache/huggingface/hub/models--Qwen--Qwen3-1.7B/snapshots/70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
EMBEDDING_MODEL_PATH=C:/Users/70787/.cache/huggingface/hub/models--sentence-transformers--paraphrase-multilingual-MiniLM-L12-v2/snapshots/86741b4e3f5cb7765a600d3a3d55a0f6a6cb443d
VECTOR_DB_PATH=C:/Users/70787/Desktop/AIChat/backend/data/faiss
UPLOAD_DIR=C:/Users/70787/Desktop/AIChat/backend/data/uploads
MAX_NEW_TOKENS=128
TEMPERATURE=0.7
TOP_P=0.9
REPETITION_PENALTY=1.08
STREAMING_ENABLED=true
```

注意：

- `MODEL_PATH` 应指向本地大语言模型目录。
- `EMBEDDING_MODEL_PATH` 应指向本地 SentenceTransformers 兼容的 Embedding 模型目录。
- 不要把 HuggingFace 缓存中的 `refs/main` 文件路径当作模型路径，通常应使用 `snapshots/<commit_hash>` 目录。
- 建议使用 Python 3.10 或 Python 3.11 运行后端。

## 启动项目

### 启动后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

后端默认运行在：

```text
http://127.0.0.1:8000
```

也可以使用：

```bash
uvicorn app:app --reload
```

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在：

```text
http://localhost:5173
```

### 登录账号

```text
用户名：SDD
密码：123456
```

## 核心页面

- 登录页：基础登录、表单校验、登录态持久化
- 智能对话页：会话列表、聊天区、RAG 模式切换、流式输出、引用展示
- 知识库管理页：文档上传、文档列表、文档详情、删除文档、重建索引
- 模型设置页：模型路径配置、生成参数配置、模型加载状态、错误诊断
- 数据看板页：会话总数、今日提问数、文档总数、RAG 调用次数、最近 7 天趋势、会话模式分布、知识库状态、最近会话
- 404 页面：兜底路由
- 异常页：路由异常状态展示

## 后端接口

### 登录

- `POST /api/auth/login`

### 会话

- `GET /api/sessions`
- `GET /api/sessions/{session_id}`
- `POST /api/sessions`
- `PUT /api/sessions/{session_id}`
- `DELETE /api/sessions/{session_id}`

### 对话

- `POST /api/chat`
- `POST /api/chat/stream`
- `POST /api/chat/stop/{session_id}`

### 知识库

- `POST /api/knowledge/upload`
- `GET /api/knowledge/files`
- `DELETE /api/knowledge/files/{file_id}`
- `POST /api/knowledge/reindex`
- `POST /api/rag/query`

### 模型设置

- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/settings/load`

### 数据看板

- `GET /api/stats/dashboard`

## RAG 流程

1. 在知识库页面上传 txt、md 或 pdf 文档。
2. 后端解析文档文本。
3. 后端使用滑窗策略将文本切分为 Chunk。
4. 后端使用本地 Embedding 模型将 Chunk 向量化。
5. 后端将向量写入本地 FAISS 索引。
6. 用户在聊天页切换到 RAG 问答模式并提问。
7. 后端根据问题检索 Top-K 相关片段。
8. 后端将检索片段拼接进 Prompt。
9. 本地大模型生成回答。
10. 前端展示回答和引用来源。

## 数据存储

当前项目使用本地文件存储运行数据：

- `backend/data/sessions.json`：会话和消息数据
- `backend/data/documents.json`：知识库文档元数据和 Chunk
- `backend/data/stats.json`：部分运行统计
- `backend/data/faiss/`：FAISS 向量索引
- `backend/data/uploads/`：上传文档

这些运行数据默认不会提交到 Git。

## 常见问题

### 后端提示 No module named fastapi

说明当前 Python 环境没有安装依赖：

```bash
cd backend
pip install -r requirements.txt
```

### Torch 或 FAISS 安装失败

建议使用 Python 3.10 或 Python 3.11。Python 3.14 可能会遇到部分 AI 依赖暂不兼容的问题。

### 模型路径错误

检查 `.env` 中的 `MODEL_PATH` 和 `EMBEDDING_MODEL_PATH`。路径应指向完整模型目录，目录中通常包含 `config.json`、tokenizer 文件和模型权重文件。

### PDF 解析不到内容

扫描版 PDF 可能无法直接提取文本。建议优先上传 txt 或 md，或先将 PDF 转换为可复制文本的版本。

### RAG 检索不到结果

先确认已经上传文档，并在知识库页面点击“重建索引”。同时确认 Embedding 模型路径配置正确。

### 模型生成速度慢

可以调小 `MAX_NEW_TOKENS`，换用更小的本地模型，或使用量化模型。

## 后续扩展

- 数据库持久化
- 多模型切换
- 会话搜索与标签管理
- 文档批量上传
- 更细粒度的 RAG 检索参数配置
- 长消息虚拟列表
- 真实用户权限系统
- 部署脚本和 Docker 配置
