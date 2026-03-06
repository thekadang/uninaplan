import { useCallback } from 'react';
import { TourData, defaultTourData } from '../types/tour-data';
import { PageConfig } from '../types/page-config';
import { BlurRegion } from '../types/blur-region';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface AppActionsProps {
    tourData: TourData;
    setTourData: (data: TourData) => void;
    pageConfigs: PageConfig[];
    setPageConfigs: (configs: PageConfig[]) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    toggleBlurMode: (pageId: string) => void;
    addBlurRegion: (pageId: string, region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
    removeBlurRegion: (pageId: string, regionId: string) => void;
    clearBlurModePages: () => void;
    setIsEditMode: (edit: boolean) => void;
}

export function useAppActions({
    tourData,
    setTourData,
    pageConfigs,
    setPageConfigs,
    currentPage,
    setCurrentPage,
    toggleBlurMode,
    addBlurRegion,
    removeBlurRegion,
    clearBlurModePages,
    setIsEditMode
}: AppActionsProps) {

    const saveAsDefault = useCallback(async () => {
        try {
            storage.set(STORAGE_KEYS.TOUR_DATA, tourData);
            storage.set(STORAGE_KEYS.PAGE_CONFIGS, pageConfigs);

            const dataToExport = {
                tourData,
                pageConfigs,
                exportedAt: new Date().toISOString()
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `tour-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('✅ 현재 상태가 JSON 파일로 저장되었습니다!\n\n이 파일을 개발자에게 전달하면 기본값으로 설정할 수 있습니다.\n\n또는 다른 브라우저에서 "설정 불러오기" 버튼으로 이 파일을 업로드하세요.');
        } catch (error) {
            console.error('Failed to save data:', error);
            alert('❌ 저장에 실패했습니다.');
        }
    }, [tourData, pageConfigs]);

    const loadSettings = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);

                    if (data.tourData) {
                        const mergedTourData = { ...defaultTourData, ...data.tourData };
                        setTourData(mergedTourData);
                        storage.set(STORAGE_KEYS.TOUR_DATA, mergedTourData);
                    }

                    if (data.pageConfigs) {
                        setPageConfigs(data.pageConfigs);
                        storage.set(STORAGE_KEYS.PAGE_CONFIGS, data.pageConfigs);
                    }

                    alert('✅ 설정이 성공적으로 불러와졌습니다!');
                } catch (error) {
                    console.error('Failed to load settings:', error);
                    alert('❌ 파일을 읽는데 실패했습니다.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [setTourData, setPageConfigs]);

    const saveCurrentPage = useCallback(async () => {
        try {
            const currentPageConfig = pageConfigs[currentPage];
            let pageDataToExport: any = null;

            if (currentPageConfig.type === 'accommodation') {
                const accIndex = currentPageConfig.data?.index ?? 0;
                pageDataToExport = tourData.accommodations[accIndex];
            } else if (currentPageConfig.type === 'detailed-schedule') {
                const dayNumber = currentPageConfig.data?.dayNumber ?? 1;
                pageDataToExport = tourData.detailedSchedules.find(s => s.day === dayNumber);
            } else if (currentPageConfig.type === 'tourist-spot') {
                const dayNumber = currentPageConfig.data?.dayNumber ?? 1;
                pageDataToExport = tourData.touristSpots?.find(s => s.day === dayNumber);
            } else {
                pageDataToExport = currentPageConfig.data?.pageData || tourData;
            }

            const dataToExport = {
                pageConfig: currentPageConfig,
                pageData: pageDataToExport,
                exportedAt: new Date().toISOString()
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `page-${currentPageConfig.type}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('✅ 현재 페이지가 저장되었습니다!');
        } catch (error) {
            console.error('Failed to save page:', error);
            alert('❌ 페이지 저장에 실패했습니다.');
        }
    }, [pageConfigs, currentPage, tourData]);

    const loadPageAtCurrent = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);

                    if (!data.pageConfig || !data.pageData) {
                        alert('❌ 올바른 페이지 파일이 아닙니다.');
                        return;
                    }

                    const newId = Date.now().toString();
                    let newPage: PageConfig;

                    if (data.pageConfig.type === 'accommodation') {
                        const newAccommodations = [...tourData.accommodations, data.pageData];
                        setTourData({ ...tourData, accommodations: newAccommodations });
                        newPage = {
                            id: newId,
                            type: 'accommodation',
                            title: data.pageConfig.title,
                            data: { index: newAccommodations.length - 1 }
                        };
                    } else if (data.pageConfig.type === 'detailed-schedule') {
                        const existingDayNumbers = tourData.detailedSchedules.map(s => s.day);
                        const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;
                        const loadedSchedule = { ...data.pageData, day: newDayNumber };
                        const newSchedules = [...tourData.detailedSchedules, loadedSchedule];
                        setTourData({ ...tourData, detailedSchedules: newSchedules });
                        newPage = {
                            id: newId,
                            type: 'detailed-schedule',
                            title: `세부 일정 (DAY ${newDayNumber})`,
                            data: { dayNumber: newDayNumber }
                        };
                    } else if (data.pageConfig.type === 'tourist-spot') {
                        const touristSpots = tourData.touristSpots || [];
                        const existingDayNumbers = touristSpots.map(s => s.day);
                        const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;
                        const loadedSpot = { ...data.pageData, day: newDayNumber };
                        const newSpots = [...touristSpots, loadedSpot];
                        setTourData({ ...tourData, touristSpots: newSpots });
                        newPage = {
                            id: newId,
                            type: data.pageConfig.type as any,
                            title: `관광지 리스트 (DAY ${newDayNumber})`,
                            data: { dayNumber: newDayNumber }
                        };
                    } else {
                        newPage = {
                            id: newId,
                            type: data.pageConfig.type as any,
                            title: data.pageConfig.title,
                            data: { ...data.pageConfig.data, pageData: data.pageData }
                        };
                    }

                    const newPages = [...pageConfigs];
                    newPages.splice(currentPage, 0, newPage);
                    setPageConfigs(newPages);

                    alert('✅ 페이지가 성공적으로 불러와졌습니다!');
                } catch (error) {
                    console.error('Failed to load page:', error);
                    alert('❌ 페이지를 불러오는데 실패했습니다.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [tourData, pageConfigs, currentPage, setTourData, setPageConfigs]);

    const duplicatePage = useCallback((index: number) => {
        const pageToDuplicate = pageConfigs[index];
        const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        let newPage: PageConfig;
        if (pageToDuplicate.type === 'accommodation') {
            const accIndex = pageToDuplicate.data?.index ?? 0;
            const hotelToDuplicate = pageToDuplicate.data?.pageData?.accommodations?.[accIndex] || tourData.accommodations[accIndex];
            const newAccommodations = [...tourData.accommodations];
            const duplicatedHotel = JSON.parse(JSON.stringify(hotelToDuplicate));
            duplicatedHotel.name = duplicatedHotel.name + ' (복사)';
            newAccommodations.push(duplicatedHotel);
            setTourData({ ...tourData, accommodations: newAccommodations });

            const duplicatedPageData = pageToDuplicate.data?.pageData
                ? JSON.parse(JSON.stringify(pageToDuplicate.data.pageData))
                : null;

            if (duplicatedPageData) {
                duplicatedPageData.accommodations = duplicatedPageData.accommodations || [...tourData.accommodations];
                duplicatedPageData.accommodations.push(duplicatedHotel);
            }

            newPage = {
                id: newId,
                type: 'accommodation',
                title: pageToDuplicate.title + ' (복사)',
                data: { index: newAccommodations.length - 1, pageData: duplicatedPageData }
            };
        } else if (pageToDuplicate.type === 'detailed-schedule') {
            const currentDayNumber = pageToDuplicate.data?.dayNumber ?? 1;
            const scheduleToDuplicate = pageToDuplicate.data?.pageData?.detailedSchedules?.find((s: any) => s.day === currentDayNumber)
                || tourData.detailedSchedules.find(s => s.day === currentDayNumber);

            const existingDayNumbers = pageConfigs
                .filter(p => p.type === 'detailed-schedule')
                .map(p => p.data?.dayNumber ?? 0);
            const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;

            const duplicatedSchedule = scheduleToDuplicate
                ? JSON.parse(JSON.stringify(scheduleToDuplicate))
                : { day: newDayNumber, title: `DAY ${newDayNumber}`, colorTheme: 'pink', scheduleItems: [] };

            duplicatedSchedule.day = newDayNumber;
            duplicatedSchedule.title = `DAY ${newDayNumber}`;

            const newSchedules = [...tourData.detailedSchedules, duplicatedSchedule];
            setTourData({ ...tourData, detailedSchedules: newSchedules });

            const duplicatedPageData = pageToDuplicate.data?.pageData
                ? JSON.parse(JSON.stringify(pageToDuplicate.data.pageData))
                : null;

            if (duplicatedPageData) {
                duplicatedPageData.detailedSchedules = duplicatedPageData.detailedSchedules || [];
                duplicatedPageData.detailedSchedules.push(duplicatedSchedule);
            }

            newPage = {
                id: newId,
                type: 'detailed-schedule',
                title: `세부 일정 (DAY ${newDayNumber})`,
                data: { dayNumber: newDayNumber, pageData: duplicatedPageData }
            };
        } else if (pageToDuplicate.type === 'tourist-spot') {
            const currentDayNumber = pageToDuplicate.data?.dayNumber ?? 1;
            const touristSpots = tourData.touristSpots || [];

            const spotToDuplicate = pageToDuplicate.data?.pageData?.touristSpots?.find((s: any) => s.day === currentDayNumber)
                || touristSpots.find(s => s.day === currentDayNumber);

            const existingDayNumbers = pageConfigs
                .filter(p => p.type === 'tourist-spot')
                .map(p => p.data?.dayNumber ?? 0);
            const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;

            const duplicatedSpot = spotToDuplicate
                ? JSON.parse(JSON.stringify(spotToDuplicate))
                : { day: newDayNumber, title: `DAY ${newDayNumber}`, colorTheme: 'pink', scheduleItems: [] };

            duplicatedSpot.day = newDayNumber;
            duplicatedSpot.title = `DAY ${newDayNumber}`;

            const newSpots = [...touristSpots, duplicatedSpot];
            setTourData({ ...tourData, touristSpots: newSpots });

            const duplicatedPageData = pageToDuplicate.data?.pageData
                ? JSON.parse(JSON.stringify(pageToDuplicate.data.pageData))
                : null;

            if (duplicatedPageData) {
                duplicatedPageData.touristSpots = duplicatedPageData.touristSpots || [];
                duplicatedPageData.touristSpots.push(duplicatedSpot);
            }

            newPage = {
                id: newId,
                type: 'tourist-spot',
                title: `관광지 리스트 (DAY ${newDayNumber})`,
                data: { dayNumber: newDayNumber, pageData: duplicatedPageData }
            };
        } else {
            const duplicatedPageData = pageToDuplicate.data?.pageData
                ? JSON.parse(JSON.stringify(pageToDuplicate.data.pageData))
                : null;

            newPage = {
                ...pageToDuplicate,
                id: newId,
                title: pageToDuplicate.title + ' (복사)',
                data: { ...pageToDuplicate.data, pageData: duplicatedPageData }
            };
        }

        const newPages = [...pageConfigs];
        newPages.splice(index + 1, 0, newPage);
        setPageConfigs(newPages);
        setCurrentPage(index + 1);
    }, [pageConfigs, tourData, setTourData, setPageConfigs, setCurrentPage]);

    const deletePage = useCallback((index: number) => {
        if (pageConfigs.length <= 1) return;

        const pageToDelete = pageConfigs[index];

        if (pageToDelete.type === 'accommodation') {
            const accIndex = pageToDelete.data?.index ?? 0;
            const newAccommodations = tourData.accommodations.filter((_, i) => i !== accIndex);
            setTourData({ ...tourData, accommodations: newAccommodations });

            const newPages = pageConfigs
                .filter((_, i) => i !== index)
                .map(page => {
                    if (page.type === 'accommodation' && (page.data?.index ?? 0) > accIndex) {
                        return { ...page, data: { ...page.data, index: page.data.index - 1 } };
                    }
                    return page;
                });
            setPageConfigs(newPages);
        } else if (pageToDelete.type === 'detailed-schedule') {
            const dayNumber = pageToDelete.data?.dayNumber ?? 1;
            const newSchedules = tourData.detailedSchedules.filter(s => s.day !== dayNumber);
            setTourData({ ...tourData, detailedSchedules: newSchedules });
            const newPages = pageConfigs.filter((_, i) => i !== index);
            setPageConfigs(newPages);
        } else if (pageToDelete.type === 'tourist-spot') {
            const dayNumber = pageToDelete.data?.dayNumber ?? 1;
            const touristSpots = tourData.touristSpots || [];
            const newSpots = touristSpots.filter(s => s.day !== dayNumber);
            setTourData({ ...tourData, touristSpots: newSpots });
            const newPages = pageConfigs.filter((_, i) => i !== index);
            setPageConfigs(newPages);
        } else {
            const newPages = pageConfigs.filter((_, i) => i !== index);
            setPageConfigs(newPages);
        }

        if (currentPage >= pageConfigs.length - 1) {
            setCurrentPage(Math.max(0, currentPage - 1));
        }
    }, [pageConfigs, tourData, currentPage, setTourData, setPageConfigs, setCurrentPage]);

    const addAccommodationPage = useCallback(() => {
        const newHotel = {
            country: '새 국가',
            city: '새 도시',
            checkIn: '2026.08.01',
            checkOut: '2026.08.03',
            nights: '2박 3일',
            name: '새 호텔',
            type: '호텔',
            stars: 5,
            roomType: '디럭스 더블룸',
            facilities: ['수영장', '피트니스'],
            breakfast: true,
            cityTax: '€3 per person/night',
            description: '호텔 설명을 입력하세요.',
            nearbyAttractions: ['관광지 1', '관광지 2', '관광지 3'],
            images: [
                'https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=1080',
                'https://images.unsplash.com/photo-1631048835184-3f0ceda91b75?w=1080',
                'https://images.unsplash.com/photo-1759223607861-f0ef3e617739?w=1080',
                'https://images.unsplash.com/photo-1722867710896-8b5ddb94e141?w=1080',
                'https://images.unsplash.com/photo-1758973470049-4514352776eb?w=1080'
            ]
        };

        const newAccommodations = [...tourData.accommodations, newHotel];
        setTourData({ ...tourData, accommodations: newAccommodations });

        const newPage: PageConfig = {
            id: Date.now().toString(),
            type: 'accommodation',
            title: '숙소 안내',
            data: { index: newAccommodations.length - 1 }
        };

        const newPages = [...pageConfigs, newPage];
        setPageConfigs(newPages);
        setCurrentPage(newPages.length - 1);
    }, [tourData, pageConfigs, setTourData, setPageConfigs, setCurrentPage]);

    const handleToggleEditMode = useCallback((edit: boolean) => {
        setIsEditMode(edit);
        if (!edit) clearBlurModePages();
    }, [setIsEditMode, clearBlurModePages]);

    const handlePrint = useCallback(async (setIsPrintMode: (p: boolean) => void) => {
        console.log('[PDF] 인쇄 시작...');
        setIsPrintMode(true);
        setIsEditMode(false);

        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[PDF] 인쇄 모드 활성화됨');

        const waitForImages = () => {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    const images = document.querySelectorAll('img');
                    console.log(`[PDF] ${images.length}개 이미지 로드 대기...`);

                    let loadedCount = 0;
                    const totalImages = images.length;

                    const imagePromises = Array.from(images).map((img, index) => {
                        if (img.loading === 'lazy') {
                            img.loading = 'eager';
                            const currentSrc = img.src;
                            img.src = '';
                            img.src = currentSrc;
                            console.log(`[PDF] 이미지 ${index + 1}/${totalImages} lazy→eager 전환`);
                        }

                        if (img.complete && img.naturalWidth > 0) {
                            loadedCount++;
                            return Promise.resolve();
                        }

                        return new Promise<void>((imgResolve) => {
                            const timeout = setTimeout(() => {
                                imgResolve();
                            }, 3000);

                            img.onload = () => {
                                clearTimeout(timeout);
                                loadedCount++;
                                imgResolve();
                            };
                            img.onerror = () => {
                                clearTimeout(timeout);
                                imgResolve();
                            };
                        });
                    });

                    Promise.all(imagePromises).then(() => {
                        console.log(`[PDF] 총 ${loadedCount}/${totalImages} 이미지 로드됨`);
                        resolve();
                    });
                }, 100);
            });
        };

        await waitForImages();
        console.log('[PDF] 이미지 로드 완료');

        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('[PDF] window.print() 호출...');

        try {
            window.print();
        } catch (e) {
            console.error('[PDF] window.print() 에러:', e);
        }

        setIsPrintMode(false);
        console.log('[PDF] 인쇄 모드 종료');
    }, [setIsEditMode]);

    const handleReset = useCallback((customDefaultData: any) => {
        if (confirm('정말 초기화하시겠습니까?\n\n불러온 모든 데이터가 삭제되고 커스텀 기본값으로 초기화됩니다.')) {
            storage.set(STORAGE_KEYS.TOUR_DATA, customDefaultData.tourData);
            if (customDefaultData.pageConfigs) {
                storage.set(STORAGE_KEYS.PAGE_CONFIGS, customDefaultData.pageConfigs);
            } else {
                storage.remove(STORAGE_KEYS.PAGE_CONFIGS);
            }
            storage.remove(STORAGE_KEYS.BLUR_DATA);
            window.location.reload();
        }
    }, []);

    const handleDragStart = useCallback((index: number, setDraggedIndex: (i: number | null) => void) => {
        setDraggedIndex(index);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number, draggedIndex: number | null, setDragOverIndex: (i: number | null) => void) => {
        e.preventDefault();
        if (draggedIndex === null) return;
        setDragOverIndex(index);
    }, []);

    const handleDragEnd = useCallback((
        draggedIndex: number | null,
        dragOverIndex: number | null,
        setDraggedIndex: (i: number | null) => void,
        setDragOverIndex: (i: number | null) => void,
        pageConfigs: PageConfig[],
        setPageConfigs: (configs: PageConfig[]) => void,
        currentPage: number,
        setCurrentPage: (page: number) => void
    ) => {
        if (draggedIndex === null || dragOverIndex === null) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        if (draggedIndex === dragOverIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newPages = [...pageConfigs];
        const [draggedPage] = newPages.splice(draggedIndex, 1);
        newPages.splice(dragOverIndex, 0, draggedPage);

        setPageConfigs(newPages);

        if (currentPage === draggedIndex) {
            setCurrentPage(dragOverIndex);
        } else if (draggedIndex < currentPage && dragOverIndex >= currentPage) {
            setCurrentPage(currentPage - 1);
        } else if (draggedIndex > currentPage && dragOverIndex <= currentPage) {
            setCurrentPage(currentPage + 1);
        }

        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    const handleDragLeave = useCallback((setDragOverIndex: (i: number | null) => void) => {
        setDragOverIndex(null);
    }, []);

    return {
        saveAsDefault,
        loadSettings,
        saveCurrentPage,
        loadPageAtCurrent,
        duplicatePage,
        deletePage,
        handleToggleBlurMode: toggleBlurMode,
        handleAddBlurRegion: addBlurRegion,
        handleRemoveBlurRegion: removeBlurRegion,
        addAccommodationPage,
        handleToggleEditMode,
        handlePrint,
        handleReset,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave
    };
}
