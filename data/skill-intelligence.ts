// ─────────────────────────────────────────────────────────────────────────────
// Skill Intelligence Data Layer
// Mock data for competency frameworks, role profiles, iGOT courses, NSSTA TPAC
// ─────────────────────────────────────────────────────────────────────────────

export type CompetencyDomain =
  | 'statistical'
  | 'technical'
  | 'digital_governance'
  | 'behavioural';

export interface Competency {
  id: string;
  name: string;
  domain: CompetencyDomain;
  description: string;
}

export interface RoleProfile {
  id: string;
  title: string;
  department: string;
  level: 'junior' | 'mid' | 'senior' | 'executive';
  requiredCompetencies: Record<string, number>;
  baseCompetencies: Record<string, number>;
}

export interface IgotCourse {
  id: string;
  title: string;
  provider: string;
  durationHours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  competencyIds: string[];
  tags: string[];
  rating: number;
  enrollments: number;
  description: string;
}

export interface NsstaTpacProgram {
  id: string;
  title: string;
  type: 'Workshop' | 'Training' | 'Certification' | 'Seminar';
  durationDays: number;
  competencyIds: string[];
  venue: string;
  nextDate: string;
  description: string;
}

export const COMPETENCIES: Competency[] = [
  { id: 'survey_design', name: 'Survey Design', domain: 'statistical', description: 'Design and planning of large-scale statistical surveys' },
  { id: 'sampling', name: 'Sampling Methods', domain: 'statistical', description: 'Probability and non-probability sampling techniques' },
  { id: 'national_accounts', name: 'National Accounts', domain: 'statistical', description: 'GDP estimation, SNA framework, and national income accounting' },
  { id: 'price_stats', name: 'Price Statistics', domain: 'statistical', description: 'CPI, WPI, and inflation measurement methodologies' },
  { id: 'labour_stats', name: 'Labour Statistics', domain: 'statistical', description: 'Employment, unemployment, and workforce measurement' },
  { id: 'agri_stats', name: 'Agricultural Statistics', domain: 'statistical', description: 'Crop estimation, land use, and agri-census methods' },
  { id: 'sdg_indicators', name: 'SDG Indicators', domain: 'statistical', description: 'Monitoring and reporting of sustainable development goals' },
  { id: 'data_quality', name: 'Data Quality Frameworks', domain: 'statistical', description: 'DQAF, data validation and quality assurance processes' },
  { id: 'python', name: 'Python for Data Science', domain: 'technical', description: 'Python programming for statistical analysis and automation' },
  { id: 'r_lang', name: 'R Statistical Computing', domain: 'technical', description: 'R programming for statistical modeling and visualization' },
  { id: 'sql', name: 'SQL & Databases', domain: 'technical', description: 'Database querying and management for statistical data' },
  { id: 'stata_spss', name: 'Stata / SPSS / SAS', domain: 'technical', description: 'Statistical software packages used in official surveys' },
  { id: 'gis', name: 'GIS & Spatial Analysis', domain: 'technical', description: 'Geographic information systems for census and survey mapping' },
  { id: 'data_viz', name: 'Data Visualization', domain: 'technical', description: 'Creating effective charts, dashboards, and data stories' },
  { id: 'ai_ml', name: 'AI / Machine Learning', domain: 'technical', description: 'Applying ML techniques to statistical problems' },
  { id: 'cloud_computing', name: 'Cloud Computing', domain: 'technical', description: 'Cloud platforms and big data infrastructure for statistics' },
  { id: 'cybersecurity', name: 'Cybersecurity', domain: 'digital_governance', description: 'Information security practices and government data protection' },
  { id: 'data_privacy', name: 'Data Privacy & Protection', domain: 'digital_governance', description: 'Privacy laws, data ethics, and respondent confidentiality' },
  { id: 'digital_infra', name: 'Digital Public Infrastructure', domain: 'digital_governance', description: 'India Stack, GSTN, NIC systems, and e-governance platforms' },
  { id: 'open_data', name: 'Open Data Standards', domain: 'digital_governance', description: 'SDMX, APIs, and open government data dissemination' },
  { id: 'leadership', name: 'Leadership & Governance', domain: 'behavioural', description: 'Strategic leadership and public sector governance skills' },
  { id: 'project_mgmt', name: 'Project Management', domain: 'behavioural', description: 'Planning, execution, and monitoring of statistical projects' },
  { id: 'communication', name: 'Statistical Communication', domain: 'behavioural', description: 'Presenting data insights to policymakers and the public' },
  { id: 'ethics', name: 'Professional Ethics', domain: 'behavioural', description: 'Integrity, objectivity, and statistical ethics' },
];

