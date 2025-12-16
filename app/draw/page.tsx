'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MatchResult } from '@/lib/types';

type DrawResponse = {
  success: boolean;
  data?: MatchResult;
  error?: { code: string; message: string };
};

const MIN_LOADING_MS = 1800;

export default function DrawPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('正在为你匹配异性用户...');
  const [hasRequested, setHasRequested] = useState(false);

  const userId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('ff:userId') || '';
  }, []);

  useEffect(() => {
    if (!userId) {
      setStatus('error');
      setMessage('缺少用户信息，请先提交资料');
      return;
    }

    const controller = new AbortController();

    const doDraw = async () => {
      if (hasRequested) return;
      setHasRequested(true);
      const started = Date.now();
      try {
        const res = await fetch('/api/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
          signal: controller.signal
        });
        const data = (await res.json()) as DrawResponse;
        const elapsed = Date.now() - started;
        const wait = Math.max(0, MIN_LOADING_MS - elapsed);

        if (!data.success || !data.data) {
          setStatus('error');
          setTimeout(() => {
            setMessage(data.error?.message || '匹配失败，请稍后重试');
          }, wait);
          return;
        }

        setTimeout(() => {
          sessionStorage.setItem('ff:match', JSON.stringify(data.data));
          router.replace('/result');
        }, wait);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '网络异常，请重试');
      }
    };

    doDraw();

    return () => controller.abort();
  }, [router, userId, hasRequested]);

  return (
    <main>
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="spinner" aria-label="loading" />
        <h2 style={{ marginTop: 6, marginBottom: 6 }}>抽取中</h2>
        <p style={{ color: 'var(--muted)' }}>{message}</p>
        {status === 'error' && (
          <button
            className="button"
            style={{ marginTop: 18 }}
            onClick={() => router.push('/')}
          >
            返回填写
          </button>
        )}
      </div>
    </main>
  );
}

