// src/pages/LifeRecord/LifeRecordPage.jsx
import React, { useEffect, useMemo, useState } from "react";

import StudentSelectSection from "./sections/StudentSelectSection";
import SummarySection from "./sections/SummarySection";
import CommentEditorSection from "./sections/CommentEditorSection";
import ActionBar from "./sections/ActionBar";

/* =========================================================
   Env 호환 (Vite || CRA) + 안전한 URL 합치기
   ========================================================= */
/* eslint-disable no-undef */
let VITE_ENV;
try {
  // Vite에서는 import.meta.env 사용 가능
  VITE_ENV = import.meta.env;
} catch (e) {
  // CRA/Webpack 환경이라면 여기로 들어옴 (문제 없음)
}
/* eslint-enable no-undef */

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const API_TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT) || 15000;

// base와 path를 안전하게 합쳐서 //, /// 같은 중복 슬래시 제거
function apiUrl(path) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}


/** 공통 fetch(JSON 전용, 실패해도 화면은 살려둠) */
async function getJSON(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT);
  try {
    const token = localStorage.getItem("token"); // 로그인 토큰(있다면)
    const res = await fetch(url, {
      signal: ctrl.signal,
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} ${text}`);
    }
    return res.headers.get("content-type")?.includes("application/json")
      ? res.json()
      : res;
  } finally {
    clearTimeout(timer);
  }
}

export default function LifeRecordPage() {
  // --- 상태 ----------------------------------------------------
  const [students, setStudents] = useState([]);        // 드롭다운 옵션
  const [studentId, setStudentId] = useState("");      // 선택 학생 id
  const [studentName, setStudentName] = useState("");  // 선택 학생 이름(프롬프트용)
  const [summary, setSummary] = useState(null);        // 요약(출결/성적/행동)
  const [comment, setComment] = useState("");          // 코멘트
  const [generating, setGenerating] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const actionsEnabled = comment.trim().length > 0;

  // 학년/학기(임시 계산). 백엔드에 학기 API가 있으면 도착 후 덮어쓰기 권장.
  const year = useMemo(() => new Date().getFullYear(), []);
  const semester = useMemo(() => ((new Date().getMonth() + 1) <= 8 ? 1 : 2), []);

  // --- 초기 로딩: 학생 목록 -------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await getJSON(apiUrl(`v1/students/`));
        // data 예: [{id, name, ...}]
        const options = (data || []).map((s) => ({ label: s.name, value: String(s.id) }));
        setStudents(options);
      } catch (e) {
        console.error("학생 목록 조회 실패:", e);
        // 최소한의 폴백(데모)
        setStudents([
          { label: "김민수", value: "1" },
          { label: "이수진", value: "2" },
          { label: "박준호", value: "3" },
        ]);
      }
    })();
  }, []);

  // --- 학생 선택 시: 요약 불러오기 ------------------------------
  const handleStudentChange = async (id) => {
    setStudentId(id);
    const name = students.find((s) => String(s.value) === String(id))?.label || "";
    setStudentName(name);
    setComment(""); // 학생 바뀌면 코멘트 초기화

    if (!id) {
      setSummary(null);
      return;
    }

    setLoadingSummary(true);
    try {
      // 1) 출결 요약
      let attendanceText = "-";
      try {
        const a = await getJSON(apiUrl(`v1/attendance/student/${id}/summary`));
        // 예: { student_id: 1, attendance_rate: "90%" }
        attendanceText =
          a?.attendance_rate
            ? `출석률 ${a.attendance_rate}`
            : (a?.summary || "-");
      } catch (e) {
        console.warn("출결 요약 실패:", e);
      }

      // 2) 성적 요약
      let gradesText = "-";
      try {
        // 권장: /v1/grades?student_id= 혹은 /v1/grades/student/{id}/summary 로 백엔드 보강
        const g = await getJSON(apiUrl(`v1/grades?student_id=${id}`));
        // g 예시: [{subject_name:"국어", score:92}, ...] 또는 {grades:[...]}
        const arr = Array.isArray(g) ? g : (g?.grades || []);
        if (Array.isArray(arr) && arr.length) {
          const top3 = arr.slice(0, 3).map((r) => `${r.subject_name ?? r.subject ?? "과목"} ${r.score ?? "-"}`);
          gradesText = top3.join(" / ");
        }
      } catch (e) {
        console.warn("성적 요약 실패:", e);
      }

      // 3) 행동특성(생활기록부)
      let behaviorText = "-";
      try {
        // 권장: /v1/school_report?student_id=&year=&semester= 로 필터 지원
        const sr = await getJSON(apiUrl(`v1/school_report?student_id=${id}&year=${year}&semester=${semester}`));
        const item = Array.isArray(sr) ? sr[0] : sr;
        behaviorText =
          item?.behavior_summary ||
          item?.teacher_feedback ||
          item?.peer_relation ||
          "-";
      } catch (e) {
        console.warn("행동특성 조회 실패:", e);
      }

      setSummary({
        attendance: attendanceText,
        grades: gradesText,
        behavior: behaviorText,
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  // --- 코멘트 생성 ----------------------------------------------
  const handleGenerate = async () => {
    if (!studentId) return;
    setGenerating(true);
    try {
      const prompt = [
        `학생: ${studentName || studentId}`,
        `출결: ${summary?.attendance || "-"}`,
        `성적: ${summary?.grades || "-"}`,
        `행동특성: ${summary?.behavior || "-"}`,
        "",
        "위 정보를 바탕으로 생활기록부 코멘트를 2~3문장으로 간결하게 작성해줘.",
        "어조: 담임교사 기록체, 구체적 강점 1개 이상, 개선점 1개(있다면) 부드럽게.",
      ].join("\n");

      const ai = await getJSON(apiUrl(`v1/ai_chatbot/`), {
        method: "POST",
        body: JSON.stringify({ question: prompt }),
      });
      const text =
        ai?.data?.answer ||
        ai?.answer ||
        "성실하게 학습에 임하며 또래와의 협력 활동에도 적극적입니다. 자기주도 학습 습관을 강화하면 더욱 성장할 수 있습니다.";
      setComment(text);
    } catch (e) {
      console.error("코멘트 생성 실패:", e);
      setComment("코멘트 생성에 실패했습니다. 내용을 확인 후 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  };

  // --- 저장: 생활기록부 코멘트 -----------------------------------
  const handleSave = async () => {
    if (!studentId) return;
    try {
      const payload = {
        year,
        semester,
        student_id: Number(studentId),
        teacher_feedback: comment, // 또는 behavior_summary 필드 사용 가능
      };
      await getJSON(apiUrl(`v1/school_report/`), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      alert("저장되었습니다.");
    } catch (e) {
      console.error("저장 실패:", e);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // --- 미리보기/인쇄 ---------------------------------------------
  const handlePreview = () => {
    if (!studentId) return;
    window.open(apiUrl(`v1/pdf/report/${studentId}`), "_blank", "noopener,noreferrer");
  };
  const handlePrint = handlePreview;

  return (
    <div className="w-full">
      {/* 헤더와 폭을 맞춤 (Header가 1124px 컨테이너 사용) */}
      <div className="mx-auto max-w-[1124px] space-y-6">
        {/* 상단 2열 그리드: 좌(학생선택), 우(요약) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <StudentSelectSection
              value={studentId}
              onChange={handleStudentChange}
              options={students}
              showGenerateButton={false}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <SummarySection
              data={
                loadingSummary
                  ? { attendance: "불러오는 중…", grades: "불러오는 중…", behavior: "불러오는 중…" }
                  : summary
              }
            />
          </div>

          {/* 하단 전체 폭: 코멘트 에디터 */}
          <div className="col-span-12">
            <CommentEditorSection
              value={comment}
              onChange={setComment}
              onGenerate={handleGenerate}
              canGenerate={!!studentId && !generating}
              generating={generating}
            />
          </div>
        </div>

        {/* 우측 정렬 액션바 */}
        <div className="sticky bottom-0">
          <div className="flex justify-end">
            <ActionBar
              onSave={handleSave}
              onPreview={handlePreview}
              onPrint={handlePrint}
              onRegenerate={handleGenerate}
              disabled={!actionsEnabled || generating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
