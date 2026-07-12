import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, FileImage, Heart, LogOut, MessageCircle, Paperclip, Plus, Send, ThumbsUp, Trash2, Users, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PostOwnerMenu from '../components/PostOwnerMenu';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { addComment, approveGroupMember, cancelJoinRequest, createPost, deleteComment, deleteGroup, deletePost, fetchComments, fetchGroupDetail, joinGroup, leaveGroup, reactToPost, rejectGroupMember, updatePost } from '../services/api';
import { isImageAttachment, readFileAsDataUrl } from '../utils/postAttachments';

const POST_TYPES = [
  { value: 'DISCUSSION', label: 'Thảo luận' },
  { value: 'QUESTION', label: 'Câu hỏi' },
  { value: 'MATERIAL', label: 'Tài liệu' },
  { value: 'ANNOUNCEMENT', label: 'Thông báo' },
];

function avatarFromName(name = 'StudyNet User') {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [rejectModalMember, setRejectModalMember] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadGroupDetail = async () => {
    try {
      const detail = await fetchGroupDetail(groupId, user.id);
      setGroupDetail(detail);
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể tải chi tiết nhóm.');
    }
  };

  useEffect(() => {
    loadGroupDetail();
  }, [groupId, user.id]);

  const formatTime = (value) => {
    if (!value) return 'Vừa xong';
    const date = new Date(value);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const typeLabel = (type) => {
    const item = POST_TYPES.find((entry) => entry.value === type);
    return item?.label ?? 'Bài viết';
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

  const handleCancelJoinRequest = async () => {
    try {
      const updatedGroup = await cancelJoinRequest(groupId, user.id);
      setGroupDetail((current) => current ? { ...current, group: updatedGroup } : current);
      setPageError('');
      setActionMessage('Đã hủy yêu cầu tham gia nhóm.');
    } catch (error) {
      setPageError(error.message || 'Không thể hủy yêu cầu tham gia nhóm.');
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

    if (file.size > 10 * 1024 * 1024) {
      setPageError('Vui lòng chọn tệp nhỏ hơn 10MB để đăng trên hệ thống.');
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
    try {
      const summary = await reactToPost(postId, { userId: user.id, type });
      setGroupDetail((current) => current ? {
        ...current,
        posts: current.posts.map((post) => (
          post.id === postId
            ? { ...post, reactionCount: summary.reactionCount, currentUserReaction: summary.currentUserReaction }
            : post
        )),
      } : current);
    } catch (error) {
      setPageError(error.message || 'Không thể thả cảm xúc lúc này.');
    }
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
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
    } catch (error) {
      setPageError(error.message || 'Không thể gửi bình luận lúc này.');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
      return;
    }

    await deleteComment(postId, commentId, user.id);
    setCommentsByPost((current) => ({
      ...current,
      [postId]: (current[postId] ?? []).filter((comment) => comment.id !== commentId),
    }));
    setGroupDetail((current) => current ? {
      ...current,
      posts: current.posts.map((post) => (
        post.id === postId ? { ...post, commentCount: Math.max(0, post.commentCount - 1) } : post
      )),
    } : current);
  };

  const handleCommentKeyDown = (event, postId) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleAddComment(postId).catch((error) => {
      setPageError(error.message || 'Không thể gửi bình luận lúc này.');
    });
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời nhóm này không?')) {
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác.')) {
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

  const handleApproveMember = async (targetUserId, fullName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt ${fullName} vào nhóm không?`)) {
      return;
    }

    try {
      setIsProcessingAction(true);
      await approveGroupMember(groupId, targetUserId, user.id);
      await loadGroupDetail();
      setActionMessage('Đã duyệt yêu cầu tham gia nhóm.');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể duyệt thành viên lúc này.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectMember = async (targetUserId, fullName) => {
    setRejectModalMember({ userId: targetUserId, fullName });
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (isProcessingAction) return;
    setRejectModalMember(null);
    setRejectReason('');
  };

  const submitRejectMember = async () => {
    if (!rejectModalMember) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setPageError('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setIsProcessingAction(true);
      await rejectGroupMember(groupId, rejectModalMember.userId, {
        userId: user.id,
        reason: trimmedReason,
      });
      await loadGroupDetail();
      setActionMessage('Đã từ chối yêu cầu tham gia nhóm.');
      setPageError('');
      setRejectModalMember(null);
      setRejectReason('');
    } catch (error) {
      setPageError(error.message || 'Không thể từ chối thành viên lúc này.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdatePost = async (postId, payload) => {
    try {
      await updatePost(postId, {
        ...payload,
        userId: user.id,
      });
      await loadGroupDetail();
      setActionMessage('Bài viết đã được cập nhật.');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể chỉnh sửa bài viết lúc này.');
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      return;
    }

    try {
      await deletePost(postId, user.id);
      await loadGroupDetail();
      setActionMessage('Bài viết đã được xóa.');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể xóa bài viết lúc này.');
    }
  };

  const isJoined = Boolean(groupDetail?.group.joined);
  const isPending = Boolean(groupDetail?.group.pending);
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
            ← Quay lại Nhóm học tập
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
                {groupDetail?.group.memberCount} thành viên
              </span>
            </div>

            {isJoined && (
              <button
                type="button"
                onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Đăng bài
              </button>
            )}

            <div className="mt-3 space-y-3">
              {isPending && (
                <button
                  type="button"
                  onClick={handleCancelJoinRequest}
                  disabled={isProcessingAction}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Hủy yêu cầu tham gia
                </button>
              )}

              {isJoined && isGroupAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  disabled={isProcessingAction}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa nhóm
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
                  Rời nhóm
                </button>
              )}
            </div>

            {!isJoined && isPending && (
              <p className="mt-3 text-sm text-amber-600">
                Yêu cầu tham gia của bạn đang chờ trưởng nhóm duyệt.
              </p>
            )}
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Thành viên nổi bật</h2>
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

          {isGroupAdmin && (
            <section className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Yêu cầu tham gia</h2>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                  {groupDetail?.pendingMembers?.length ?? 0} chờ duyệt
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {groupDetail?.pendingMembers?.length ? groupDetail.pendingMembers.map((member) => (
                  <div key={member.userId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/profile/${member.userId}`)}
                        className="shrink-0"
                      >
                        <img
                          src={avatarFromName(member.fullName)}
                          alt={member.fullName}
                          className="h-10 w-10 rounded-full bg-indigo-100"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/profile/${member.userId}`)}
                          className="font-semibold text-slate-800 transition hover:text-indigo-600"
                        >
                          {member.fullName}
                        </button>
                        <p className="mt-1 text-xs text-slate-500">{member.school}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveMember(member.userId, member.fullName)}
                            disabled={isProcessingAction}
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectMember(member.userId, member.fullName)}
                            disabled={isProcessingAction}
                            className="rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có yêu cầu tham gia nào đang chờ duyệt.
                  </div>
                )}
              </div>
            </section>
          )}
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
              <h3 className="text-lg font-semibold text-slate-900">Tạo bài đăng mới</h3>
              <p className="mt-1 text-sm text-slate-500">Đăng bài tập, câu hỏi, thảo luận hoặc tài liệu để cả nhóm cùng trao đổi.</p>
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 transition focus-within:border-indigo-300 focus-within:bg-white">
                <textarea
                  value={composerContent}
                  onChange={(event) => setComposerContent(event.target.value)}
                  rows={1}
                  placeholder="Viết nội dung bạn muốn chia sẻ với nhóm..."
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
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={isSubmittingPost || (!composerContent.trim() && !composerAttachment)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {isSubmittingPost ? 'Đang đăng...' : 'Đăng bài'}
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
                    {post.authorSchool || 'Sinh viên StudyNet'} · {formatTime(post.createdAt)}
                  </p>
                </div>
                {post.authorId === user.id && (
                  <PostOwnerMenu
                    post={post}
                    typeOptions={POST_TYPES.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                    renderAttachment={renderAttachment}
                    onSave={(payload) => handleUpdatePost(post.id, payload)}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                )}
              </div>

              {post.content && (
                <p className="mt-5 text-[15px] leading-7 text-slate-700">{post.content}</p>
              )}

              {renderAttachment(post)}

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleReact(post.id)}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition ${
                      post.currentUserReaction
                        ? 'bg-slate-100 text-yellow-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {post.currentUserReaction ? <ThumbsUp className="h-4 w-4 fill-current" /> : <ThumbsUp className="h-4 w-4" />}
                    {post.reactionCount} lượt thích
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    <MessageCircle className="h-4 w-4 text-indigo-500" />
                    {post.commentCount} bình luận
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleComments(post.id)}
                  className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  {expandedComments[post.id] ? 'Ẩn bình luận' : 'Xem thảo luận'}
                </button>
              </div>

              {expandedComments[post.id] && (
                <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                  <div className="space-y-3">
                    {(commentsByPost[post.id] ?? []).map((comment) => (
                      <div key={comment.id} className="rounded-2xl bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <button
                              type="button"
                              onClick={() => navigate(`/profile/${comment.authorId}`)}
                              className="text-sm font-semibold text-slate-800 transition hover:text-indigo-600"
                            >
                              {comment.authorName}
                            </button>
                            <p className="text-xs text-slate-400">{formatTime(comment.createdAt)}</p>
                          </div>
                          {comment.authorId === user.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(post.id, comment.id).catch((error) => {
                                setPageError(error.message || 'Không thể xóa bình luận lúc này.');
                              })}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Xóa bình luận"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {isJoined ? (
                    <div className="mt-4 flex items-center gap-3">
                      <input
                        value={commentInputs[post.id] ?? ''}
                        onChange={(event) => setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))}
                        onKeyDown={(event) => handleCommentKeyDown(event, post.id)}
                        placeholder="Viết bình luận của bạn..."
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
                  ) : (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                      {isPending
                        ? 'Bạn cần chờ yêu cầu tham gia được duyệt trước khi bình luận.'
                        : 'Tham gia nhóm để bình luận vào bài viết này.'}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}

          {groupDetail && groupDetail.posts.length === 0 && (
            <div className="rounded-[28px] bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
              {isJoined
                ? 'Nhóm này chưa có bài viết nào. Hãy bắt đầu bằng bài đăng đầu tiên của bạn.'
                : 'Nhóm này chưa có bài viết nào. Tham gia nhóm để bắt đầu thảo luận.'}
            </div>
          )}
        </section>
      </main>

      {rejectModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Từ chối yêu cầu tham gia</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {`Hãy cho ${rejectModalMember.fullName} biết vì sao họ chưa thể tham gia nhóm này.`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeRejectModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                placeholder="Nhập lý do từ chối..."
                className="w-full resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitRejectMember}
                disabled={isProcessingAction}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessingAction ? 'Đang gửi...' : 'Từ chối yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
