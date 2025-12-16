'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Gender } from '@/lib/types';

type SubmitResponse = {
  success: boolean;
  data?: { userId: string };
  error?: { code: string; message: string };
};

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [wechat, setWechat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = useMemo(() => {
    const ageNum = Number(age);
    return (
      nickname.trim().length > 0 &&
      wechat.trim().length > 0 &&
      (gender === 'male' || gender === 'female') &&
      Number.isInteger(ageNum) &&
      ageNum >= 18 &&
      ageNum <= 50
    );
  }, [nickname, age, gender, wechat]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          age: Number(age),
          gender,
          wechat: wechat.trim()
        })
      });

      const data = (await res.json()) as SubmitResponse;
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '提交失败，请稍后重试');
      }

      localStorage.setItem('ff:userId', data.data.userId);
      router.push('/draw');
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络异常，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="card stack">
        <div className="pill">信息由用户自愿填写，仅用于匹配展示</div>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>匿名抽取异性好友</h1>
          <p style={{ color: 'var(--muted)' }}>
            填写基础信息后即可随机抽取异性微信，请文明交友，勿骚扰。
          </p>
        </div>
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="nickname">
              昵称
            </label>
            <input
              id="nickname"
              className="input"
              placeholder="例：小李 / Sunny"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              required
            />
          </div>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="age">
                年龄（18-50）
              </label>
              <input
                id="age"
                className="input"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="数字"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
                maxLength={2}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">性别</label>
              <div className="row">
                {['male', 'female'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGender(value as Gender)}
                    className="button"
                    style={{
                      padding: '12px',
                      opacity: gender === value ? 1 : 0.5,
                      background:
                        gender === value ? 'linear-gradient(120deg, #4f8bff, #7f6bff)' : '#1b1d26'
                    }}
                  >
                    {value === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="wechat">
              微信号
            </label>
            <input
              id="wechat"
              className="input"
              placeholder="仅匹配对象可见"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              maxLength={50}
              required
            />
          </div>
          <button className="button" type="submit" disabled={!isValid || submitting}>
            {submitting ? '提交中...' : '提交并开始抽取'}
          </button>
          <p className="hint">提交即视为同意平台展示所填信息，用于一次性匹配。</p>
          {error && (
            <div className="status error" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

