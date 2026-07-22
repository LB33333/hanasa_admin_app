import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/formControls';

export default function LoginGate() {
  const { login } = useAuth();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(key.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">hanasa</h1>
          <p className="mt-1 text-sm text-gray-400">관리자 도구</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            autoFocus
            placeholder="관리자 키를 입력하세요"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" loading={loading} disabled={!key.trim()}>
            들어가기
          </Button>
        </form>
      </div>
    </div>
  );
}
