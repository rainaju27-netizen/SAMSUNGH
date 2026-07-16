// api/records.js
// 환자 분석 기록을 공유 데이터베이스(Vercel Postgres)에 저장/조회하는 API입니다.
// 여러 직원 PC에서 같은 기록을 검색할 수 있게 해주고, 브라우저 저장 용량 제한도 없어집니다.
//
// 사전 준비 (한 번만 하면 됨):
//   1. Vercel 프로젝트 대시보드 > Storage 탭 > Create Database > Postgres 선택
//   2. 만들어진 DB를 이 프로젝트에 연결(Connect Project)
//      → POSTGRES_URL 등 환경변수가 자동으로 설정됩니다 (따로 입력할 필요 없음)
//   3. 테이블은 이 코드가 첫 호출 시 자동으로 만들어줘서, 별도로 SQL을 실행할 필요 없어요.

import { sql } from '@vercel/postgres';

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS analysis_records (
      id TEXT PRIMARY KEY,
      patient_name TEXT,
      chart_no TEXT,
      dob TEXT,
      phone TEXT,
      test_date TEXT,
      saved_at TIMESTAMPTZ DEFAULT now(),
      data JSONB NOT NULL
    );
  `;
}

export default async function handler(req, res) {
  try {
    await ensureTable();

    if (req.method === 'POST') {
      const { id, patientName, chartNo, dob, phone, testDate, data } = req.body || {};
      if (!id || !data) {
        res.status(400).json({ error: 'id와 data가 필요합니다.' });
        return;
      }

      await sql`
        INSERT INTO analysis_records (id, patient_name, chart_no, dob, phone, test_date, data)
        VALUES (${id}, ${patientName || ''}, ${chartNo || ''}, ${dob || ''}, ${phone || ''}, ${testDate || ''}, ${JSON.stringify(data)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          patient_name = EXCLUDED.patient_name,
          chart_no = EXCLUDED.chart_no,
          dob = EXCLUDED.dob,
          phone = EXCLUDED.phone,
          test_date = EXCLUDED.test_date,
          data = EXCLUDED.data;
      `;

      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, patient_name, chart_no, dob, phone, test_date, saved_at, data
        FROM analysis_records
        ORDER BY saved_at DESC
        LIMIT 1000;
      `;
      res.status(200).json({ records: rows });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) {
        res.status(400).json({ error: '삭제할 기록의 id가 필요합니다.' });
        return;
      }
      await sql`DELETE FROM analysis_records WHERE id = ${id};`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({
      error: '기록 서버 오류: ' + err.message + ' (Vercel Storage에서 Postgres 데이터베이스를 만들고 프로젝트에 연결했는지 확인해주세요)'
    });
  }
}
