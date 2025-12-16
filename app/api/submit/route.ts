import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import type { ApiResponse } from '@/lib/types';

const submitSchema = z.object({
  nickname: z.string().trim().min(1).max(50),
  age: z.coerce.number().int().min(18).max(50),
  gender: z.enum(['male', 'female']),
  wechat: z.string().trim().min(1).max(64)
});

export async function POST(req: NextRequest) {
  let parsed:
    | {
        nickname: string;
        age: number;
        gender: 'male' | 'female';
        wechat: string;
      }
    | undefined;

  try {
    const body = await req.json();
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return response<ApiResponse<never>>(
        { success: false, error: { code: 'INVALID_BODY', message: '参数不合法，请检查输入' } },
        400
      );
    }
    parsed = result.data;
  } catch (err) {
    return response<ApiResponse<never>>(
      { success: false, error: { code: 'BAD_JSON', message: '请求体格式错误' } },
      400
    );
  }

  try {
    const supabase = await getServiceSupabase();
    const { data, error } = await supabase
      .from('users')
      .insert({
        nickname: parsed.nickname.trim(),
        age: parsed.age,
        gender: parsed.gender,
        wechat: parsed.wechat.trim()
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('insert user failed', error);
      return response<ApiResponse<never>>(
        { success: false, error: { code: 'DB_ERROR', message: '保存失败，请稍后重试' } },
        500
      );
    }

    return response<ApiResponse<{ userId: string }>>({
      success: true,
      data: { userId: data.id }
    });
  } catch (err) {
    console.error('submit api error', err);
    return response<ApiResponse<never>>(
      { success: false, error: { code: 'UNKNOWN', message: '服务异常，请稍后再试' } },
      500
    );
  }
}

function response<T>(body: T, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

