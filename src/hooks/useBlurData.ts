import { useState, useEffect, useCallback } from 'react';
import { BlurData, BlurRegion } from '../types/blur-region';
import { storage, STORAGE_KEYS } from '../utils/storage';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeBlurData = (data: unknown): BlurData => {
  if (!isRecord(data)) {
    return {};
  }

  return Object.entries(data).reduce<BlurData>((acc, [pageId, regions]) => {
    acc[pageId] = Array.isArray(regions) ? (regions as BlurRegion[]) : [];
    return acc;
  }, {});
};

/**
 * 블러 영역 상태 관리 훅
 * - localStorage 자동 저장/불러오기
 * - 페이지별 블러 영역 관리
 */
export function useBlurData() {
  const [blurData, setBlurData] = useState<BlurData>(() => {
    const saved = storage.get<unknown>(STORAGE_KEYS.BLUR_DATA, {});
    return normalizeBlurData(saved);
  });

  const [blurModePages, setBlurModePages] = useState<Set<string>>(new Set());

  useEffect(() => {
    storage.set(STORAGE_KEYS.BLUR_DATA, blurData);
  }, [blurData]);

  const toggleBlurMode = useCallback((pageId: string) => {
    setBlurModePages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  const isBlurMode = useCallback((pageId: string) => {
    return blurModePages.has(pageId);
  }, [blurModePages]);

  const addBlurRegion = useCallback((pageId: string, region: Omit<BlurRegion, 'id' | 'pageId'>) => {
    const regionId = Date.now().toString();
    const newRegion: BlurRegion = { ...region, id: regionId, pageId };

    setBlurData((prev) => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), newRegion]
    }));

    return regionId;
  }, []);

  const removeBlurRegion = useCallback((pageId: string, regionId: string) => {
    setBlurData((prev) => ({
      ...prev,
      [pageId]: (prev[pageId] || []).filter((region) => region.id !== regionId)
    }));
  }, []);

  const getBlurRegions = useCallback((pageId: string): BlurRegion[] => {
    return blurData[pageId] || [];
  }, [blurData]);

  const clearPageBlurRegions = useCallback((pageId: string) => {
    setBlurData((prev) => {
      const next = { ...prev };
      delete next[pageId];
      return next;
    });
  }, []);

  const clearBlurModePages = useCallback(() => {
    setBlurModePages(new Set());
  }, []);

  const resetBlurData = useCallback(() => {
    setBlurData({});
    setBlurModePages(new Set());
  }, []);

  return {
    blurData,
    blurModePages,
    toggleBlurMode,
    isBlurMode,
    addBlurRegion,
    removeBlurRegion,
    getBlurRegions,
    clearPageBlurRegions,
    clearBlurModePages,
    resetBlurData
  };
}