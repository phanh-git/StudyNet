import { useState } from 'react';
import {
  BookOpen, Eye, EyeOff, Mail, Lock, User as UserIcon, School,
  GraduationCap, ArrowRight, CheckCircle, AlertCircle, ArrowLeft, Sparkles,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { title: 'Cá nhân'},
  { title: 'Học vấn'},
  { title: 'Bảo mật'},
];

const SUBJECTS = ['Lập trình', 'Toán học', 'Vật lý', 'Hóa học', 'Ngoại ngữ'];

function PasswordStrength({ password }) {
  const checks = [
    { label: 'Ít nhất 8 ký tự', pass: password.length >= 8 },
    { label: 'Có chữ hoa', pass: /[A-Z]/.test(password) },
    { label: 'Có chữ số', pass: /\d/.test(password) },
  ];
  const strength = checks.filter((check) => check.pass).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  const labels = ['Yếu', 'Trung bình', 'Mạnh'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`flex-1 h-1.5 rounded-full transition-all ${index < strength ? colors[strength - 1] : 'bg-gray-200'}`}
          />
        ))}
        <span className={`text-xs font-medium ml-1 ${strength === 3 ? 'text-emerald-600' : strength === 2 ? 'text-amber-600' : 'text-red-500'}`}>
          {labels[strength - 1] || ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((check) => (
          <span key={check.label} className={`flex items-center gap-1 text-xs ${check.pass ? 'text-emerald-600' : 'text-gray-400'}`}>
            <CheckCircle className="w-3 h-3" />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: { interestedSubjects: ['Lập trình'] },
  });

  const password = watch('password') || '';
  const name = watch('name') || '';

  const validateStep = async (step) => {
    const fields = {
      0: ['name', 'email'],
      1: ['school', 'major'],
      2: ['password', 'confirmPassword', 'agreeTerms'],
    };
    return trigger(fields[step]);
  };

  const nextStep = async () => {
    const valid = await validateStep(currentStep);
    if (valid) setCurrentStep((step) => step + 1);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setIsLoading(true);
      const response = await registerRequest({
        fullName: data.name,
        email: data.email,
        school: data.school,
        major: data.major,
        password: data.password,
        interestedSubjects: data.interestedSubjects ?? [],
      });
      login(response.user);
      navigate('/feed');
    } catch (error) {
      setSubmitError(error.message || 'Đăng ký thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-white overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">StudyNet</span>
          </div>

          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100/50">
            <div className="mb-7">
              <h2 className="text-3xl font-bold text-gray-900 mb-1.5">Tạo tài khoản</h2>
              <p className="text-gray-500 text-sm">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((step, index) => (
                <div key={step.title} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    index < currentStep ? 'bg-indigo-600 text-white' :
                    index === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className={`text-xs font-semibold truncate ${index === currentStep ? 'text-indigo-600' : index < currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{step.desc}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 hidden sm:block rounded-full transition-all ${index < currentStep ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm text-indigo-700">
                      Chào mừng! Hãy bắt đầu bằng cách cho chúng tôi biết bạn là ai.
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('name', {
                            required: 'Vui lòng nhập họ tên',
                            minLength: { value: 2, message: 'Tên ít nhất 2 ký tự' },
                          })}
                          placeholder="Nguyễn Văn A"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('email', {
                            required: 'Vui lòng nhập email',
                            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' },
                          })}
                          type="email"
                          placeholder="your@email.com"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errors.email.message}
                        </p>
                      )}
                    </div>

                    {name.trim().length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full bg-indigo-100"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Xem trước avatar</p>
                          <p className="text-xs text-gray-500">Avatar tự động được tạo theo tên của bạn</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-700">
                      Thông tin học vấn giúp hệ thống gợi ý nhóm học phù hợp với bạn.
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Trường đại học *</label>
                      <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('school', { required: 'Vui lòng nhập tên trường' })}
                          placeholder="VD: ĐH Bách Khoa Hà Nội"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {errors.school && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errors.school.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ngành học *</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('major', { required: 'Vui lòng nhập ngành học' })}
                          placeholder="VD: Khoa học máy tính"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {errors.major && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errors.major.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Môn học quan tâm</label>
                      <div className="grid grid-cols-3 gap-2">
                        {SUBJECTS.map((subject) => (
                          <label
                            key={subject}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all select-none ${
                              (watch('interestedSubjects') ?? []).includes(subject)
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                            }`}
                          >
                            <input
                              {...register('interestedSubjects')}
                              type="checkbox"
                              value={subject}
                              className="hidden"
                            />
                            {subject}
                          </label>
                        ))}
                      </div>          
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-sm text-emerald-700">
                      Gần xong rồi. Hãy tạo mật khẩu mạnh để bảo vệ tài khoản của bạn.
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu *</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('password', {
                            required: 'Vui lòng nhập mật khẩu',
                            minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                          })}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu *</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('confirmPassword', {
                            required: 'Vui lòng xác nhận mật khẩu',
                            validate: (value) => value === watch('password') || 'Mật khẩu không khớp',
                          })}
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        {...register('agreeTerms', { required: 'Vui lòng đồng ý điều khoản' })}
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-indigo-600 shrink-0"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của StudyNet.
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.agreeTerms.message}
                      </p>
                    )}

                    {submitError && (
                      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {submitError}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex gap-3 mt-7 ${currentStep > 0 ? 'justify-between' : 'justify-end'}`}>
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => step - 1)}
                    className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                  </button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-200"
                  >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Tạo tài khoản
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
