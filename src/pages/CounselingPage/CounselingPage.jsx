import React, { useState, useEffect } from "react";
import "./CounselingPage.css";

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/counseling`;

const CounselingPage = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    meeting_type: "학습상담",
    student_id: "",
    teacher_id: 1,
    date: "",
    time: "",
    location: "교무실",
    title: "",
  });
  const [aiPreview, setAiPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 수정 모드 상태
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ✅ 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await fetch(`${API_BASE}/students`).then((r) =>
          r.json()
        );

        const statsRes = await fetch(`${API_BASE}/stats`).then((r) => r.json());
        
        setStudents(studentRes.data || []);
        setStats(statsRes.data || {});
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      }
    };
    fetchData();
  }, []);

  // ✅ 학생 선택 시 상담 히스토리 가져오기
  useEffect(() => {
    if (selectedStudent) {
      setForm((prev) => ({ ...prev, student_id: selectedStudent.id }));
      fetch(`${API_BASE}/history/${selectedStudent.id}`)
        .then((r) => r.json())
        .then((res) => setHistory(res.data || []));
    }
  }, [selectedStudent]);

  // ✅ 첫 번째 학생 자동 선택
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ datetime-local → date, time 분리
  const handleDateTimeChange = (e) => {
    const [d, t] = e.target.value.split("T");
    setForm({
      ...form,
      date: d,
      time: t + ":00", // HH:MM → HH:MM:SS
    });
  };

  // ✅ 상담일지 저장
  const handleSave = async () => {
    if (!selectedStudent) {
      alert("학생을 선택하세요!");
      return;
    }
    const payload = {
      ...form,
      student_id: selectedStudent.id,
    };
    await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    alert("상담일지가 저장되었습니다.");
    fetch(`${API_BASE}/history/${selectedStudent.id}`)
      .then((r) => r.json())
      .then((res) => setHistory(res.data || []));
  };

  // ✅ AI 상담일지 미리보기
  const handleAIGenerate = async () => {
    if (!selectedStudent) {
      alert("학생을 선택하세요!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.title || "상담일지를 작성해주세요" }),
      }).then((r) => r.json());
      setAiPreview(res.data.preview);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 상담일지 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    alert("상담일지가 삭제되었습니다.");
    fetch(`${API_BASE}/history/${selectedStudent.id}`)
      .then((r) => r.json())
      .then((res) => setHistory(res.data || []));
  };

  // ✅ 상담일지 수정 모드 전환
  const handleEdit = (h) => {
    setEditingId(h.id);
    setEditForm({
      title: h.title,
      meeting_type: h.meeting_type,
      dateTime: `${h.date}T${h.time.slice(0, 5)}`, // yyyy-mm-ddTHH:MM
      location: h.location,
    });
  };

  // ✅ 상담일지 수정 저장
  const handleUpdate = async (id) => {
    const [date, time] = editForm.dateTime.split("T");
    const payload = {
      title: editForm.title,
      meeting_type: editForm.meeting_type,
      date,
      time: time + ":00",
      location: editForm.location,
      student_id: selectedStudent.id,
      teacher_id: 1,
    };

    await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    alert("상담일지가 수정되었습니다.");
    setEditingId(null);

    // 수정 후 히스토리 새로고침
    fetch(`${API_BASE}/history/${selectedStudent.id}`)
      .then((r) => r.json())
      .then((res) => setHistory(res.data || []));
  };

  // ✅ 상담일지 수정 취소
  const handleCancel = () => {
    setEditingId(null);
  };

  // ✅ 학생 Top 5 정렬
  const sortedStudents = [...students]
    .sort((a, b) => {
      if (b.counseling_count !== a.counseling_count) {
        return b.counseling_count - a.counseling_count;
      }
      return new Date(b.recent_date || 0) - new Date(a.recent_date || 0);
    })
    .slice(0, 5);

  return (
    <div className="counseling-container">
      {/* 상단: 학생 목록 */}
      <h2 className="section-title">👥 학생 목록</h2>
      <div className="student-list">
        {sortedStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className={`student-card ${
              selectedStudent?.id === student.id ? "active" : ""
            }`}
          >
            <h3 className="student-name">{student.name}</h3>
            <p className="student-meta">
              상담 횟수: {student.counseling_count}회
            </p>
            {student.recent_date && (
              <p className="student-meta">최근: {student.recent_date}</p>
            )}
            <span className={`student-tag ${student.recent_type || ""}`}>
              {student.recent_type || "최근 상담 없음"}
            </span>
          </div>
        ))}
      </div>

      {/* 전체 학생 선택 드롭다운 */}
      <div className="student-dropdown">
        <label>다른 학생 선택:</label>
        <select
          onChange={(e) => {
            const selected = students.find(
              (s) => s.id === Number(e.target.value)
            );
            setSelectedStudent(selected);
          }}
          value={selectedStudent?.id || ""}
        >
          <option value="">학생 선택</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 메인 컨텐츠 */}
      {selectedStudent && (
        <div className="counseling-wrapper">
          <h2 className="wrapper-title">📝 상담일지 작성</h2>

          <div className="counseling-grid">
            <div className="left-column">
              {/* 상담 기본 정보 */}
              <div className="card-box">
                <h3 className="form-title">📋 상담 기본 정보</h3>
                <div className="info-grid">
                  <div>
                    <label>상담 유형</label>
                    <select
                      name="meeting_type"
                      value={form.meeting_type}
                      onChange={handleChange}
                      className="input"
                    >
                      <option>학습상담</option>
                      <option>생활상담</option>
                      <option>진로상담</option>
                      <option>집중관리</option>
                    </select>
                  </div>
                  <div>
                    <label>상담 일시</label>
                    <input
                      type="datetime-local"
                      value={
                        form.date && form.time
                          ? `${form.date}T${form.time.slice(0, 5)}`
                          : ""
                      }
                      onChange={handleDateTimeChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label>상담 장소</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>

                <textarea
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="상담 내용을 입력하세요"
                  className="input textarea"
                />

                <div className="button-group">
                  <button
                    onClick={handleAIGenerate}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? "생성 중..." : "🤖 AI 상담일지 생성"}
                  </button>
                  <button onClick={handleSave} className="btn-secondary">
                    💾 저장
                  </button>
                </div>
              </div>

              {/* AI 상담일지 미리보기 */}
              <div className="card-box">
                <h3 className="form-title">🤖 AI 생성 상담일지 미리보기</h3>
                {aiPreview ? (
                  <p>{aiPreview}</p>
                ) : (
                  <p className="placeholder">
                    상담 내용을 입력하고 AI 생성 버튼을 클릭하면
                    정형화된 상담일지가 생성됩니다.
                  </p>
                )}
              </div>
            </div>

            <div className="right-column">
              {/* 상담 현황 통계 */}
              <div className="card-box">
                <h3 className="section-subtitle">📊 상담 현황 통계</h3>
                <div className="stats-grid">
                  <div className="stat-card blue">
                    {stats.total_students || 0}
                    <span>전체 학생</span>
                  </div>
                  <div className="stat-card green">
                    {stats.counseling_completed || 0}
                    <span>상담 완료</span>
                  </div>
                  <div className="stat-card yellow">
                    {stats.focus_students || 0}
                    <span>집중 관리</span>
                  </div>
                  <div className="stat-card red">
                    {stats.no_counseling || 0}
                    <span>미상담</span>
                  </div>
                </div>
              </div>

              {/* 상담 히스토리 */}
              <div className="card-box">
                <h3 className="section-subtitle">
                  📖 {selectedStudent.name} 상담 히스토리
                </h3>
                <ul className="history-list">
                  {history.map((h) => (
                    <li key={h.id} className="history-card">
                      {editingId === h.id ? (
                        <>
                          <div className="info-grid">
                            <div>
                              <label>상담 유형</label>
                              <select
                                value={editForm.meeting_type}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    meeting_type: e.target.value,
                                  })
                                }
                                className="input"
                              >
                                <option>학습상담</option>
                                <option>생활상담</option>
                                <option>진로상담</option>
                                <option>집중관리</option>
                              </select>
                            </div>
                            <div>
                              <label>상담 일시</label>
                              <input
                                type="datetime-local"
                                value={editForm.dateTime}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    dateTime: e.target.value,
                                  })
                                }
                                className="input"
                              />
                            </div>
                            <div>
                              <label>상담 장소</label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    location: e.target.value,
                                  })
                                }
                                className="input"
                              />
                            </div>
                          </div>

                          <textarea
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            className="input textarea"
                          />

                          <div className="history-actions">
                            <button
                              onClick={() => handleUpdate(h.id)}
                              className="btn-edit"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancel}
                              className="btn-delete"
                            >
                              취소
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="history-date">
                            {h.date}
                            <span className={`history-type ${h.meeting_type}`}>
                              {h.meeting_type}
                            </span>
                          </p>
                          <p className="history-content">{h.title}</p>
                          <div className="history-actions">
                            <button
                              onClick={() => handleEdit(h)}
                              className="btn-edit"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(h.id)}
                              className="btn-delete"
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                  {history.length === 0 && (
                    <div className="empty-card">
                      <p>상담 기록이 없습니다.</p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselingPage;