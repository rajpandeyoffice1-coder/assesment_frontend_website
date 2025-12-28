// User Types
export type UserRole = 'admin' | 'candidate';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

// Candidate Types
export interface Candidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  groupId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Group Types
export interface CandidateGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  candidateCount: number;
  createdAt: Date;
}

// Exam Types
export type ExamType = 'behavioral' | 'aptitude' | 'knowledge' | 'intelligence';
export type ExamStatus = 'draft' | 'published' | 'active' | 'completed';

export interface Exam {
  id: string;
  title: string;
  code: string;
  description?: string;
  type: ExamType;
  duration: number; // in minutes
  totalQuestions: number;
  shuffleQuestions: boolean;
  negativeMarking: boolean;
  allowSkip: boolean;
  autoSubmit: boolean;
  status: ExamStatus;
  themeColor: string;
  createdAt: Date;
}

// Question Types
export type QuestionType = 'mcq' | 'mcq_image' | 'likert' | 'true_false' | 'scenario' | 'image_identification';

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
  isCorrect?: boolean;
  score?: number;
}

export interface Question {
  id: string;
  examId: string;
  type: QuestionType;
  text: string;
  image?: string;
  options: QuestionOption[];
  correctAnswer?: string;
  marks: number;
  negativeMarks?: number;
  trait?: string;
  intelligence?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weightage?: number;
}

// Exam Assignment Types
export interface ExamAssignment {
  id: string;
  examId: string;
  candidateId?: string;
  groupId?: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
}

// Exam Attempt Types
export interface ExamAttempt {
  id: string;
  examId: string;
  candidateId: string;
  startedAt: Date;
  submittedAt?: Date;
  status: 'in_progress' | 'submitted' | 'evaluated';
  responses: ExamResponse[];
  result?: ExamResult;
}

export interface ExamResponse {
  questionId: string;
  selectedOption?: string;
  score?: number;
  timeTaken?: number;
}

// Result Types
export interface ExamResult {
  id: string;
  attemptId: string;
  totalScore: number;
  percentage: number;
  percentile?: number;
  rank?: number;
  traits?: TraitScore[];
  intelligences?: IntelligenceScore[];
  sectionScores?: SectionScore[];
  careerFitment?: CareerFitment[];
}

export interface TraitScore {
  trait: string;
  score: number;
  percentage: number;
}

export interface IntelligenceScore {
  intelligence: string;
  score: number;
  percentage: number;
}

export interface SectionScore {
  section: string;
  score: number;
  total: number;
  percentage: number;
  accuracy: number;
}

export interface CareerFitment {
  career: string;
  fitment: number;
  strengths: string[];
  reasoning: string;
}

// Likert Scale
export const LIKERT_SCALE = [
  { value: 1, label: 'Not True at All' },
  { value: 2, label: 'Not True' },
  { value: 3, label: 'Not Sure' },
  { value: 4, label: 'True' },
  { value: 5, label: 'Very True' },
] as const;

// Intelligence Types
export const INTELLIGENCE_TYPES = [
  'Linguistic',
  'Logical-Mathematical',
  'Spatial',
  'Musical',
  'Bodily-Kinesthetic',
  'Interpersonal',
  'Intrapersonal',
  'Naturalistic',
] as const;
