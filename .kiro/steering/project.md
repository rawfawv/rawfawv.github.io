# rawfawv.github.io 프로젝트

## 개요
GitHub Pages로 호스팅되는 개인 포트폴리오 사이트. 브랜드명은 "CACACACA", 작가명은 Jiwoon Chung.

## 기술 스택
- 순수 HTML, CSS, JavaScript (프레임워크/빌드 도구 없음)
- 별도의 패키지 매니저나 번들러 미사용
- 정적 파일 직접 서빙

## 프로젝트 구조
```
/
├── index.html          # 메인 포트폴리오 페이지
├── main.js             # 갤러리 인터랙션 (드래그, 뷰 전환)
├── style.css           # 전체 스타일 (CSS Variables 사용)
├── assets/             # 포트폴리오 이미지
└── fish-game/          # 서브 프로젝트: 어항 물고기 게임
    └── index.html      # 단일 파일 게임 (HTML+CSS+JS 인라인)
```

## 디자인 시스템
- 컬러: `--bg: #F5F7F8`, `--ink: #121212`, `--accent-orange: #e06d48`
- 폰트: Syne(디스플레이), Inter(본문), DM Mono(코드/레이블)
- 스타일: NYT Magazine 에디토리얼 + Swiss 미니멀리즘

## 코딩 컨벤션
- 한국어 주석 사용
- 외부 라이브러리 최소화 (vanilla JS 선호)
- CSS는 BEM 대신 직관적인 클래스명 사용
- 접근성 고려 (aria-label, semantic HTML)
- 반응형 디자인 (모바일 768px 기준)

## 주요 기능
### 메인 페이지
- 두 가지 뷰 모드: 한줄보기(shelf), 모아보기(grid)
- 드래그 기반 가로 스크롤 + 모멘텀 효과
- 마우스/터치/휠 모두 지원

### fish-game
- Canvas 기반 인터랙티브 게임
- 물고기 키우기 → 질문 → 엔딩 분기
- 단일 HTML 파일에 모든 코드 포함

## 배포
- GitHub Pages 자동 배포 (main 브랜치 push 시)
- 도메인: rawfawv.github.io
