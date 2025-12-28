import api from "@/lib/axios";

export type CandidateExam = {
  assignment_id: string;
  exam_id: string;
  title: string;
  type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  duration: number;
  questions: number;
  status: "pending" | "in_progress" | "completed";
  score?: number | null;
  description?: string;
};

export const fetchCandidateAssignments = async (): Promise<CandidateExam[]> => {
  const res = await api.get<{ success: boolean; data: CandidateExam[] }>(
    "candidate/assignments"
  );
  console.log("Fetched candidate assignments:", res.data.data);
  return res.data.data;

  
};
