import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Heart, MessageCircle, Paperclip, School, Send, Share2, SquarePen, ThumbsUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PostOwnerMenu from '../components/PostOwnerMenu';
import SharePostModal from '../components/SharePostModal';
import SharedPostPreview, { shouldRenderPostBody } from '../components/SharedPostPreview';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { addComment, deletePost, fetchComments, fetchUserPosts, fetchUserProfile, reactToPost, sharePost, updatePost } from '../services/api';
import { isImageAttachment } from '../utils/postAttachments';

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

function renderAttachment(post) {
  if (!post.fileUrl) return null;

  if (isImageAttachment(post.fileType, post.fileUrl)) {
    return (
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <img src={post.fileUrl} alt={post.fileName || 'Ảnh đính kèm'} className="max-h-[420px] w-full object-cover" />
      </div>
    );
  }

  return (
    <a
      href={post.fileUrl}
      download={post.fileName || 'attachment'}
      className="mt-5 flex items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
    >
      <Paperclip className="h-4 w-4" />
      <span className="font-medium">{post.fileName || 'Tệp đính kèm'}</span>
    </a>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { locale } = useSettings();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [shareModalPost, setShareModalPost] = useState(null);
  const [shareContent, setShareContent] = useState('');
  const [isSharingPost, setIsSharingPost] = useState(false);
  const targetUserId = Number(userId ?? user.id);
  const isOwnProfile = targetUserId === user.id;

  const formatPostTime = (value) => {
    if (!value) return 'Vừa xong';
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const typeLabel = (type) => {
    const labels = {
      DISCUSSION: 'Thảo luận',
      QUESTION: 'Câu hỏi',
      MATERIAL: 'Tài liệu',
      ANNOUNCEMENT: 'Thông báo',
    };
    return labels[type] ?? 'Bài viết';
  };

  const typeOptions = [
    { value: 'DISCUSSION', label: 'Thảo luận' },
    { value: 'QUESTION', label: 'Câu hỏi' },
    { value: 'MATERIAL', label: 'Tài liệu' },
    { value: 'ANNOUNCEMENT', label: 'Thông báo' },
  ];

  const loadProfilePosts = async () => {
    const postResponse = await fetchUserPosts(targetUserId, user.id);
    setPosts(postResponse);
  };

  useEffect(() => {
    Promise.all([fetchUserProfile(targetUserId), fetchUserPosts(targetUserId, user.id)])
      .then(([profileResponse, postResponse]) => {
        setProfile(profileResponse);
        setPosts(postResponse);
        setPageError('');
      })
      .catch((error) => {
        setPageError(error.message || 'Không thể tải trang cá nhân lúc này.');
      });
  }, [targetUserId, user.id]);

  const handleToggleComments = async (postId) => {
    const nextOpen = !expandedComments[postId];
    setExpandedComments((current) => ({ ...current, [postId]: nextOpen }));

    if (nextOpen && !commentsByPost[postId]) {
      const comments = await fetchComments(postId);
      setCommentsByPost((current) => ({ ...current, [postId]: comments }));
    }
  };

  const handleReact = async (postId) => {
    const summary = await reactToPost(postId, { userId: user.id, type: 'LIKE' });
    setPosts((current) => current.map((post) => (
      post.id === postId
        ? { ...post, reactionCount: summary.reactionCount, currentUserReaction: summary.currentUserReaction }
        : post
    )));
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
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
    )));
  };

  const openShareModal = (post) => {
    setShareModalPost(post);
    setShareContent('');
    setPageError('');
  };

  const closeShareModal = () => {
    if (isSharingPost) return;
    setShareModalPost(null);
    setShareContent('');
  };

  const handleSharePost = async () => {
    if (!shareModalPost) return;

    try {
      setIsSharingPost(true);
      await sharePost(shareModalPost.id, {
        userId: user.id,
        content: shareContent,
      });
      await loadProfilePosts();
      setActionMessage('Bài viết đã được chia sẻ về trang cá nhân của bạn.');
      setPageError('');
      setShareModalPost(null);
      setShareContent('');
    } catch (error) {
      setPageError(error.message || 'Không thể chia sẻ bài viết lúc này.');
    } finally {
      setIsSharingPost(false);
    }
  };

  const handleUpdatePost = async (postId, payload) => {
    try {
      await updatePost(postId, {
        ...payload,
        userId: user.id,
      });
      await loadProfilePosts();
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
      await loadProfilePosts();
      setActionMessage('Bài viết đã được xóa.');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể xóa bài viết lúc này.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNavbar
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearchSubmit={(event) => event.preventDefault()}
      />

      <main className="grid w-full gap-6 px-4 py-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-6">
        <aside className="space-y-6">
          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <img
                src={avatarFromName(profile?.fullName || user.fullName)}
                alt={profile?.fullName || user.fullName}
                className="h-28 w-28 rounded-full bg-indigo-100"
              />
              <h1 className="mt-4 text-2xl font-bold text-slate-900">{profile?.fullName || user.fullName}</h1>
              <p className="mt-1 text-sm text-slate-500">{profile?.major || user.major}</p>
              {isOwnProfile && (
                <button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
                  <SquarePen className="h-4 w-4" />
                  Chỉnh sửa trang cá nhân
                </button>
              )}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
                  <School className="h-4 w-4" />
                  Trường học
                </div>
                {profile?.school || 'Chưa cập nhật'}
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
                  <GraduationCap className="h-4 w-4" />
                  Ngành học
                </div>
                {profile?.major || 'Chưa cập nhật'}
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
                  <BookOpen className="h-4 w-4" />
                  Thống kê
                </div>
                {profile?.joinedGroupCount || 0} nhóm tham gia · {profile?.postCount || 0} bài viết
              </div>
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Bài viết của {profile?.fullName || user.fullName}</h2>
            <p className="mt-2 text-sm text-slate-500">Không gian chia sẻ, thảo luận và tài liệu học tập cá nhân.</p>
          </div>

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

          {posts.map((post) => (
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
                <div className="flex-1">
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
                  <p className="mt-1 text-sm text-slate-500">{formatPostTime(post.createdAt)}</p>
                </div>
                {post.authorId === user.id && (
                  <PostOwnerMenu
                    post={post}
                    typeOptions={typeOptions}
                    renderAttachment={renderAttachment}
                    onSave={(payload) => handleUpdatePost(post.id, payload)}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                )}
              </div>

              {/* {post.shared && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                  <Share2 className="h-4 w-4" />
                  Đã chia sẻ vào {formatPostTime(post.createdAt)}
                </div>
              )} */}

              {shouldRenderPostBody(post) && post.content && (
                <p className="mt-5 text-[15px] leading-7 text-slate-700">{post.content}</p>
              )}

              {shouldRenderPostBody(post) && renderAttachment(post)}

              {post.sharedPostPreview && (
                <SharedPostPreview
                  post={post.sharedPostPreview}
                  formatTime={formatPostTime}
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
                    <button
                      type="button"
                      onClick={() => !post.currentUserShared && openShareModal(post)}
                      className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition ${
                        post.currentUserShared
                          ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Share2 className="h-4 w-4" />
                    {post.shareCount} chia sẻ
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
                          <button
                            type="button"
                            onClick={() => navigate(`/profile/${comment.authorId}`)}
                            className="text-sm font-semibold text-slate-800 transition hover:text-indigo-600"
                          >
                            {comment.authorName}
                          </button>
                          <p className="text-xs text-slate-400">{formatPostTime(comment.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="text"
                      value={commentInputs[post.id] ?? ''}
                      onChange={(event) => setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))}
                      placeholder="Viết bình luận..."
                      className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
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
        </section>
      </main>

      <SharePostModal
        open={Boolean(shareModalPost)}
        post={shareModalPost}
        shareContent={shareContent}
        onShareContentChange={setShareContent}
        onClose={closeShareModal}
        onSubmit={handleSharePost}
        isSubmitting={isSharingPost}
        formatTime={formatPostTime}
        typeLabel={typeLabel}
        renderAttachment={renderAttachment}
        onAuthorClick={(authorId) => navigate(`/profile/${authorId}`)}
      />
    </div>
  );
}
