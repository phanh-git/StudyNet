import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleHelp, FileImage, FileText, MessageCircle, Megaphone, Paperclip, Plus, Heart, Send, Share2, ThumbsUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SharedPostPreview, { shouldRenderPostBody } from '../components/SharedPostPreview';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { addComment, createPost, fetchComments, fetchFeed, fetchSubjects, fetchUserGroups, reactToPost, sharePost } from '../services/api';
import { isImageAttachment, readFileAsDataUrl } from '../utils/postAttachments';

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
  const { t, locale } = useSettings();
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [postType, setPostType] = useState('ALL');
  const [sortBy, setSortBy] = useState('LATEST');
  const [composerType, setComposerType] = useState('DISCUSSION');
  const [composerContent, setComposerContent] = useState('');
  const [composerAttachment, setComposerAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const typeLabel = (type) => POST_TYPES.find((item) => item.value === type)?.label ?? 'Post';

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
    setIsLoading(true);
    setPageError('');

    fetchFeed({
      subjectId: selectedSubjectId,
      keyword: searchKeyword,
      type: postType,
      sortBy,
      currentUserId: user.id,
    })
      .then(setPosts)
      .catch((error) => {
        setPageError(error.message || 'Không thể tải bảng tin.');
      })
      .finally(() => setIsLoading(false));
  }, [selectedSubjectId, searchKeyword, postType, sortBy]);

  const activeSubjectName = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId)?.name ?? 'Tất cả môn học',
    [subjects, selectedSubjectId],
  );

  const submitSearch = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput);
  };

  const handleCreatePost = async () => {
    if (!composerContent.trim() && !composerAttachment) return;

    try {
      setIsSubmitting(true);
      const createdPost = await createPost({
        content: composerContent.trim(),
        type: composerType,
        userId: user.id,
        subjectId: selectedSubjectId,
        fileUrl: composerAttachment?.fileUrl ?? null,
        fileName: composerAttachment?.fileName ?? null,
        fileType: composerAttachment?.fileType ?? null,
      });
      setPosts((current) => [createdPost, ...current]);
      setComposerContent('');
      setComposerAttachment(null);
      setPageError('');
      setActionMessage('');
    } catch (error) {
      setPageError(error.message || 'Không thể đăng bài lúc này.');
    } finally {
      setIsSubmitting(false);
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

  const handleSharePost = async (postId) => {
    try {
      const sharedPost = await sharePost(postId, user.id);
      setPosts((current) => [
        sharedPost,
        ...current.map((post) => (
          post.id === (sharedPost.sharedPostId ?? sharedPost.id)
            ? { ...post, shareCount: sharedPost.shareCount, currentUserShared: true }
            : post
        )),
      ]);
      setActionMessage('Bài viết đã được chia sẻ về trang cá nhân của bạn.');
      setPageError('');
    } catch (error) {
      setPageError(error.message || 'Không thể chia sẻ bài viết lúc này.');
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
              <h2 className="font-semibold text-slate-900">{t('feed.yourGroups')}</h2>
              <p className="text-xs text-slate-500">{t('feed.yourGroupsDesc')}</p>
            </div>

            <div className="space-y-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate(`/groups/${group.id}`);
                  }}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{group.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{group.subjectName || t('feed.noSubject')}</p>
                    </div>
                    <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600">
                      {group.memberCount} {t('feed.members')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900">{t('feed.filterBySubject')}</h2>
              <p className="text-xs text-slate-500">{t('feed.filterBySubjectDesc')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubjectId(null)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedSubjectId === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t('feed.all')}
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
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={avatarFromName(user.fullName)}
                alt={user.fullName}
                className="h-14 w-14 rounded-full bg-indigo-100"
              />
              <div className="flex-1">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 transition focus-within:border-indigo-300 focus-within:bg-white">
                  <textarea
                    value={composerContent}
                    onChange={(event) => setComposerContent(event.target.value)}
                    rows={1}
                    placeholder={`${user.fullName}, ${t('feed.askShare')}`}
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
                <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {POST_TYPES.filter((item) => item.value !== 'ALL').map((item) => (
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
                    disabled={isSubmitting || (!composerContent.trim() && !composerAttachment)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {isSubmitting ? t('feed.posting') : t('feed.createPost')}
                  </button>
                </div>
              </div>
            </div>
          </div>

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
            {/* <p className="mt-4 text-sm text-slate-500">
              {t('feed.viewingSubject')} <span className="font-semibold text-slate-700">{activeSubjectName}</span>
            </p> */}
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
              <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <p className="text-sm text-slate-500">{t('feed.loading')}</p>
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
                      {post.authorSchool || t('feed.studentLabel')} · {formatTime(post.createdAt)}
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
                      {post.reactionCount} {t('feed.likes')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      <MessageCircle className="h-4 w-4 text-indigo-500" />
                      {post.commentCount} {t('feed.comments')}
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
                    {expandedComments[post.id] ? t('feed.hideComments') : t('feed.viewDiscussion')}
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
                        placeholder={t('feed.writeComment')}
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
