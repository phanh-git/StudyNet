import { Paperclip, Share2 } from 'lucide-react';

function avatarFromName(name = 'StudyNet User') {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;
}

export function shouldRenderPostBody(post) {
  if (!post?.shared || !post.sharedPostPreview) {
    return Boolean(post?.content || post?.fileUrl);
  }

  const sourcePost = post.sharedPostPreview;
  const sameContent = (post.content ?? '') === (sourcePost.content ?? '');
  const sameFileUrl = (post.fileUrl ?? '') === (sourcePost.fileUrl ?? '');
  const sameFileName = (post.fileName ?? '') === (sourcePost.fileName ?? '');

  return !sameContent || !sameFileUrl || !sameFileName;
}

export default function SharedPostPreview({
  post,
  formatTime,
  typeLabel,
  renderAttachment,
  onAuthorClick,
  depth = 0,
}) {
  if (!post) return null;

  const canRenderOwnBody = shouldRenderPostBody(post);

  return (
    <div className={`mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 ${depth > 0 ? 'bg-white' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onAuthorClick(post.authorId)}
          className="shrink-0"
        >
          <img
            src={avatarFromName(post.authorName)}
            alt={post.authorName}
            className="h-10 w-10 rounded-full bg-indigo-100"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onAuthorClick(post.authorId)}
              className="font-semibold text-slate-900 transition hover:text-indigo-600"
            >
              {post.authorName}
            </button>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600">
              {typeLabel(post.type)}
            </span>
            {post.subjectName && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                {post.subjectName}
              </span>
            )}
            {post.groupName && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {post.groupName}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatTime(post.createdAt)}</p>
        </div>
      </div>

      {post.shared && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          <Share2 className="h-3.5 w-3.5 text-amber-500" />
          Chia sẻ lại từ {post.sharedAuthorName}
        </div>
      )}

      {canRenderOwnBody && post.content && (
        <p className="mt-4 text-sm leading-6 text-slate-700">{post.content}</p>
      )}

      {canRenderOwnBody && renderAttachment({
        fileUrl: post.fileUrl,
        fileName: post.fileName,
        fileType: post.fileType,
      })}

      {post.sharedPostPreview && (
        <SharedPostPreview
          post={post.sharedPostPreview}
          formatTime={formatTime}
          typeLabel={typeLabel}
          renderAttachment={renderAttachment}
          onAuthorClick={onAuthorClick}
          depth={depth + 1}
        />
      )}

      {!canRenderOwnBody && !post.sharedPostPreview && post.fileUrl && (
        <a
          href={post.fileUrl}
          download={post.fileName || 'attachment'}
          className="mt-4 flex items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <Paperclip className="h-4 w-4" />
          <span className="font-medium">{post.fileName || 'Tệp đính kèm'}</span>
        </a>
      )}
    </div>
  );
}
