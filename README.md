# 광교삼성H정형외과 체형 분석 LAB — 배포 가이드

이 폴더 안의 파일들을 그대로 사용하면 독립된 웹사이트로 배포할 수 있어요.
브라우저(프론트엔드)는 절대 API 키를 갖고 있지 않고, `api/anthropic.js`(서버)만
API 키를 갖고 있다가 대신 요청을 보내주는 구조예요.

```
gait-app-standalone/
├── index.html          ← 웹사이트 화면 (그대로 두면 됩니다)
├── api/
│   └── anthropic.js    ← API 키를 보관하고 대신 호출해주는 서버 코드
└── package.json
```

## 1. Anthropic API 키 발급받기

1. https://console.anthropic.com 접속 후 회원가입/로그인
2. 왼쪽 메뉴에서 **API Keys** 이동
3. **Create Key** 클릭 → 키 이름 아무거나 입력 (예: gaitlab-prod)
4. 생성된 키(`sk-ant-...`로 시작)를 복사해두기 (다시 볼 수 없으니 꼭 저장해두세요)
5. 결제 수단 등록 필요 (사용한 만큼만 과금되는 방식이에요. 리포트 1건 분석에 드는 비용은
   보통 몇십 원~백 원대예요)

## 2. Vercel로 배포하기 (권장, 무료)

1. https://vercel.com 접속 후 회원가입 (GitHub 계정으로 가입하면 편해요)
2. 이 `gait-app-standalone` 폴더를 GitHub 저장소로 올리기
   - GitHub 데스크톱 앱을 쓰거나, GitHub 웹사이트에서 새 저장소를 만들고
     이 폴더의 파일들을 업로드하면 됩니다.
3. Vercel 대시보드에서 **Add New → Project** 클릭 → 방금 만든 저장소 선택
4. **Environment Variables** 항목에서 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: 1번에서 복사해둔 키(`sk-ant-...`)
5. **Deploy** 클릭
6. 배포가 끝나면 `https://프로젝트이름.vercel.app` 같은 주소가 생겨요. 그 주소로
   접속하면 바로 사용할 수 있어요.
7. (선택) 병원 도메인을 연결하고 싶으면 Vercel 프로젝트 설정 > Domains에서
   갖고 계신 도메인(예: gaitlab.gwanggyosamsungh.com)을 추가하면 돼요.

## 3. 이후 업데이트하는 방법

`index.html`이나 `api/anthropic.js`를 수정한 뒤, GitHub 저장소에 다시 업로드(push)하면
Vercel이 자동으로 재배포해줘요. 별도로 서버를 만지실 필요는 없어요.

## 4. 다른 호스팅을 쓰고 싶다면

Vercel이 아니어도, "서버리스 함수" 또는 "Node.js 서버"를 지원하는 곳이면 어디든 됩니다
(예: Netlify Functions, Cloudflare Workers, 또는 회사 자체 서버에 Node.js + Express로
`api/anthropic.js`의 로직만 옮겨서 실행). 핵심은 딱 하나예요 —
**API 키는 반드시 서버 쪽 환경변수로만 두고, 브라우저 코드에는 절대 넣지 않는 것.**

## 5. 참고 사항

- `index.html`은 환자 검사 기록을 브라우저의 `localStorage`에 저장해요. 즉,
  같은 컴퓨터·같은 브라우저에서만 "최근 분석 기록"이 남아요. 여러 직원 PC에서
  기록을 공유하려면 별도의 데이터베이스 연동이 필요한데, 필요하시면 말씀해주세요.
- 유튜브 영상 추천은 Claude의 웹 검색 기능으로 실제 검색해서 찾은 링크예요.
  가끔 영상이 삭제되었거나 못 찾을 수도 있어요.
- 페이지 하단의 의료 면책 문구("본 해설은 참고자료이며...")는 임의로 지우지 마세요.
