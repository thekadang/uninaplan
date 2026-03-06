import { useState, useCallback } from 'react';
import { STORAGE_KEYS, LEGACY_STORAGE_KEYS } from '../utils/storage';

/**
 * 인증 상태 관리 훅
 * - sessionStorage 기반 인증
 * - 브라우저 탭 종료 시 자동 로그아웃
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true' || sessionStorage.getItem(LEGACY_STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const authenticate = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      sessionStorage.removeItem(LEGACY_STORAGE_KEYS.AUTH);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
      sessionStorage.removeItem(LEGACY_STORAGE_KEYS.AUTH);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  }, []);

  return {
    isAuthenticated,
    authenticate,
    logout
  };
}