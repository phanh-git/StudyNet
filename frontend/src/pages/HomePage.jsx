import { BookOpen, Users, MessageSquare, Star, ArrowRight, Zap, Globe, Award } from 'lucide-react';
import {Link} from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Nhóm học tập',
    desc: 'Tạo và tham gia các nhóm theo môn học, trao đổi kiến thức cùng bạn bè',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Bảng tin sôi động',
    desc: 'Đăng câu hỏi, chia sẻ tài liệu và thảo luận như mạng xã hội thực thụ',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Kho tài liệu phong phú',
    desc: 'Hàng nghìn tài liệu học tập được chia sẻ bởi cộng đồng sinh viên',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Tìm kiếm thông minh',
    desc: 'Lọc bài viết theo môn học, loại nội dung và thời gian một cách dễ dàng',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Kết nối toàn quốc',
    desc: 'Kết nối với sinh viên từ các trường đại học trên khắp Việt Nam',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Phân quyền rõ ràng',
    desc: 'Hệ thống quản lý User và Admin giúp duy trì chất lượng nội dung',
    color: 'bg-rose-100 text-rose-600',
  },
];

const stats = [
  { value: '12,000+', label: 'Sinh viên' },
  { value: '350+', label: 'Nhóm học tập' },
  { value: '45,000+', label: 'Bài đăng' },
  { value: '120+', label: 'Trường ĐH' },
];

const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Lập trình', 'Tiếng Anh', 'Kinh tế', 'Sinh học', 'Văn học'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-black-900">StudyNet</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-black-600 hover:text-indigo-600 transition-colors text-lg font-medium"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
            >
              Đăng ký 
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-white" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-base font-medium rounded-full mb-6">
                <Star className="w-3.5 h-3.5 fill-indigo-500" />
                Mạng xã hội học tập #1 Việt Nam
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Học tập cùng nhau,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  tiến xa hơn
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                StudyNet kết nối sinh viên Việt Nam để cùng trao đổi kiến thức, chia sẻ tài liệu và hỗ trợ nhau trong hành trình học tập.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="text-lg flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium"
                >
                  Tham gia ngay
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: 'Nguyễn Văn An', sub: 'Lập trình', text: ' Ai có thể giải thích thuật toán Dynamic Programming?', reactions: 24, comments: 12 },
                  { name: 'Trần Thị Bình', sub: 'Hóa học', text: ' Chia sẻ tài liệu Hóa hữu cơ đầy đủ nhất 2025!', reactions: 67, comments: 18 },
                  { name: 'Lê Hoàng Nam', sub: 'Vật lý', text: ' Thảo luận về nguyên lý bất định Heisenberg', reactions: 38, comments: 9 },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl p-3 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                        {item.name[0]}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                        <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-sm">{item.sub}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{item.text}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>👍 {item.reactions}</span>
                      <span>💬 {item.comments} bình luận</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-indigo-200 text-base mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subject Tags */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wide">Các môn học nổi bật</p>
          <div className="flex flex-wrap justify-center gap-2">
            {subjects.map((s, i) => (
              <span key={i} className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 border border-gray-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Tính năng nổi bật</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Mọi thứ bạn cần để học tập hiệu quả và kết nối với cộng đồng</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-600">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng tham gia StudyNet?</h2>
          <p className="text-indigo-200 mb-8">Đăng ký miễn phí và bắt đầu kết nối với hàng nghìn sinh viên ngay hôm nay</p>
          <Link
            to="/register"
            className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Đăng ký miễn phí ngay →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold">StudyNet</span>
        </div>
        <p className="text-gray-500 text-sm">© 2026 StudyNet - Mạng xã hội học tập dành cho sinh viên Việt Nam</p>
      </footer>
    </div>
  );
}
