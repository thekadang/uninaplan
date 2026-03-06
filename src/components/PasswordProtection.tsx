import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { STORAGE_KEYS, LEGACY_STORAGE_KEYS } from '../utils/storage';

interface Props {
  onAuthenticate: () => void;
}

export function PasswordProtection({ onAuthenticate }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === import.meta.env.VITE_APP_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        sessionStorage.removeItem(LEGACY_STORAGE_KEYS.AUTH);
      } catch (storageError) {
        console.error('Failed to save auth state:', storageError);
      }

      onAuthenticate();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-cyan-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-cyan-600 mb-2">유니나투어</h1>
            <p className="text-gray-600">여행 기획서</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                비밀번호를 입력하세요
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">비밀번호가 올바르지 않습니다.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              접속하기
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            승인된 사용자만 접속 가능합니다
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}