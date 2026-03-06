import { useState, useEffect, useCallback } from 'react';
import { PageConfig } from '../types/page-config';
import { storage, STORAGE_KEYS } from '../utils/storage';

const VALID_PAGE_TYPES = new Set<PageConfig['type']>([
  'cover',
  'intro',
  'flight',
  'flight-departure',
  'flight-transit',
  'flight-arrival',
  'itinerary',
  'accommodation',
  'quotation',
  'process',
  'service-options',
  'payment',
  'detailed-schedule',
  'tourist-spot',
  'transportation-ticket',
  'transportation-card',
  'contact'
]);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizePageConfig = (config: unknown, index: number): PageConfig | null => {
  if (!isRecord(config)) {
    return null;
  }

  const rawType = typeof config.type === 'string' ? config.type : '';
  if (!VALID_PAGE_TYPES.has(rawType as PageConfig['type'])) {
    return null;
  }

  return {
    id: typeof config.id === 'string' && config.id ? config.id : `migrated-${index}`,
    type: rawType as PageConfig['type'],
    title: typeof config.title === 'string' && config.title ? config.title : '페이지',
    data: config.data
  };
};

const defaultPageConfigs: PageConfig[] = [
  { id: '1', type: 'cover', title: '표지' },
  { id: '2', type: 'intro', title: '여행 소개' },
  { id: '10', type: 'process', title: '프로세스' },
  { id: '10-1', type: 'service-options', title: '서비스 옵션' },
  { id: '3', type: 'flight-departure', title: '항공편 (출발)' },
  { id: '4', type: 'flight-transit', title: '항공편 (중간이동)' },
  { id: '5', type: 'flight-arrival', title: '항공편 (도착)' },
  { id: '6', type: 'itinerary', title: '여행 일정' },
  { id: '7', type: 'accommodation', title: '숙소 안내', data: { index: 0 } },
  { id: '6-1', type: 'detailed-schedule', title: '세부 일정 (DAY 1)', data: { dayNumber: 1 } },
  { id: '6-4', type: 'tourist-spot', title: '관광지 리스트 (DAY 1)', data: { dayNumber: 1 } },
  { id: '12', type: 'transportation-ticket', title: '교통편 안내' },
  { id: '13', type: 'transportation-card', title: '교통카드 안내' },
  { id: '9', type: 'quotation', title: '견적' },
  { id: '11', type: 'payment', title: '결제 안내' },
  { id: '14', type: 'contact', title: '문의 하기' }
];

const migratePageConfigs = (configs: unknown): PageConfig[] => {
  const normalized = Array.isArray(configs)
    ? configs
        .map((config, index) => normalizePageConfig(config, index))
        .filter((config): config is PageConfig => config !== null)
    : [];

  const migrated = normalized.length > 0 ? [...normalized] : [...defaultPageConfigs];

  if (!migrated.some((page) => page.type === 'contact')) {
    migrated.push({ id: '14', type: 'contact', title: '문의 하기' });
  }

  if (!migrated.some((page) => page.type === 'service-options')) {
    const processIndex = migrated.findIndex((page) => page.type === 'process');
    const serviceOptionsPage: PageConfig = {
      id: '10-1',
      type: 'service-options',
      title: '서비스 옵션'
    };

    if (processIndex !== -1) {
      migrated.splice(processIndex + 1, 0, serviceOptionsPage);
    } else {
      migrated.push(serviceOptionsPage);
    }
  }

  return migrated;
};

export function usePageConfigs() {
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>(() => {
    const saved = storage.get<unknown>(STORAGE_KEYS.PAGE_CONFIGS, defaultPageConfigs);
    return migratePageConfigs(saved);
  });

  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    storage.set(STORAGE_KEYS.PAGE_CONFIGS, pageConfigs);
  }, [pageConfigs]);

  useEffect(() => {
    if (currentPage >= pageConfigs.length) {
      setCurrentPage(Math.max(0, pageConfigs.length - 1));
    }
  }, [pageConfigs.length, currentPage]);

  const generateId = useCallback(() => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, []);

  const addPage = useCallback((page: Omit<PageConfig, 'id'>, afterIndex?: number) => {
    const newPage: PageConfig = { ...page, id: generateId() };
    setPageConfigs((prev) => {
      const newConfigs = [...prev];
      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : prev.length;
      newConfigs.splice(insertIndex, 0, newPage);
      return newConfigs;
    });
    return newPage.id;
  }, [generateId]);

  const removePage = useCallback((index: number) => {
    if (pageConfigs.length <= 1) {
      return false;
    }

    setPageConfigs((prev) => prev.filter((_, pageIndex) => pageIndex !== index));
    return true;
  }, [pageConfigs.length]);

  const updatePage = useCallback((index: number, updates: Partial<PageConfig>) => {
    setPageConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = { ...newConfigs[index], ...updates };
      return newConfigs;
    });
  }, []);

  const duplicatePage = useCallback((index: number): PageConfig | null => {
    if (index < 0 || index >= pageConfigs.length) {
      return null;
    }

    const pageToDuplicate = pageConfigs[index];
    const newPage: PageConfig = {
      ...pageToDuplicate,
      id: generateId(),
      title: `${pageToDuplicate.title} (복사)`,
      data: pageToDuplicate.data ? JSON.parse(JSON.stringify(pageToDuplicate.data)) : undefined
    };

    setPageConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs.splice(index + 1, 0, newPage);
      return newConfigs;
    });

    return newPage;
  }, [pageConfigs, generateId]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    setPageConfigs((prev) => {
      const newConfigs = [...prev];
      const [removed] = newConfigs.splice(fromIndex, 1);
      newConfigs.splice(toIndex, 0, removed);
      return newConfigs;
    });
  }, []);

  const goToPage = useCallback((index: number) => {
    if (index >= 0 && index < pageConfigs.length) {
      setCurrentPage(index);
    }
  }, [pageConfigs.length]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, pageConfigs.length - 1));
  }, [pageConfigs.length]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const getCurrentPageConfig = useCallback(() => {
    return pageConfigs[currentPage];
  }, [pageConfigs, currentPage]);

  const resetPageConfigs = useCallback(() => {
    setPageConfigs(defaultPageConfigs);
    setCurrentPage(0);
  }, []);

  return {
    pageConfigs,
    setPageConfigs,
    currentPage,
    setCurrentPage,
    addPage,
    removePage,
    updatePage,
    duplicatePage,
    reorderPages,
    goToPage,
    nextPage,
    prevPage,
    getCurrentPageConfig,
    resetPageConfigs,
    totalPages: pageConfigs.length
  };
}

export { defaultPageConfigs };