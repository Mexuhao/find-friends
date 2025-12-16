'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MatchResult } from '@/lib/types';

export default function ResultPage() {
  const router = useRouter();
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('ff:match');
    if (!raw) return;
    try {
      setMatch(JSON.parse(raw) as MatchResult);
    } catch (err) {
      console.error('parse match failed', err);
    }
  }, []);

  const handleCopy = async () => {
    if (!match?.wechat) return;
    try {
      await navigator.clipboard.writeText(match.wechat);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      setCopied(false);
      alert('复制失败，请手动复制');
    }
  };

  if (!match) {
    return (
      <main>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>暂无匹配结果，请重新提交信息</p>
          <button className="button" style={{ marginTop: 16 }} onClick={() => router.push('/')}>
            返回首页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="card stack">
        <div className="pill">仅展示匹配对象信息，禁止用于骚扰或营销</div>
        <div>
          <h1 className="section-title">已为你匹配到一位异性</h1>
          <p style={{ color: 'var(--muted)' }}>请礼貌添加好友，对方微信号仅展示一次。</p>
        </div>
        <div className="stack" style={{ background: '#11131a', padding: 16, borderRadius: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>昵称</span>
            <strong>{match.nickname}</strong>
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>年龄</span>
            <strong>{match.age}</strong>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span>微信号</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong>{match.wechat}</strong>
              <button className="button" style={{ width: 'auto', padding: '10px 12px' }} onClick={handleCopy}>
                复制
              </button>
            </div>
          </div>
          {copied && <div className="status success">已复制到剪贴板</div>}
        </div>
        <div className="divider" />
        <div className="stack">
          <p style={{ color: 'var(--muted)' }}>
            邀请好友参与，池子越大，越容易匹配到理想的 TA。
          </p>
          <button className="button" onClick={() => router.push('/')}>
            继续帮好友填写
          </button>
        </div>
      </div>
    </main>
  );
}

