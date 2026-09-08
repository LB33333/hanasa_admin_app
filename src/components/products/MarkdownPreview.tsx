import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 상품 설명(마크다운)이 앱에서 어떻게 보일지 근사하게 보여주는 미리보기.
// tailwind preflight가 h1~h6/ul/ol 기본 스타일을 제거하므로 직접 스타일을 입힌다.
export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="md-preview text-sm leading-relaxed text-gray-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
