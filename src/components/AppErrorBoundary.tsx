import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { clearAllStorage } from '../utils/storage';

interface State {
  hasError: boolean;
  errorMessage?: string;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {
    hasError: false,
    errorMessage: undefined
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('애플리케이션 렌더링 오류:', error, errorInfo);
  }

  private handleReset = () => {
    clearAllStorage();
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">페이지를 불러오는 중 오류가 발생했습니다</h1>
              <p className="text-sm text-gray-600 mt-1">이전 저장 데이터 충돌이 원인일 수 있습니다.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 mb-6">
            <p>GitHub Pages에서 다른 프로젝트와 저장소 키가 겹치면 빈 화면이 나올 수 있습니다.</p>
            <p className="mt-2">아래 버튼을 누르면 이 앱 관련 브라우저 저장 데이터를 초기화하고 새로고침합니다.</p>
            {this.state.errorMessage && (
              <p className="mt-3 text-xs text-gray-500 break-all">오류: {this.state.errorMessage}</p>
            )}
          </div>

          <button
            type="button"
            onClick={this.handleReset}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            저장 데이터 초기화 후 다시 열기
          </button>
        </div>
      </div>
    );
  }
}