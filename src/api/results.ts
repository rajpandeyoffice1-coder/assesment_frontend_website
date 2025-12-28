import api from "@/lib/axios";

export type ExamResult = {
  attemptId: string;
  candidateId: string;
  examId: string;
  examType: "behavioral" | "aptitude" | "intelligence" | "knowledge";
  overallScore: number;
  maxScore: number;
  percentage: number;
  sectionWise: {
    sectionId: { _id: string; name: string };
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  traitWise: {
    traitId: { _id: string; name: string };
    score: number;
    maxScore: number;
    percentage: number;
  }[];
};

export const fetchResultByCandidateAndExam = async (
  candidateId: string,
  examId: string
): Promise<ExamResult> => {
  const res = await api.get<{
    success: boolean;
    data: ExamResult;
  }>(`/candidate/results/${candidateId}/${examId}`);

  return res.data.data;
};
