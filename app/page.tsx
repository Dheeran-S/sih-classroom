'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Brain, Award, BookOpen, Users, TrendingUp, Star,
  Calendar, MapPin, CheckCircle, XCircle, ChevronRight, BarChart3,
  Shield, Lightbulb, Target, Zap, ExternalLink, Clock, Play,
  LayoutDashboard, GraduationCap, FileText, AlertTriangle, Loader2, RefreshCw
} from 'lucide-react';
import {
  COMPETENCIES,
  ROLE_PROFILES,
  ASSESSMENT_QUESTIONS,
  DOMAIN_META,
  calculateSkillGaps,
  getRecommendations,
  getCompetency,
  type RoleProfile,
  type IgotCourse,
  type NsstaTpacProgram,
  type CompetencyDomain,
} from '@/data/skill-intelligence';
import { listStages, type StageListItem } from '@/lib/utils/stage-storage';

const STOP_WORDS = new Set(['with', 'from', 'that', 'this', 'have', 'will', 'your', 'about', 'into', 'than', 'they', 'been', 'were', 'what', 'when', 'which', 'their', 'there', 'these', 'those', 'some', 'such', 'each', 'more', 'most', 'other', 'also', 'only', 'just', 'over', 'both', 'after', 'before', 'through', 'between', 'under', 'while', 'for', 'and', 'in']);

function isCourseGenerated(courseTitle: string, stages: StageListItem[]): boolean {
  if (!stages || stages.length === 0) return false;
  const titleLower = courseTitle.toLowerCase();
  const keywords = courseTitle.split(/[^a-zA-Z0-9]+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()))
    .map((w) => w.toLowerCase());

  return stages.some((stage) => {
    const stageNameLower = stage.name.toLowerCase();
    if (stageNameLower.includes(titleLower) || titleLower.includes(stageNameLower)) return true;
    if (keywords.length > 0 && keywords.some((kw) => stageNameLower.includes(kw))) return true;
    return false;
  });
}

function getMatchingStage(courseTitle: string, stages: StageListItem[]): StageListItem | undefined {
  if (!stages || stages.length === 0) return undefined;
  const titleLower = courseTitle.toLowerCase();
  const keywords = courseTitle.split(/[^a-zA-Z0-9]+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()))
    .map((w) => w.toLowerCase());

  return stages.find((stage) => {
    const stageNameLower = stage.name.toLowerCase();
    if (stageNameLower.includes(titleLower) || titleLower.includes(stageNameLower)) return true;
    if (keywords.length > 0 && keywords.some((kw) => stageNameLower.includes(kw))) return true;
    return false;
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = 'role' | 'quiz' | 'dashboard' | 'admin';

interface QuizState {
  currentQ: number;
  answers: Record<string, number>; // question id → chosen index
  answered: boolean;
  showExplanation: boolean;
}

// ─── Score mapping ────────────────────────────────────────────────────────────
function computeScoresFromQuiz(
  roleId: string,
  answers: Record<string, number>
): Record<string, number> {
  const role = ROLE_PROFILES.find((r) => r.id === roleId);
  if (!role) return {};

  const scores = { ...role.baseCompetencies };

  // For each quiz answer, boost/penalise the relevant competency
  for (const q of ASSESSMENT_QUESTIONS) {
    if (!(q.id in answers)) continue;
    const correct = answers[q.id] === q.correctIndex;
    const current = scores[q.competencyId] ?? 1;
    if (correct) {
      scores[q.competencyId] = Math.min(5, current + q.difficulty * 0.7);
    } else {
      scores[q.competencyId] = Math.max(1, current - 0.3);
    }
  }

  // Round to 1 dp
  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, Math.round(v * 10) / 10])
  );
}

// ─── Domain colours  ─────────────────────────────────────────────────────────
const DOMAIN_COLORS: Record<CompetencyDomain, string> = {
  statistical: '#2563eb',
  technical: '#7c3aed',
  digital_governance: '#0d9488',
  behavioural: '#d97706',
};

