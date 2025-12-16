export type Gender = 'male' | 'female';

export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type MatchResult = {
  nickname: string;
  age: number;
  wechat: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nickname: string;
          age: number;
          gender: Gender;
          wechat: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nickname: string;
          age: number;
          gender: Gender;
          wechat: string;
          created_at?: string;
        };
      };
      match_logs: {
        Row: {
          id: number;
          user_id: string;
          matched_user_id: string;
          created_at: string;
          ip_hash: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          matched_user_id: string;
          created_at?: string;
          ip_hash?: string | null;
        };
      };
    };
  };
}

