import React, { useEffect, useState } from "react";
import api from "../../api/client";
import { Button } from "@/components/ui/button";

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("2025-07-22");
  const [endDate, setEndDate] = useState("2025-07-26");
  const [message, setMessage] = useState("");

  // ✅ 개요 API 호출
  useEffect(() => {
    api
      .get("/reports/overview")
      .then((res) => {
        setOverview(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Overview 불러오기 실패:", err);
        setLoading(false);
      });
  }, []);

  // ✅ 보고서 생성
  const handleGenerate = () => {
    if (!reportType) {
      alert("보고서 유형을 선택해주세요.");
      return;
    }
    api
      .post("/reports/generate", {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
      })
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("보고서 생성 실패:", err);
      });
  };

  // ✅ 미리보기
  const handlePreview = () => {
    if (!reportType) {
      alert("보고서 유형을 선택해주세요.");
      return;
    }
    api
      .get("/reports/preview", {
        params: {
          report_type: reportType,
          start_date: startDate,
          end_date: endDate,
        },
      })
      .then((res) => {
        setMessage(res.data.data.summary);
      })
      .catch((err) => {
        console.error("미리보기 실패:", err);
      });
  };

  if (loading) return <p className="p-6">⏳ 로딩 중...</p>;
  if (!overview) return <p className="p-6">데이터 없음</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">보고서 작성</h1>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h2 className="text-lg font-semibold">보고서 자동 생성</h2>

        {/* 드롭다운 + 날짜 선택 */}
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border p-2 rounded w-60"
          >
            <option value="">보고서 유형 선택</option>
            {overview.available_types.map((t, i) => (
              <option key={i} value={t}>
                {t === "weekly"
                  ? "주간 학급 현황"
                  : t === "monthly"
                  ? "월간 학사 보고서"
                  : "성적 분석 보고서"}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <span className="self-center">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <Button onClick={handleGenerate} className="bg-blue-500 text-white">
            보고서 생성
          </Button>
          <Button onClick={handlePreview} className="bg-blue-300 text-white">
            미리보기
          </Button>
        </div>

        {/* 안내 메시지 */}
        <p className="text-gray-500 mt-2">
          마지막 생성: {overview.last_report.type} (
          {overview.last_report.date}) | 총 {overview.total_reports}개 보고서 생성됨
        </p>
      </div>

      {/* 미리보기 / 메시지 영역 */}
      {message && (
        <div className="bg-gray-100 p-4 rounded">
          <strong>결과:</strong> {message}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;