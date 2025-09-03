import React from 'react';
import useUIStore from '../../store/useUIStore';

const ChatMessage = ({ message, isUser = false, onSendMessage }) => {
  const { triggerEventRefresh } = useUIStore();

  // URL을 감지하고 링크 버튼으로 변환하는 함수
  const formatMessage = (text) => {
    // URL 패턴 감지 (http/https로 시작하는 링크)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (!text) return '';
    
    // 대괄호 제거
    const cleanText = text.replace(/\[([^\]]*)\]/g, '$1');
    
    // 일정 관련 텍스트 감지 및 버튼 추가 (더 정확한 패턴)
    const scheduleRegex = /(\*\s*[^*\n]*?(?:수학여행|대청소|체육대회|운동회|시험|평가|행사)[^*\n]*?(?:일정|하는 날|예정|있어요|해요)[^*\n]*?)/g;
    
    // 미래 일정 감지 (공지사항에서)
    const futureScheduleRegex = /(\d+월\s*\d+일[^:]*:(?:[^.]*?(?:예정되어\s*있습니다|있습니다)[^.]*?))/g;
    let lastIndex = 0;
    const elements = [];
    const processedSchedules = new Set(); // 중복 방지를 위한 Set
    
    // 일정 관련 텍스트 찾기
    let match;
    while ((match = scheduleRegex.exec(cleanText)) !== null) {
      // 일정 텍스트 이전 부분 추가
      if (match.index > lastIndex) {
        const beforeText = cleanText.slice(lastIndex, match.index);
        if (beforeText) {
          elements.push(beforeText);
        }
      }
      
      // 일정 텍스트와 버튼 추가
      const scheduleText = match[1];
      
      // 중복 체크
      if (!processedSchedules.has(scheduleText)) {
        processedSchedules.add(scheduleText);
        elements.push(
          <div key={`schedule-${match.index}`} className="mb-2">
            <div className="text-sm">{scheduleText}</div>
            <button
              onClick={() => handleScheduleAdd(scheduleText)}
              className="inline-block mt-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              📅 일정 추가
            </button>
          </div>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // 미래 일정 찾기 (공지사항에서)
    while ((match = futureScheduleRegex.exec(cleanText)) !== null) {
      // 미래 일정 텍스트 이전 부분 추가
      if (match.index > lastIndex) {
        const beforeText = cleanText.slice(lastIndex, match.index);
        if (beforeText) {
          elements.push(beforeText);
        }
      }
      
      // 미래 일정 텍스트와 버튼 추가
      const futureScheduleText = match[1];
      
      // 중복 체크
      if (!processedSchedules.has(futureScheduleText)) {
        processedSchedules.add(futureScheduleText);
        elements.push(
          <div key={`future-schedule-${match.index}`} className="mb-2">
            <div className="text-sm">{futureScheduleText}</div>
            <button
              onClick={() => handleScheduleAdd(futureScheduleText)}
              className="inline-block mt-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              📅 일정 추가
            </button>
          </div>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // 남은 텍스트 추가
    if (lastIndex < cleanText.length) {
      const remainingText = cleanText.slice(lastIndex);
      if (remainingText) {
        elements.push(remainingText);
      }
    }
    
    // URL을 PPT 자료 버튼으로 변환
    const finalElements = elements.map((element, index) => {
      if (typeof element === 'string') {
        // URL을 PPT 자료 버튼으로 변환
        const parts = element.split(urlRegex);
        return parts.map((part, partIndex) => {
          if (urlRegex.test(part)) {
            return (
              <button
                key={`${index}-${partIndex}`}
                onClick={() => window.open(part, '_blank', 'noopener,noreferrer')}
                className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white text-sm rounded-md hover:from-[#5A67D8] hover:to-[#6B46C1] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                PPT 자료
              </button>
            );
          }
          return part;
        });
      }
      return element;
    });
    
    return finalElements;
  };

  // 일정 추가 버튼 클릭 핸들러
  const handleScheduleAdd = (scheduleText) => {
    // 텍스트에서 날짜와 일정 제목 추출
    const dateMatch = scheduleText.match(/(\d+월\s*\d+일|\d+월\s*\d+일부터\s*\d+월\s*\d+일까지|오늘|내일|다가오는\s*\*\*[^*]+\*\*)/);
    const eventMatch = scheduleText.match(/(수학여행|대청소|체육대회|운동회|시험|평가|행사|취침|축구경기|축구|경기)/);
    
    if (dateMatch && eventMatch) {
      const date = dateMatch[1];
      const event = eventMatch[1];
      
      // 메시지 생성
      let message = '';
      if (date.includes('부터') && date.includes('까지')) {
        // 기간 일정
        const periodMatch = date.match(/(\d+월\s*\d+일)부터\s*(\d+월\s*\d+일)까지/);
        if (periodMatch) {
          message = `${periodMatch[1]}부터${periodMatch[2]}까지 ${event}일정을 추가해줘`;
        }
      } else {
        // 단일 일정
        message = `${date} ${event}일정을 추가해줘`;
      }
      
      if (message && onSendMessage) {
        // 사용자 메시지 없이 바로 AI 응답만 처리
        onSendMessage(message, true); // 두 번째 파라미터로 silent 모드 표시
        
        // 일정 추가 후 프론트엔드 업데이트 트리거
        setTimeout(() => {
          triggerEventRefresh();
        }, 1000); // 1초 후 트리거 (AI 응답 완료 대기)
      }
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white' 
          : 'bg-white text-slate-800 border border-slate-200'
      }`}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
              {formatMessage(message)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 