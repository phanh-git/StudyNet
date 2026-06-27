import { Send, Share2, X } from 'lucide-react';
import SharedPostPreview from './SharedPostPreview';

export default function SharePostModal({
  open,
  post,
  shareContent,
  onShareContentChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  formatTime,
  typeLabel,
  renderAttachment,
  onAuthorClick,
}) {
  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
              <Share2 className="h-3.5 w-3.5" />
              Chia sẻ bài viết
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">Viết điều bạn muốn chia sẻ</h3>
            <p className="mt-1 text-sm text-slate-500">Bài gốc sẽ xuất hiện bên dưới bài viết của bạn sau khi chia sẻ.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <textarea
            value={shareContent}
            onChange={(event) => onShareContentChange(event.target.value)}
            rows={4}
            placeholder="Bạn muốn nói gì về bài viết này?"
            className="w-full resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none"
          />
        </div>

        <SharedPostPreview
          post={post}
          formatTime={formatTime}
          typeLabel={typeLabel}
          renderAttachment={renderAttachment}
          onAuthorClick={onAuthorClick}
        />

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Đang chia sẻ...' : 'Chia sẻ ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
