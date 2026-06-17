import { ShieldCheck, Users, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const cards = [
  { icon: Users, title: 'Quản lý người dùng', description: 'Theo dõi hoạt động sinh viên và phân quyền tài khoản.' },
  { icon: Bell, title: 'Thông báo hệ thống', description: 'Gửi thông báo và xử lý các cảnh báo quan trọng.' },
  { icon: BarChart3, title: 'Thống kê nội dung', description: 'Quan sát số bài viết, nhóm học tập và mức độ tương tác.' },
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Khu vực quản trị
            </p>
            <h1 className="text-3xl font-bold">Xin chào {user?.fullName}</h1>
            <p className="mt-2 text-slate-300">Dashboard admin đã sẵn route riêng. Mình để khung này để bạn phát triển tiếp phần quản trị ở bước sau.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Đăng xuất
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-sky-400/15 p-3 text-sky-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
