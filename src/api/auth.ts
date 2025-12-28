import axios from "axios";

export type LoginResponse = {
  status: true;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "candidate";
  };
};

export type RegisterResponse = {
  status: true;
};

const api = axios.create({
  baseURL: "https://assesment-backend-jyvd.onrender.com/api",
  // baseURL: "http://localhost:5000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
};

export const registerApi = async (
  name: string,
  email: string,
  password: string,
  role: "admin" | "candidate"
): Promise<RegisterResponse> => {
  const res = await api.post<RegisterResponse>("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return res.data;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
