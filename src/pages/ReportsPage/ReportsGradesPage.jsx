import React, { useEffect, useState } from "react";
import api from "../api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ReportsGradesPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/grades/full", {
        params: { class_id: 3, exam_period: "2025-07-15_to_2025-07-19" },
      })
      .then((res) => {
        setReport(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("성적 분석 보고서 로드 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">⏳ 로딩 중...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!report) return <p className="p-6">데이터 없음</p>;

  const { summary, subject_analysis, improvement } = report;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">성적 분석 보고서</h1>
        <Button variant="outline">PDF 내보내기</Button>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-gray-500">평균 점수</p>
          <p className="text-xl font-bold">{summary.avg_score}점</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">최고 점수</p>
          <p className="text-xl font-bold">{summary.max_score}점</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">최저 점수</p>
          <p className="text-xl font-bold">{summary.min_score}점</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">80점 이상 학생</p>
          <p className="text-xl font-bold">{summary.students_over_80}명</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">우수 학생</p>
          <p className="text-xl font-bold">{summary.excellent}명</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-500">A등급 비율</p>
          <p className="text-xl font-bold">{summary.grade_A_ratio}</p>
        </Card>
      </div>

      {/* 과목별 성적 분석 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">과목별 성적 분석</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">과목</th>
              <th className="border px-4 py-2">평균</th>
              <th className="border px-4 py-2">최고</th>
              <th className="border px-4 py-2">최저</th>
              <th className="border px-4 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {subject_analysis.map((s, i) => (
              <tr key={i}>
                <td className="border px-4 py-2">{s.subject}</td>
                <td className="border px-4 py-2">{s.avg}</td>
                <td className="border px-4 py-2">{s.max}</td>
                <td className="border px-4 py-2">{s.min}</td>
                <td className="border px-4 py-2">{s.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 개선 방안 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">개선 방안</h2>
        <p>{improvement}</p>
      </div>
    </div>
  );
}

export default ReportsGradesPage;
