// ============================================================
// Global TypeScript Types — PlayStation Lounge Manager SaaS
// ============================================================

export type UserRole = 'admin' | 'staff';
export type DeviceType = 'PS4' | 'PS5';
export type SessionMode = 'single' | 'multi';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Device {
  id: number;
  name: string;
  type: DeviceType;
  is_active: boolean;
  price_single: number;
  price_multi: number;
  created_at: string;
  // Joined from active sessions
  active_session?: Session | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  points: number;
  created_at: string;
}

export interface Session {
  id: string;
  device_id: number;
  customer_id: string | null;
  mode: SessionMode;
  game_played: string | null;
  started_at: string;
  ended_at: string | null;
  cost: number | null;
  staff_id: string | null;
  notes: string | null;
  created_at: string;
  // Joined
  device?: Device;
  customer?: Customer;
  staff?: Profile;
}

export interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

// Analytics
export interface DailyDeviceRevenue {
  device_id: number;
  device_name: string;
  device_type: DeviceType;
  day: string;
  session_count: number;
  total_revenue: number;
  avg_session_cost: number;
  total_hours: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  phone: string | null;
  points: number;
  session_count: number;
  total_hours: number;
  total_spent: number;
  month: string;
}

export interface TopGame {
  game_played: string;
  play_count: number;
  total_hours: number;
}

// Dashboard summary (admin only)
export interface DashboardSummary {
  gross_revenue: number;
  total_expenses: number;
  net_profit: number;
  active_sessions: number;
  total_sessions_today: number;
  revenue_today: number;
}

export interface StartSessionPayload {
  device_id: number;
  mode: SessionMode;
  game_played?: string;
  customer_id?: string;
  notes?: string;
}

// Fixed expenses constants
export const FIXED_EXPENSES = [
  { name: 'إيجار المحل',       amount: 21800 },
  { name: 'بضاعة / مستلزمات', amount: 17000 },
  { name: 'صيانة',             amount:  2200 },
  { name: 'إنترنت',            amount:  1500 },
  { name: 'جمعية',             amount:  4000 },
  { name: 'مرتبات',            amount:  3500 },
  { name: 'كهرباء',            amount:  4000 },
] as const;

export const TOTAL_FIXED_EXPENSES = FIXED_EXPENSES.reduce((sum, e) => sum + e.amount, 0); // 54,000

export const POPULAR_GAMES = [
  'FIFA 26', 'FC 25', 'eFootball / PES', 'Call of Duty',
  'GTA V', 'Red Dead Redemption 2', 'Mortal Kombat 1',
  'WWE 2K24', 'Tekken 8', 'Fortnite', 'Apex Legends',
  'God of War', 'Spider-Man 2', 'NBA 2K25', 'أخرى',
] as const;
