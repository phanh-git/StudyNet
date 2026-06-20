import { useEffect, useRef, useState } from 'react';
import { BookOpen, MessageCircle, Plus, Trash2, LogOut, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { createPost, deleteGroup, fetchGroupDetail, joinGroup, leaveGroup } from '../services/api';

const POST_TYPES = [
  { value: 'DISCUSSION', label: 'Thảo luận' },
  { value: 'QUESTION', label: 'Câu hỏi' },
  { value: 'MATERIAL', label: 'Tài liệu' },
  { value: 'ANNOUNCEMENT', label: 'Thông báo' },
];

function avatarFromName(name = 'StudyNet User') {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;
}

function formatTime(value) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [groupDetail, setGroupDetail] = useState(null);
  const [pageError, setPageError] = useState('');
  const [composerType, setComposerType] = useState('DISCUSSION');
  const [composerContent, setComposerContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const composerRef = useRef(null);

  useEffect(() => {
    fetchGroupDetail(groupId, user.id)
      .then(setGroupDetail)
      .catch((error) => setPageError(error.message || 'Không thể tải chi tiết nhóm.'));
  }, [groupId, user.id]);

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
    if (!composerContent.trim()) return;

    try {
      setIsSubmittingPost(true);
      const createdPost = await createPost({
        content: composerContent.trim(),
        type: composerType,
        userId: user.id,
        groupId: Number(groupId),
        subjectId: groupDetail?.group.subjectId ?? null,
      });
      setGroupDetail((current) => current ? { ...current, posts: [createdPost, ...current.posts] } : current);
      setComposerContent('');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể đăng bài trong nhóm.');
    } finally {
      setIsSubmittingPost(false);
    }
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

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (isJoined) {
                    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                  }
                  if (!isPending) {
                    handleJoinRequest();
                  }
                }}
                className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                  isJoined
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : isPending
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isJoined ? 'Đăng bài' : isPending ? 'Đang chờ duyệt' : 'Tham gia nhóm'}
              </button>

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
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Thành viên nổi bật</h2>
            <div className="mt-4 space-y-3">
              {groupDetail?.members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <img
                    src={avatarFromName(member.fullName)}
                    alt={member.fullName}
                    className="h-10 w-10 rounded-full bg-indigo-100"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{member.fullName}</p>
                    <p className="text-xs text-slate-500">{member.school} · {member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bài viết trong nhóm</h2>
                <p className="mt-2 text-sm text-slate-500">Theo dõi thảo luận, tài liệu và thông báo mới nhất của nhóm.</p>
              </div>
              {isJoined && (
                <button
                  type="button"
                  onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Đăng bài
                </button>
              )}
            </div>
          </div>

          {pageError && (
            <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {pageError}
            </div>
          )}

          {isJoined && (
            <div ref={composerRef} className="rounded-[32px] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Tạo bài đăng mới</h3>
              <p className="mt-1 text-sm text-slate-500">Đăng bài tập, câu hỏi, thảo luận hoặc tài liệu để cả nhóm cùng trao đổi.</p>
              <textarea
                value={composerContent}
                onChange={(event) => setComposerContent(event.target.value)}
                rows={4}
                placeholder="Viết nội dung bạn muốn chia sẻ với nhóm..."
                className="mt-4 w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
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
                  disabled={isSubmittingPost || !composerContent.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                <img
                  src={avatarFromName(post.authorName)}
                  alt={post.authorName}
                  className="h-12 w-12 rounded-full bg-indigo-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{post.authorName}</h3>
                    {post.subjectName && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {post.subjectName}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {post.authorSchool || 'Sinh viên StudyNet'} · {formatTime(post.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-7 text-slate-700">{post.content}</p>
              <div className="mt-5 flex items-center gap-4 text-sm text-slate-500">
                <span>{post.reactionCount} lượt thích</span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentCount} bình luận
                </span>
              </div>
            </article>
          ))}

          {groupDetail && groupDetail.posts.length === 0 && (
            <div className="rounded-[28px] bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
              Nhóm này chưa có bài viết nào. {isJoined ? 'Hãy bắt đầu bằng bài đăng đầu tiên của bạn.' : 'Tham gia nhóm để bắt đầu thảo luận.'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
