import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendChatMessage } from '../../api/chatbot';
import { sendCounselingMessage, setUserContext, getUserContext, sendCounselingMessageWithContext, clearUserContext } from '../../api/chatbot_counseling';
import useUIStore from '../../store/useUIStore';

const ChatbotSidebar = ({ isOpen, onClose }) => {
  const messagesEndRef = useRef(null);
  const { triggerEventRefresh } = useUIStore();
  const location = useLocation();
  
  // URL 경로에 따른 초기 탭 설정
  const getInitialTab = useCallback(() => {
    switch (location.pathname) {
      case '/Schedule':
        return 'schedule';
      case '/problem-writing':
        return 'exam';
      case '/counseling':
        return 'consultation';
      case '/dashboard':
      default:
        return 'attendance';
    }
  }, [location.pathname]);
  
  // 슬라이드 탭 상태 관리
  const [sidebarWidth, setSidebarWidth] = useState(700);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  
  // 사용자 컨텍스트 관련 상태
  const [userContextSet, setUserContextSet] = useState(false);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({
    student_name: '',
    worry_tag_filter: ''
  });

  // 상담 탭의 초기 메시지를 동적으로 생성하는 함수
  const getInitialConsultationMessage = useCallback(() => {
    const context = getUserContext();
    if (context.student_name && context.worry_tag_filter) {
      return `상담 업무를 도와드리겠습니다! 현재 설정: ${context.student_name}님, 태그: ${context.worry_tag_filter}\n\n학생 상담, 학부모 상담, 상담일지 작성 등 무엇이든 도와드릴 수 있습니다.`;
    }
    return "상담 업무를 도와드리겠습니다! 학생 상담, 학부모 상담, 상담일지 작성 등 무엇이든 도와드릴 수 있습니다.\n\n더 정확한 상담을 위해 학생 정보를 설정해보세요.";
  }, [userContextSet]);
  
  // 각 탭별로 메시지를 별도 관리
  const [tabMessages, setTabMessages] = useState({
    attendance: [{
      id: 1,
      message: "출결 관리 업무를 도와드리겠습니다! 출석 현황 확인, 결석자 추출, 출결 통계 생성, 출결 관리 등 출결 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    consultation: [{
      id: 1,
      message: "상담 업무를 도와드리겠습니다! 학생 상담, 학부모 상담, 상담일지 작성 등 무엇이든 도와드릴 수 있습니다.\n\n더 정확한 상담을 위해 학생 정보를 설정해보세요.",
      isUser: false,
      timestamp: new Date()
    }],
    schedule: [{
      id: 1,
      message: "일정 관리 업무를 도와드리겠습니다! 오늘 일정 확인, 일정 추가, 수정, 삭제 등 일정 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    exam: [{
      id: 1,
      message: "시험지 관련 업무를 도와드리겠습니다! 문제지 생성, 시험지 관리, 문제 수정, 정답 확인 등 시험지 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    notice: [{
      id: 1,
      message: "공지사항 관리 업무를 도와드리겠습니다! 공지사항 조회, 공지사항 작성, 공지사항 수정, 공지사항 관리 등 공지사항 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    grades: [{
      id: 1,
      message: "성적 관리 업무를 도와드리겠습니다! 성적 입력, 성적 분석, 성적 통계 생성, 성적 리포트 작성, 성적 관리 등 성적 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // 현재 탭의 메시지 가져오기 (useMemo로 최적화)
  const messages = useMemo(() => {
    return tabMessages[activeTab] || [];
  }, [tabMessages, activeTab]);

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // URL 경로가 변경될 때 탭도 업데이트
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab]);

  // 사용자 컨텍스트 설정 확인 함수
  const checkUserContext = useCallback(() => {
    const context = getUserContext();
    return context.student_name && context.worry_tag_filter;
  }, []);

  // 사용자 정보 설정 모달/폼 토글
  const toggleUserSetup = () => {
    const context = getUserContext();
    setTempUserInfo({
      student_name: context.student_name || '',
      worry_tag_filter: context.worry_tag_filter || ''
    });
    setShowUserSetup(!showUserSetup);
  };

  // 사용자 정보 저장
  const saveUserContext = () => {
    if (tempUserInfo.student_name.trim() && tempUserInfo.worry_tag_filter.trim()) {
      setUserContext(tempUserInfo.student_name.trim(), tempUserInfo.worry_tag_filter.trim());
      setUserContextSet(!userContextSet); // 강제로 리렌더링 트리거
      setShowUserSetup(false);
      
      // 성공 메시지 추가
      const successMsg = {
        id: Date.now(),
        message: `사용자 정보가 설정되었습니다.\n학생명: ${tempUserInfo.student_name}\n상담 태그: ${tempUserInfo.worry_tag_filter}`,
        isUser: false,
        timestamp: new Date()
      };
      
      setTabMessages(prev => ({
        ...prev,
        consultation: [...(prev.consultation || []), successMsg]
      }));

      // 초기 메시지도 업데이트
      setTimeout(() => {
        setTabMessages(prev => ({
          ...prev,
          consultation: [
            {
              id: 1,
              message: getInitialConsultationMessage(),
              isUser: false,
              timestamp: new Date()
            },
            ...prev.consultation.slice(1) // 기존 메시지들 유지 (첫 번째 제외)
          ]
        }));
      }, 100);
    }
  };

  // 상담 탭으로 전환될 때 초기 메시지 업데이트
  useEffect(() => {
    if (activeTab === 'consultation') {
      setTabMessages(prev => {
        const existingMessages = prev.consultation || [];
        const updatedFirstMessage = {
          id: 1,
          message: getInitialConsultationMessage(),
          isUser: false,
          timestamp: new Date()
        };
        
        // 첫 번째 메시지만 업데이트, 나머지는 유지
        return {
          ...prev,
          consultation: [updatedFirstMessage, ...existingMessages.slice(1)]
        };
      });
    }
  }, [activeTab, userContextSet, getInitialConsultationMessage]);

  // 드래그 리사이징 기능
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 400;
    const maxWidth = 1200;
    
    // 즉시 DOM 업데이트로 반응성 향상
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      // 실시간 DOM 업데이트
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    }
  }, [isResizing]);

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove]);

  const handleSendMessage = async (userMessage, silent = false) => {
    if (!userMessage.trim()) return;

    // 사용자 메시지 추가 (silent 모드가 아닐 때만)
    if (!silent) {
      const userMsg = {
        id: Date.now(),
        message: userMessage,
        isUser: true,
        timestamp: new Date()
      };
      
      setTabMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), userMsg]
      }));
    }
    
    setIsLoading(true);

    try {
      let response;
      
      // consultation 탭인 경우 chatbot_counseling.js의 sendCounselingMessage 사용
      if (activeTab === 'consultation') {
        console.log('상담 챗봇 API 호출 시작:', userMessage);
        
        // 사용자 컨텍스트가 설정되어 있는지 확인
        const hasContext = checkUserContext();
        
        if (hasContext) {
          // 컨텍스트가 있으면 간편한 방식 사용
          response = await sendCounselingMessageWithContext(userMessage);
        } else {
          // 컨텍스트가 없으면 기본값으로 API 호출
          response = await sendCounselingMessage(userMessage);
        }
        
        console.log('상담 챗봇 API 응답:', response);
      } else {
        // 다른 탭들은 기존의 sendChatMessage 사용
        console.log('일반 챗봇 API 호출 시작:', userMessage);
        response = await sendChatMessage(userMessage);
        console.log('일반 챗봇 API 응답:', response);
      }
      
      // 응답 구조 확인 및 처리
      let aiMessage = '';
      if (response) {
        // 다양한 응답 구조에 대응
        aiMessage = response.response || response.message || response.answer || response.text || response.content || '';
        
        // 응답이 없는 경우 전체 응답 객체를 문자열로 변환
        if (!aiMessage && typeof response === 'object') {
          aiMessage = JSON.stringify(response, null, 2);
        }
        
        // 여전히 응답이 없는 경우
        if (!aiMessage) {
          aiMessage = "응답을 받았지만 내용을 찾을 수 없습니다.";
        }
      } else {
        aiMessage = "서버로부터 응답을 받지 못했습니다.";
      }
      
      // AI 응답 추가
      const aiMsg = {
        id: Date.now() + 1,
        message: aiMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      setTabMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), aiMsg]
      }));
      
      // 일정 관련 작업인지 확인하고 프론트엔드 업데이트 트리거
      const isEventRelated = checkIfEventRelated(userMessage, aiMessage);
      if (isEventRelated) {
        triggerEventRefresh();
      }
    } catch (error) {
      console.error('챗봇 응답 오류 상세:', error);
      console.error('에러 타입:', typeof error);
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
      
      // 더 상세한 에러 메시지 생성
      let errorMessage = "죄송합니다. 일시적인 오류가 발생했습니다.";
      
      if (error.message) {
        errorMessage += `\n오류 내용: ${error.message}`;
      }
      
      if (activeTab === 'consultation') {
        errorMessage += "\n상담 챗봇 서비스에 문제가 있을 수 있습니다.";
      }
      
      // 에러 메시지 추가
      const errorMsg = {
        id: Date.now() + 1,
        message: errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      setTabMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 일정 관련 작업인지 확인하는 함수
  const checkIfEventRelated = (userMessage, aiResponse) => {
    const eventKeywords = ['일정', '추가', '등록', '삭제', '수정', '변경', '체육대회', '시험', '행사', '회의'];
    const successKeywords = ['성공', '추가되었습니다', '등록되었습니다', '삭제되었습니다', '수정되었습니다'];
    
    const hasEventKeyword = eventKeywords.some(keyword => 
      userMessage.includes(keyword) || (aiResponse && aiResponse.includes(keyword))
    );
    
    const hasSuccessKeyword = successKeywords.some(keyword => 
      aiResponse && aiResponse.includes(keyword)
    );
    
    return hasEventKeyword && hasSuccessKeyword;
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform ${isResizing ? '' : 'transition-all duration-300 ease-in-out'} ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 border-l border-slate-200 flex ${isResizing ? 'select-none' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        
        {/* 드래그 핸들 */}
        <div 
          className="w-2 bg-slate-200 hover:bg-slate-300 cursor-col-resize transition-colors duration-200 flex-shrink-0 relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-12 bg-slate-400 rounded-full group-hover:bg-slate-600 transition-colors duration-200"></div>
          </div>
          {/* 드래그 영역 확장 */}
          <div className="absolute inset-0 w-4 -left-1 cursor-col-resize"></div>
        </div>

        {/* Left Sub Sidebar */}
        <div className="w-48 bg-[#667EEA] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-6 text-white">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="#667EEA" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold">AI 업무 도우미</h2>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 px-4">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/80 mb-3 px-2">주요 업무</h3>
               <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'attendance'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  출결
                </button>
                <button
                  onClick={() => {
                    console.log('상담 탭 클릭됨');
                    setActiveTab('consultation');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'consultation'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  상담
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'schedule'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  일정
                </button>
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'exam'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  시험지
                </button>
                <button
                  onClick={() => setActiveTab('notice')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'notice'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  공지사항
                </button>
                <button
                  onClick={() => setActiveTab('grades')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'grades'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  성적
                </button>
              </div>
            </div>

            {/* Recent Conversations */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3 px-2">최근 대화</h3>
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs text-white/60 hover:text-white/80 cursor-pointer">
                  상담일지 작성 도움
                </div>
                <div className="px-3 py-2 text-xs text-white/60 hover:text-white/80 cursor-pointer">
                  학부모 상담 가이드
                </div>
                <div className="px-3 py-2 text-xs text-white/60 hover:text-white/80 cursor-pointer">
                  학생 상담 기록
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 bg-white border-b border-slate-200">
            <div className="flex-1">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">
                     {activeTab === 'attendance' ? '출결 도우미' : 
                      activeTab === 'consultation' ? '상담 도우미' : 
                      activeTab === 'schedule' ? '일정 도우미' : 
                      activeTab === 'exam' ? '시험지 도우미' : 
                      activeTab === 'notice' ? '공지사항 도우미' : '성적 도우미'}
                   </h2>
                   <p className="text-sm text-gray-600 mt-1">
                     {activeTab === 'attendance'
                       ? '출석 현황 확인, 결석자 추출, 출결 통계 생성, 출결 관리'
                       : activeTab === 'consultation'
                       ? '학생 상담, 학부모 상담, 상담일지 작성'
                       : activeTab === 'schedule'
                       ? '오늘 일정 확인, 일정 추가, 수정, 삭제, 일정 관리'
                       : activeTab === 'exam'
                       ? '문제지 생성, 시험지 관리, 문제 수정, 정답 확인, 시험지 관련 업무'
                       : activeTab === 'notice'
                       ? '공지사항 조회, 공지사항 작성, 공지사항 수정, 공지사항 관리'
                       : '성적 입력, 성적 분석, 성적 통계 생성, 성적 리포트 작성, 성적 관리'
                     }
                   </p>
                 </div>
                 
                 {/* 상담 탭에서만 사용자 설정 버튼 표시 */}
                 {activeTab === 'consultation' && (
                   <button
                     onClick={toggleUserSetup}
                     className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     {checkUserContext() ? '사용자 정보 변경' : '사용자 정보 설정'}
                   </button>
                 )}
               </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 사용자 정보 설정 모달/폼 */}
          {activeTab === 'consultation' && showUserSetup && (
            <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-blue-900">상담 대상자 정보 설정</h4>
                  {checkUserContext() && (
                    <div className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      현재 설정됨
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">학생명</label>
                    <input
                      type="text"
                      value={tempUserInfo.student_name}
                      onChange={(e) => setTempUserInfo(prev => ({ ...prev, student_name: e.target.value }))}
                      placeholder="예: 김철수"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상담 태그</label>
                    <input
                      type="text"
                      value={tempUserInfo.worry_tag_filter}
                      onChange={(e) => setTempUserInfo(prev => ({ ...prev, worry_tag_filter: e.target.value }))}
                      placeholder="예: 용기, 따돌림, 우울"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>• 학생명: 상담 대상 학생의 이름을 입력하세요</p>
                  <p>• 상담 태그: 쉼표로 구분하여 여러 태그 입력 가능 (예: 용기, 따돌림, 우울)</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowUserSetup(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveUserContext}
                    disabled={!tempUserInfo.student_name.trim() || !tempUserInfo.worry_tag_filter.trim()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-6 space-y-4">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id}
                  message={msg.message} 
                  isUser={msg.isUser}
                  onSendMessage={handleSendMessage}
                  timestamp={msg.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#667EEA] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* 스크롤을 위한 빈 div */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotSidebar;