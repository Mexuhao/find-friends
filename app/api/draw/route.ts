import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import type { ApiResponse, MatchResult } from '@/lib/types';

type UserRow = {
  id: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female';
  wechat: string;
  created_at?: string;
};

type UserWithGender = Pick<UserRow, 'id' | 'gender'>;

type MatchLogWithCreatedAt = {
  created_at: string;
};

const drawSchema = z.object({
  user_id: z.string().uuid()
});

const COOLDOWN_SECONDS = 30;

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const body = await req.json();
    const parsed = drawSchema.safeParse(body);
    if (!parsed.success) {
      return json<ApiResponse<never>>(
        { success: false, error: { code: 'INVALID_BODY', message: '参数不合法' } },
        400
      );
    }
    userId = parsed.data.user_id;
  } catch (err) {
    return json<ApiResponse<never>>(
      { success: false, error: { code: 'BAD_JSON', message: '请求体格式错误' } },
      400
    );
  }

  const supabase = await getServiceSupabase();

  // 1. 获取用户信息
  const userRes = await supabase
    .from('users')
    .select('id, gender')
    .eq('id', userId)
    .single<UserWithGender>();

  if (userRes.error || !userRes.data) {
    return json<ApiResponse<never>>(
      { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在，请重新提交信息' } },
      404
    );
  }

  const user: UserWithGender = userRes.data;
  const targetGender: 'male' | 'female' = user.gender === 'male' ? 'female' : 'male';

  // 2. 防刷：检查最近一次抽取记录
  const lastLogRes = await supabase
    .from('match_logs')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<MatchLogWithCreatedAt>();

  if (lastLogRes.data) {
    const lastLog: MatchLogWithCreatedAt = lastLogRes.data;
    const lastTime = new Date(lastLog.created_at).getTime();
    if (Date.now() - lastTime < COOLDOWN_SECONDS * 1000) {
      return json<ApiResponse<never>>(
        {
          success: false,
          error: { code: 'TOO_FREQUENT', message: '操作过于频繁，请稍后再试' }
        },
        429
      );
    }
  }

  // 3. 随机抽取一条异性记录
  const { data: matched, error: matchError } = await supabase
    .from('users')
    .select('id, nickname, age, wechat')
    .eq('gender', targetGender)
    .neq('id', userId)
    .limit(1)
    .maybeSingle<UserRow>();

  if (matchError) {
    console.error('query match error', matchError);
    return json<ApiResponse<never>>(
      { success: false, error: { code: 'DB_ERROR', message: '服务异常，请稍后再试' } },
      500
    );
  }

  if (!matched) {
    return json<ApiResponse<never>>({
      success: false,
      error: { code: 'EMPTY_POOL', message: '当前暂无可匹配的异性用户，稍后再试' }
    });
  }

  const match = matched;

  // 4. 记录日志（不影响用户成功拿到结果）
  const ip = req.headers.get('x-forwarded-for') || '';
  const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32) : null;
  supabase
    .from('match_logs')
    .insert({ user_id: userId, matched_user_id: match.id, ip_hash: ipHash })
    .then(({ error }) => error && console.error('insert log error', error));

  const responseBody: ApiResponse<MatchResult> = {
    success: true,
    data: {
      nickname: match.nickname,
      age: match.age,
      wechat: match.wechat
    }
  };

  return json(responseBody);
}

function json<T>(body: T, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

