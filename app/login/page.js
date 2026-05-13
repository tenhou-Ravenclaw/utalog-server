'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      loginId,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === 'しばらく時間をおいてから再試行してください'
        ? result.error
        : 'IDまたはパスワードが正しくありません');
    } else {
      router.push('/loading');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Uta-Log</h1>
        <p className={styles.subtitle}>DAM★とも アカウントでログイン</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>DAM★とも ID</label>
            <input
              type="text"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              className={styles.input}
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className={styles.hint}>
          DAM★とも の ID とパスワードは utalog には保存されません
        </p>
      </div>
    </div>
  );
}
