# 트러블슈팅

## ❌ 문제: GitHub Pages에서 `gh-pages` 브랜치 배포 시 빈 화면만 표시됨

### 증상
- `https://thekadang.github.io/uninaplan/` 접속 시 UI가 전혀 보이지 않음
- 같은 저장소의 다른 브랜치를 Pages 소스로 잡으면 화면이 보이는 것처럼 보일 수 있음
- 브라우저에 남아 있던 이전 저장 데이터에 따라 증상이 달라질 수 있음

### 원인
- 브라우저 저장소 키가 `tourData`, `pageConfigs`, `blurData`, `tour-authenticated`처럼 일반 이름이라 다른 GitHub Pages 프로젝트와 충돌할 수 있었음
- GitHub Pages 프로젝트 사이트들은 같은 origin(`https://thekadang.github.io`)을 공유하므로 localStorage/sessionStorage 키가 앱 간에 섞일 수 있음
- 충돌한 저장 데이터 형식이 현재 앱이 기대하는 구조와 다르면 초기 훅 렌더 단계에서 예외가 발생해 빈 화면이 됨

### 해결 방법
1. 저장 키를 `uninaplan:*` 네임스페이스로 분리
2. 레거시 키가 있으면 새 키로 자동 마이그레이션
3. `tourData`, `pageConfigs`, `blurData`를 불러올 때 배열/객체 형식을 검증하고 잘못된 값은 기본값으로 복구
4. 렌더 예외가 나도 빈 화면 대신 복구 UI가 보이도록 최상단 에러 바운더리 추가

### 예방 팁
- GitHub Pages 프로젝트 사이트는 저장소를 origin 단위로 공유하므로 저장 키를 앱별로 반드시 구분할 것
- 저장 데이터 스키마가 바뀌는 훅에는 형식 검증과 기본값 복구 로직을 둘 것
- 최상단 에러 바운더리를 유지해 빈 화면 대신 복구 경로를 제공할 것