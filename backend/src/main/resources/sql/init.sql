-- =============================================================
-- portfolio_db 초기화 스크립트
-- 대상 DB : MySQL 8.x
-- 인코딩  : UTF-8 (utf8mb4)
-- 용도    : 로그인 / 회원가입 / 프로필 관리 기능에 필요한 스키마
-- =============================================================

-- 1. 데이터베이스 생성
-- =============================================================
CREATE DATABASE IF NOT EXISTS portfolio_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- =============================================================
-- 2. users 테이블
--    - JPA Entity: com.portfolio.backend.auth.entity.User
--    - 회원가입(POST /api/auth/signup), 로그인(POST /api/auth/login),
--      토큰 갱신(POST /api/auth/refresh), 프로필 조회/수정에 사용
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '사용자 PK',
    email       VARCHAR(100)    NOT NULL                 COMMENT '이메일 (로그인 ID, UNIQUE)',
    password    VARCHAR(255)    NOT NULL                 COMMENT 'BCrypt 암호화 비밀번호',
    username    VARCHAR(50)     NOT NULL                 COMMENT '표시 이름',
    role        VARCHAR(20)     NOT NULL DEFAULT 'USER'  COMMENT '권한 (USER | ADMIN)',
    organization VARCHAR(100)   NULL                     COMMENT '소속 기관 (UpdateProfileRequest)',
    github_url  VARCHAR(255)    NULL                     COMMENT 'GitHub 프로필 URL (UpdateProfileRequest)',
    created_at  DATETIME        NULL                     COMMENT '가입일 (@CreatedDate 자동 삽입)',

    PRIMARY KEY (id),
    UNIQUE  KEY uq_users_email (email),
    INDEX   idx_users_role (role)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='회원 테이블';

-- =============================================================
-- 3. refresh_tokens 테이블  (선택 - 토큰 무효화가 필요할 때 사용)
--    현재 AuthService.refresh() 는 DB 저장 없이 JWT 서명만 검증하므로
--    이 테이블은 확장용입니다. 필요 시 AuthService 로직을 업데이트하세요.
-- =============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT  COMMENT 'PK',
    user_id     BIGINT          NOT NULL                 COMMENT 'users.id FK',
    token       VARCHAR(512)    NOT NULL                 COMMENT 'Refresh JWT 문자열',
    expires_at  DATETIME        NOT NULL                 COMMENT '만료 일시',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발급 일시',
    revoked     TINYINT(1)      NOT NULL DEFAULT 0       COMMENT '폐기 여부 (0=유효, 1=폐기)',

    PRIMARY KEY (id),
    UNIQUE  KEY uq_refresh_token (token(255)),
    INDEX   idx_rt_user_id (user_id),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='리프레시 토큰 저장 테이블 (확장용)';

-- =============================================================
-- 4. 테스트용 초기 데이터  (개발 환경 전용 — 운영 적용 시 삭제)
--    비밀번호 원문: Admin1234!
--    BCrypt 해시 생성 방법:
--      Java: new BCryptPasswordEncoder().encode("Admin1234!")
--      또는 POST /api/auth/signup 으로 가입 후 role을 ADMIN으로 수동 변경
-- =============================================================
-- INSERT IGNORE INTO users (email, password, username, role, created_at)
-- VALUES (
--     'admin@portfolio.dev',
--     '<BCrypt 해시를 여기에 입력>',
--     'Admin',
--     'ADMIN',
--     NOW()
-- );

-- =============================================================
-- 5. 컬럼 확인 (실행 결과로 스키마 검증)
-- =============================================================
DESCRIBE users;
