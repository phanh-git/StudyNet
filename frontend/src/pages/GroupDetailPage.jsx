import { useEffect, useRef, useState } from 'react';
import { BookOpen, FileImage, Heart, LogOut, MessageCircle, Paperclip, Plus, Send, Share2, ThumbsUp, Trash2, Users, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SharedPostPreview, { shouldRenderPostBody } from '../components/SharedPostPreview';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { addComment, createPost, deleteGroup, fetchComments, fetchGroupDetail, joinGroup, leaveGroup, reactToPost, sharePost } from '../services/api';
import { isImageAttachment, readFileAsDataUrl } from '../utils/postAttachments';

const POST_TYPES = [
  { value: 'DISCUSSION', labelVi: 'Thảo luận', labelEn: 'Discussion' },
  { value: 'QUESTION', labelVi: 'Câu hỏi', labelEn: 'Question' },
  { value: 'MATERIAL', labelVi: 'Tài liệu', labelEn: 'Material' },
  { value: 'ANNOUNCEMENT', labelVi: 'Thông báo', labelEn: 'Announcement' },
];

function avatarFromName(name = 'StudyNet User') {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale, language } = useSettings();
  const [searchInput, setSearchInput] = useState('');
  const [groupDetail, setGroupDetail] = useState(null);
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [composerType, setComposerType] = useState('DISCUSSION');
  const [composerContent, setComposerContent] = useState('');
  const [composerAttachment, setComposerAttachment] = useState(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGroupDetail(groupId, user.id)
      .then(setGroupDetail)
      .catch((error) => setPageError(error.message || 'Không thể tải chi tiết nhóm.'));
  }, [groupId, user.id]);

  const formatTime = (value) => {
    if (!value) return t('common.justNow');
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const typeLabel = (type) => {
    const item = POST_TYPES.find((entry) => entry.value === type);
    if (!item) return language === 'en' ? 'Post' : 'Bài viết';
    return language === 'en' ? item.labelEn : item.labelVi;
  };

  const handleJoinRequest = async () => {
    try {
      const updatedGroup = await joinGroup(groupId, user.id);
      setGroupDetail((current) => current ? { ...current, group: updatedGroup } : current);
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể gửi yêu cầu tham gia nhóm.');
    }
  };

  const handleCreatePost = async () => {
    if (!composerContent.trim() && !composerAttachment) return;

    try {
      setIsSubmittingPost(true);
      const createdPost = await createPost({
        content: composerContent.trim(),
        type: composerType,
        userId: user.id,
        groupId: Number(groupId),
        subjectId: groupDetail?.group.subjectId ?? null,
        fileUrl: composerAttachment?.fileUrl ?? null,
        fileName: composerAttachment?.fileName ?? null,
        fileType: composerAttachment?.fileType ?? null,
      });
      setGroupDetail((current) => current ? { ...current, posts: [createdPost, ...current.posts] } : current);
      setComposerContent('');
      setComposerAttachment(null);
      setPageError('');
      setActionMessage('');
    } catch (error) {
      setPageError(error.message || 'Không thể đăng bài trong nhóm.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleComposerFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setPageError('Vui lòng chọn tệp nhỏ hơn 3MB để đăng nhanh trên hệ thống.');
      event.target.value = '';
      return;
    }

    try {
      const fileUrl = await readFileAsDataUrl(file);
      setComposerAttachment({
        fileUrl,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
      });
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể đọc tệp đính kèm.');
    } finally {
      event.target.value = '';
    }
  };

  const clearComposerAttachment = () => {
    setComposerAttachment(null);
  };

  const renderAttachment = (attachment) => {
    if (!attachment?.fileUrl) return null;

    if (isImageAttachment(attachment.fileType, attachment.fileUrl)) {
      return (
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <img src={attachment.fileUrl} alt={attachment.fileName || 'Ảnh đính kèm'} className="max-h-[420px] w-full object-cover" />
        </div>
      );
    }

    return (
      <a
        href={attachment.fileUrl}
        download={attachment.fileName || 'attachment'}
        className="mt-5 flex items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
      >
        <Paperclip className="h-4 w-4" />
        <span className="font-medium">{attachment.fileName || 'Tệp đính kèm'}</span>
      </a>
    );
  };

  const handleToggleComments = async (postId) => {
    const nextOpen = !expandedComments[postId];
    setExpandedComments((current) => ({ ...current, [postId]: nextOpen }));

    if (nextOpen && !commentsByPost[postId]) {
      const comments = await fetchComments(postId);
      setCommentsByPost((current) => ({ ...current, [postId]: comments }));
    }
  };

  const handleReact = async (postId, type = 'LIKE') => {
    const summary = await reactToPost(postId, { userId: user.id, type });
    setGroupDetail((current) => current ? {
      ...current,
      posts: current.posts.map((post) => (
        post.id === postId
          ? { ...post, reactionCount: summary.reactionCount, currentUserReaction: summary.currentUserReaction }
          : post
      )),
    } : current);
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const createdComment = await addComment(postId, { userId: user.id, content });
    setCommentsByPost((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), createdComment],
    }));
    setCommentInputs((current) => ({ ...current, [postId]: '' }));
    setExpandedComments((current) => ({ ...current, [postId]: true }));
    setGroupDetail((current) => current ? {
      ...current,
      posts: current.posts.map((post) => (
        post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
      )),
    } : current);
  };

  const handleSharePost = async (postId) => {
    try {
      const sharedPost = await sharePost(postId, user.id);
      setGroupDetail((current) => current ? {
        ...current,
        posts: current.posts.map((post) => (
          post.id === (sharedPost.sharedPostId ?? sharedPost.id)
            ? { ...post, shareCount: sharedPost.shareCount, currentUserShared: true }
            : post
        )),
      } : current);
      setActionMessage('Bài viết đã được chia sẻ về trang cá nhân của bạn.');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể chia sẻ bài viết lúc này.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to leave this group?' : 'Bạn có chắc chắn muốn rời nhóm này không?')) {
      return;
    }

    try {
      setIsProcessingAction(true);
      await leaveGroup(groupId, user.id);
      navigate('/groups');
    } catch (error) {
      setPageError(error.message || 'Không thể rời nhóm lúc này.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to delete this group? This cannot be undone.' : 'Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setIsProcessingAction(true);
      await deleteGroup(groupId, user.id);
      navigate('/groups');
    } catch (error) {
      setPageError(error.message || 'Không thể xóa nhóm lúc này.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const isJoined = Boolean(groupDetail?.group.joined);
  const isGroupAdmin = groupDetail?.group.role === 'GROUP_ADMIN';

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNavbar
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearchSubmit={(event) => event.preventDefault()}
      />

      <main className="grid w-full gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6">
        <aside className="space-y-6">
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← {t('group.back')}
          </button>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{groupDetail?.group.name}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{groupDetail?.group.description}</p>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                <BookOpen className="h-4 w-4" />
                {groupDetail?.group.subjectName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                <Users className="h-4 w-4" />
                {groupDetail?.group.memberCount} {t('group.members')}
              </span>
            </div>

            {isJoined && (
              <button
                type="button"
                onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                {t('feed.createPost')}
              </button>
            )}

            <div className="mt-3 space-y-3">
              {isJoined && isGroupAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  disabled={isProcessingAction}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('group.delete')}
                </button>
              )}

              {isJoined && !isGroupAdmin && (
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  disabled={isProcessingAction}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {t('group.leave')}
                </button>
              )}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('group.featuredMembers')}</h2>
            <div className="mt-4 space-y-3">
              {groupDetail?.members.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => navigate(`/profile/${member.userId}`)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-indigo-50"
                >
                  <img
                    src={avatarFromName(member.fullName)}
                    alt={member.fullName}
                    className="h-10 w-10 rounded-full bg-indigo-100"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{member.fullName}</p>
                    <p className="text-xs text-slate-500">{member.school} · {member.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          {pageError && (
            <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {pageError}
            </div>
          )}

          {actionMessage && (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              {actionMessage}
            </div>
          )}

          {isJoined && (
            <div ref={composerRef} className="rounded-[32px] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{t('group.newPost')}</h3>
              <p className="mt-1 text-sm text-slate-500">{t('group.newPostDesc')}</p>
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 transition focus-within:border-indigo-300 focus-within:bg-white">
                <textarea
                  value={composerContent}
                  onChange={(event) => setComposerContent(event.target.value)}
                  rows={1}
                  placeholder={t('group.newPostPlaceholder')}
                  className="w-full resize-none rounded-t-3xl bg-transparent px-5 pt-4 pb-3 text-sm text-slate-700 outline-none"
                />
                <div className="flex items-center justify-end px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-emerald-600"
                      title="Thêm ảnh"
                    >
                      <FileImage className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-indigo-600"
                      title="Đính kèm tệp"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                      onChange={handleComposerFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              {composerAttachment && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{composerAttachment.fileName}</p>
                      <p className="mt-1 text-xs text-slate-500">{composerAttachment.fileType || 'Tệp đính kèm'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearComposerAttachment}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {renderAttachment(composerAttachment)}
                </div>
              )}
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {POST_TYPES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setComposerType(item.value)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${composerType === item.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {language === 'en' ? item.labelEn : item.labelVi}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={isSubmittingPost || (!composerContent.trim() && !composerAttachment)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {isSubmittingPost ? t('feed.posting') : t('feed.createPost')}
                </button>
              </div>
            </div>
          )}

          {groupDetail?.posts.map((post) => (
            <article key={post.id} className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${post.authorId}`)}
                  className="shrink-0"
                >
                  <img
                    src={avatarFromName(post.authorName)}
                    alt={post.authorName}
                    className="h-12 w-12 rounded-full bg-indigo-100"
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${post.authorId}`)}
                      className="font-semibold text-slate-900 transition hover:text-indigo-600"
                    >
                      {post.authorName}
                    </button>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                      {typeLabel(post.type)}
                    </span>
                    {post.subjectName && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                        {post.subjectName}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {post.authorSchool || t('group.studentLabel')} · {formatTime(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* {post.shared && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                  <Share2 className="h-4 w-4" />
                  Đã chia sẻ vào {formatTime(post.createdAt)}
                </div>
              )} */}

              {shouldRenderPostBody(post) && post.content && (
                <p className="mt-5 text-[15px] leading-7 text-slate-700">{post.content}</p>
              )}

              {shouldRenderPostBody(post) && renderAttachment(post)}

              {post.sharedPostPreview && (
                <SharedPostPreview
                  post={post.sharedPostPreview}
                  formatTime={formatTime}
                  typeLabel={typeLabel}
                  renderAttachment={renderAttachment}
                  onAuthorClick={(authorId) => navigate(`/profile/${authorId}`)}
                />
              )}

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleReact(post.id)}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition ${
                      post.currentUserReaction
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {post.currentUserReaction ? <Heart className="h-4 w-4 fill-current" /> : <ThumbsUp className="h-4 w-4" />}
                    {post.reactionCount} {t('group.likes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    <MessageCircle className="h-4 w-4 text-indigo-500" />
                    {post.commentCount} {t('group.comments')}
                  </button>
                  <button
                    type="button"
                    onClick={() => !post.currentUserShared && handleSharePost(post.id)}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition ${
                      post.currentUserShared
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Share2 className="h-4 w-4" />
                    {post.shareCount} Chia sẻ
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleComments(post.id)}
                  className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  {expandedComments[post.id] ? t('group.hideComments') : t('group.viewDiscussion')}
                </button>
              </div>

              {expandedComments[post.id] && (
                <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                  <div className="space-y-3">
                    {(commentsByPost[post.id] ?? []).map((comment) => (
                      <div key={comment.id} className="rounded-2xl bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/profile/${comment.authorId}`)}
                            className="text-sm font-semibold text-slate-800 transition hover:text-indigo-600"
                          >
                            {comment.authorName}
                          </button>
                          <p className="text-xs text-slate-400">{formatTime(comment.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      value={commentInputs[post.id] ?? ''}
                      onChange={(event) => setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))}
                      placeholder={t('group.writeComment')}
                      className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}

          {groupDetail && groupDetail.posts.length === 0 && (
            <div className="rounded-[28px] bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
              {isJoined ? t('group.emptyJoined') : t('group.emptyGuest')}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
