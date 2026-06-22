import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Bell, BookOpen, DatabaseZap, FolderKanban, LogOut, Menu, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAdminGroups, fetchAdminOverview, fetchAdminPosts, fetchAdminUsers, seedDemoData, seedSampleData } from '../services/api';

const sidebarItems = [
  { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { key: 'users', label: 'Người dùng', icon: Users },
  { key: 'groups', label: 'Nhóm học tập', icon: FolderKanban },
  { key: 'posts', label: 'Bài viết', icon: BookOpen },
  { key: 'tools', label: 'Công cụ dữ liệu', icon: DatabaseZap },
];

function avatarFromName(name = 'Admin') {
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

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const [overviewResponse, usersResponse, groupsResponse, postsResponse] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminUsers(),
        fetchAdminGroups(),
        fetchAdminPosts(),
      ]);
      setOverview(overviewResponse);
      setUsers(usersResponse);
      setGroups(groupsResponse);
      setPosts(postsResponse);
    } catch (error) {
      setPageError(error.message || 'Không thể tải dữ liệu quản trị.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard().catch(() => {});
  }, []);

  const summaryCards = useMemo(() => ([
    { title: 'Người dùng', value: overview?.totalUsers ?? 0, note: `${overview?.totalAdmins ?? 0} admin`, tone: 'from-indigo-600 to-blue-500' },
    { title: 'Nhóm học tập', value: overview?.totalGroups ?? 0, note: `${overview?.totalSubjects ?? 0} môn học`, tone: 'from-emerald-500 to-teal-500' },
    { title: 'Bài viết', value: overview?.totalPosts ?? 0, note: `${overview?.totalNotifications ?? 0} thông báo`, tone: 'from-amber-500 to-orange-500' },
  ]), [overview]);

  const handleSeed = async (mode) => {
    try {
      setIsSeeding(true);
      setActionMessage('');
      const response = mode === 'demo' ? await seedDemoData() : await seedSampleData();
      setActionMessage(response.message || 'Đã cập nhật dữ liệu mẫu.');
      await loadDashboard();
    } catch (error) {
      setPageError(error.message || 'Không thể chạy công cụ dữ liệu.');
    } finally {
      setIsSeeding(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              Khu vực quản trị StudyNet
            </p>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Xin chào {user?.fullName}</h1>
            <p className="mt-2 text-sm text-slate-500">Theo dõi hệ thống, người dùng, nhóm học tập và dữ liệu mẫu từ một nơi duy nhất.</p>
          </div>
          <div className="rounded-[28px] bg-slate-50 px-5 py-4 text-sm text-slate-600">
            Phiên admin đang hoạt động
            <p className="mt-1 font-semibold text-slate-900">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
              <div className={`inline-flex rounded-2xl bg-gradient-to-r px-3 py-2 text-sm font-semibold text-white ${card.tone}`}>
                {card.title}
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500">{card.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">Người dùng mới</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(overview?.recentUsers ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {item.role}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.school} · {formatTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-slate-900">Nhóm mới tạo</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(overview?.recentGroups ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.subjectName || 'Chưa gắn môn học'}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {item.memberCount} thành viên
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Tạo bởi {item.creatorName} · {formatTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderUsers = () => (
    <section className="rounded-[32px] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h2>
      <p className="mt-2 text-sm text-slate-500">Xem nhanh vai trò, số nhóm đã tham gia và số bài viết của từng tài khoản.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="px-3 py-3 font-semibold">Người dùng</th>
              <th className="px-3 py-3 font-semibold">Trường / Ngành</th>
              <th className="px-3 py-3 font-semibold">Quan tâm</th>
              <th className="px-3 py-3 font-semibold">Hoạt động</th>
              <th className="px-3 py-3 font-semibold">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-4">
                  <p className="font-semibold text-slate-900">{item.fullName}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                </td>
                <td className="px-3 py-4 text-slate-600">{item.school}<p className="mt-1 text-xs text-slate-500">{item.major}</p></td>
                <td className="px-3 py-4 text-slate-600">{item.interestedSubjects?.length ? item.interestedSubjects.join(', ') : 'Chưa chọn'}</td>
                <td className="px-3 py-4 text-slate-600">{item.joinedGroupCount} nhóm · {item.postCount} bài viết</td>
                <td className="px-3 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {item.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderGroups = () => (
    <section className="rounded-[32px] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Danh sách nhóm học tập</h2>
      <p className="mt-2 text-sm text-slate-500">Theo dõi nhanh chủ đề, trưởng nhóm và mức độ hoạt động của từng nhóm.</p>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {groups.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.subjectName || 'Chưa gắn môn học'}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{item.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-white px-3 py-2">{item.memberCount} thành viên</span>
              <span className="rounded-full bg-white px-3 py-2">{item.postCount} bài viết</span>
            </div>
            <p className="mt-4 text-sm text-slate-600">Tạo bởi <span className="font-semibold text-slate-800">{item.creatorName}</span></p>
          </article>
        ))}
      </div>
    </section>
  );

  const renderPosts = () => (
    <section className="rounded-[32px] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Bài viết gần đây</h2>
      <p className="mt-2 text-sm text-slate-500">Kiểm tra nhanh nội dung mới được đăng trên hệ thống.</p>
      <div className="mt-6 space-y-4">
        {posts.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{item.authorName}</p>
                <p className="mt-1 text-xs text-slate-500">{item.authorSchool || 'Sinh viên StudyNet'} · {formatTime(item.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.subjectName && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">{item.subjectName}</span>}
                {item.groupName && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">{item.groupName}</span>}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{item.content}</p>
            <div className="mt-4 flex gap-3 text-xs text-slate-500">
              <span>{item.reactionCount} lượt thích</span>
              <span>{item.commentCount} bình luận</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderTools = () => (
    <section className="rounded-[32px] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Công cụ dữ liệu admin</h2>
      <p className="mt-2 text-sm text-slate-500">Kích hoạt dữ liệu mẫu để kiểm tra nhanh hệ thống khi demo hoặc test giao diện.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSeed('base')}
          disabled={isSeeding}
          className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <p className="text-lg font-semibold text-slate-900">Seed dữ liệu cơ bản</p>
          <p className="mt-2 text-sm text-slate-500">Khởi tạo người dùng, nhóm, bài viết và thông báo mẫu nếu hệ thống còn trống.</p>
        </button>
        <button
          type="button"
          onClick={() => handleSeed('demo')}
          disabled={isSeeding}
          className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <p className="text-lg font-semibold text-slate-900">Thêm dữ liệu demo nâng cao</p>
          <p className="mt-2 text-sm text-slate-500">Bổ sung thêm người dùng, nhóm học, bài viết và tương tác để demo dashboard phong phú hơn.</p>
        </button>
      </div>

      {actionMessage && (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}
    </section>
  );

  const content = {
    overview: renderOverview(),
    users: renderUsers(),
    groups: renderGroups(),
    posts: renderPosts(),
    tools: renderTools(),
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => navigate('/admin')} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-indigo-200">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">StudyNet Admin</p>
                <p className="text-xs text-slate-500">Bảng điều khiển quản trị</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 md:block">
              {overview?.totalUsers ?? 0} người dùng
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
              <img src={avatarFromName(user?.fullName)} alt={user?.fullName} className="h-10 w-10 rounded-full bg-indigo-100" />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} border-r border-slate-200 bg-white p-5 lg:block`}>
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="px-4 py-6 lg:px-6">
          {pageError && (
            <div className="mb-5 rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {pageError}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-[28px] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="text-sm text-slate-500">Đang tải dữ liệu quản trị...</p>
            </div>
          ) : (
            content[activeTab]
          )}
        </main>
      </div>
    </div>
  );
}
