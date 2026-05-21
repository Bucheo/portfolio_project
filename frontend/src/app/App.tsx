import { useState, useEffect } from 'react';
import { tokenStorage, logout } from '../api/auth';
// motion/react 대신 표준 라이브러리인 framer-motion을 사용합니다.
import { motion } from 'framer-motion'; 
import { 
  Code2, Database, Layout, Server, Smartphone, Terminal, 
  Github, Linkedin, Mail, Award, Briefcase, Users, 
  Trophy, Plus, LogOut, Moon, Sun, Edit 
} from 'lucide-react';

// 상대 경로 수정: 현재 App.tsx가 있는 폴더 안의 components 폴더를 바라봅니다.
import { SkillCard } from './components/SkillCard';
import { ProjectCard } from './components/projectCard';
import { ProjectModal } from './components/projectModal';
import { SkillModal } from './components/SkillModal';
import { TimelineItem } from './components/TimelineItem';
import { TimelineModal } from './components/TimelineModal';
import { AuthModal } from './components/AuthModal';
import { EditModal } from './components/EditModal';
import { TipsSection } from './components/TipsSection';

const defaultSkills = [
  { 
    icon: Code2, 
    name: 'React / Next.js', 
    level: 90,
    experience: '3년 경력',
    details: [
      '복잡한 SPA(Single Page Application) 설계 및 개발',
      'React Hooks, Context API, Redux를 활용한 상태 관리',
      'Next.js를 이용한 SSR/SSG 구현 및 최적화',
      'React Query를 사용한 서버 상태 관리',
      '성능 최적화 (Code Splitting, Lazy Loading, Memoization)',
    ]
  },
  { 
    icon: Server, 
    name: 'Node.js / Express', 
    level: 85,
    experience: '2.5년 경력',
    details: [
      'RESTful API 설계 및 구현',
      'Express 미들웨어를 활용한 인증/인가 시스템 구축',
      'WebSocket을 이용한 실시간 통신 구현',
      'API 문서화 (Swagger/OpenAPI)',
      '에러 핸들링 및 로깅 시스템 구축',
    ]
  },
  { 
    icon: Database, 
    name: 'PostgreSQL / MongoDB', 
    level: 80,
    experience: '2년 경력',
    details: [
      '데이터베이스 스키마 설계 및 정규화',
      '복잡한 쿼리 작성 및 최적화',
      'Prisma, TypeORM, Mongoose ORM 사용',
      '인덱싱 및 성능 튜닝',
      '트랜잭션 및 데이터 무결성 관리',
    ]
  },
];

const defaultProjects = [
  {
    id: 1,
    title: 'E-Commerce 플랫폼',
    description: '풀스택 전자상거래 웹사이트 - 결제, 장바구니, 관리자 대시보드 포함',
    image: 'https://images.unsplash.com/photo-1675981004502-cb3961785a38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWIlMjBkZXNpZ258ZW58MXx8fHwxNzY4OTc3NTE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    longDescription: 'Next.js와 TypeScript로 구축한 풀스택 전자상거래 플랫폼입니다. Stripe를 이용한 안전한 결제 시스템, 실시간 재고 관리, 관리자 대시보드, 반응형 디자인을 포함하고 있습니다.',
    myRole: '프론트엔드 개발 (70%) 및 백엔드 API 연동 담당. React로 사용자 인터페이스 구현, 상태 관리 최적화, Stripe 결제 시스템 통합 작업 수행.',
    github: 'https://github.com/yourusername/ecommerce',
    demo: 'https://demo.example.com',
  },
  {
    id: 2,
    title: '실시간 채팅 애플리케이션',
    description: 'WebSocket을 활용한 실시간 메시징 플랫폼',
    image: 'https://images.unsplash.com/photo-1605108222700-0d605d9ebafe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzY4OTk4NjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['React', 'Socket.io', 'Express', 'MongoDB'],
    longDescription: 'Socket.io를 사용한 실시간 채팅 애플리케이션입니다. 개인 메시지, 그룹 채팅, 파일 공유, 온라인 상태 표시 등의 기능을 제공합니다.',
    myRole: '풀스택 개발 (100%). Socket.io를 활용한 실시간 통신 구현, MongoDB 데이터베이스 설계, JWT 기반 인증 시스템 구축.',
    github: 'https://github.com/yourusername/chat-app',
  },
];

const defaultTimeline = [
  {
    icon: Trophy,
    title: '해커톤 대상 수상',
    organization: '2025 전국 대학생 해커톤',
    date: '2025.11',
    description: 'AI 기반 학습 관리 플랫폼으로 대상 수상. 팀 리더로서 프로젝트 기획 및 풀스택 개발 담당.',
  },
  {
    icon: Award,
    title: '우수 프로젝트 선정',
    organization: '한국 소프트웨어 진흥원',
    date: '2025.08',
    description: '오픈소스 프로젝트 기여로 우수 개발자 인증. GitHub에서 1000+ Stars 달성.',
  },
];

