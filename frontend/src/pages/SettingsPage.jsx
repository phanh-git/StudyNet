import { Languages, MonitorCog, MoonStar, SunMedium } from 'lucide-react';
import { useState } from 'react';
import StudentNavbar from '../components/StudentNavbar';
import { useSettings } from '../context/SettingsContext';

const themeOptions = [
  { value: 'light', icon: SunMedium, accent: 'from-amber-400 to-orange-500' },
  { value: 'dark', icon: MoonStar, accent: 'from-slate-700 to-slate-900' },
];

const languageOptions = [
  { value: 'vi', flag: 'VN' },
  { value: 'en', flag: 'EN' },
];

export default function SettingsPage() {
  const [searchInput, setSearchInput] = useState('');
  const { theme, setTheme, language, setLanguage, t } = useSettings();

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNavbar
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearchSubmit={(event) => event.preventDefault()}
      />

      <main className="grid w-full gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-6">
        <section className="space-y-6">
          <div className="rounded-[36px] bg-white p-7 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <MonitorCog className="h-4 w-4" />
              {t('nav.settings')}
            </div>
            <h1 className="mt-5 text-3xl font-bold text-slate-900">{t('settings.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{t('settings.subtitle')}</p>
          </div>

          <div className="rounded-[36px] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <SunMedium className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('settings.appearance')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('settings.appearanceDesc')}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const selected = theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`rounded-[28px] border p-5 text-left transition ${
                      selected
                        ? 'border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${option.accent} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      {option.value === 'light' ? t('settings.light') : t('settings.dark')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {option.value === 'light'
                        ? (language === 'en' ? 'Bright, clean, and easy to scan in daylight.' : 'Sáng sủa, rõ ràng và dễ nhìn khi học ban ngày.')
                        : (language === 'en' ? 'Gentler on the eyes for evening study sessions.' : 'Dịu mắt hơn khi học buổi tối hoặc trong không gian tối.')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('settings.language')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('settings.languageDesc')}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {languageOptions.map((option) => {
                const selected = language === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={`rounded-[28px] border p-5 text-left transition ${
                      selected
                        ? 'border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-100'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {option.flag}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      {option.value === 'vi' ? t('settings.vietnamese') : t('settings.english')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {option.value === 'vi'
                        ? (language === 'en' ? 'Prioritize Vietnamese labels for a familiar experience.' : 'Ưu tiên giao diện tiếng Việt cho trải nghiệm quen thuộc.')
                        : (language === 'en' ? 'Use English labels where translation support is available.' : 'Dùng nhãn tiếng Anh ở những khu vực đã hỗ trợ chuyển ngữ.')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[36px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-7 text-white shadow-2xl shadow-slate-300/30">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{t('settings.preview')}</p>
            <h2 className="mt-4 text-2xl font-bold">{t('settings.previewTitle')}</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">{t('settings.previewDesc')}</p>

            <div className="mt-6 rounded-[28px] bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t('settings.appearance')}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {theme === 'light' ? t('settings.light') : t('settings.dark')}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{t('settings.language')}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {language === 'vi' ? t('settings.vietnamese') : t('settings.english')}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
