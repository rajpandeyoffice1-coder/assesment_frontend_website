import api from "@/lib/axios";

/* =======================
   TYPES
======================= */

export type QuestionOption = {
  label: string;
  value: string;
  weight?: number;
};

export type Question = {
  _id: string;
  examType: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  questionText: string;
  options: QuestionOption[];
  correctAnswer?: string;
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "inactive";
};

export type CreateQuestionPayload = {
  examType: Question["examType"];
  questionText: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  difficulty?: Question["difficulty"];
};

export type UpdateQuestionPayload =
  Partial<CreateQuestionPayload> & {
    status?: Question["status"];
  };

export type FetchQuestionsParams = {
  examType?: Question["examType"];
  search?: string;
  status?: Question["status"];
};

/* =======================
   API CALLS
======================= */

export const fetchQuestions = async (
  params?: FetchQuestionsParams
): Promise<Question[]> => {
  const res = await api.get<Question[]>("/admin/questions", { params });
  return res.data;
};

export const createQuestion = async (
  payload: CreateQuestionPayload
): Promise<Question> => {
  const res = await api.post<Question>("/admin/questions", payload);
  console.log("res.data", res.data);
  return res.data;
};

export const updateQuestion = async (
  id: string,
  payload: UpdateQuestionPayload
): Promise<Question> => {
  const res = await api.put<Question>(`/admin/questions/${id}`, payload);
  return res.data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await api.delete(`/admin/questions/${id}`);
};

export const bulkImportQuestions = async (
  formData: FormData
): Promise<void> => {
  await api.post("/admin/questions/bulk-import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