export const ROLE_PROFILES: RoleProfile[] = [
  {
    id: 'sso_national_accounts',
    title: 'Senior Statistical Officer — National Accounts',
    department: 'MoSPI / National Statistical Office',
    level: 'senior',
    requiredCompetencies: { national_accounts: 5, survey_design: 4, sampling: 4, price_stats: 3, python: 3, r_lang: 3, stata_spss: 4, data_viz: 4, data_quality: 5, sdg_indicators: 3, cybersecurity: 2, data_privacy: 3, leadership: 4, project_mgmt: 4, communication: 4, ethics: 5 },
    baseCompetencies: { national_accounts: 2, survey_design: 2, sampling: 2, price_stats: 1, python: 1, r_lang: 1, stata_spss: 2, data_viz: 2, data_quality: 2, sdg_indicators: 1, cybersecurity: 1, data_privacy: 1, leadership: 1, project_mgmt: 2, communication: 2, ethics: 3 },
  },
  {
    id: 'fo_field_survey',
    title: 'Field Officer — Household Survey Operations',
    department: 'NSSO / State Statistical Bureau',
    level: 'junior',
    requiredCompetencies: { survey_design: 3, sampling: 4, labour_stats: 3, agri_stats: 3, stata_spss: 3, data_quality: 4, gis: 2, data_viz: 2, data_privacy: 3, digital_infra: 2, cybersecurity: 2, communication: 4, ethics: 5, project_mgmt: 2 },
    baseCompetencies: { survey_design: 1, sampling: 2, labour_stats: 1, agri_stats: 1, stata_spss: 1, data_quality: 1, gis: 1, data_viz: 1, data_privacy: 2, digital_infra: 1, cybersecurity: 1, communication: 2, ethics: 2, project_mgmt: 1 },
  },
  {
    id: 'dso_digital_analytics',
    title: 'Data Science Officer — Digital Analytics Cell',
    department: 'MoSPI / DPIIT',
    level: 'mid',
    requiredCompetencies: { python: 5, r_lang: 4, sql: 5, ai_ml: 5, cloud_computing: 4, data_viz: 5, gis: 3, survey_design: 2, national_accounts: 2, sdg_indicators: 3, cybersecurity: 4, data_privacy: 4, open_data: 4, digital_infra: 4, communication: 4, project_mgmt: 3, ethics: 4 },
    baseCompetencies: { python: 2, r_lang: 1, sql: 2, ai_ml: 1, cloud_computing: 1, data_viz: 2, gis: 1, survey_design: 1, national_accounts: 1, sdg_indicators: 1, cybersecurity: 2, data_privacy: 2, open_data: 1, digital_infra: 1, communication: 2, project_mgmt: 2, ethics: 3 },
  },
  {
    id: 'dir_policy_support',
    title: 'Director — Policy Support & Dissemination',
    department: 'MoSPI / Planning Commission Liaison',
    level: 'executive',
    requiredCompetencies: { national_accounts: 4, price_stats: 4, labour_stats: 4, sdg_indicators: 5, data_viz: 5, communication: 5, leadership: 5, project_mgmt: 5, data_quality: 4, ethics: 5, open_data: 4, data_privacy: 3, ai_ml: 3, python: 2, digital_infra: 3 },
    baseCompetencies: { national_accounts: 3, price_stats: 2, labour_stats: 3, sdg_indicators: 2, data_viz: 3, communication: 3, leadership: 2, project_mgmt: 3, data_quality: 2, ethics: 3, open_data: 2, data_privacy: 2, ai_ml: 1, python: 1, digital_infra: 2 },
  },
  {
    id: 'jso_price_stats',
    title: 'Junior Statistical Officer — Price Statistics',
    department: 'DPIIT / Economic Adviser Office',
    level: 'junior',
    requiredCompetencies: { price_stats: 4, national_accounts: 2, sampling: 3, stata_spss: 3, data_quality: 3, data_viz: 3, r_lang: 2, python: 2, cybersecurity: 2, data_privacy: 3, communication: 3, ethics: 4, project_mgmt: 2 },
    baseCompetencies: { price_stats: 1, national_accounts: 1, sampling: 1, stata_spss: 1, data_quality: 1, data_viz: 1, r_lang: 1, python: 1, cybersecurity: 1, data_privacy: 1, communication: 2, ethics: 2, project_mgmt: 1 },
  },
];

