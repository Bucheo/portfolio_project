-- =============================================================
-- portfolio_db 초기화 스크립트
-- 대상 DB : MySQL 8.x  |  인코딩 : utf8mb4
-- =============================================================

-- =============================================================
-- 1. 기존 테이블 삭제 (순서 중요: FK 있는 테이블 먼저)
-- =============================================================
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- =============================================================
-- 2. 데이터베이스 생성 & 선택
-- =============================================================
CREATE DATABASE IF NOT EXISTS portfolio_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- =============================================================
-- 3. users 테이블
--    JPA Entity: com.portfolio.backend.auth.entity.User
-- =============================================================
CREATE TABLE users (
    id           BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '사용자 PK',
    email        VARCHAR(100) NOT NULL                 COMMENT '이메일 (로그인 ID)',
    password     VARCHAR(255) NOT NULL                 COMMENT 'BCrypt 암호화 비밀번호',
    username     VARCHAR(50)  NOT NULL                 COMMENT '표시 이름',
    role         VARCHAR(20)  NOT NULL DEFAULT 'USER'  COMMENT '권한 (USER | ADMIN)',
    organization VARCHAR(100)     NULL                 COMMENT '소속 기관',
    github_url   VARCHAR(255)     NULL                 COMMENT 'GitHub 프로필 URL',
    created_at   DATETIME         NULL                 COMMENT '가입일 (@CreatedDate 자동)',

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    INDEX      idx_users_role  (role)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='회원 테이블';

-- =============================================================
-- 4. refresh_tokens 테이블  (확장용 — 현재 AuthService는 미사용)
-- =============================================================
CREATE TABLE refresh_tokens (
    id         BIGINT      NOT NULL AUTO_INCREMENT COMMENT 'PK',
    user_id    BIGINT      NOT NULL               COMMENT 'users.id FK',
    token      VARCHAR(512) NOT NULL              COMMENT 'Refresh JWT 문자열',
    expires_at DATETIME    NOT NULL               COMMENT '만료 일시',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발급 일시',
    revoked    TINYINT(1)  NOT NULL DEFAULT 0     COMMENT '폐기 여부 (0=유효, 1=폐기)',

    PRIMARY KEY (id),
    UNIQUE KEY uq_refresh_token  (token(255)),
    INDEX      idx_rt_user_id    (user_id),
    CONSTRAINT fk_rt_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='리프레시 토큰 저장 테이블 (확장용)';

-- =============================================================
-- 5. 스키마 검증
-- =============================================================
DESCRIBE users;
DESCRIBE refresh_tokens;
SHOW TABLES;