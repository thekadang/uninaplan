# 배포 가이드 (GitHub Pages)

이 문서는 현재 프로젝트를 `https://github.com/thekadang/uninaplan` 저장소 기준으로 GitHub Pages에 배포하는 방법을 설명합니다.

## 1. 현재 배포 방식

이 프로젝트는 두 가지 배포 경로를 지원합니다.

1. `npm run deploy`
   로컬에서 빌드 후 `gh-pages` 브랜치로 바로 업로드합니다.
2. `main` 브랜치 푸시
   GitHub Actions가 빌드 후 Pages에 자동 배포합니다.

---

## 2. 수동 배포 (`npm run deploy`)

### 2.1 사전 설정

- `vite.config.ts`의 `base`는 `'/uninaplan/'`로 설정되어 있어야 합니다.
- `package.json`의 `homepage`는 `https://thekadang.github.io/uninaplan` 이어야 합니다.
- 로컬 `.env` 파일에 `VITE_APP_PASSWORD`가 설정되어 있어야 합니다.

### 2.2 실행 명령

```bash
npm run deploy
```

### 2.3 동작 방식

`npm run deploy`는 내부적으로 [scripts/deploy_manual.ps1](/F:/The kadang/code_project/codex/uninaplan/scripts/deploy_manual.ps1)를 실행합니다.

이 스크립트는 아래 순서로 동작합니다.

1. 프로덕션 빌드 실행
2. `build/` 폴더를 Git 저장소로 준비
3. `gh-pages` 브랜치 생성 또는 갱신
4. `https://github.com/thekadang/uninaplan.git`로 강제 푸시

### 2.4 GitHub 설정

처음 한 번은 GitHub 저장소의 **Settings > Pages**에서 아래처럼 설정해야 합니다.

- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/ (root)`

배포 후 접속 주소는 `https://thekadang.github.io/uninaplan/` 입니다.

---

## 3. 자동 배포 (`main` 푸시)

자동 배포 워크플로는 [.github/workflows/deploy.yml](/F:/The kadang/code_project/codex/uninaplan/.github/workflows/deploy.yml)에 있습니다.

### 3.1 필요한 GitHub 설정

GitHub 저장소에서 아래 두 가지를 설정해야 합니다.

1. **Settings > Pages**
   Source를 `GitHub Actions`로 선택
2. **Settings > Secrets and variables > Actions**
   `VITE_APP_PASSWORD` secret 추가

### 3.2 동작 방식

`main` 브랜치에 푸시하면 워크플로가 아래 순서로 실행됩니다.

1. 의존성 설치
2. `VITE_APP_PASSWORD` secret 존재 여부 검증
3. 프로덕션 빌드
4. GitHub Pages 배포

Secret이 없으면 잘못된 비밀번호 값으로 배포되는 것을 막기 위해 워크플로가 실패하도록 설정되어 있습니다.

---

## 4. 확인 포인트

- 빌드 결과 `build/index.html`의 정적 경로가 `/uninaplan/`으로 시작해야 합니다.
- GitHub Pages 최종 주소는 `https://thekadang.github.io/uninaplan/` 입니다.
- 수동 배포와 자동 배포 중 하나만 GitHub Pages 소스로 선택해서 운영하는 것이 안전합니다.