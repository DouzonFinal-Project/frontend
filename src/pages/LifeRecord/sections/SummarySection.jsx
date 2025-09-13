import React from "react";

export default function SummarySection({ data, loading }) {
  // data가 없거나(미선택) 로딩 중이어도 표는 항상 렌더링
  // /school_report/full 응답 형태: { attendance:[], grades:[], reports:[] }
// SummarySection.jsx
  const attendanceSummary = (() => {
     if (loading) return "불러오는 중…";
    const arr = data?.attendance;
    if (typeof arr === "string") return arr || "출결 데이터 없음";
     if (Array.isArray(arr) && arr.length) {
       const absents = arr.filter(a => a.status === "결석").length;
       return `${arr.length}일 기록 (결석 ${absents}회)`;
     }
     return "출결 데이터 없음";
   })();

  const gradesSummary = (() => {
     if (loading) return "불러오는 중…";
    const arr = data?.grades;
    if (typeof arr === "string") return arr || "성적 데이터 없음";
     if (Array.isArray(arr) && arr.length) {
       return arr.slice(0, 3).map(g => `${g.subject ?? g.subject_name} ${g.score}`).join(" / ");
     }
     return "성적 데이터 없음";
   })();

  const behaviorSummary = (() => {
     if (loading) return "불러오는 중…";
    const reports = data?.reports;
    if (typeof data?.behavior === "string") return data.behavior || "행동특성 데이터 없음";
     if (Array.isArray(reports) && reports.length) {
       const latest = reports[reports.length - 1];
       const merged = [
         latest.behavior_summary,
         latest.peer_relation,
         latest.career_aspiration,
         latest.teacher_feedback,
       ].filter(Boolean).join(" / ");
       return merged || "행동특성 데이터 없음";
     }
     return "행동특성 데이터 없음";
   })();


  const rows = [
    ["출결", attendanceSummary],
    ["성적", gradesSummary],
    ["행동특성", behaviorSummary],
  ];

  return (
    <section className="w-full max-w-[1100px] border border-[#E1E5E9] rounded bg-white">
      {/* 헤더 */}
      <div className="grid grid-cols-2 h-[25px]" role="row">
        <div className="bg-[#34495E] flex items-center justify-center" role="columnheader">
          <span className="text-white text-xs">항목</span>
        </div>
        <div className="bg-[#34495E] flex items-center justify-center" role="columnheader">
          <span className="text-white text-xs">내용</span>
        </div>
      </div>

      {/* 본문 표: 항상 렌더링 */}
      {rows.map(([label, content], idx) => (
        <div key={`${label}-${idx}`} className="grid grid-cols-2 h-[35px]" role="row">
          <div className="bg-[#ECF0F1] flex items-center justify-center px-4" role="cell">
            <span className="text-[#2C3E50] text-[11px]">{label}</span>
          </div>
          <div className="bg-white flex items-center px-4" role="cell">
            <span className="text-[#2C3E50] text-[11px] break-words">{content || "-"}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
