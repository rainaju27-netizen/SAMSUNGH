// api/send-kakao.js
// 윙고(WINGO, 인포뱅크) 알림톡 발송용 프록시 함수입니다.
//
// ⚠️ 윙고는 기본적으로 "웹사이트 로그인 후 수동 발송" 중심 서비스라서,
// 프로그램(API)으로 자동 발송하려면 윙고 고객센터(wingohelp@infobank.net)에
// "서버/API 연동"을 별도로 신청해야 해요. 이미 채널·템플릿이 있으니
// "기존 계정에 API 연동만 추가하고 싶다"고 문의하면 빠르게 진행될 거예요.
//
// 아래 코드는 인포뱅크(비즈고) 계열 API의 일반적인 구조를 기준으로 미리
// 만들어둔 틀입니다. 실제 API 문서를 받으시면 URL/필드명을 문서에 맞게
// 확인 후 조정해야 해요 (특히 인증 방식이 API Key 단순 방식인지,
// 토큰 발급이 필요한 방식인지에 따라 달라질 수 있어요).
//
// 필요한 환경변수 (Vercel 프로젝트 설정 > Environment Variables):
//   WINGO_API_KEY            - 윙고/비즈고에서 발급받은 API 인증키(통합키)
//   WINGO_SENDER_PROFILE_KEY - 카카오톡 발신프로필 키 (채널 연동 시 발급)
//   WINGO_TEMPLATE_CODE      - 승인된 알림톡 템플릿 코드
//   WINGO_SENDER_NUMBER      - 등록된 발신번호 (알림톡 실패 시 문자 대체발송용, 선택)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { phone, message, patientName } = req.body || {};
  if (!phone || !message) {
    res.status(400).json({ error: '전화번호 또는 메시지 내용이 없습니다.' });
    return;
  }

  const apiKey = process.env.WINGO_API_KEY;
  const senderProfileKey = process.env.WINGO_SENDER_PROFILE_KEY;
  const templateCode = process.env.WINGO_TEMPLATE_CODE;

  if (!apiKey || !senderProfileKey || !templateCode) {
    res.status(501).json({
      error: '윙고 API 연동 정보가 아직 설정되지 않았어요. 윙고 고객센터(wingohelp@infobank.net)에 "서버/API 연동" 신청 후, 발급받은 값들을 Vercel 환경변수(WINGO_API_KEY 등)에 넣어주세요.'
    });
    return;
  }

  try {
    // ----- TODO: 실제 문서 받으면 아래 URL/요청 형식을 문서 기준으로 맞춰주세요 -----
    const wingoRes = await fetch('https://kakaoapi.infobank.net/wingo/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        senderProfileKey: senderProfileKey,
        templateCode: templateCode,
        phoneNumber: phone.replace(/-/g, ''),
        variables: {
          '#{환자명}': patientName || '환자',
          '#{운동추천}': message
        }
      })
    });

    const data = await wingoRes.json();
    if (!wingoRes.ok) {
      res.status(wingoRes.status).json({ error: data.message || '윙고 발송 요청이 실패했어요.' });
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: '윙고 발송 중 오류가 발생했습니다: ' + err.message });
  }
}

