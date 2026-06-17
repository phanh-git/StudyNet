import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, School, SquarePen } from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { fetchUserPosts, fetchUserProfile } from '../services/api';

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

export default function ProfilePage() {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    Promise.all([fetchUserProfile(user.id), fetchUserPosts(user.id)])
      .then(([profileResponse, postResponse]) => {
        setProfile(profileResponse);
        setPosts(postResponse);
      })
      .catch(() => {});
  }, [user.id]);

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
              <button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                <SquarePen className="h-4 w-4" />
                Chỉnh sửa trang cá nhân
              </button>
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

          {posts.map((post) => (
            <article key={post.id} className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <img
                  src={avatarFromName(profile?.fullName || user.fullName)}
                  alt={profile?.fullName || user.fullName}
                  className="h-12 w-12 rounded-full bg-indigo-100"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{profile?.fullName || user.fullName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{formatTime(post.createdAt)}</p>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-7 text-slate-700">{post.content}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
