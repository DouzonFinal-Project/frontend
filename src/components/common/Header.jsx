import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotSidebar from '../ChatbotSidebar';

const Header = () => {
  const location = useLocation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // 경로 → 타이틀 매핑
  const titleMap = {
    '/dashboard': '홈',
    '/attendance': '출결관리',
    '/grades': '성적평가',
    '/progress': '진도 및 과제관리',
    '/reports': '보고서 작성',
    '/counseling': '상담관리',
    '/lifeGuidance': '생활지도',
    '/studentInfo': '학생 특이사항',
    '/homeLetter': '가정통신문',
    '/notice': '공지사항',
    '/staffCollaboration': '교직원 협업',
    '/classSchedule': '학급 일정',
    '/timetable': '시간표 관리',
    '/events': '교내 행사',
    '/documents': '행정 서류',
    '/facility': '교실 환경',
    '/survey': '조사·설문',
    '/LifeRecord': '생활기록부',
    '/problem-writing': '문제작성'
  };

  // 현재 경로
  const currentPath = location.pathname;

  // 기본값
  let currentTitle = '페이지';

  // startsWith 매칭 적용
  for (const path in titleMap) {
    if (currentPath.startsWith(path)) {
      currentTitle = titleMap[path];
      break;
    }
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <header className="flex w-full min-h-[94px] px-4 py-3 justify-start items-center border-b border-[#E1E5E9] bg-white">
      <div className="flex w-full max-w-[1124px] flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
        {/* Left Section - Title Group */}
        <div className="flex flex-col items-start gap-[7px]">
          <h1 className="text-[24px] font-bold text-[#2C3E50] leading-normal">
            {currentTitle}
          </h1>
          <p className="text-[14px] font-medium text-[#7F8C8D] leading-normal">
            6학년 3반 - {today}
          </p>
        </div>

        {/* Right Section - User Info and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-[13px] w-full lg:w-auto">
          {/* User Info */}
          <span className="text-[16px] font-medium text-[#2C3E50] leading-normal order-1 sm:order-none">
            👤 김선생님
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-[13px] order-2 sm:order-none">
            {/* Chat Toggle Button */}
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="w-[72px] h-[72px] flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="채팅 토글"
            >
              {/* Chatbot Icon */}
              <svg
                width="73"
                height="72"
                viewBox="0 0 73 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[72px] h-[72px]"
              >
                <path
                  d="M37.7568 8H34.7568C22.3304 8 12.2568 18.0736 12.2568 30.5V33.5C12.2568 45.9264 22.3304 56 34.7568 56H37.7568C50.1832 56 60.2568 45.9264 60.2568 33.5V30.5C60.2568 18.0736 50.1832 8 37.7568 8Z"
                  fill="url(#paint0_linear_287_2414)"
                />
                <path
                  d="M36.2568 23C36.8091 23 37.2568 22.5523 37.2568 22C37.2568 21.4477 36.8091 21 36.2568 21C35.7046 21 35.2568 21.4477 35.2568 22C35.2568 22.5523 35.7046 23 36.2568 23Z"
                  fill="white"
                />
                <path
                  d="M42.2568 26H30.2568C29.1523 26 28.2568 26.8954 28.2568 28V36C28.2568 37.1046 29.1523 38 30.2568 38H42.2568C43.3614 38 44.2568 37.1046 44.2568 36V28C44.2568 26.8954 43.3614 26 42.2568 26Z"
                  fill="white"
                />
                <path
                  d="M32.2568 31.5C33.0853 31.5 33.7568 30.8284 33.7568 30C33.7568 29.1716 33.0853 28.5 32.2568 28.5C31.4284 28.5 30.7568 29.1716 30.7568 30C30.7568 30.8284 31.4284 31.5 32.2568 31.5Z"
                  fill="#764BA2"
                />
                <path
                  d="M40.2568 31.5C41.0853 31.5 41.7568 30.8284 41.7568 30C41.7568 29.1716 41.0853 28.5 40.2568 28.5C39.4284 28.5 38.7568 29.1716 38.7568 30C38.7568 30.8284 39.4284 31.5 40.2568 31.5Z"
                  fill="#764BA2"
                />
                <path
                  d="M37.7568 33H34.7568C34.4807 33 34.2568 33.2239 34.2568 33.5C34.2568 33.7761 34.4807 34 34.7568 34H37.7568C38.033 34 38.2568 33.7761 38.2568 33.5C38.2568 33.2239 38.033 33 37.7568 33Z"
                  fill="#764BA2"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_287_2414"
                    x1="12.2568"
                    y1="8"
                    x2="60.2568"
                    y2="56"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#667EEA" />
                    <stop offset="1" stopColor="#764BA2" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            {/* Settings Button */}
            <button
              className="flex w-[45px] h-[34px] px-[11px] py-[10px] justify-center items-center rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="설정"
            >
              <span className="text-[13px] font-normal text-[#2E86C1] text-center leading-normal whitespace-nowrap">
                설정
              </span>
            </button>

            {/* Logout Button */}
            <button
              className="flex w-[80px] h-[34px] px-4 py-[9px] justify-center items-center rounded-md bg-[#2E86C1] hover:bg-[#2874A6] transition-colors"
              aria-label="로그아웃"
            >
              <span className="text-[14px] font-medium text-white text-center leading-normal whitespace-nowrap">
                로그아웃
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Chatbot Sidebar */}
      <ChatbotSidebar 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </header>
  );
};

export default Header;
