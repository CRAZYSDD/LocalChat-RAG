import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-body prose prose-slate max-w-none text-sm dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
