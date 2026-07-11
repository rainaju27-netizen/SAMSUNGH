// api/anthropic.js
// 브라우저(프론트엔드)는 이 엔드포인트만 호출합니다. API 키는 여기(서버)에만 있고
// 브라우저로는 절대 내려가지 않습니다. Vercel에 배포하면 자동으로 서버리스 함수로 인식됩니다.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: '서버에 ANTHROPIC_API_KEY 환경변수가 설정되어 있지 않습니다. Vercel 프로젝트 설정 > Environment Variables에서 추가해주세요.' });
    return;
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await anthropicRes.json();
    res.status(anthropicRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: '분석 서버 호출 중 오류가 발생했습니다: ' + err.message });
  }
}
