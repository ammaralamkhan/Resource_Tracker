// ─── User Types ───────────────────────────────────────────────

export type UserRole = 'chairman' | 'admin' | 'faculty' | 'staff' | 'student';

export interface IUser {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  role_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  is_active?: boolean;
  role?: UserRole;
}
