import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API = axios.create({
  baseURL: API_BASE_URL, // ✅ 환경 변수 사용
});

// ✅ 상담 채팅 (RAG 기반)
export const counselingChat = (data) =>
  API.post("/v1/counseling-chat/", data);

// ✅ 간단 채팅 (빠른 상담)
export const quickChat = (data) =>
  API.post("/v1/quick-chat/", data);

// ✅ 상담 계획 수립
export const counselingPlan = (data) =>
  API.post("/v1/counseling-plan/", data);

// ✅ 대화 요약
export const summarizeConversation = (data) =>
  API.post("/v1/summarize-conversation/", data);

// ✅ 키워드 추출
export const extractKeywords = (data) =>
  API.post("/v1/extract-keywords/", data);

// ✅ 학생 목록 조회
export const getStudents = () =>
  API.get("/v1/students");

// ✅ 상담 히스토리 조회
export const getCounselingHistory = (studentId) =>
  API.get(`/v1/students/${studentId}/counselings`);

// ✅ 상담일지 저장
export const saveCounseling = (data) =>
  API.post("/v1/counselings", data);

// ✅ 상담 마스터 챗
export const masterCouselingChat = (data) =>
<<<<<<< HEAD
  API.post("/v1/gemini/master-chat", data);

// ✅ Milvus 상담 일지 저장
export const milvusAddRecord = (data) =>
  API.post("/v1/milvus/add-record", data);
=======
  API.post("/gemini/master-chat", data);
>>>>>>> dev

export default API;
