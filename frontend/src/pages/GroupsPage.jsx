import { useEffect, useMemo, useState } from 'react';
import { Plus, Users, BookOpen } from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';
import { useAuth } from '../context/AuthContext';
import { createGroup, fetchAllGroups, fetchSubjects, joinGroup } from '../services/api';

export default function GroupsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', subjectId: '', status: 'PUBLIC' });

  useEffect(() => {
    fetchSubjects().then(setSubjects).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAllGroups({ userId: user.id, subjectId: selectedSubjectId, keyword: searchKeyword })
      .then(setGroups)
      .catch((error) => setPageError(error.message || 'Không thể tải danh sách nhóm.'));
  }, [user.id, selectedSubjectId, searchKeyword]);

  const joinedCount = useMemo(
    () => groups.filter((group) => group.joined).length,
    [groups],
  );

  const handleJoinGroup = async (groupId) => {
    const updated = await joinGroup(groupId, user.id);
    setGroups((current) => current.map((group) => (group.id === groupId ? updated : group)));
  };

  const handleCreateGroup = async () => {
    const created = await createGroup({
      name: formData.name,
      description: formData.description,
      subjectId: Number(formData.subjectId),
      status: formData.status,
      creatorId: user.id,
    });
    setGroups((current) => [created, ...current]);
    setFormData({ name: '', description: '', subjectId: '', status: 'PUBLIC' });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNavbar
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearchSubmit={(event) => {
          event.preventDefault();
          setSearchKeyword(searchInput);
        }}
      />

      <main className="grid w-full gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="space-y-6">
          <section className="rounded-[28px] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Lọc theo môn học</h2>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubjectId(null)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${selectedSubjectId === null ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Tất cả môn học
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${selectedSubjectId === subject.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Nhóm học tập</h1>
                <p className="mt-2 text-sm text-slate-500">Khám phá cộng đồng học tập đúng chủ đề bạn đang quan tâm.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Tạo nhóm mới
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Tất cả nhóm</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{groups.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Đã tham gia</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{joinedCount}</p>
              </div>
            </div>
          </div>

          {pageError && (
            <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {pageError}
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            {groups.map((group) => (
              <article key={group.id} className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900">{group.name}</h2>
                      {group.subjectName && (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {group.subjectName}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{group.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {group.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                    <Users className="h-4 w-4" />
                    {group.memberCount} thành viên
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                    <BookOpen className="h-4 w-4" />
                    {group.postCount} bài viết
                  </span>
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                    Xem nhóm
                  </button>
                  <button
                    type="button"
                    onClick={() => !group.joined && handleJoinGroup(group.id)}
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      group.joined
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {group.joined ? 'Đã tham gia' : 'Tham gia'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900">Tạo nhóm mới</h2>
              <p className="mt-1 text-sm text-slate-500">Tạo không gian học tập cho đúng môn học bạn muốn kết nối.</p>
            </div>

            <div className="space-y-4">
              <input
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                placeholder="Tên nhóm"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              />
              <textarea
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Mô tả nhóm"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              />
              <select
                value={formData.subjectId}
                onChange={(event) => setFormData((current) => ({ ...current, subjectId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              >
                <option value="">Chọn môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
                Hủy
              </button>
              <button type="button" onClick={handleCreateGroup} className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
