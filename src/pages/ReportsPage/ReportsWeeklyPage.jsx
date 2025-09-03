// src/pages/ReportsWeeklyPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client"; // axios 인스턴스 (baseURL 설정)

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ReportsWeeklyPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  // ✅ API 호출
  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/weekly/full", {
        params: {
          class_id: 3,
          start_date: "2025-07-22",
          end_date: "2025-07-26",
        },
      })
      .then((res) => {
        setReport(res.data); // { summary: {...}, details: {...} }
        setLoading(false);
      })
      .catch((err) => {
        console.error("주간 보고서 로드 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">⏳ 로딩 중...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!report) return <p className="p-6">데이터 없음</p>;

  const { summary, details } = report;

  return (
    <div className="p-6 space-y-6">
      {/* 제목 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">주간 학급 현황 보고서</h1>
        <Button variant="outline">PDF 내보내기</Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-gray-500">총 학생 수</p>
          <p className="text-xl font-bold">{summary.total_students}명</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">출석률</p>
          <p className="text-xl font-bold">{summary.attendance_rate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">평균 성적</p>
          <p className="text-xl font-bold">{summary.avg_score}점</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">과제 미제출</p>
          <p className="text-xl font-bold">{summary.missing_assignments}건</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">상담</p>
          <p className="text-xl font-bold">{summary.counseling}건</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">특이사항</p>
          <p className="text-xl font-bold">{summary.special_notes}건</p>
        </Card>
      </div>

      {/* 상세 보고 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">상세 보고</h2>
        <ul className="space-y-3">
          <li>
            <strong>환경 현황: </strong>
            {details.environment}
          </li>
          <li>
            <strong>학습 현황: </strong>
            {details.learning}
          </li>
          <li>
            <strong>상담 현황: </strong>
            {details.counseling}
          </li>
          <li>
            <strong>특이사항: </strong>
            {details.special_notes}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ReportsWeeklyPage;
