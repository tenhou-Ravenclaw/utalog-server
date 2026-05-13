'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', cdmCardNo: '' });
  const [damLogin, setDamLogin] = useState({ loginId: '', password: '' });
  const [inputMode, setInputMode] = useState('dam'); // 'dam' | 'manual'
  const [damFetching, setDamFetching] = useState(false);
  const [damFetchDone, setDamFetchDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDamLoginChange = (e) => {
    setDamLogin({ ...damLogin, [e.target.name]: e.target.value });
  };

  /** DAM★とも認証して cdmCardNo を自動取得 */
  const handleFetchCdmCardNo = async () => {
    if (!damLogin.loginId || !damLogin.password) {
      setError('DAM★とも ID とパスワードを入力してください');
      return;
    }
    setError('');
    setDamFetching(true);
    setDamFetchDone(false);

    const res = await fetch('/api/dam-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: damLogin.loginId, password: damLogin.password }),
    });

    const data = await res.json();
    setDamFetching(false);

    if (!res.ok) {
      setError(data.error || 'DAM★とも 認証に失敗しました');
    } else {
      setForm(prev => ({ ...prev, cdmCardNo: data.cdmCardNo }));
      setDamFetchDone(true);
      setError('');
    }
  };

  /** utalog アカウントを作成 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cdmCardNo) {
      setError(
        inputMode === 'dam'
          ? 'まず「DAM★ともで取得」を押してください'
          : '会員番号を入力してください',
      );
      return;
    }
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '登録に失敗しました');
    } else {
      // 登録後に自動ログイン
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/ai');
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Uta-Log</h1>
        <p className={styles.subtitle}>新規登録</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* utalog アカウント情報 */}
          <div className={styles.field}>
            <label className={styles.label}>メールアドレス</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>パスワード（8文字以上）</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={styles.input}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {/* CDM 会員番号 */}
          <div className={styles.cdmSection}>
            <p className={styles.label}>DAM★とも 会員番号の取得方法</p>
            <div className={styles.tabRow}>
              <button
                type="button"
                onClick={() => setInputMode('dam')}
                className={`${styles.tab} ${inputMode === 'dam' ? styles.tabActive : ''}`}
              >
                DAM★ともでログイン
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`${styles.tab} ${inputMode === 'manual' ? styles.tabActive : ''}`}
              >
                手動で入力
              </button>
            </div>

            {inputMode === 'dam' ? (
              <div className={styles.damLoginBox}>
                <div className={styles.field}>
                  <label className={styles.label}>DAM★とも ID</label>
                  <input
                    type="text"
                    name="loginId"
                    value={damLogin.loginId}
                    onChange={handleDamLoginChange}
                    className={styles.input}
                    placeholder="DAM★とも ID"
                    autoComplete="username"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>DAM★とも パスワード</label>
                  <input
                    type="password"
                    name="password"
                    value={damLogin.password}
                    onChange={handleDamLoginChange}
                    className={styles.input}
                    placeholder="パスワード"
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchCdmCardNo}
                  disabled={damFetching}
                  className={styles.fetchButton}
                >
                  {damFetching ? '取得中...' : 'DAM★ともで取得'}
                </button>
                {damFetchDone && (
                  <p className={styles.fetchSuccess}>会員番号を取得しました</p>
                )}
                <p className={styles.hint}>
                  DAM★とも の ID とパスワードは utalog には保存されません
                </p>
              </div>
            ) : (
              <div className={styles.field}>
                <label className={styles.label}>会員番号</label>
                <input
                  type="text"
                  name="cdmCardNo"
                  value={form.cdmCardNo}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="例: ODAwMD..."
                />
                <p className={styles.hint}>
                  DAM★ともアプリ → メニュー → 会員情報 → ブラウザの開発者ツール(Network タブ)で確認できます
                </p>
              </div>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        <p className={styles.link}>
          既にアカウントをお持ちの方は{' '}
          <Link href="/login">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
