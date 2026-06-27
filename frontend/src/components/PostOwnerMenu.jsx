import { useEffect, useRef, useState } from 'react';
import { Ellipsis, FileImage, Paperclip, Pencil, Trash2, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { readFileAsDataUrl } from '../utils/postAttachments';

export default function PostOwnerMenu({
  post,
  typeOptions,
  renderAttachment,
  onSave,
  onDelete,
}) {
  const { t } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [content, setContent] = useState(post.content ?? '');
  const [type, setType] = useState(post.type ?? 'DISCUSSION');
  const [attachment, setAttachment] = useState(
    post.fileUrl
      ? {
          fileUrl: post.fileUrl,
          fileName: post.fileName,
          fileType: post.fileType,
        }
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setContent(post.content ?? '');
    setType(post.type ?? 'DISCUSSION');
    setAttachment(
      post.fileUrl
        ? {
            fileUrl: post.fileUrl,
            fileName: post.fileName,
            fileType: post.fileType,
          }
        : null,
    );
  };

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      window.alert('Vui long chon tep nho hon 3MB.');
      event.target.value = '';
      return;
    }

    try {
      const fileUrl = await readFileAsDataUrl(file);
      setAttachment({
        fileUrl,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
      });
    } catch (error) {
      window.alert(error.message || 'Khong the doc tep dinh kem.');
    } finally {
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!content.trim() && !attachment) {
      window.alert('Bai viet can co noi dung hoac tep dinh kem.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        content: content.trim(),
        type,
        fileUrl: attachment?.fileUrl ?? null,
        fileName: attachment?.fileName ?? null,
        fileType: attachment?.fileType ?? null,
      });
      setEditOpen(false);
      setMenuOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <Ellipsis className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditOpen(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <Pencil className="h-4 w-4" />
              {t('post.edit')}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              {t('post.delete')}
            </button>
          </div>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Chỉnh sửa bài viết</h3>
                <p className="mt-1 text-sm text-slate-500">ạn có thể cập nhật nội dung, loại bài đăng và tập tin đính kèm.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditOpen(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="Ban muon cap nhat dieu gi?"
                className="w-full resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      type === option.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 transition hover:text-emerald-600"
                  title="Them anh"
                >
                  <FileImage className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 transition hover:text-indigo-600"
                  title="Them tep"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
              </div>
            </div>

            {attachment && (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{attachment.fileName}</p>
                    <p className="mt-1 text-xs text-slate-500">{attachment.fileType || 'Tep dinh kem'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderAttachment(attachment)}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditOpen(false);
                }}
                className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
