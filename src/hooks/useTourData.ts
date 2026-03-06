import { useState, useEffect, useCallback } from 'react';
import { TourData, defaultTourData } from '../types/tour-data';
import { storage, STORAGE_KEYS } from '../utils/storage';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const ensureArray = <T,>(value: unknown, fallback: T[]): T[] => {
  return Array.isArray(value) ? (value as T[]) : fallback;
};

const normalizeTourData = (data: unknown): TourData => {
  const safeData = isRecord(data) ? (data as Partial<TourData>) : {};
  const merged = { ...defaultTourData, ...safeData } as TourData;

  return {
    ...merged,
    startDate: typeof merged.startDate === 'string' ? merged.startDate : defaultTourData.startDate,
    endDate: typeof merged.endDate === 'string' ? merged.endDate : defaultTourData.endDate,
    itinerary: ensureArray(merged.itinerary, defaultTourData.itinerary),
    accommodations: ensureArray(merged.accommodations, defaultTourData.accommodations),
    services: ensureArray(merged.services, defaultTourData.services),
    paymentMethods: ensureArray(merged.paymentMethods, defaultTourData.paymentMethods),
    detailedSchedules: ensureArray(merged.detailedSchedules, defaultTourData.detailedSchedules),
    touristSpots: ensureArray(merged.touristSpots, Array.isArray(defaultTourData.touristSpots) ? defaultTourData.touristSpots : []),
    transportationPages: ensureArray(merged.transportationPages, ensureArray(defaultTourData.transportationPages, [])),
    transportationTickets: ensureArray(merged.transportationTickets, ensureArray(defaultTourData.transportationTickets, [])),
    transportationRestrictions: ensureArray(merged.transportationRestrictions, ensureArray(defaultTourData.transportationRestrictions, [])),
    transportationCards: ensureArray(merged.transportationCards, ensureArray(defaultTourData.transportationCards, [])),
    transportationCardRestrictions: ensureArray(merged.transportationCardRestrictions, ensureArray(defaultTourData.transportationCardRestrictions, []))
  };
};

/**
 * 구버전 투어 데이터 마이그레이션 로직
 * - itinerary.date가 숫자인 경우 dayNum을 기준으로 정확한 ISO 날짜 형식으로 변환
 * - 다월(Multi-month) 여행 시 발생하는 날짜 오계산 문제 해결
 */
const migrateTourData = (data: TourData): TourData => {
  if (!Array.isArray(data.itinerary) || data.itinerary.length === 0) {
    return data;
  }

  if (typeof data.startDate !== 'string') {
    return data;
  }

  const startParts = data.startDate.split('-');
  if (startParts.length < 3) {
    return data;
  }

  const startDateObj = new Date(
    parseInt(startParts[0], 10),
    parseInt(startParts[1], 10) - 1,
    parseInt(startParts[2], 10)
  );

  const migratedItinerary = data.itinerary.map((item) => {
    if (typeof item.date === 'number') {
      const dayNum = item.dayNum || 1;
      const actualDate = new Date(startDateObj);
      actualDate.setDate(startDateObj.getDate() + (dayNum - 1));

      const year = actualDate.getFullYear();
      const month = String(actualDate.getMonth() + 1).padStart(2, '0');
      const day = String(actualDate.getDate()).padStart(2, '0');

      return {
        ...item,
        date: `${year}-${month}-${day}`
      };
    }

    return item;
  });

  return { ...data, itinerary: migratedItinerary };
};

/**
 * 투어 데이터 상태 관리 훅
 * - localStorage 자동 저장/불러오기
 * - 불러온 데이터에 대한 자동 마이그레이션 수행
 * - 부분 업데이트 지원
 */
export function useTourData() {
  const [tourData, setRawTourData] = useState<TourData>(() => {
    const savedData = storage.get<unknown>(STORAGE_KEYS.TOUR_DATA, defaultTourData);
    return migrateTourData(normalizeTourData(savedData));
  });

  useEffect(() => {
    storage.set(STORAGE_KEYS.TOUR_DATA, tourData);
  }, [tourData]);

  const setTourData = useCallback((data: TourData | ((prev: TourData) => TourData)) => {
    setRawTourData((prev) => {
      const next = typeof data === 'function' ? data(prev) : data;
      return migrateTourData(normalizeTourData(next));
    });
  }, []);

  const updateTourData = useCallback((updates: Partial<TourData>) => {
    setRawTourData((prev) => {
      const next = { ...prev, ...updates };
      return migrateTourData(normalizeTourData(next));
    });
  }, []);

  const addAccommodation = useCallback((accommodation: TourData['accommodations'][0]) => {
    updateTourData({
      accommodations: [...tourData.accommodations, accommodation]
    });
    return tourData.accommodations.length;
  }, [tourData.accommodations, updateTourData]);

  const removeAccommodation = useCallback((index: number) => {
    updateTourData({
      accommodations: tourData.accommodations.filter((_, i) => i !== index)
    });
  }, [tourData.accommodations, updateTourData]);

  const addDetailedSchedule = useCallback((schedule: TourData['detailedSchedules'][0]) => {
    updateTourData({
      detailedSchedules: [...tourData.detailedSchedules, schedule]
    });
  }, [tourData.detailedSchedules, updateTourData]);

  const removeDetailedSchedule = useCallback((dayNumber: number) => {
    updateTourData({
      detailedSchedules: tourData.detailedSchedules.filter((schedule) => schedule.day !== dayNumber)
    });
  }, [tourData.detailedSchedules, updateTourData]);

  const addTouristSpot = useCallback((spot: NonNullable<TourData['touristSpots']>[0]) => {
    updateTourData({
      touristSpots: [...(tourData.touristSpots || []), spot]
    });
  }, [tourData.touristSpots, updateTourData]);

  const removeTouristSpot = useCallback((dayNumber: number) => {
    updateTourData({
      touristSpots: (tourData.touristSpots || []).filter((spot) => spot.day !== dayNumber)
    });
  }, [tourData.touristSpots, updateTourData]);

  const resetTourData = useCallback(() => {
    setTourData(defaultTourData);
  }, [setTourData]);

  return {
    tourData,
    setTourData,
    updateTourData,
    addAccommodation,
    removeAccommodation,
    addDetailedSchedule,
    removeDetailedSchedule,
    addTouristSpot,
    removeTouristSpot,
    resetTourData
  };
}