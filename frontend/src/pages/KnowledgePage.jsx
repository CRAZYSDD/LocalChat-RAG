import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UploadPanel from '../components/knowledge/UploadPanel';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { formatTime } from '../utils/format';

export default function KnowledgePage() {
  const {
    files,
    loadingFiles,
    uploading,
    reindexing,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
    reindex,
    clearError,
  } = useKnowledgeBase();
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await deleteFile(target.id);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">知识库管理</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              上传文档、切分 Chunk、向量化并写入本地 FAISS。
            </p>
          </div>
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-slate-900" onClick={reindex}>
            {reindexing ? '重建中...' : '重建索引'}
          </button>
        </div>

        <UploadPanel onUpload={uploadFile} uploading={uploading} />

        {error ? (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            <span>{error}</span>
            <button className="shrink-0 text-xs underline" onClick={clearError}>
              关闭
            </button>
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          {loadingFiles ? <LoadingSpinner text="正在加载文档列表..." /> : null}
          {!loadingFiles && !files.length ? (
            <EmptyState
              title="暂无文档"
              description="上传 txt / md / pdf 文件后，就可以在对话页开启 RAG 问答。"
            />
          ) : null}
          <div className="space-y-3">
            {files.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-[1fr_auto_auto]">
                <div>
                  <p className="font-medium">{item.file_name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {`状态：${item.status} | Chunk：${item.chunk_count} | 更新时间：${formatTime(item.updated_at)}`}
                  </p>
                </div>
                <button className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700" onClick={() => setSelected(item)}>
                  查看详情
                </button>
                <button className="rounded-xl bg-rose-500 px-3 py-2 text-sm text-white" onClick={() => setDeleteTarget(item)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-panel dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selected.file_name}</h3>
                <button className="text-sm text-slate-400" onClick={() => setSelected(null)}>
                  关闭
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                {`共 ${selected.chunk_count} 个 Chunk，以下展示前 5 个切分片段：`}
              </p>
              <div className="mt-4 space-y-3">
                {(selected.preview_chunks || []).map((chunk, index) => (
                  <div key={index} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                    {chunk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除知识库文档"
        description={`确定删除“${deleteTarget?.file_name || '当前文档'}”吗？删除后需要重新检索时将无法恢复。`}
        cancelText="保留文档"
        confirmText="确认删除"
        confirmTone="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
