import { useEffect, useState } from 'react';
import { Bell, BookOpen, ChevronDown, Home, LogOut, Search, Settings, UserCircle2, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { fetchNotifications, fetchUnreadNotificationCount, markNotificationAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

export default function StudentNavbar({ searchValue, onSearchValueChange, onSearchSubmit }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      const [notificationItems, summary] = await Promise.all([
        fetchNotifications(user.id),
        fetchUnreadNotificationCount(user.id),
      ]);

      if (!ignore) {
        setNotifications(notificationItems);
        setUnreadCount(summary.unreadCount);
      }
    }

    loadNotifications().catch(() => {});
    return () => {
      ignore = true;
    };
  }, [user.id]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: true } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
      markNotificationAsRead(user.id, notification.id).catch(() => {});
    }

    setNotificationsOpen(false);
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex w-full items-center gap-4 px-4 py-3 lg:px-6">
        <button type="button" onClick={() => navigate('/feed')} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-indigo-200">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">StudyNet</p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          <NavLink
            to="/feed"
            className={({ isActive }) => `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="h-4 w-4" />
            Bảng tin
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) => `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            Nhóm học tập
          </NavLink>
        </nav>

        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 shadow-inner">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder="Tìm kiếm bài viết, tài liệu, nhóm..."
              className="w-full bg-transparent px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-96 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200">
                <div className="mb-3 flex items-center justify-between px-2">
                  <h3 className="font-semibold text-slate-900">Thông báo</h3>
                  <span className="text-xs text-slate-500">{unreadCount} chưa đọc</span>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Chưa có thông báo nào.
                    </div>
                  )}

                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        notification.isRead
                          ? 'border-slate-100 bg-white hover:bg-slate-50'
                          : 'border-indigo-100 bg-indigo-50/70 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{notification.message}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatTime(notification.createdAt)}</p>
                        </div>
                        {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50"
            >
              <img
                src={avatarFromName(user.fullName)}
                alt={user.fullName}
                className="h-10 w-10 rounded-full bg-indigo-100"
              />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.school}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200">
                <button type="button" onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  <UserCircle2 className="h-4 w-4" />
                  Trang cá nhân
                </button>
                <button type="button" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </button>
                <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-rose-600 transition hover:bg-rose-50">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