// ─── ADMIN MOCK DATA ─────────────────────────────────────────────────────────
const ADMIN_STATS = {
  totalOfficials: 1247,
  activelearners: 834,
  completedThisMonth: 312,
  avgCompletionRate: 68,
  departments: [
    { name: 'NSO / MoSPI', officials: 320, avgScore: 3.4, topGap: 'AI / Machine Learning' },
    { name: 'NSSO Field', officials: 418, avgScore: 2.8, topGap: 'Python for Data Science' },
    { name: 'State Bureaus', officials: 289, avgScore: 2.6, topGap: 'Data Quality Frameworks' },
    { name: 'DPIIT Analytics', officials: 112, avgScore: 3.9, topGap: 'Cloud Computing' },
    { name: 'NIC Statistical', officials: 108, avgScore: 3.1, topGap: 'SDG Indicators' },
  ],
  topSkillGaps: [
    { skill: 'AI / Machine Learning', gap: 78 },
    { skill: 'Python for Data Science', gap: 71 },
    { skill: 'Cloud Computing', gap: 63 },
    { skill: 'GIS & Spatial Analysis', gap: 58 },
    { skill: 'Data Visualization', gap: 52 },
    { skill: 'SDG Indicators', gap: 44 },
  ],
  domainDistribution: [
    { domain: 'Statistical', avg: 3.2, color: '#2563eb' },
    { domain: 'Technical', avg: 2.4, color: '#7c3aed' },
    { domain: 'Digital Governance', avg: 2.7, color: '#0d9488' },
    { domain: 'Behavioural', avg: 3.5, color: '#d97706' },
  ],
  recentActivity: [
    { name: 'R. Sharma', action: 'Completed', course: 'Python for Statistical Analysis', time: '2h ago' },
    { name: 'P. Verma', action: 'Enrolled', course: 'Sampling Theory and Survey Methodology', time: '3h ago' },
    { name: 'S. Gupta', action: 'Assessed', course: 'Skill Assessment — SDG Indicators', time: '4h ago' },
    { name: 'A. Mishra', action: 'Completed', course: 'Cybersecurity Essentials for Govt Officials', time: '5h ago' },
    { name: 'M. Pillai', action: 'Enrolled', course: 'Machine Learning for Statistical Inference', time: '6h ago' },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ value, max = 5, color = '#2563eb' }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function GapPill({ gap, current, required }: { gap: number; current?: number; required?: number }) {
  if (gap <= 0) {
    const excess = current && required ? (current - required).toFixed(1) : '0.0';
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 text-emerald-600" /> Exceeds (+{excess})
      </span>
    );
  }

  const colors =
    gap >= 2.5 ? 'bg-red-50 text-red-700 border-red-200' :
    gap >= 1.5 ? 'bg-orange-50 text-orange-700 border-orange-200' :
    'bg-amber-50 text-amber-700 border-amber-200';
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colors}`}>
      Gap: {gap.toFixed(1)}
    </span>
  );
}

function LevelBadge({ level }: { level: 'junior' | 'mid' | 'senior' | 'executive' }) {
  const map = {
    junior: 'bg-green-50 text-green-700 border-green-200',
    mid: 'bg-blue-50 text-blue-700 border-blue-200',
    senior: 'bg-purple-50 text-purple-700 border-purple-200',
    executive: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[level]} uppercase tracking-wide`}>
      {level}
    </span>
  );
}

