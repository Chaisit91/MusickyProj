export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  birthDate: string; // วันเดือนปีเกิด เก็บเป็น ISO string
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
