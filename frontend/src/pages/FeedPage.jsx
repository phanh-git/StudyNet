import { useEffect, useMemo, useState } from 'react';
import { CircleHelp, FileText, Heart, Megaphone, MessageCircle, Paperclip, Send, ThumbsUp, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostOwnerMenu from '../components/PostOwnerMenu';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { addComment, deleteComment, deletePost, fetchComments, fetchFeed, fetchSubjects, fetchUserGroups, reactToPost, updatePost } from '../services/api';
import { isImageAttachment } from '../utils/postAttachments';

const POST_TYPES = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'QUESTION', label: 'Câu hỏi', icon: CircleHelp },
  { value: 'DISCUSSION', label: 'Thảo luận', icon: MessageCircle },
  { value: 'MATERIAL', label: 'Tài liệu', icon: FileText },
  { value: 'ANNOUNCEMENT', label: 'Thông báo', icon: Megaphone },
];

const SORT_OPTIONS = [
  { value: 'LATEST', label: 'Mới nhất' },
  { value: 'TRENDING', label: 'Nổi bật' },
];

function avatarFromName(name = 'StudyNet User') {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [postType, setPostType] = useState('ALL');
  const [sortBy, setSortBy] = useState('LATEST');
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const navigate = useNavigate();

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

  const typeLabel = (type) => POST_TYPES.find((item) => item.value === type)?.label ?? 'Bài viết';

  const activeSubjectName = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId)?.name ?? 'Tất cả môn học',
    [selectedSubjectId, subjects],
  );

  const loadFeed = async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const nextPosts = await fetchFeed({
        subjectId: selectedSubjectId,
        keyword: searchKeyword,
        type: postType,
        sortBy,
        currentUserId: user.id,
      });
      setPosts(nextPosts);
    } catch (error) {
      setPageError(error.message || 'Không thể tải bảng tin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchSubjects(), fetchUserGroups(user.id)])
      .then(([subjectItems, userGroups]) => {
        setSubjects(subjectItems);
        setGroups(userGroups);
      })
      .catch((error) => {
        setPageError(error.message || 'Không thể tải dữ liệu newfeed.');
      });
  }, [user.id]);

  useEffect(() => {
    loadFeed();
  }, [selectedSubjectId, searchKeyword, postType, sortBy]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput);
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
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
    )));
    setExpandedComments((current) => ({ ...current, [postId]: true }));
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
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, commentCount: Math.max(0, post.commentCount - 1) } : post
    )));
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

  const handleUpdatePost = async (postId, payload) => {
    try {
      await updatePost(postId, {
        ...payload,
        userId: user.id,
      });
      await loadFeed();
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
      await loadFeed();
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
        onSearchSubmit={submitSearch}
      />

      <main className="grid w-full gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <aside className="space-y-6">
          <section className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900">Nhóm của bạn</h2>
              <p className="text-xs text-slate-500">Các nhóm học bạn đã tham gia</p>
            </div>

            <div className="space-y-3">
              {groups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Bạn chưa tham gia nhóm nào nên bảng tin hiện chưa có bài đăng.
                </div>
              ) : groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(`/groups/${group.id}`);
                    }
                  }}
                  className="cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{group.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{group.subjectName || 'Chưa gắn môn học'}</p>
                    </div>
                    <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600">
                      {group.memberCount} thành viên
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900">Lọc theo môn học</h2>
              <p className="text-xs text-slate-500">Hiển thị bài viết theo môn học</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubjectId(null)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedSubjectId === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Tất cả
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedSubjectId === subject.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {POST_TYPES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPostType(item.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${postType === item.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSortBy(item.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${sortBy === item.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
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

          {isLoading ? (
            <div className="rounded-[28px] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="text-sm text-slate-500">Đang tải bảng tin học tập...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[28px] bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
              Bạn chưa có bài đăng nào trên bảng tin. Hãy tham gia nhóm và bắt đầu thảo luận.
            </div>
          ) : (
            posts.map((post) => (
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
                      {post.groupName && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          {post.groupName}
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
                      typeOptions={POST_TYPES.filter((item) => item.value !== 'ALL')}
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
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
