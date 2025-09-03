// src/pages/ReportsMonthlyPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ReportsMonthlyPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/monthly/full", {
        params: { class_id: 3, month: "2025-07" },
      })
      .then((res) => {
        setReport(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("월간 보고서 로드 실패:", err);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">월간 학사 보고서</h1>
        <Button variant="outline">PDF 내보내기</Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-gray-500">수업일수</p>
          <p className="text-xl font-bold">{summary.school_days}일</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">출석률</p>
          <p className="text-xl font-bold">{summary.attendance_rate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">상담 건수</p>
          <p className="text-xl font-bold">{summary.counseling}건</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">사고 건수</p>
          <p className="text-xl font-bold">{summary.incidents}건</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">교육과정 진도율</p>
          <p className="text-xl font-bold">{summary.curriculum_progress}%</p>
        </Card>
      </div>

      {/* 상세 보고 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">상세 보고</h2>
        <ul className="space-y-3">
          <li><strong>교육과정 운영: </strong>{details.education}</li>
          <li><strong>학생 현황: </strong>{details.students}</li>
          <li><strong>학부모 소통: </strong>{details.parents}</li>
          <li><strong>특이사항: </strong>{details.notes}</li>
        </ul>
      </div>
    </div>
  );
}

export default ReportsMonthlyPage;
