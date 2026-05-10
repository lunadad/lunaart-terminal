# Render 배포 가이드 (GitHub + Postgres)

이 저장소는 `render.yaml` 블루프린트를 포함합니다.
Render Dashboard에서 **Blueprint 배포**를 선택하면 아래 리소스가 자동 생성됩니다.

- Web Service: `lunaart-terminal`
- Postgres: `lunaart-postgres`
- Web Service 환경변수 `DATABASE_URL`은 DB connection string으로 자동 연결

## 1) Render에 GitHub 연결
1. Render 로그인
2. Workspace 선택
3. **New > Blueprint** 선택
4. 이 저장소(브랜치: `main`) 선택
5. `render.yaml` 검토 후 생성

## 2) 생성되는 설정
- Build: `npm ci && npm run build`
- Start: `npm run start`
- Region: `oregon`
- Plan: `free`

## 3) 배포 후 확인
1. Web Service deploy logs 확인 (build/start 성공)
2. Service URL 접속 (`https://<service>.onrender.com`)
3. Environment 탭에서 `DATABASE_URL` 주입 확인

## 4) 주의사항 (Free 플랜)
- Free Postgres는 30일 만료 정책이 있으므로 장기 운영 시 유료 플랜 전환 권장
- Free web은 슬립/콜드스타트가 발생할 수 있음
