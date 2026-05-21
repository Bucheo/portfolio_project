# 포트폴리오 프로젝트

Personal Portfolio 프론트엔드 + Spring Boot 백엔드 풀스택 프로젝트

---

## 📁 프로젝트 구조

```
portfolio_project/
├── frontend/          # React (CRA) 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx               # 메인 앱 컴포넌트
│   │   │   └── components/           # UI 컴포넌트들
│   │   ├── styles/
│   │   │   └── index.css             # 전역 스타일 (Tailwind)
│   │   └── index.tsx                 # CRA 진입점
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── postcss.config.js
├── backend/           # Spring Boot 백엔드
│   ├── src/
│   │   └── main/java/com/noos/backend/
│   │       ├── auth/                 # 인증 (OAuth2, 회원)
│   │       ├── board/                # 게시판
│   │       ├── chat/                 # 실시간 채팅 (WebSocket)
│   │       └── config/               # 보안/CORS/WebSocket 설정
│   ├── build.gradle
│   ├── gradlew
│   └── gradlew.bat
└── portfolio.code-workspace          # VSCode 워크스페이스
```

---

## 🚀 실행 방법

### 프론트엔드 (React)

```bash
cd frontend
npm install
npm start
```
→ http://localhost:3000 에서 실행

### 백엔드 (Spring Boot)

```bash
cd backend
./gradlew bootRun
```
→ http://localhost:8080 에서 실행

> **Windows 사용자:** `./gradlew` 대신 `gradlew.bat bootRun` 사용

---

## ⚙️ 환경 설정 (백엔드)

백엔드 실행 전 `backend/src/main/resources/application-secret.properties` 파일 생성 필요:

```properties
# MySQL 비밀번호
spring.datasource.password=YOUR_DB_PASSWORD

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

# GitHub OAuth2
spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET
```

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18, TypeScript, Tailwind CSS v3, Framer Motion |
| 백엔드 | Spring Boot 3.4, MyBatis, MySQL, WebSocket (STOMP) |
| 인증 | Spring Security, OAuth2 (Google, GitHub) |

---

## 💡 VSCode에서 열기

```bash
code portfolio.code-workspace
```

워크스페이스를 열면 Frontend와 Backend가 각각 별도 폴더로 나뉘어 표시됩니다.
