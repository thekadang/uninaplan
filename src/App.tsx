import { useState, useEffect, useCallback } from 'react';
import { TourData, defaultTourData } from './types/tour-data';
import customDefaultData from './data/custom-default-data.json';
import { BlurData, BlurRegion } from './types/blur-region';
import { PasswordProtection } from './components/PasswordProtection';
import { AppSidebar } from './components/AppSidebar';
import { PageRenderer } from './components/PageRenderer';
import { PageConfig } from './types/page-config';
import { ChevronLeft, ChevronRight, Menu, Download, Settings, Plus, FileDown, Upload, RotateCcw, Eye, EyeOff, Trash2, ImageIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';

// Hooks
import { useTourData } from './hooks/useTourData';
import { usePageConfigs } from './hooks/usePageConfigs';
import { useBlurData } from './hooks/useBlurData';
import { useAppActions } from './hooks/useAppActions';
import { STORAGE_KEYS, LEGACY_STORAGE_KEYS } from './utils/storage';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true' || sessionStorage.getItem(LEGACY_STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });
  const [showNav, setShowNav] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // 통합 커스텀 훅 사용
  const { tourData, setTourData, updateTourData, resetTourData } = useTourData();
  const { blurData, blurModePages, toggleBlurMode, addBlurRegion, removeBlurRegion, clearBlurModePages, resetBlurData } = useBlurData();
  const {
    pageConfigs,
    setPageConfigs,
    currentPage,
    setCurrentPage,
    duplicatePage: duplicatePageConfig,
    reorderPages,
    resetPageConfigs
  } = usePageConfigs();

  const {
    saveAsDefault,
    loadSettings,
    saveCurrentPage,
    loadPageAtCurrent,
    duplicatePage,
    deletePage,
    handleToggleBlurMode,
    handleAddBlurRegion,
    handleRemoveBlurRegion,
    addAccommodationPage,
    handleToggleEditMode,
    handlePrint,
    handleReset,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave
  } = useAppActions({
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
  });

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, setCurrentPage]);

  const nextPage = useCallback(() => {
    if (currentPage < pageConfigs.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pageConfigs.length, setCurrentPage]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollBottom = scrollTop + windowHeight;

      // 페이지 하단에서 100px 이내면 불투명하게
      const isNearBottom = documentHeight - scrollBottom < 100;
      setIsAtBottom(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 확인

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  if (isPrintMode) {
    return (
      <div className="print-mode">
        {/* SVG Filter for blur effect in PDF */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="svg-blur-filter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
            </filter>
          </defs>
        </svg>

        {pageConfigs.map((config, index) => {
          // Generate page-specific class based on type
          const pageClass = `${config.type}-page`;

          return (
            <div
              key={config.id}
              className={`print-page print:break-after-page ${pageClass}`}
            >
              <PageRenderer
                config={config}
                index={index}
                tourData={tourData}
                pageConfigs={pageConfigs}
                isEditMode={isEditMode}
                blurModePages={blurModePages}
                blurData={blurData}
                setTourData={setTourData}
                setPageConfigs={setPageConfigs}
                duplicatePage={duplicatePage}
                deletePage={deletePage}
                handleToggleBlurMode={handleToggleBlurMode}
                handleAddBlurRegion={handleAddBlurRegion}
                handleRemoveBlurRegion={handleRemoveBlurRegion}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-yellow-50">
      {/* SVG Filter for blur effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="svg-blur-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
          </filter>
        </defs>
      </svg>

      <AppSidebar
        currentPage={currentPage}
        pageConfigs={pageConfigs}
        showFileMenu={showFileMenu}
        showNav={showNav}
        isEditMode={isEditMode}
        blurModePages={blurModePages}
        draggedIndex={draggedIndex}
        dragOverIndex={dragOverIndex}
        setShowFileMenu={setShowFileMenu}
        setShowNav={setShowNav}
        setIsEditMode={handleToggleEditMode}
        setCurrentPage={setCurrentPage}
        handlePrint={() => handlePrint(setIsPrintMode)}
        saveAsDefault={saveAsDefault}
        loadSettings={loadSettings}
        saveCurrentPage={saveCurrentPage}
        loadPageAtCurrent={loadPageAtCurrent}
        handleReset={() => handleReset(customDefaultData)}
        handleToggleBlurMode={handleToggleBlurMode}
        handleDragStart={(index) => handleDragStart(index, setDraggedIndex)}
        handleDragOver={(e, index) => handleDragOver(e, index, draggedIndex, setDragOverIndex)}
        handleDragEnd={() => handleDragEnd(draggedIndex, dragOverIndex, setDraggedIndex, setDragOverIndex, pageConfigs, setPageConfigs, currentPage, setCurrentPage)}
        handleDragLeave={() => handleDragLeave(setDragOverIndex)}
      />

      {/* Page Content */}
      <div className="max-w-4xl mx-auto pb-32 px-4 md:px-6 lg:px-0">
        <PageRenderer
          config={pageConfigs[currentPage]}
          index={currentPage}
          tourData={tourData}
          pageConfigs={pageConfigs}
          isEditMode={isEditMode}
          blurModePages={blurModePages}
          blurData={blurData}
          setTourData={setTourData}
          setPageConfigs={setPageConfigs}
          duplicatePage={duplicatePage}
          deletePage={deletePage}
          handleToggleBlurMode={handleToggleBlurMode}
          handleAddBlurRegion={handleAddBlurRegion}
          handleRemoveBlurRegion={handleRemoveBlurRegion}
        />
      </div>

      {/* Page Navigation */}
      <div className={`fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-4 rounded-full shadow-xl px-4 md:px-6 py-2 md:py-3 border border-cyan-200 print:hidden z-[100] transition-all ${isAtBottom ? 'bg-white' : 'bg-white/80 backdrop-blur-sm'
        }`}>
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="p-2 md:p-2 rounded-full hover:bg-cyan-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5 md:w-5 md:h-5 text-cyan-600" />
        </button>

        <div className="flex items-center gap-1.5 md:gap-2">
          {pageConfigs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all touch-manipulation ${currentPage === index
                ? 'w-6 md:w-8 bg-cyan-500'
                : 'w-1.5 md:w-2 bg-gray-300 hover:bg-cyan-300'
                }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pageConfigs.length - 1}
          className="p-2 md:p-2 rounded-full hover:bg-cyan-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          <ChevronRight className="w-5 h-5 md:w-5 md:h-5 text-cyan-600" />
        </button>
      </div>

      {/* Page Counter */}
      <div className={`fixed bottom-4 md:bottom-8 right-4 md:right-8 rounded-full shadow-lg px-3 md:px-4 py-1.5 md:py-2 border border-cyan-200 print:hidden z-[100] transition-all ${isAtBottom ? 'bg-white' : 'bg-white/80 backdrop-blur-sm'
        }`}>
        <span className="text-sm md:text-base text-cyan-600">
          {currentPage + 1} / {pageConfigs.length}
        </span>
      </div>
    </div>
  );
}