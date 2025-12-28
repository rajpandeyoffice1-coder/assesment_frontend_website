import api from "@/lib/axios";

export type Exam = {
  _id: string;
  title: string;
  code: string;
  description?: string;
  type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  status: "draft" | "published" | "active" | "completed";
  duration: number;
  totalQuestions: number;
  themeColor: string;
  attempts: number;

  settings: {
    shuffleQuestions: boolean;
    negativeMarking: boolean;
    allowSkip: boolean;
    autoSubmit: boolean;
  };

  scoring?: {
    marksPerQuestion?: number;
    negativeMarks?: number;
    reverseScoring?: boolean;
  };

  intelligenceWeights?: Record<string, number>;
};

export type CreateExamPayload = {
  title: string;
  code: string;
  description?: string;
  type: Exam["type"];
  duration: number;
  totalQuestions: number;
  themeColor: string;

  questionBanks: string[];

  settings: {
    shuffleQuestions: boolean;
    negativeMarking: boolean;
    allowSkip: boolean;
    autoSubmit: boolean;
  };

  scoring?: {
    marksPerQuestion?: number;
    negativeMarks?: number;
    reverseScoring?: boolean;
  };

  intelligenceWeights?: Record<string, number>;
};


export type UpdateExamPayload =
  Partial<CreateExamPayload> & {
    status?: Exam["status"];
  };

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const fetchExams = async (): Promise<Exam[]> => {
  const res = await api.get<ApiResponse<Exam[]>>("/exams");
  return res.data.data;
};

export const fetchExamById = async (id: string): Promise<Exam> => {
  const res = await api.get<ApiResponse<Exam>>(`/exams/${id}`);
  return res.data.data;
};

export const createExam = async (
  payload: CreateExamPayload
): Promise<Exam> => {
  const res = await api.post<ApiResponse<Exam>>("/exams", payload);
  return res.data.data;
};

export const updateExam = async (
  id: string,
  payload: UpdateExamPayload
): Promise<Exam> => {
  const res = await api.put<ApiResponse<Exam>>(
    `/exams/${id}`,
    payload
  );
  return res.data.data;
};

export const deleteExam = async (id: string): Promise<void> => {
  await api.delete(`/exams/${id}`);
};