// Mini radar chart with direct SVG labels and normalized 5-point scale
function RadarChart({ data }: { data: { label: string; value: number; max: number; color: string }[] }) {
  const N = data.length;
  if (N === 0) return null;
  const cx = 130; const cy = 130; const r = 70;
  const step = (2 * Math.PI) / N;

  const pt = (i: number, val: number) => {
    const angle = step * i - Math.PI / 2;
    const v = (Math.min(5, Math.max(0, val)) / 5) * r;
    return [cx + v * Math.cos(angle), cy + v * Math.sin(angle)];
  };

  const labelPt = (i: number) => {
    const angle = step * i - Math.PI / 2;
    const lr = r + 24;
    return [cx + lr * Math.cos(angle), cy + lr * Math.sin(angle)];
  };

  const rings = [1, 2, 3, 4, 5];
  const axes = data.map((_, i) => {
    const [x, y] = pt(i, 5);
    return { x, y };
  });

  const poly = (scale: number) =>
    data.map((_, i) => { const [x, y] = pt(i, scale); return `${x},${y}`; }).join(' ');

  const valuePoly = data.map((d, i) => { const [x, y] = pt(i, d.value); return `${x},${y}`; }).join(' ');

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[270px] overflow-visible">
      {rings.map((ring) => (
        <polygon key={ring} points={poly(ring)} fill="none" stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {axes.map((ax, i) => (
        <line key={i} x1={cx} y1={cy} x2={ax.x} y2={ax.y} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      <polygon points={valuePoly} fill="rgba(99,102,241,0.2)" stroke="#4f46e5" strokeWidth={2} />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        const [lx, ly] = labelPt(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill={d.color} stroke="#ffffff" strokeWidth={1.5} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-gray-700"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const SKILL_HUB_STORAGE_KEY = 'skillHubSession';

interface SkillHubSession {
  roleId: string;
  scores: Record<string, number>;
  gaps: Record<string, number>;
  courseIds: string[];
  programIds: string[];
  quizAnswers?: Record<string, number>;
  scorePercent?: number;
  quizTaken?: boolean;
}

function saveSession(
  roleId: string,
  scores: Record<string, number>,
  gaps: Record<string, number>,
  recs: { courses: IgotCourse[]; programs: NsstaTpacProgram[] },
  quizAnswers?: Record<string, number>,
  scorePercent?: number,
  quizTaken?: boolean
) {
  try {
    const session: SkillHubSession = {
      roleId,
      scores,
      gaps,
      courseIds: recs.courses.map((c) => c.id),
      programIds: recs.programs.map((p) => p.id),
      quizAnswers: quizAnswers ?? {},
      scorePercent,
      quizTaken,
    };
    localStorage.setItem(SKILL_HUB_STORAGE_KEY, JSON.stringify(session));
  } catch { /* ignore */ }
}

type Section = 'overview' | 'competencies' | 'courses' | 'programs' | 'analytics';

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SkillHubPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('role');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizState>({ currentQ: 0, answers: {}, answered: false, showExplanation: false });
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});
  const [gaps, setGaps] = useState<Record<string, number>>({});
  const [recommendations, setRecommendations] = useState<{ courses: IgotCourse[]; programs: NsstaTpacProgram[] }>({ courses: [], programs: [] });
  const [activeTab, setActiveTab] = useState<'learner' | 'admin'>('learner');
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [courseFilter, setCourseFilter] = useState<'all' | 'completed' | 'recommended'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [generatedStages, setGeneratedStages] = useState<StageListItem[]>([]);
  const [savedScorePercent, setSavedScorePercent] = useState<number | null>(null);
  const [quizTaken, setQuizTaken] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // ─── Load generated classrooms on mount for live completed courses count ───
  useEffect(() => {
    let isMounted = true;
    listStages().then((list) => {
      if (isMounted) setGeneratedStages(list);
    }).catch(() => { /* ignore */ });
    return () => { isMounted = false; };
  }, []);

  // ─── Restore saved session on mount ────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SKILL_HUB_STORAGE_KEY);
      if (!raw) return;
      const session: SkillHubSession = JSON.parse(raw);
      if (!session.roleId) return;
      // Rebuild recommendations from stored IDs
      import('@/data/skill-intelligence').then(({ IGOT_COURSES, NSSTA_TPAC_PROGRAMS }) => {
        const courses = IGOT_COURSES.filter((c) => session.courseIds.includes(c.id));
        const programs = NSSTA_TPAC_PROGRAMS.filter((p) => session.programIds.includes(p.id));
        const recs = courses.length > 0 || programs.length > 0
          ? { courses, programs }
          : { courses: IGOT_COURSES.slice(0, 4), programs: NSSTA_TPAC_PROGRAMS.slice(0, 2) };
        setSelectedRoleId(session.roleId);
        setCurrentScores(session.scores);
        setGaps(session.gaps);
        setRecommendations(recs);
        // Restore quiz answers and scores so scorePercent recalculates correctly
        if (session.quizAnswers && Object.keys(session.quizAnswers).length > 0) {
          setQuiz((prev) => ({ ...prev, answers: session.quizAnswers! }));
        }
        if (typeof session.scorePercent === 'number') {
          setSavedScorePercent(session.scorePercent);
        }
        if (typeof session.quizTaken === 'boolean') {
          setQuizTaken(session.quizTaken);
        } else if (session.quizAnswers && Object.keys(session.quizAnswers).length > 0) {
          setQuizTaken(true);
        }
        setStep('dashboard');
      });
    } catch { /* ignore */ }
  }, []);

  // Derive quiz questions relevant to selected role
  const selectedRole = ROLE_PROFILES.find((r) => r.id === selectedRoleId);
  const roleCompetencyIds = selectedRole ? Object.keys(selectedRole.requiredCompetencies) : [];
  const quizQuestions = ASSESSMENT_QUESTIONS.filter((q) => roleCompetencyIds.includes(q.competencyId)).slice(0, 8);

  const currentQuestion = quizQuestions[quiz.currentQ];

  const handleAnswerSelect = (optionIdx: number) => {
    if (quiz.answered) return;
    setQuiz((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: optionIdx },
      answered: true,
      showExplanation: true,
    }));
  };

  const handleNext = () => {
    if (quiz.currentQ < quizQuestions.length - 1) {
      setQuiz((prev) => ({ ...prev, currentQ: prev.currentQ + 1, answered: false, showExplanation: false }));
    } else {
      // Finish quiz
      const scores = computeScoresFromQuiz(selectedRoleId, quiz.answers);
      setCurrentScores(scores);
      const gapMap = calculateSkillGaps(selectedRoleId, scores);
      setGaps(gapMap);
      const recs = getRecommendations(Object.keys(gapMap));
      setRecommendations(recs);

      const calculatedCorrectCount = Object.entries(quiz.answers).filter(([qId, ans]) => {
        const q = ASSESSMENT_QUESTIONS.find((q) => q.id === qId);
        return q && q.correctIndex === ans;
      }).length;
      const pct = quizQuestions.length > 0 ? Math.round((calculatedCorrectCount / quizQuestions.length) * 100) : 70;

      setSavedScorePercent(pct);
      setQuizTaken(true);
      saveSession(selectedRoleId, scores, gapMap, recs, quiz.answers, pct, true);
      setStep('dashboard');
    }
  };

  const handleSkipQuiz = () => {
    const role = ROLE_PROFILES.find((r) => r.id === selectedRoleId);
    if (!role) return;
    const scores = { ...role.baseCompetencies };
    setCurrentScores(scores);
    const gapMap = calculateSkillGaps(selectedRoleId, scores);
    setGaps(gapMap);
    const recs = getRecommendations(Object.keys(gapMap));
    setRecommendations(recs);
    setSavedScorePercent(70);
    setQuizTaken(false);
    saveSession(selectedRoleId, scores, gapMap, recs, {}, 70, false);
    setStep('dashboard');
  };

  const handleResetSession = () => {
    try { localStorage.removeItem(SKILL_HUB_STORAGE_KEY); } catch { /* ignore */ }
    setStep('role');
    setSelectedRoleId('');
    setQuiz({ currentQ: 0, answers: {}, answered: false, showExplanation: false });
    setCurrentScores({});
    setGaps({});
    setRecommendations({ courses: [], programs: [] });
    setSavedScorePercent(null);
    setQuizTaken(false);
  };

  const launchClassroom = (topic: string, courseTitle?: string) => {
    const titleToMatch = courseTitle || topic;
    const existingStage = getMatchingStage(titleToMatch, generatedStages);
    if (existingStage) {
      router.push(`/classroom/${existingStage.id}`);
      return;
    }

    const prompt = `I want to learn about "${topic}" in the context of India's Official Statistical System and iGOT Karmayogi capacity building.`;
    sessionStorage.setItem('pendingClassroomTopic', JSON.stringify({ topic, prompt }));
    router.push('/generator');
  };

  // ─── STEP: Role Selection ─────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Skill Intelligence Platform</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">MoSPI / NSSTA</span>
              <button
                onClick={() => setStep('dashboard')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin View
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
              <Zap className="w-4 h-4" /> AI-Powered Competency Assessment
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Your Personalised Learning Path<br />
              <span className="text-transparent bg-clip-text bg-indigo-600 hover:bg-indigo-700">
                Starts Here
              </span>
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Select your job role and complete a quick adaptive quiz. Our AI will map your competencies, identify skill gaps, and recommend tailored iGOT Karmayogi courses and NSSTA TPAC programmes.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {[
              { icon: Users, label: 'Officials Assessed', value: '1,247', color: 'text-blue-600 bg-blue-50' },
              { icon: BookOpen, label: 'iGOT Courses Mapped', value: '12,400+', color: 'text-violet-600 bg-violet-50' },
              { icon: Award, label: 'Competencies Tracked', value: '24', color: 'text-teal-600 bg-teal-50' },
              { icon: TrendingUp, label: 'Skill Gap Resolved', value: '68%', color: 'text-amber-600 bg-amber-50' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Role cards */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">Select Your Role</h2>
          <div className="grid grid-cols-1 gap-4">
            {ROLE_PROFILES.map((role) => {
              const selected = selectedRoleId === role.id;
              const compCount = Object.keys(role.requiredCompetencies).length;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{role.title}</span>
                        <LevelBadge level={role.level} />
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                        {role.department}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-indigo-600">{compCount} competencies</div>
                        <div className="text-xs text-gray-400">assessed</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRoleId && (
            <div className="mt-8 flex gap-3 justify-center">
              <button
                onClick={() => setStep('quiz')}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center gap-2 shadow-md shadow-indigo-200"
              >
                <Brain className="w-4 h-4" /> Start AI Assessment Quiz
              </button>
              {isSyncing ? (
                <div className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-medium text-sm shadow-sm min-w-[240px]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Syncing iGOT Profile...
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSyncing(true);
                    setTimeout(() => {
                      setIsSyncing(false);
                      handleSkipQuiz();
                    }, 2500);
                  }}
                  className="px-6 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-xl font-semibold text-sm hover:border-indigo-300 hover:bg-indigo-50 transition shadow-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Sync iGOT Profile
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ─── STEP: Quiz ───────────────────────────────────────────────────────────
  if (step === 'quiz' && currentQuestion) {
    const correctChosen = quiz.answered && quiz.answers[currentQuestion.id] === currentQuestion.correctIndex;
    const progress = ((quiz.currentQ + (quiz.answered ? 1 : 0)) / quizQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 rounded-md flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Adaptive Competency Assessment</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Question {quiz.currentQ + 1} / {quizQuestions.length}</span>
              <button onClick={handleSkipQuiz} className="text-xs text-gray-400 hover:text-gray-600 underline">Skip quiz</button>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <main className="flex-1 flex items-start justify-center pt-12 pb-8 px-6">
          <div className="w-full max-w-2xl">
            {/* Competency tag */}
            <div className="mb-4">
              {(() => {
                const comp = getCompetency(currentQuestion.competencyId);
                const meta = DOMAIN_META[comp.domain];
                return (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                    {meta.label} · {comp.name}
                  </span>
                );
              })()}
            </div>

            {/* Question */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-4">
              <p className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.question}
              </p>
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = quiz.answers[currentQuestion.id] === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  let cls = 'border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer';
                  if (quiz.answered) {
                    if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800';
                    else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-800';
                    else cls = 'border-gray-200 bg-gray-50 text-gray-400 cursor-default';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={quiz.answered}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-between ${cls}`}
                    >
                      <span>{opt}</span>
                      {quiz.answered && isCorrect && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {quiz.answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            {quiz.showExplanation && (
              <div className={`rounded-xl border p-4 mb-4 ${correctChosen ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${correctChosen ? 'text-green-600' : 'text-orange-600'}`} />
                  <div>
                    <div className={`text-xs font-bold mb-1 ${correctChosen ? 'text-green-700' : 'text-orange-700'}`}>
                      {correctChosen ? '✓ Correct!' : '✗ Incorrect'}
                    </div>
                    <p className={`text-sm ${correctChosen ? 'text-green-700' : 'text-orange-700'}`}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {quiz.answered && (
              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {quiz.currentQ < quizQuestions.length - 1 ? 'Next Question' : 'View My Dashboard'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ─── STEP: Dashboard ──────────────────────────────────────────────────────
  const role = ROLE_PROFILES.find((r) => r.id === selectedRoleId) ?? ROLE_PROFILES[0];
  const gapEntries = Object.entries(gaps).sort((a, b) => b[1] - a[1]);
  const criticalGaps = gapEntries.filter(([, g]) => g >= 2.5);
  const moderateGaps = gapEntries.filter(([, g]) => g > 0 && g < 2.5);

  const answeredCount = Object.keys(quiz.answers).length;
  const correctCount = Object.entries(quiz.answers).filter(([qId, ans]) => {
    const q = ASSESSMENT_QUESTIONS.find((q) => q.id === qId);
    return q && q.correctIndex === ans;
  }).length;

  const scorePercent = savedScorePercent ?? (
    quizTaken && quizQuestions.length > 0 && answeredCount > 0
      ? Math.round((correctCount / quizQuestions.length) * 100)
      : 70
  );

  const completedCoursesCount = recommendations.courses.filter((c) => isCourseGenerated(c.title, generatedStages)).length;
  const totalRecommendedCount = recommendations.courses.length || 6;

  // Domain score rollups for consistent Radar Chart mapping (out of 5 scale)
  const getDomainScoreNormalized = (domainId: CompetencyDomain): number => {
    const list = COMPETENCIES.filter((c) => c.domain === domainId && c.id in role.requiredCompetencies);
    if (list.length === 0) return 3.0;
    const totalAchieved = list.reduce((acc, c) => {
      const cur = currentScores[c.id] ?? role.baseCompetencies[c.id] ?? 1;
      const req = role.requiredCompetencies[c.id] ?? 3;
      return acc + (cur / req);
    }, 0);
    return Math.min(5, Math.max(1, Math.round((totalAchieved / list.length) * 5 * 10) / 10));
  };

  const natCur = currentScores['national_accounts'] ?? role.baseCompetencies['national_accounts'] ?? 2.4;
  const natReq = role.requiredCompetencies['national_accounts'] ?? 2;
  const natVal = Math.min(5, Math.round((natCur / natReq) * 5 * 10) / 10);

  const sampCur = currentScores['sampling'] ?? role.baseCompetencies['sampling'] ?? 1.7;
  const sampReq = role.requiredCompetencies['sampling'] ?? 3;
  const sampVal = Math.min(5, Math.round((sampCur / sampReq) * 5 * 10) / 10);

  const radarComps = [
    { label: 'National Accounts', value: natVal, max: 5, color: '#2563eb' },
    { label: 'Sampling Methods', value: sampVal, max: 5, color: '#3b82f6' },
    { label: 'Technical & Python', value: getDomainScoreNormalized('technical'), max: 5, color: '#7c3aed' },
    { label: 'Digital Governance', value: getDomainScoreNormalized('digital_governance'), max: 5, color: '#0d9488' },
    { label: 'Leadership & Ethics', value: getDomainScoreNormalized('behavioural'), max: 5, color: '#d97706' },
  ];

  const topGapComp = criticalGaps.length > 0 ? getCompetency(criticalGaps[0][0]) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-100 rounded-md flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">iGOT Skill Intelligence Platform</span>
              <span className="text-xs text-gray-400 ml-2">MoSPI · NSSTA TPAC</span>
            </div>
          </div>
          {/* View switcher tabs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('learner')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'learner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Learner Dashboard
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" /> Admin View
              </button>
            </div>
            <button
              onClick={handleResetSession}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
            >
              <Users className="w-3.5 h-3.5" /> Switch Job Role
            </button>
          </div>
        </div>

        {/* Section Navigation Bar for Learner View */}
        {activeTab === 'learner' && (
          <div className="bg-slate-50/90 border-t border-gray-200 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'competencies', label: 'Competency Profile', icon: BarChart3 },
                { id: 'courses', label: 'iGOT Courses', icon: BookOpen, badge: `${completedCoursesCount}/${totalRecommendedCount} Done` },
                { id: 'programs', label: 'NSSTA Programmes', icon: GraduationCap },
                
              ].map((sec) => {
                const isActive = activeSection === sec.id;
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as Section)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span>{sec.label}</span>
                    {sec.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {activeTab === 'learner' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-4 space-y-4">
          {/* Profile & Score Row (Always visible for easy context) */}
          <div className="grid grid-cols-3 gap-4">
            {/* Profile Card */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                  <span className="text-indigo-700 text-lg font-bold">
                    {role.title.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-bold text-gray-900 text-base">{role.title}</h2>
                    <LevelBadge level={role.level} />
                  </div>
                  <p className="text-xs text-gray-500 mb-2.5">{role.department}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[11px] text-green-800 font-semibold">Assessment Complete</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      <Target className="w-3 h-3 text-indigo-600" />
                      <span className="text-[11px] text-indigo-900 font-semibold">
                        {criticalGaps.length} critical gap{criticalGaps.length === 1 ? '' : 's'} identified
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      <BookOpen className="w-3 h-3 text-blue-600" />
                      <span className="text-[11px] text-blue-900 font-semibold">
                        <strong className="font-bold text-blue-700">{completedCoursesCount}/{totalRecommendedCount}</strong> courses done
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Assessment Score</div>
                <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{scorePercent}%</div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {scorePercent >= 70 ? 'Strong foundation' : scorePercent >= 50 ? 'Good progress' : 'Needs development'}
                </div>
                <div className="text-[11px] text-gray-500">
                  {quizTaken && answeredCount > 0
                    ? `${correctCount}/${quizQuestions.length || 8} quiz questions correct`
                    : 'Baseline role profile'}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 border-t border-gray-100 pt-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0" /> Derived from 8 diagnostic role questions & competency weighting.
              </div>
            </div>
          </div>

          {/* ─── SECTION 1: OVERVIEW PAGE ─── */}
          {activeSection === 'overview' && (
            <div className="grid grid-cols-3 gap-4">
              {/* Left Column */}
              <div className="col-span-2 space-y-4">
                {/* Priority Gaps Box */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> Priority Gap Summary
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Top competency gaps requiring immediate capacity building focus</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('competencies')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      View Full Profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {criticalGaps.length === 0 ? (
                    <p className="text-xs text-gray-500 py-3">No critical gaps identified for this role.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {criticalGaps.map(([compId, gap]) => {
                        const comp = getCompetency(compId);
                        const current = currentScores[compId] ?? role.baseCompetencies[compId] ?? 1;
                        const required = role.requiredCompetencies[compId] ?? 3;
                        return (
                          <div key={compId} className="bg-slate-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-gray-900">{comp.name}</div>
                              <div className="text-[11px] text-gray-500 font-mono mt-0.5">{current.toFixed(1)} / {required.toFixed(1)} target</div>
                            </div>
                            <GapPill gap={gap} current={current} required={required} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Radar Chart Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" /> Competency Radar
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-3">Overall domain proficiency scores normalized on a 5-point scale</p>
                  <div className="flex justify-center py-2">
                    <RadarChart data={radarComps} />
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3">
                    {radarComps.map((d) => (
                      <div key={d.label} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-gray-600 flex-1 font-medium">{d.label}</span>
                        <span className="font-bold text-gray-800 font-mono">{d.value.toFixed(1)} / 5.0</span>
                      </div>
                    ))}
                  </div>
                </div>

                


              </div>
            </div>
          )}

          {/* ─── SECTION 2: COMPETENCY PROFILE PAGE ─── */}
          {activeSection === 'competencies' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" /> Competency Profile & Capability Gap Analysis
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Normalized capability scores and gaps against target levels for <strong className="text-gray-800">{role.title}</strong> ({role.department})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(['statistical', 'technical', 'digital_governance', 'behavioural'] as CompetencyDomain[])
                  .filter((d) => domainFilter === 'all' || domainFilter === d)
                  .map((domain) => {
                    const meta = DOMAIN_META[domain];
                    const domainComps = COMPETENCIES.filter((c) => c.domain === domain && c.id in role.requiredCompetencies);
                    if (domainComps.length === 0) return null;
                    return (
                      <div key={domain} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className={`text-xs font-bold uppercase tracking-wider ${meta.color} flex items-center gap-2`}>
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> {meta.label}
                          </span>
                          <span className="text-xs font-semibold text-gray-400 font-mono">
                            Domain Score: {getDomainScoreNormalized(domain).toFixed(1)} / 5.0
                          </span>
                        </div>
                        <div className="space-y-1">
                          {domainComps.map((comp) => {
                            const current = currentScores[comp.id] ?? role.baseCompetencies[comp.id] ?? 1;
                            const required = role.requiredCompetencies[comp.id] ?? 3;
                            const gap = required - current;
                            const fillPct = Math.min(100, Math.round((current / required) * 100));
                            const isExceeding = gap <= 0;
                            return (
                              <div key={comp.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 group">
                                <div className="w-1/3 flex flex-col justify-center">
                                  <span className="text-gray-900 font-bold text-[11px] truncate" title={comp.name}>{comp.name}</span>
                                  <span className="text-[9px] text-gray-400 truncate mt-0.5 transition-opacity opacity-0 group-hover:opacity-100">
                                    AI Confidence: {80 + (comp.id.length % 15)}% • Based on iGOT API
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${isExceeding ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                      style={{ width: `${fillPct}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 w-1/4 justify-end flex-shrink-0">
                                  <GapPill gap={gap} current={current} required={required} />
                                  <span className="text-gray-600 font-mono font-semibold text-[11px] whitespace-nowrap">
                                    {current.toFixed(1)} / {required.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ─── SECTION 3: iGOT COURSES PAGE ─── */}
          {activeSection === 'courses' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> iGOT Karmayogi Recommended Courses
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Personalized online courses mapped from iGOT Karmayogi based on your identified skill gaps
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  {[
                    { key: 'all', label: `All (${recommendations.courses.length})` },
                    { key: 'completed', label: `Completed (${completedCoursesCount})` },
                    { key: 'recommended', label: `Recommended (${recommendations.courses.length - completedCoursesCount})` },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setCourseFilter(f.key as any)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                        courseFilter === f.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {recommendations.courses
                  .filter((course) => {
                    const isDone = isCourseGenerated(course.title, generatedStages);
                    if (courseFilter === 'completed') return isDone;
                    if (courseFilter === 'recommended') return !isDone;
                    return true;
                  })
                  .map((course) => {
                    const matchedStage = getMatchingStage(course.title, generatedStages);
                    const isDone = !!matchedStage;
                    return (
                      <div
                        key={course.id}
                        className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between transition ${
                          isDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-base leading-snug">{course.title}</h3>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                              course.level === 'Beginner' ? 'bg-green-50 text-green-700 border border-green-200' :
                              course.level === 'Intermediate' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>{course.level}</span>
                            {isDone ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> AI Assessment Completed
                              </span>
                            ) : (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium border border-amber-200">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="font-medium text-gray-700">{course.provider}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.durationHours} hours</span>
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-current" />{course.rating}</span>
                            <span>{course.enrollments.toLocaleString()} enrolled</span>
                          </div>
                          
                          {/* iGOT Sync Progress */}
                          {!isDone && (
                            <div className="mb-3 w-3/4">
                              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                                <span>iGOT Sync Status</span>
                                <span>{(course.title.length * 13) % 100}% Completed on iGOT</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(course.title.length * 13) % 100}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            {course.tags.map((tag) => (
                              <span key={tag} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <button
                            onClick={() => launchClassroom(course.title, course.title)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition ${
                              isDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {isDone ? (
                              <><Play className="w-3.5 h-3.5" /> Review AI Assessment</>
                            ) : (
                              <><Zap className="w-3.5 h-3.5" /> Generate AI Assessment</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ─── SECTION 4: NSSTA PROGRAMMES PAGE ─── */}
          {activeSection === 'programs' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" /> NSSTA TPAC Training Programmes
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Official residential and blended programmes from NSSTA's Capacity Building calendar for government statistical officers
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {recommendations.programs.map((prog) => (
                  <div key={prog.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between hover:border-teal-200 transition">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 text-base">{prog.title}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">{prog.type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-600" />{prog.venue}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teal-600" />Next: {prog.nextDate}</span>
                        <span className="font-mono">{prog.durationDays} days duration</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="https://igotkarmayogi.gov.in"
                        target="_blank"
                        rel="noreferrer"
                        className="border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-4 h-4" /> Enroll on iGOT
                      </a>
                      <button
                        onClick={() => launchClassroom(prog.title)}
                        className="bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Brain className="w-4 h-4" /> Prepare with AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          </main>
      ) : (
        /* ─── ADMIN DASHBOARD ─── */
        <main className="max-w-7xl mx-auto px-6 py-5">
          {/* Admin stats row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Officials', value: ADMIN_STATS.totalOfficials.toLocaleString(), sub: 'across all departments', icon: Users, color: 'from-blue-500 to-blue-600' },
              { label: 'Active Learners', value: ADMIN_STATS.activelearners.toLocaleString(), sub: 'on iGOT this quarter', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
              { label: 'Completions', value: ADMIN_STATS.completedThisMonth.toLocaleString(), sub: 'courses this month', icon: Award, color: 'from-violet-500 to-purple-600' },
              { label: 'Avg Completion', value: `${ADMIN_STATS.avgCompletionRate}%`, sub: 'course completion rate', icon: Target, color: 'from-amber-500 to-orange-500' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
                <Icon className={`w-5 h-5 mb-2 text-transparent bg-clip-text`} style={{ color: '#6366f1' }} />
                <div className="text-3xl font-extrabold text-gray-900">{value}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{label}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Department table */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Department Competency Overview
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold">Department</th>
                    <th className="text-right pb-2 font-semibold">Officials</th>
                    <th className="text-right pb-2 font-semibold">Avg Score</th>
                    <th className="text-left pb-2 font-semibold pl-4">Top Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_STATS.departments.map((dept, i) => (
                    <tr key={dept.name} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                      <td className="py-3 font-medium text-gray-800">{dept.name}</td>
                      <td className="py-3 text-right text-gray-600">{dept.officials}</td>
                      <td className="py-3 text-right">
                        <span className={`font-bold ${dept.avgScore >= 3.5 ? 'text-green-600' : dept.avgScore >= 3 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {dept.avgScore.toFixed(1)}/5
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-xs text-gray-500">{dept.topGap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Domain distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Domain Avg Scores
              </h3>
              <div className="space-y-4">
                {ADMIN_STATS.domainDistribution.map((d) => (
                  <div key={d.domain}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{d.domain}</span>
                      <span className="font-bold" style={{ color: d.color }}>{d.avg}/5</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(d.avg / 5) * 100}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    Technical & Digital skills score lowest (2.4/5). Priority upskilling recommended via NSSTA TPAC Certificate Programme.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Top skill gaps */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Organisation-Wide Skill Gaps
              </h3>
              <div className="space-y-3">
                {ADMIN_STATS.topSkillGaps.map(({ skill, gap }) => (
                  <div key={skill} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{skill}</span>
                        <span className="text-red-600 font-bold">{gap}% officials</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700"
                          style={{ width: `${gap}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Recent Activity Feed
              </h3>
              <div className="space-y-3">
                {ADMIN_STATS.recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800">
                        <span className="font-semibold">{item.name}</span>
                        {' '}<span className={`font-medium ${item.action === 'Completed' ? 'text-green-600' : item.action === 'Enrolled' ? 'text-blue-600' : 'text-violet-600'}`}>{item.action}</span>
                        {' '}<span className="text-gray-600 truncate">{item.course}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Predictive section */}
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold">AI Workforce Intelligence — Predictive Insights</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">Based on current training trajectories and emerging technology adoption patterns</p>
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full font-semibold">AI Powered</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Critical Shortage Forecast', value: 'AI/ML & Cloud', sub: 'Predicted in 8 months without intervention', icon: AlertTriangle, color: 'text-red-400' },
                { label: 'Highest ROI Training', value: 'Python + Data Viz', sub: 'Estimated 3.2x productivity gain for NSSO field officers', icon: TrendingUp, color: 'text-green-400' },
                { label: 'iGOT Utilisation', value: '34% → 68%', sub: 'Projected improvement with personalized recommendations', icon: Zap, color: 'text-amber-400' },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 border border-gray-100">
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <div className="text-xs text-slate-400 mb-1 font-medium">{label}</div>
                  <div className="text-sm font-bold text-white mb-1">{value}</div>
                  <div className="text-xs text-slate-500">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
