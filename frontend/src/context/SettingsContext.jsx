import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SETTINGS_STORAGE_KEY = 'studynet-ui-settings';

const translations = {
  vi: {
    'common.justNow': 'Vừa xong',
    'common.studentSpace': 'Không gian học tập của sinh viên',
    'common.searchPlaceholder': 'Tìm kiếm bài viết, tài liệu, nhóm...',
    'nav.feed': 'Bảng tin',
    'nav.groups': 'Nhóm học tập',
    'nav.profile': 'Trang cá nhân',
    'nav.settings': 'Cài đặt',
    'nav.logout': 'Đăng xuất',
    'notifications.title': 'Thông báo',
    'notifications.unread': 'chưa đọc',
    'notifications.empty': 'Chưa có thông báo nào.',
    'feed.yourGroups': 'Nhóm của bạn',
    'feed.yourGroupsDesc': 'Các nhóm học bạn đã tham gia',
    'feed.noSubject': 'Chưa gắn môn học',
    'feed.members': 'thành viên',
    'feed.filterBySubject': 'Lọc theo môn học',
    'feed.filterBySubjectDesc': 'Hiển thị bài viết theo môn học',
    'feed.all': 'Tất cả',
    'feed.askShare': 'bạn muốn chia sẻ điều gì hôm nay?',
    'feed.posting': 'Đang đăng...',
    'feed.createPost': 'Đăng bài',
    'feed.latest': 'Mới nhất',
    'feed.trending': 'Nổi bật',
    // 'feed.viewingSubject': 'Đang xem theo môn',
    'feed.loading': 'Đang tải bảng tin học tập...',
    'feed.studentLabel': 'Sinh viên StudyNet',
    'feed.likes': 'lượt thích',
    'feed.comments': 'bình luận',
    'feed.hideComments': 'Ẩn bình luận',
    'feed.viewDiscussion': 'Xem thảo luận',
    'feed.writeComment': 'Viết bình luận của bạn...',
    'group.back': 'Quay lại Nhóm học tập',
    'group.members': 'thành viên',
    'group.delete': 'Xóa nhóm',
    'group.leave': 'Rời nhóm',
    'group.featuredMembers': 'Thành viên nổi bật',
    'group.newPost': 'Tạo bài đăng mới',
    'group.newPostDesc': 'Đăng bài tập, câu hỏi, thảo luận hoặc tài liệu để cả nhóm cùng trao đổi.',
    'group.newPostPlaceholder': 'Viết nội dung bạn muốn chia sẻ với nhóm...',
    'group.studentLabel': 'Sinh viên StudyNet',
    'group.likes': 'lượt thích',
    'group.comments': 'bình luận',
    'group.hideComments': 'Ẩn bình luận',
    'group.viewDiscussion': 'Xem thảo luận',
    'group.writeComment': 'Viết bình luận của bạn...',
    'group.emptyJoined': 'Nhóm này chưa có bài viết nào. Hãy bắt đầu bằng bài đăng đầu tiên của bạn.',
    'group.emptyGuest': 'Nhóm này chưa có bài viết nào. Tham gia nhóm để bắt đầu thảo luận.',
    'settings.title': 'Cài đặt hệ thống',
    'settings.subtitle': 'Tùy chỉnh giao diện và ngôn ngữ theo cách bạn muốn học tập thoải mái nhất.',
    'settings.appearance': 'Giao diện',
    'settings.appearanceDesc': 'Chọn chế độ hiển thị phù hợp khi học ban ngày hoặc buổi tối.',
    'settings.language': 'Ngôn ngữ',
    'settings.languageDesc': 'Chọn ngôn ngữ hiển thị chính cho những khu vực đã hỗ trợ đa ngôn ngữ.',
    'settings.light': 'Chế độ sáng',
    'settings.dark': 'Chế độ tối',
    'settings.vietnamese': 'Tiếng Việt',
    'settings.english': 'English',
    'settings.preview': 'Xem trước',
    'settings.previewTitle': 'Không gian học tập được cá nhân hóa',
    'settings.previewDesc': 'Thay đổi sẽ được áp dụng ngay cho thanh điều hướng, trang cài đặt và các màn hình nhóm/bảng tin mới.',
  },
  en: {
    'common.justNow': 'Just now',
    'common.studentSpace': 'A social learning space for students',
    'common.searchPlaceholder': 'Search posts, materials, groups...',
    'nav.feed': 'Feed',
    'nav.groups': 'Study Groups',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'notifications.title': 'Notifications',
    'notifications.unread': 'unread',
    'notifications.empty': 'No notifications yet.',
    'feed.yourGroups': 'Your groups',
    'feed.yourGroupsDesc': 'Study groups you have joined',
    'feed.noSubject': 'No subject assigned',
    'feed.members': 'members',
    'feed.filterBySubject': 'Filter by subject',
    'feed.filterBySubjectDesc': 'Show posts by subject',
    'feed.all': 'All',
    'feed.askShare': 'what would you like to share today?',
    'feed.posting': 'Posting...',
    'feed.createPost': 'Create post',
    'feed.latest': 'Latest',
    'feed.trending': 'Trending',
    'feed.viewingSubject': 'Viewing subject',
    'feed.loading': 'Loading your learning feed...',
    'feed.studentLabel': 'StudyNet student',
    'feed.likes': 'likes',
    'feed.comments': 'comments',
    'feed.hideComments': 'Hide comments',
    'feed.viewDiscussion': 'View discussion',
    'feed.writeComment': 'Write your comment...',
    'group.back': 'Back to Study Groups',
    'group.members': 'members',
    'group.delete': 'Delete group',
    'group.leave': 'Leave group',
    'group.featuredMembers': 'Featured members',
    'group.newPost': 'Create a new post',
    'group.newPostDesc': 'Post assignments, questions, discussions, or materials for the group.',
    'group.newPostPlaceholder': 'Write something to share with the group...',
    'group.studentLabel': 'StudyNet student',
    'group.likes': 'likes',
    'group.comments': 'comments',
    'group.hideComments': 'Hide comments',
    'group.viewDiscussion': 'View discussion',
    'group.writeComment': 'Write your comment...',
    'group.emptyJoined': 'This group has no posts yet. Start the first discussion.',
    'group.emptyGuest': 'This group has no posts yet. Join the group to start discussing.',
    'settings.title': 'System settings',
    'settings.subtitle': 'Adjust the interface and language so learning feels comfortable for you.',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Choose the display mode that fits daytime study or late-night review.',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose the main display language for areas that support translation.',
    'settings.light': 'Light mode',
    'settings.dark': 'Dark mode',
    'settings.vietnamese': 'Tiếng Việt',
    'settings.english': 'English',
    'settings.preview': 'Preview',
    'settings.previewTitle': 'A personalized study space',
    'settings.previewDesc': 'Changes apply instantly to the navbar, settings page, and the updated feed/group screens.',
  },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');

  useEffect(() => {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed.theme === 'dark' || parsed.theme === 'light') {
        setTheme(parsed.theme);
      }
      if (parsed.language === 'en' || parsed.language === 'vi') {
        setLanguage(parsed.language);
      }
    } catch {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ theme, language }));
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = language;
  }, [theme, language]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    language,
    setLanguage,
    locale: language === 'en' ? 'en-US' : 'vi-VN',
    t: (key) => translations[language]?.[key] ?? translations.vi[key] ?? key,
  }), [theme, language]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}
