/**
 * 브라우저 저장소 래퍼 유틸리티
 * - 앱별 네임스페이스 적용
 * - 레거시 키 자동 마이그레이션
 * - 에러 처리 포함
 */

const STORAGE_PREFIX = 'uninaplan';

const withPrefix = (key: string) => `${STORAGE_PREFIX}:${key}`;

export const LEGACY_STORAGE_KEYS = {
  TOUR_DATA: 'tourData',
  PAGE_CONFIGS: 'pageConfigs',
  BLUR_DATA: 'blurData',
  AUTH: 'tour-authenticated'
} as const;

export const STORAGE_KEYS = {
  TOUR_DATA: withPrefix('tourData'),
  PAGE_CONFIGS: withPrefix('pageConfigs'),
  BLUR_DATA: withPrefix('blurData'),
  AUTH: withPrefix('auth')
} as const;

const STORAGE_ALIASES: Record<string, string[]> = {
  [STORAGE_KEYS.TOUR_DATA]: [LEGACY_STORAGE_KEYS.TOUR_DATA],
  [STORAGE_KEYS.PAGE_CONFIGS]: [LEGACY_STORAGE_KEYS.PAGE_CONFIGS],
  [STORAGE_KEYS.BLUR_DATA]: [LEGACY_STORAGE_KEYS.BLUR_DATA],
  [STORAGE_KEYS.AUTH]: [LEGACY_STORAGE_KEYS.AUTH]
};

const getStorageCandidates = (key: string) => [key, ...(STORAGE_ALIASES[key] || [])];

const removeStorageKeys = (storageArea: Storage, keys: string[]) => {
  keys.forEach((storageKey) => storageArea.removeItem(storageKey));
};

export const storage = {
  /**
   * localStorage에서 데이터 불러오기
   * @param key 저장 키
   * @param defaultValue 기본값 (파싱 실패 시 반환)
   */
  get<T>(key: string, defaultValue: T): T {
    const candidates = getStorageCandidates(key);

    for (const candidate of candidates) {
      try {
        const saved = localStorage.getItem(candidate);
        if (saved === null) {
          continue;
        }

        const parsed = JSON.parse(saved) as T;

        if (candidate !== key) {
          localStorage.setItem(key, saved);
          removeStorageKeys(localStorage, candidates.filter((item) => item !== key));
        }

        return parsed;
      } catch (error) {
        console.error(`Failed to load ${candidate} from localStorage:`, error);
        localStorage.removeItem(candidate);
      }
    }

    return defaultValue;
  },

  /**
   * localStorage에 데이터 저장
   * @param key 저장 키
   * @param value 저장할 값
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      removeStorageKeys(localStorage, (STORAGE_ALIASES[key] || []));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  /**
   * localStorage에서 데이터 삭제
   * @param key 삭제할 키
   */
  remove(key: string): void {
    try {
      removeStorageKeys(localStorage, getStorageCandidates(key));
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

export function clearAllStorage(): void {
  try {
    const allKeys = [...new Set([...Object.values(STORAGE_KEYS), ...Object.values(LEGACY_STORAGE_KEYS)])];
    removeStorageKeys(localStorage, allKeys);
    removeStorageKeys(sessionStorage, allKeys);
  } catch (error) {
    console.error('Failed to clear app storage:', error);
  }
}