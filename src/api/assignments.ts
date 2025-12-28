import api from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type Assignment = {
  _id: string;
  exam_id: { _id: string; title: string };
  assign_type: "group" | "individual";
  group_id?: { _id: string; name: string };
  candidate_id?: { _id: string; name: string };
  start_at: string;
  end_at: string;
  status: "pending" | "active" | "completed" | "expired";
};

export type CreateAssignmentPayload = {
  exam_id: string;
  assign_type: "group" | "individual";
  group_id?: string | null;
  candidate_id?: string | null;
  start_at: string;
  end_at: string;
};

export const fetchAssignments = async (): Promise<Assignment[]> => {
  const res = await api.get<ApiResponse<Assignment[]>>("/assignments");
  return res.data.data;
};

export const createAssignment = async (
  payload: CreateAssignmentPayload
): Promise<Assignment> => {
  const res = await api.post<ApiResponse<Assignment>>("/assignments", payload);
  return res.data.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<null>>(`/assignments/${id}`);
};
