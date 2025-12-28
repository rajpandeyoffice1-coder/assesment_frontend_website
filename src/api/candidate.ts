import api from "@/lib/axios";

export type CandidateProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  group?: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

export const fetchCandidateProfile = async (): Promise<CandidateProfile> => {
  const auth_user = localStorage.getItem("auth_user");
  const email = auth_user ? JSON.parse(auth_user).email : "";
  const res = await api.get<{ success: boolean; data: CandidateProfile }>(
    "/candidate/profile/" + email
  );

  return res.data.data;
};