export default function App() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'project' | 'skill' | 'timeline'>('project');
  const [editData, setEditData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [skills, setSkills] = useState(defaultSkills);
  const [projects, setProjects] = useState(defaultProjects);
  const [timeline, setTimeline] = useState(defaultTimeline);

  // ─── 앱 초기화: JWT 토큰으로 로그인 상태 복원 ───────────
  useEffect(() => {
    if (tokenStorage.isLoggedIn()) {
      const user = tokenStorage.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUsername(user.username);
        loadUserData(user.username);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadUserData = (user: string) => {
    const userData = localStorage.getItem(`portfolio_data_${user}`);
    if (userData) {
      const data = JSON.parse(userData);
      setSkills(data.skills || defaultSkills);
      setProjects(data.projects || defaultProjects);
      setTimeline(data.timeline || defaultTimeline);
    }
  };

  const saveUserData = () => {
    if (username) {
      const data = { skills, projects, timeline };
      localStorage.setItem(`portfolio_data_${username}`, JSON.stringify(data));
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      saveUserData();
    }
  }, [skills, projects, timeline]);

  // ─── 로그인 성공 콜백 (AuthModal → App) ───────────────
  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    loadUserData(user);
  };

  // ─── 로그아웃: JWT 토큰 제거 ──────────────────────────
  const handleLogout = () => {
    logout();                     // tokenStorage.clear() 호출
    setIsLoggedIn(false);
    setUsername('');
    setSkills(defaultSkills);
    setProjects(defaultProjects);
    setTimeline(defaultTimeline);
  };

  const handleEdit = (type: 'project' | 'skill' | 'timeline', data?: any) => {
    setEditType(type);
    setEditData(data);
    setShowEditModal(true);
  };

  const handleSave = (data: any) => {
    if (editType === 'project') {
      if (editData) {
        setProjects(projects.map(p => p.id === editData.id ? { ...data, id: editData.id } : p));
      } else {
        setProjects([...projects, { ...data, id: Date.now() }]);
      }
    } else if (editType === 'skill') {
      if (editData) {
        setSkills(skills.map(s => s.name === editData.name ? { ...s, ...data } : s));
      } else {
        setSkills([...skills, { ...data, icon: Code2 }]);
      }
    } else if (editType === 'timeline') {
      if (editData) {
        setTimeline(timeline.map((t, i) => timeline.indexOf(editData) === i ? { ...t, ...data } : t));
      } else {
        setTimeline([...timeline, { ...data, icon: Award }]);
      }
    }
  };

  const handleDelete = (type: 'project' | 'skill' | 'timeline', item: any) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    if (type === 'project') {
      setProjects(projects.filter(p => p.id !== item.id));
    } else if (type === 'skill') {
      setSkills(skills.filter(s => s.name !== item.name));
    } else if (type === 'timeline') {
      setTimeline(timeline.filter(t => t !== item));
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor: isDarkMode ? '#0f172a' : '#f0f9ff',
        }}
      />

      {/* Top Controls */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-colors"
        >
          {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
        </button>
      </div>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {isLoggedIn ? (
          <>
            <span className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium">
              {username}
            </span>
            <button
              onClick={handleLogout}
              className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium"
          >
            로그인
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              풀스택 개발자
            </h1>
            <p className="text-xl text-gray-800 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
              열정적으로 웹과 모바일 애플리케이션을 만들고 있습니다.
              사용자 경험과 코드 품질에 집중합니다.
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-800 dark:text-gray-200 rounded-full hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors border border-gray-200 dark:border-gray-700 shadow-lg">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-500/60 backdrop-blur-sm text-white rounded-full hover:bg-blue-500/80 transition-colors border border-blue-300 shadow-lg">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:your@email.com" className="p-3 bg-purple-500/60 backdrop-blur-sm text-white rounded-full hover:bg-purple-500/80 transition-colors border border-purple-300 shadow-lg">
                <Mail className="w-6 h-6" />
              </a>
            </div>
            <a 
              href="https://github.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
            >
              github.com/yourusername
            </a>
          </motion.div>
        </section>

        {/* Tips Section */}
        <TipsSection />

        {/* Timeline Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="flex justify-between items-center mb-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              경력 및 수상 내역
            </motion.h2>
            {isLoggedIn && (
              <button
                onClick={() => handleEdit('timeline')}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-12">
            각 항목을 클릭하면 관련 서류를 확인하고 등록할 수 있습니다
          </p>
          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="relative group">
                <TimelineItem
                  icon={item.icon}
                  title={item.title}
                  organization={item.organization}
                  date={item.date}
                  description={item.description}
                  index={index}
                  onClick={() => setSelectedTimeline(item)}
                />
                {isLoggedIn && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit('timeline', item);
                      }}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="flex justify-between items-center mb-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              기술 스택
            </motion.h2>
            {isLoggedIn && (
              <button
                onClick={() => handleEdit('skill')}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-12">
            각 카드를 클릭하면 상세 능력을 확인할 수 있습니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <div key={skill.name} className="relative group">
                <SkillCard
                  icon={skill.icon}
                  name={skill.name}
                  level={skill.level}
                  index={index}
                  onClick={() => setSelectedSkill(skill)}
                />
                {isLoggedIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit('skill', skill);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="flex justify-between items-center mb-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              프로젝트
            </motion.h2>
            {isLoggedIn && (
              <button
                onClick={() => handleEdit('project')}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={project.id} className="relative group">
                <ProjectCard
                  project={project}
                  onClick={() => setSelectedProject(project)}
                  index={index}
                />
                {isLoggedIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit('project', project);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">© 2026 Portfolio. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isLoggedIn={isLoggedIn}
          onEdit={() => {
            handleEdit('project', selectedProject);
            setSelectedProject(null);
          }}
          onDelete={() => {
            handleDelete('project', selectedProject);
            setSelectedProject(null);
          }}
        />
      )}

      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          isLoggedIn={isLoggedIn}
          onEdit={() => {
            handleEdit('skill', selectedSkill);
            setSelectedSkill(null);
          }}
        />
      )}

      {selectedTimeline && (
        <TimelineModal
          item={selectedTimeline}
          onClose={() => setSelectedTimeline(null)}
        />
      )}

      {showEditModal && (
        <EditModal
          type={editType}
          data={editData}
          onClose={() => {
            setShowEditModal(false);
            setEditData(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}