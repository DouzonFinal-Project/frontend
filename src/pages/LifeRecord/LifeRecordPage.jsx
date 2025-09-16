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

/** 응답에서 흔한 껍데기 제거: {data:...} | {result:...} | {results:[...]} | 그 외 원본 */
function unwrap(x) {
  if (x == null) return x;
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.results)) return x.results;
  if (Array.isArray(x?.items)) return x.items;
  if (x && typeof x === "object") {
    if (x.data && typeof x.data === "object" && !Array.isArray(x.data)) return x.data;
    if (x.result && typeof x.result === "object") return x.result;
  }
  return x;
}
// 글자수 제한(열 너비에 맞춰 잘라서 … 처리)
function clamp(text, max = 120) {
  if (!text) return "-";
  const s = String(text);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// 과목 ID → 이름 매핑 (서버 /subjects가 있으면 fetch해서 덮어씀)
const FALLBACK_SUBJECT_MAP = {
  1: "국어",
  2: "수학",
  3: "영어",
  4: "과학",
  5: "사회",
};

async function loadSubjectMap(apiUrl) {
  try {
    const raw = await getJSON(apiUrl(`subjects`));
    const arr = unwrap(raw);

    if (Array.isArray(arr) && arr.length) {
      const m = {};
      for (const it of arr) {
        const id = Number(it?.id ?? it?.subject_id);
        const name = it?.name ?? it?.subject_name;
        if (Number.isFinite(id) && name) m[id] = name;
      }
      if (Object.keys(m).length) {
        return m;
      }
    }
    // subjects 응답이 비어있으면 기본 맵 사용
    return FALLBACK_SUBJECT_MAP;
  } catch (e) {
    // 핸들링을 명시적으로 넣어서 no-empty 회피 + 로그 남김
    console.warn("subjects fetch failed -> fallback map 사용", e);
    return FALLBACK_SUBJECT_MAP;
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
        const data = await getJSON(apiUrl(`students/`));
        const list = unwrap(data) || [];

      // 3) 타입/스키마 보정: id, name이 없으면 최대한 유추
          const normalized = list.map((s) => ({
        // label은 name/username/title 등 흔한 키에서 우선 추출
          label: s?.student_name ?? s?.name ?? s?.username ?? s?.title ?? String(s?.id ?? ''),
        // value는 문자열화된 id(없으면 label)
          value: String(s?.id ?? s?.value ?? s?.uuid ?? s?.pk ?? (s?.student_name ?? s?.name ?? '')),
        // 필요하면 원본도 보관
          _raw: s,
        }));
        
        setStudents(normalized);
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
    // 0) 과목 맵 준비 (/subjects 있으면 사용, 없으면 기본 맵)
    const SUBJECT_MAP = await loadSubjectMap(apiUrl);

    // 1) 출결 요약 -------------------------------------------------
    let attendanceText = "-";
    try {
      let list = [];
      try {
        const aRaw = await getJSON(apiUrl(`attendance?student_id=${encodeURIComponent(id)}`));
        const aUn = unwrap(aRaw);   // ✅ 여기서 aUn 선언
        const all = Array.isArray(aUn) ? aUn : (Array.isArray(aUn?.records) ? aUn.records : []);
        list = all.filter((r) => String(r.student_id) === String(id)); // 해당 학생만
      } catch {
        const aRaw = await getJSON(apiUrl(`attendance/student/${id}/summary`));
        const a = unwrap(aRaw) || {};
        if (a?.attendance_rate) attendanceText = `출석률 ${a.attendance_rate}`;
      }

      if (Array.isArray(list) && list.length) {
        const mapStatus = (v) => {
          const s = String(v ?? "").toLowerCase().replace(/\s+/g, "");
          if (/(출석|present|attendance)/.test(s)) return "present";
          if (/(지각|late)/.test(s)) return "late";
          if (/(조퇴|earlyleave|early)/.test(s)) return "early";
          if (/(결석|absent)/.test(s)) return "absent";
          return null;
        };
        const counts = list.reduce((acc, r) => {
          const k = mapStatus(r?.status ?? r?.attendance_status);
          if (k && acc[k] != null) acc[k] += 1;
          return acc;
        }, { present: 0, late: 0, early: 0, absent: 0 });

        attendanceText =
          `출석 ${counts.present}회, 지각 ${counts.late}회, 조퇴 ${counts.early}회` +
          (counts.absent ? `, 결석 ${counts.absent}회` : "");
      }
    } catch (e) {
      console.warn("출결 요약 실패:", e);
    }

    // 2) 성적 요약 -------------------------------------------------
    // CSV: id,student_id,subject_id,term,average_score,grade_letter
    let gradesText = "-";
    try {
      const gRaw = await getJSON(apiUrl(`grades?student_id=${encodeURIComponent(id)}`));
      const gUn = unwrap(gRaw) || [];
      const arr = Array.isArray(gUn) ? gUn : (Array.isArray(gUn?.grades) ? gUn.grades : []);

      const filtered = arr.filter(r => String(r.student_id) === String(id)); // 🔧
      if (filtered.length) {
        const normTerm = (t) => {
          const s = String(t ?? "").replace(/\s+/g, "");
          if (/^1학기|중간|mid(dle)?$/i.test(s)) return "중간고사";
          if (/^2학기|기말|final$/i.test(s)) return "기말고사";
          if (s === "1") return "중간고사";
          if (s === "2") return "기말고사";
          return "기말고사"; // 기본
        };
        const byTerm = { "중간고사": {}, "기말고사": {} };
        for (const r of filtered) {
          const sid = Number(r?.subject_id);
          const term = normTerm(r?.term);
          const score = r?.average_score ?? r?.score ?? r?.point;
          if (!Number.isFinite(sid) || !term) continue;
          byTerm[term][sid] = score;
        }

        const subjectsOrder = [1, 2, 3, 4, 5]; // 국/수/영/사/과
        const line = (label, map) =>
          label + " " +
          subjectsOrder
            .map((sid) => `${SUBJECT_MAP[sid] ?? `과목${sid}`} (${map?.[sid] ?? "-"})`)
            .join(" / ");

        const lines = [];
        if (Object.keys(byTerm["중간고사"]).length) lines.push(line("중간고사", byTerm["중간고사"]));
        if (Object.keys(byTerm["기말고사"]).length) lines.push(line("기말고사", byTerm["기말고사"]));
        if (lines.length) gradesText = lines.join("  |  ");
      }
    } catch (e) {
      console.warn("성적 요약 실패:", e);
    }

    // 3) 행동특성(생활기록부) --------------------------------------
    let behaviorText = "-";
    try {
      const srRaw = await getJSON(apiUrl(`school_report?student_id=${encodeURIComponent(id)}`));

      const un = unwrap(srRaw);
      const arr = Array.isArray(un) ? un : (Array.isArray(un?.reports) ? un.reports : []);
      const item = arr.find(r => String(r.student_id) === String(id)) || arr[0]; // 🔧
      const picked =
        item?.behavior_summary ??
        item?.teacher_feedback ??
        item?.peer_relation ??
        item?.comment;
      behaviorText = clamp(picked, 120);
    } catch (e) {
      console.warn("행동특성 조회 실패:", e);
    }

    setSummary({
      attendance: attendanceText || "-",
      grades: gradesText || "-",
      behavior: behaviorText || "-",
    });
  } finally {
    setLoadingSummary(false);
  }
  };
  
  // --- 코멘트 생성 (개선된 API 연동) ----------------------------------------------
const handleGenerate = async () => {
  if (!studentId) return;
  
  setGenerating(true);
  try {
    // 1) 먼저 해당 학생의 생활기록부 데이터가 있는지 확인 및 가져오기
    let reportId = null;
    
    try {
      const existingReports = await getJSON(apiUrl(`school_report/student/${studentId}`));
      const reports = unwrap(existingReports) || [];
      
      // 현재 연도/학기에 해당하는 기록 찾기
      const currentReport = reports.find(r => 
        r.year === year && r.semester === semester
      );
      
      if (currentReport) {
        reportId = currentReport.id;
      } else {
        // 기존 기록이 없으면 새로 생성
        const newReportData = {
          year,
          semester,
          student_id: Number(studentId),
          // 요약 정보를 기반으로 초기 데이터 설정
          behavior_summary: summary?.behavior !== "-" ? summary.behavior : null,
          teacher_feedback: "AI 생성 대기 중...",
          peer_relation: null,
          career_aspiration: null
        };
        
        const createResponse = await getJSON(apiUrl(`school_report/`), {
          method: "POST",
          body: JSON.stringify(newReportData),
        });
        
        const newReport = unwrap(createResponse);
        reportId = newReport?.id;
      }
    } catch (e) {
      console.warn("기존 생활기록 조회/생성 실패:", e);
      // 기존 방식으로 폴백
      throw new Error("생활기록부 데이터를 준비할 수 없습니다.");
    }
    
    if (!reportId) {
      throw new Error("생활기록부 ID를 얻을 수 없습니다.");
    }
    
    // 2) 생성 옵션 설정 (사용자 설정 가능하도록 확장 가능)
    const generateRequest = {
      tone: "정중하고 공식적",        // 기본값
      length: "표준",                 // 기본값 
      focus_areas: ["행동특성", "또래관계", "진로희망"], // 모든 영역 포함
      include_suggestions: true,      // 개선 제안 포함
      academic_context: summary?.grades !== "-" ? `성적 현황: ${summary.grades}` : null
    };
    
    // 3) AI 코멘트 생성 API 호출
    const response = await getJSON(apiUrl(`school_report/${reportId}/generate-comment`), {
      method: "POST",
      body: JSON.stringify(generateRequest),
    });
    
    // 4) 응답 처리
    const result = unwrap(response);
    
    if (result?.success === false) {
      throw new Error(result?.error?.message || result?.message || "생성에 실패했습니다.");
    }
    
    const generatedText = result?.generated_comment || 
                         result?.data?.generated_comment || 
                         result?.comment;
    
    if (!generatedText) {
      throw new Error("생성된 코멘트를 찾을 수 없습니다.");
    }
    
    // 5) 생성된 코멘트 설정
    setComment(generatedText);
    
    // 6) 성공 피드백 (선택사항)
    const metadata = result?.data;
    if (metadata?.character_count) {
      console.log(`코멘트 생성 완료: ${metadata.character_count}자, ${metadata.word_count}단어`);
    }
    
  } catch (e) {
    console.error("코멘트 생성 실패:", e);
    
    // 사용자 친화적인 에러 메시지
    let errorMessage = "코멘트 생성에 실패했습니다.";
    
    if (e.message?.includes("환경변수")) {
      errorMessage = "AI 서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.";
    } else if (e.message?.includes("생활기록")) {
      errorMessage = "생활기록 데이터를 불러올 수 없습니다. 학생 정보를 다시 확인해주세요.";
    } else if (e.message?.includes("부족")) {
      errorMessage = "생성할 수 있는 정보가 부족합니다. 더 많은 정보를 입력한 후 시도해주세요.";
    } else if (e.message) {
      errorMessage = e.message;
    }
    
    setComment(`❌ ${errorMessage}\n\n다음을 확인해보세요:\n• 학생의 기본 정보가 입력되어 있는지\n• 네트워크 연결이 안정적인지\n• 잠시 후 다시 시도해보세요`);
    
  } finally {
    setGenerating(false);
  }
};

// --- 추가: 코멘트 생성 전 미리보기 함수 (선택사항) --------------
const handlePreviewGeneration = async () => {
  if (!studentId) return;
  
  try {
    // 기존 생활기록부 찾기
    const existingReports = await getJSON(apiUrl(`school_report/student/${studentId}`));
    const reports = unwrap(existingReports) || [];
    const currentReport = reports.find(r => r.year === year && r.semester === semester);
    
    if (currentReport) {
      const previewResponse = await getJSON(apiUrl(`school_report/${currentReport.id}/generate-preview`));
      const preview = unwrap(previewResponse);
      
      if (preview?.data?.generation_ready) {
        console.log("생성 가능한 콘텐츠:", preview.data.available_content);
        return true;
      } else {
        alert("생성할 수 있는 정보가 부족합니다. 더 많은 데이터를 입력해주세요.");
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn("미리보기 확인 실패:", e);
    return true; // 미리보기 실패해도 생성은 시도
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
      await getJSON(apiUrl(`school_report/`), {
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
    window.open(apiUrl(`pdf/report/${studentId}`), "_blank", "noopener,noreferrer");
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