export const IGOT_COURSES: IgotCourse[] = [
  { id: 'igot_001', title: 'Foundations of National Accounts Statistics', provider: 'National Statistical Office', durationHours: 20, level: 'Beginner', competencyIds: ['national_accounts', 'survey_design', 'data_quality'], tags: ['GDP', 'SNA', 'National Income'], rating: 4.6, enrollments: 12340, description: 'A comprehensive introduction to System of National Accounts (SNA 2008), GDP estimation, and national income frameworks used in India.' },
  { id: 'igot_002', title: 'Sampling Theory and Survey Methodology', provider: 'Indian Statistical Institute', durationHours: 30, level: 'Intermediate', competencyIds: ['sampling', 'survey_design', 'data_quality'], tags: ['Probability Sampling', 'NSSO', 'Survey Design'], rating: 4.8, enrollments: 8920, description: 'Advanced sampling techniques including stratified, cluster, and systematic sampling as applied in PLFS and HCES surveys.' },
  { id: 'igot_003', title: 'Python for Statistical Analysis', provider: 'MoSPI Learning Hub', durationHours: 40, level: 'Beginner', competencyIds: ['python', 'data_viz', 'ai_ml'], tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib'], rating: 4.5, enrollments: 31200, description: 'Learn Python programming from scratch with focus on statistical analysis, data manipulation using Pandas, and visualization.' },
  { id: 'igot_004', title: 'Data Visualization for Policy Impact', provider: 'iGOT Partner — NITI Aayog', durationHours: 15, level: 'Beginner', competencyIds: ['data_viz', 'communication', 'open_data'], tags: ['Charts', 'Dashboards', 'Tableau', 'Power BI'], rating: 4.7, enrollments: 28100, description: 'Master data storytelling and visualization using Tableau, Power BI, and Python to present statistical findings effectively.' },
  { id: 'igot_005', title: 'SDG Indicators Monitoring Framework', provider: 'UN-India Statistical Partnership', durationHours: 18, level: 'Intermediate', competencyIds: ['sdg_indicators', 'data_quality', 'communication'], tags: ['SDG', 'UN Agenda 2030', 'Indicators'], rating: 4.4, enrollments: 6780, description: "Understand all 17 SDGs, their 232 indicators, India's VNR reporting process, and tools for tracking progress." },
  { id: 'igot_006', title: 'Machine Learning for Statistical Inference', provider: 'IIT Delhi — iGOT Partner', durationHours: 50, level: 'Advanced', competencyIds: ['ai_ml', 'python', 'r_lang', 'data_viz'], tags: ['ML', 'Deep Learning', 'Statistical AI'], rating: 4.9, enrollments: 4560, description: 'Apply machine learning to imputation, nowcasting, anomaly detection, and predictive analytics in official statistics.' },
  { id: 'igot_007', title: 'Cybersecurity Essentials for Govt Officials', provider: 'NIC — National Informatics Centre', durationHours: 12, level: 'Beginner', competencyIds: ['cybersecurity', 'data_privacy', 'digital_infra'], tags: ['Cyber Safety', 'Password Security', 'Phishing'], rating: 4.3, enrollments: 95400, description: 'Mandatory cybersecurity awareness training covering safe internet practices, government data classification, and incident response.' },
  { id: 'igot_008', title: 'GIS Applications in Census & Survey', provider: 'Survey of India / MoSPI', durationHours: 25, level: 'Intermediate', competencyIds: ['gis', 'survey_design', 'agri_stats'], tags: ['QGIS', 'ArcGIS', 'Spatial Statistics', 'Census Maps'], rating: 4.6, enrollments: 5200, description: 'Learn GIS tools for mapping enumeration blocks, spatial analysis of census data, and geographic visualization.' },
  { id: 'igot_009', title: 'Statistical Leadership in the Digital Age', provider: 'LBSNAA — iGOT Partner', durationHours: 16, level: 'Advanced', competencyIds: ['leadership', 'project_mgmt', 'communication', 'ethics'], tags: ['Leadership', 'Strategy', 'Policy'], rating: 4.7, enrollments: 7830, description: 'Executive-level training on leading statistical transformation projects and communicating data for policy impact.' },
  { id: 'igot_010', title: 'Price Indices: CPI & WPI Methodology', provider: 'Office of the Economic Adviser', durationHours: 22, level: 'Intermediate', competencyIds: ['price_stats', 'national_accounts', 'data_quality'], tags: ['CPI', 'WPI', 'Inflation', 'Index Numbers'], rating: 4.5, enrollments: 3900, description: 'Deep dive into the methodology behind Consumer Price Index and Wholesale Price Index, seasonal adjustment, and international comparisons.' },
  { id: 'igot_011', title: 'Cloud Computing for Government Data', provider: 'MeitY — iGOT Partner', durationHours: 28, level: 'Intermediate', competencyIds: ['cloud_computing', 'digital_infra', 'cybersecurity'], tags: ['AWS', 'Azure', 'GovCloud', 'DigiLocker'], rating: 4.4, enrollments: 14600, description: 'Hands-on training on cloud platforms, government cloud infrastructure (MeghRaj), and scalable analytics pipelines.' },
  { id: 'igot_012', title: 'Labour Force Survey Analysis — PLFS', provider: 'National Statistical Office', durationHours: 20, level: 'Intermediate', competencyIds: ['labour_stats', 'sampling', 'stata_spss'], tags: ['PLFS', 'Employment', 'Unemployment', 'LFPR'], rating: 4.6, enrollments: 4200, description: 'Hands-on analysis of Periodic Labour Force Survey data using Stata, covering employment indicators and international labour standards.' },
];

export const NSSTA_TPAC_PROGRAMS: NsstaTpacProgram[] = [
  { id: 'tpac_001', title: 'Advanced Training in National Accounts — NSSTA Giridih', type: 'Training', durationDays: 5, competencyIds: ['national_accounts', 'price_stats', 'data_quality'], venue: 'NSSTA, Giridih, Jharkhand', nextDate: '2026-11-10', description: '5-day residential training on SNA 2008, GDP measurement, input-output tables, and supply-use frameworks.' },
  { id: 'tpac_002', title: 'Workshop on Sampling Methods for Household Surveys', type: 'Workshop', durationDays: 3, competencyIds: ['sampling', 'survey_design', 'labour_stats'], venue: 'NSSTA, Giridih / Online', nextDate: '2026-10-20', description: 'Intensive workshop covering sample design for PLFS, HCES, and other NSO surveys including allocation and estimation.' },
  { id: 'tpac_003', title: 'Certificate Programme in Applied Data Science for Statistics', type: 'Certification', durationDays: 15, competencyIds: ['python', 'r_lang', 'ai_ml', 'data_viz', 'sql'], venue: 'NSSTA Giridih + Virtual Labs', nextDate: '2026-12-01', description: '15-day blended certificate programme in Python, R, and ML for official statistics.' },
  { id: 'tpac_004', title: 'Seminar on SDG Indicators and VNR Reporting', type: 'Seminar', durationDays: 2, competencyIds: ['sdg_indicators', 'communication', 'data_quality'], venue: 'New Delhi (MOSPI HQ)', nextDate: '2026-10-05', description: "National seminar on India's SDG monitoring framework and VNR reporting best practices." },
  { id: 'tpac_005', title: 'Training on GIS Applications in Agricultural Statistics', type: 'Training', durationDays: 4, competencyIds: ['gis', 'agri_stats', 'survey_design'], venue: 'NSSTA Giridih', nextDate: '2026-11-25', description: 'Practical training on QGIS and ArcGIS for agricultural survey mapping and crop estimation.' },
  { id: 'tpac_006', title: 'Leadership Excellence Programme for Senior Statistical Officers', type: 'Training', durationDays: 7, competencyIds: ['leadership', 'project_mgmt', 'ethics', 'communication'], venue: 'LBSNAA, Mussoorie', nextDate: '2026-12-15', description: 'Collaborative programme with LBSNAA covering strategic decision-making and inter-ministerial coordination.' },
];

export interface QuizQuestion {
  id: string;
  competencyId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export const ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  { id: 'q_na_1', competencyId: 'national_accounts', question: "In India's GDP calculation, which method is the primary approach used by the Central Statistics Office?", options: ['Expenditure Approach', 'Production/Value-Added Approach', 'Income Approach', 'All three simultaneously'], correctIndex: 1, explanation: 'India primarily uses the Production (Value-Added) approach to estimate GDP.', difficulty: 2 },
  { id: 'q_na_2', competencyId: 'national_accounts', question: 'What does GVA at Basic Prices exclude compared to GDP at Market Prices?', options: ['Depreciation', 'Net taxes on products', 'Intermediate consumption', 'Capital formation'], correctIndex: 1, explanation: 'GDP at Market Prices = GVA at Basic Prices + Taxes on products – Subsidies on products.', difficulty: 2 },
  { id: 'q_samp_1', competencyId: 'sampling', question: 'Which allocation method minimizes sampling variance for a fixed total sample size?', options: ['Proportional allocation', 'Equal allocation', 'Neyman (optimal) allocation', 'Random allocation'], correctIndex: 2, explanation: 'Neyman allocation minimizes variance by allocating more sample to strata with higher variability.', difficulty: 2 },
  { id: 'q_samp_2', competencyId: 'sampling', question: 'What is the primary advantage of cluster sampling?', options: ['Lower sampling error', 'Greater representativeness', 'Lower cost when population is geographically dispersed', 'Simpler variance estimation'], correctIndex: 2, explanation: 'Cluster sampling reduces field costs significantly when the population is geographically spread out.', difficulty: 1 },
  { id: 'q_py_1', competencyId: 'python', question: 'Which pandas method reshapes a DataFrame from wide format to long format?', options: ['df.pivot()', 'df.melt()', 'df.stack()', 'df.transpose()'], correctIndex: 1, explanation: 'df.melt() unpivots a DataFrame from wide to long format for tidy data transformations.', difficulty: 2 },
  { id: 'q_py_2', competencyId: 'python', question: 'What does `np.array([1,2,3]).mean()` return?', options: ['3', '2.0', '6', 'None'], correctIndex: 1, explanation: 'np.array([1,2,3]).mean() returns 2.0, the arithmetic mean.', difficulty: 1 },
  { id: 'q_sdg_1', competencyId: 'sdg_indicators', question: 'How many Sustainable Development Goals are there in the UN 2030 Agenda?', options: ['12', '15', '17', '21'], correctIndex: 2, explanation: 'There are 17 SDGs adopted by all UN Member States in 2015.', difficulty: 1 },
  { id: 'q_viz_1', competencyId: 'data_viz', question: 'Which chart type is most appropriate for showing the distribution of a continuous variable?', options: ['Bar chart', 'Pie chart', 'Histogram', 'Line chart'], correctIndex: 2, explanation: 'A histogram shows the frequency distribution of continuous data by grouping data into bins.', difficulty: 1 },
  { id: 'q_cyber_1', competencyId: 'cybersecurity', question: 'Which is the MOST secure password practice?', options: ['Using your name and birth year', 'Using the same strong password everywhere', 'Using a passphrase with a password manager', 'Changing passwords monthly but reusing old ones'], correctIndex: 2, explanation: 'A long passphrase with a password manager is the most secure approach.', difficulty: 1 },
  { id: 'q_lead_1', competencyId: 'leadership', question: 'Which leadership style is most effective during technology transformation in public sector?', options: ['Autocratic', 'Laissez-faire', 'Transformational', 'Transactional'], correctIndex: 2, explanation: 'Transformational leadership combines clear vision and empowerment to overcome resistance to change.', difficulty: 2 },
  { id: 'q_price_1', competencyId: 'price_stats', question: "What is the base year for India's Consumer Price Index (CPI)?", options: ['2004-05', '2010-11', '2011-12', '2015-16'], correctIndex: 2, explanation: "India's current CPI series uses 2011-12 as the base year.", difficulty: 2 },
  { id: 'q_gis_1', competencyId: 'gis', question: 'In GIS, what does a shapefile (.shp) primarily store?', options: ['Raster pixel data', 'Vector geometric features (points, lines, polygons)', 'Satellite imagery tiles', 'Database connection strings'], correctIndex: 1, explanation: 'A shapefile is a vector data format storing geometric features along with attribute data.', difficulty: 1 },
];

export function calculateSkillGaps(roleId: string, currentScores: Record<string, number>): Record<string, number> {
  const role = ROLE_PROFILES.find((r) => r.id === roleId);
  if (!role) return {};
  const gaps: Record<string, number> = {};
  for (const [compId, required] of Object.entries(role.requiredCompetencies)) {
    const current = currentScores[compId] ?? role.baseCompetencies[compId] ?? 1;
    const gap = required - current;
    if (gap > 0) gaps[compId] = gap;
  }
  return gaps;
}

export function getRecommendations(gapCompetencyIds: string[]): { courses: IgotCourse[]; programs: NsstaTpacProgram[] } {
  const gapSet = new Set(gapCompetencyIds);
  const scoredCourses = IGOT_COURSES.map((c) => ({ ...c, overlap: c.competencyIds.filter((id) => gapSet.has(id)).length }))
    .filter((c) => c.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.rating - a.rating)
    .slice(0, 6);
  const scoredPrograms = NSSTA_TPAC_PROGRAMS.map((p) => ({ ...p, overlap: p.competencyIds.filter((id) => gapSet.has(id)).length }))
    .filter((p) => p.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3);
  return { courses: scoredCourses, programs: scoredPrograms };
}

export function getCompetency(id: string): Competency {
  return COMPETENCIES.find((c) => c.id === id) ?? { id, name: id.replace(/_/g, ' '), domain: 'technical', description: 'Competency area' };
}

export const DOMAIN_META: Record<CompetencyDomain, { label: string; color: string; bg: string; border: string }> = {
  statistical: { label: 'Statistical', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  technical: { label: 'Technical & Digital', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  digital_governance: { label: 'Digital Governance', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  behavioural: { label: 'Behavioural & Managerial', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};
