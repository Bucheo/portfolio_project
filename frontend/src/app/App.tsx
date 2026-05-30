import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github, Mail, Plus, LogOut, Moon, Sun, UserCircle,
  Trash2, Edit3, AlignLeft, AlignCenter, AlignRight,
  ChevronUp, ChevronDown, Briefcase, Award, Code2,
  FolderOpen, Trophy, ExternalLink, Eye, Pencil
} from 'lucide-react';

import { AuthModal }    from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

// ── 토큰 스토리지 ────────────────────────────────────────────
const TOKEN_KEY   = 'portfolio_access_token';
const REFRESH_KEY = 'portfolio_refresh_token';
const USER_KEY    = 'portfolio_user_info';
const tokenStorage = {
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { const r = localStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; }
    catch { return null; }
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ── 타입 ─────────────────────────────────────────────────────
type SectionType = 'intro' | 'awards' | 'timeline' | 'projects' | 'skills';
interface Section { id: SectionType; label: string; icon: any; }
interface IntroData { html: string; profileImage: string | null; }
interface AwardItem    { id: number; title: string; description: string; icon: string; }
interface TimelineItem { id: number; icon: string; title: string; organization: string; date: string; description: string; }
interface ProjectItem  { id: number; title: string; description: string; tags: string[]; github: string; demo: string; }
interface SkillItem    { id: number; name: string; level: number; experience: string; }

const SECTION_META: Section[] = [
  { id: 'intro',    label: '자기소개',      icon: UserCircle },
  { id: 'awards',   label: '수상 & 자격증', icon: Trophy },
  { id: 'timeline', label: '경력 & 학력',   icon: Briefcase },
  { id: 'projects', label: '프로젝트',      icon: FolderOpen },
  { id: 'skills',   label: '기술 스택',     icon: Code2 },
];

const DEFAULT_INTRO: IntroData = {
  html: '<p>안녕하세요! 저는 <strong>풀스택 개발자</strong>입니다.</p><p>이곳에 자유롭게 자기소개를 작성해보세요.</p>',
  profileImage: null,
};
const DEFAULT_AWARDS: AwardItem[] = [
  { id: 1, icon: '🏆', title: '해커톤 최우수상', description: '전국 대학생 해커톤 2023 최우수상 수상.' },
  { id: 2, icon: '🎖️', title: 'AWS 공인 개발자', description: 'AWS Certified Developer – Associate 취득.' },
];
const DEFAULT_TIMELINE: TimelineItem[] = [
  { id: 1, icon: '💼', title: '시니어 풀스택 개발자', organization: '테크 스타트업', date: '2024 ~ 현재', description: '마이크로서비스 아키텍처 설계 및 팀 리딩.' },
  { id: 2, icon: '🎓', title: '컴퓨터공학과 졸업', organization: '○○대학교', date: '2018', description: '웹 기술 및 알고리즘 전공.' },
];
const DEFAULT_PROJECTS: ProjectItem[] = [
  { id: 1, title: 'E-Commerce 플랫폼', description: '풀스택 전자상거래 웹사이트', tags: ['React','Node.js','PostgreSQL'], github: '', demo: '' },
  { id: 2, title: '실시간 채팅 앱', description: 'WebSocket 기반 메시징 플랫폼', tags: ['React','Socket.io'], github: '', demo: '' },
];
const DEFAULT_SKILLS: SkillItem[] = [
  { id: 1, name: 'React / Next.js', level: 90, experience: '3년 경력' },
  { id: 2, name: 'Spring Boot',     level: 80, experience: '2년 경력' },
  { id: 3, name: 'MySQL / JPA',     level: 75, experience: '2년 경력' },
];

// ── 우측 고정 에디터 툴바 ─────────────────────────────────────
function FloatingToolbar({ visible }: { visible: boolean }) {
  const FONTS  = ['기본', 'Arial', 'Georgia', 'Courier New', 'Noto Sans KR'];
  const SIZES  = ['12px','14px','16px','18px','20px','24px','28px','32px'];
  const COLORS = [
    { hex: '#000000', label: '검정' },
    { hex: '#374151', label: '진회색' },
    { hex: '#e53e3e', label: '빨강' },
    { hex: '#dd6b20', label: '주황' },
    { hex: '#d69e2e', label: '노랑' },
    { hex: '#38a169', label: '초록' },
    { hex: '#3182ce', label: '파랑' },
    { hex: '#805ad5', label: '보라' },
    { hex: '#d53f8c', label: '핑크' },
    { hex: '#ffffff', label: '흰색' },
  ];

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };

  const applySize = (size: string) => {
    exec('fontSize', '7');
    setTimeout(() => {
      document.querySelectorAll('font[size="7"]').forEach(el => {
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.innerHTML = (el as HTMLElement).innerHTML;
        el.replaceWith(span);
      });
    }, 0);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 p-3 flex flex-col gap-2 w-48">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">✏️ 텍스트 편집</p>

      {/* 폰트 */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">폰트</p>
        <select onChange={e => exec('fontName', e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none">
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* 크기 */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">글자 크기</p>
        <select onChange={e => applySize(e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none">
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* 스타일 */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">스타일</p>
        <div className="flex gap-1">
          <button onMouseDown={e => { e.preventDefault(); exec('bold'); }}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-sm transition-colors">B</button>
          <button onMouseDown={e => { e.preventDefault(); exec('italic'); }}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 italic text-sm transition-colors">I</button>
          <button onMouseDown={e => { e.preventDefault(); exec('underline'); }}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 underline text-sm transition-colors">U</button>
        </div>
      </div>

      {/* 정렬 */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">정렬</p>
        <div className="flex gap-1">
          <button onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); }}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); }}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('justifyRight'); }}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 색상 */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">글자 색</p>
        <div className="grid grid-cols-5 gap-1">
          {COLORS.map(({ hex, label }) => (
            <button key={hex}
              title={label}
              onMouseDown={e => { e.preventDefault(); exec('foreColor', hex); }}
              style={{ background: hex }}
              className={`w-7 h-7 rounded-full shadow-sm hover:scale-110 transition-transform
                ${hex === '#ffffff'
                  ? 'border-2 border-gray-400 dark:border-gray-400'
                  : 'border-2 border-white dark:border-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 자기소개 에디터 (밀림 버그 수정) ─────────────────────────
function IntroEditor({ html, onChange, isDarkMode }: {
  html: string; onChange: (h: string) => void; isDarkMode: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // 최초 1회 innerHTML 세팅
  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = html;
      initialized.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 다크/라이트 모드 전환 시 색이 지정되지 않은 기본 글자색 자동 변경
  useEffect(() => {
    if (!ref.current) return;
    const defaultColor = isDarkMode ? '#ffffff' : '#000000';
    ref.current.style.color = defaultColor;
  }, [isDarkMode]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
      className="min-h-[160px] p-4 focus:outline-none dark:bg-gray-800 text-sm leading-relaxed rounded-xl border border-blue-300 dark:border-blue-600 focus:ring-2 focus:ring-blue-400"
      style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
    />
  );
}

// ── 재사용 가능한 contentEditable 텍스트 필드 ────────────────
function ContentEditableField({ html, onChange, className, singleLine = false }: {
  html: string;
  onChange: (h: string) => void;
  className?: string;
  singleLine?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = html;
      initialized.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
      onKeyDown={singleLine ? (e) => { if (e.key === 'Enter') e.preventDefault(); } : undefined}
      className={className}
    />
  );
}

// ── 섹션 컴포넌트들 ───────────────────────────────────────────

function IntroSection({ data, editMode, onChange, isDarkMode }: {
  data: IntroData; editMode: boolean; onChange: (d: IntroData) => void; isDarkMode: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange({ ...data, profileImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div
            onClick={() => editMode && fileRef.current?.click()}
            className={`w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-700
                        bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center
                        ${editMode ? 'cursor-pointer hover:opacity-80 ring-2 ring-blue-400 ring-offset-2' : ''} transition-all`}
          >
            {data.profileImage
              ? <img src={data.profileImage} alt="프로필" className="w-full h-full object-cover" />
              : <UserCircle className="w-16 h-16 text-white" />
            }
          </div>
          {editMode && (
            <>
              <button onClick={() => fileRef.current?.click()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline">이미지 변경</button>
              {data.profileImage && (
                <button onClick={() => onChange({ ...data, profileImage: null })}
                  className="text-xs text-red-500 hover:underline">삭제</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </>
          )}
        </div>

        {/* 텍스트 */}
        <div className="flex-1">
          {editMode ? (
            <>
              <p className="text-xs text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> 우측 툴바로 글자 스타일을 변경하세요
              </p>
              <IntroEditor html={data.html} onChange={html => onChange({ ...data, html })} isDarkMode={isDarkMode} />
            </>
          ) : (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AwardsSection({ items, editMode, onChange }: {
  items: AwardItem[]; editMode: boolean; onChange: (items: AwardItem[]) => void;
}) {
  const add = () => onChange([...items, { id: Date.now(), icon: '🏅', title: '새 항목', description: '' }]);
  const update = (id: number, field: keyof AwardItem, val: string) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative group">
            {editMode
              ? <input value={item.icon} onChange={e => update(item.id, 'icon', e.target.value)}
                  className="w-10 h-10 text-2xl text-center bg-transparent focus:outline-none flex-shrink-0" />
              : <span className="text-2xl w-10 flex-shrink-0 leading-none pt-1">{item.icon}</span>
            }
            <div className="flex-1 min-w-0">
              {editMode ? (
                <>
                  <ContentEditableField html={item.title} onChange={h => update(item.id, 'title', h)} singleLine
                    className="w-full font-semibold text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none dark:text-white mb-1 min-h-[1.25rem]" />
                  <ContentEditableField html={item.description} onChange={h => update(item.id, 'description', h)}
                    className="w-full text-xs bg-transparent focus:outline-none text-gray-500 dark:text-gray-400 min-h-[1rem]" />
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: item.title }} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: item.description }} />
                </>
              )}
            </div>
            {editMode && (
              <button onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 항목 추가
        </button>
      )}
    </div>
  );
}

function TimelineSection({ items, editMode, onChange }: {
  items: TimelineItem[]; editMode: boolean; onChange: (items: TimelineItem[]) => void;
}) {
  const add = () => onChange([...items, { id: Date.now(), icon: '💼', title: '새 항목', organization: '', date: '', description: '' }]);
  const update = (id: number, field: keyof TimelineItem, val: string) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative pl-8 pb-6 border-l-2 border-blue-200 dark:border-blue-700 last:pb-0 group">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm shadow">
              {editMode
                ? <input value={item.icon} onChange={e => update(item.id, 'icon', e.target.value)}
                    className="w-7 h-7 text-center bg-transparent focus:outline-none text-white text-sm" />
                : item.icon
              }
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 relative">
              {editMode && (
                <button onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {editMode ? (
                <div className="space-y-1.5 pr-6">
                  <div className="flex gap-2">
                    <ContentEditableField html={item.title} onChange={h => update(item.id, 'title', h)} singleLine
                      className="flex-1 font-bold text-sm bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none dark:text-white min-h-[1.25rem]" />
                    <input value={item.date} onChange={e => update(item.id, 'date', e.target.value)}
                      placeholder="기간" className="w-32 text-xs bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none text-gray-500 dark:text-gray-400" />
                  </div>
                  <ContentEditableField html={item.organization} onChange={h => update(item.id, 'organization', h)} singleLine
                    className="w-full text-sm text-blue-600 bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none font-semibold min-h-[1.25rem]" />
                  <ContentEditableField html={item.description} onChange={h => update(item.id, 'description', h)}
                    className="w-full text-xs bg-transparent focus:outline-none text-gray-500 dark:text-gray-400 min-h-[1rem]" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: item.title }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{item.date}</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1" dangerouslySetInnerHTML={{ __html: item.organization }} />
                  <p className="text-xs text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: item.description }} />
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 항목 추가
        </button>
      )}
    </div>
  );
}

function ProjectsSection({ items, editMode, onChange }: {
  items: ProjectItem[]; editMode: boolean; onChange: (items: ProjectItem[]) => void;
}) {
  const add = () => onChange([...items, { id: Date.now(), title: '새 프로젝트', description: '', tags: [], github: '', demo: '' }]);
  const update = (id: number, field: keyof ProjectItem, val: any) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 relative group border border-gray-200 dark:border-gray-600">
            {editMode && (
              <button onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {editMode ? (
              <div className="space-y-2 pr-4">
                <ContentEditableField html={item.title} onChange={h => update(item.id, 'title', h)} singleLine
                  className="w-full font-bold text-sm bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none dark:text-white min-h-[1.25rem]" />
                <ContentEditableField html={item.description} onChange={h => update(item.id, 'description', h)}
                  className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-600 rounded p-1 focus:outline-none dark:text-gray-300 min-h-[2.5rem]" />
                <input value={item.tags.join(', ')} onChange={e => update(item.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="태그 (쉼표로 구분)" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
                <input value={item.github} onChange={e => update(item.id, 'github', e.target.value)}
                  placeholder="GitHub URL" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
                <input value={item.demo} onChange={e => update(item.id, 'demo', e.target.value)}
                  placeholder="Demo URL" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
              </div>
            ) : (
              <>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3" dangerouslySetInnerHTML={{ __html: item.description }} />
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full">{t}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {item.github && (
                    <a href={item.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      <Github className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {item.demo && (
                    <a href={item.demo} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      <ExternalLink className="w-3.5 h-3.5" /> Demo
                    </a>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 프로젝트 추가
        </button>
      )}
    </div>
  );
}

function SkillsSection({ items, editMode, onChange }: {
  items: SkillItem[]; editMode: boolean; onChange: (items: SkillItem[]) => void;
}) {
  const add = () => onChange([...items, { id: Date.now(), name: '새 기술', level: 50, experience: '' }]);
  const update = (id: number, field: keyof SkillItem, val: any) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative group">
            {editMode && (
              <button onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {editMode ? (
              <div className="space-y-2 pr-4">
                <ContentEditableField html={item.name} onChange={h => update(item.id, 'name', h)} singleLine
                  className="w-full font-semibold text-sm bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none dark:text-white min-h-[1.25rem]" />
                <ContentEditableField html={item.experience} onChange={h => update(item.id, 'experience', h)} singleLine
                  className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500 min-h-[1rem]" />
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={item.level}
                    onChange={e => update(item.id, 'level', Number(e.target.value))}
                    className="flex-1" />
                  <span className="text-xs font-bold text-blue-600 w-8">{item.level}%</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: item.name }} />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{item.level}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2" dangerouslySetInnerHTML={{ __html: item.experience }} />
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <motion.div className="bg-blue-500 h-1.5 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${item.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 기술 추가
        </button>
      )}
    </div>
  );
}

// ── 메인 App ─────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn,       setIsLoggedIn]       = useState(false);
  const [editMode,         setEditMode]         = useState(false); // 수정모드 스위치
  const [username,         setUsername]         = useState('');
  const [githubUrl,        setGithubUrl]        = useState('');
  const [userEmail,        setUserEmail]        = useState('');
  const [isDarkMode,       setIsDarkMode]       = useState(false);
  const [showAuthModal,    setShowAuthModal]    = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [sectionOrder, setSectionOrder] = useState<SectionType[]>(
    ['intro', 'awards', 'timeline', 'projects', 'skills']
  );

  const [intro,    setIntro]    = useState<IntroData>(DEFAULT_INTRO);
  const [awards,   setAwards]   = useState<AwardItem[]>(DEFAULT_AWARDS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(DEFAULT_TIMELINE);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [skills,   setSkills]   = useState<SkillItem[]>(DEFAULT_SKILLS);

  useEffect(() => {
    if (tokenStorage.isLoggedIn()) {
      const user = tokenStorage.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUsername(user.username || '');
        setGithubUrl(user.githubUrl || '');
        setUserEmail(user.email || '');
        loadData(user.username || '');
      }
    }
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  // 로그아웃 시 수정모드 해제
  useEffect(() => { if (!isLoggedIn) setEditMode(false); }, [isLoggedIn]);

  const loadData = (u: string) => {
    try {
      const raw = localStorage.getItem(`portfolio_v2_${u}`);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.intro)        setIntro(d.intro);
        if (d.awards)       setAwards(d.awards);
        if (d.timeline)     setTimeline(d.timeline);
        if (d.projects)     setProjects(d.projects);
        if (d.skills)       setSkills(d.skills);
        if (d.sectionOrder) setSectionOrder(d.sectionOrder);
      }
    } catch {}
  };

  const save = useCallback(() => {
    if (!username) return;
    localStorage.setItem(`portfolio_v2_${username}`, JSON.stringify({
      intro, awards, timeline, projects, skills, sectionOrder,
    }));
  }, [username, intro, awards, timeline, projects, skills, sectionOrder]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isLoggedIn) save(); }, [intro, awards, timeline, projects, skills, sectionOrder]);

  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    const stored = tokenStorage.getUser();
    if (stored) { setGithubUrl(stored.githubUrl || ''); setUserEmail(stored.email || ''); }
    loadData(user);
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setIsLoggedIn(false);
    setEditMode(false);
    setUsername(''); setGithubUrl(''); setUserEmail('');
    setIntro(DEFAULT_INTRO); setAwards(DEFAULT_AWARDS);
    setTimeline(DEFAULT_TIMELINE); setProjects(DEFAULT_PROJECTS);
    setSkills(DEFAULT_SKILLS);
    setSectionOrder(['intro', 'awards', 'timeline', 'projects', 'skills']);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sectionOrder];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSectionOrder(next);
  };

  const renderSection = (id: SectionType, idx: number) => {
    const meta = SECTION_META.find(s => s.id === id)!;
    return (
      <section key={id}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <meta.icon className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{meta.label}</h2>
          </div>
          {editMode && (
            <div className="flex items-center gap-1">
              <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                <ChevronUp className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => moveSection(idx, 1)} disabled={idx === sectionOrder.length - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
        {id === 'intro'    && <IntroSection    data={intro}    editMode={editMode} onChange={setIntro} isDarkMode={isDarkMode} />}
        {id === 'awards'   && <AwardsSection   items={awards}  editMode={editMode} onChange={setAwards} />}
        {id === 'timeline' && <TimelineSection items={timeline} editMode={editMode} onChange={setTimeline} />}
        {id === 'projects' && <ProjectsSection items={projects} editMode={editMode} onChange={setProjects} />}
        {id === 'skills'   && <SkillsSection   items={skills}  editMode={editMode} onChange={setSkills} />}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">

      {/* ── 우측 고정 에디터 툴바 (수정모드일 때만) ── */}
      <FloatingToolbar visible={editMode} />

      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <div className="flex items-center gap-2">
            {/* 다크모드 */}
            <button onClick={() => setIsDarkMode(d => !d)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

            {isLoggedIn ? (
              <>
                {/* ── 일반/수정 모드 스위치 ── */}
                <button
                  onClick={() => setEditMode(v => !v)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    editMode
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-amber-900'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {/* 스위치 트랙 */}
                  <span className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 ${editMode ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-500'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${editMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  {editMode
                    ? <><Pencil className="w-3.5 h-3.5" /> 수정 모드</>
                    : <><Eye    className="w-3.5 h-3.5" /> 일반 모드</>
                  }
                </button>

                {/* 개인정보 버튼 */}
                <button onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                             bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50
                             text-blue-700 dark:text-blue-300 transition-colors">
                  <UserCircle className="w-4 h-4" /> {username}
                </button>

                {/* 로그아웃 */}
                <button onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium
                             bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">

        {/* 상단 이름 + 소셜 링크 */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {username ? `${username}의 포트폴리오` : '나의 포트폴리오'}
          </h2>
          <div className="flex justify-center gap-3">
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-700 text-white text-sm hover:bg-gray-700 transition-colors shadow-sm">
                <Github className="w-4 h-4" /> GitHub
              </a>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 text-sm cursor-default">
                <Github className="w-4 h-4" /> GitHub
              </div>
            )}
            {userEmail ? (
              <a href={`mailto:${userEmail}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors shadow-sm">
                <Mail className="w-4 h-4" /> 이메일
              </a>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 text-sm cursor-default">
                <Mail className="w-4 h-4" /> 이메일
              </div>
            )}
          </div>
          {isLoggedIn && (!githubUrl || !userEmail) && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              💡 <button onClick={() => setShowProfileModal(true)} className="text-blue-500 hover:underline">개인정보</button>에서 GitHub·이메일을 등록하면 버튼이 활성화됩니다.
            </p>
          )}
        </div>

        {/* 수정모드 안내 배너 */}
        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-300">
              <Pencil className="w-4 h-4 flex-shrink-0" />
              수정 모드입니다. 각 항목을 직접 클릭해서 편집하고, 우측 툴바로 텍스트 스타일을 변경하세요.
              섹션 순서는 △ ▽ 버튼으로 변경할 수 있습니다.
            </motion.div>
          )}
        </AnimatePresence>

        {/* 섹션들 */}
        {sectionOrder.map((id, idx) => renderSection(id, idx))}

      </main>

      {/* 모달 */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
        )}
        {showProfileModal && (
          <ProfileModal onClose={() => {
            setShowProfileModal(false);
            const user = tokenStorage.getUser();
            if (user) {
              setGithubUrl(user.githubUrl || '');
              setUserEmail(user.email || '');
              setUsername(user.username || '');
            }
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}