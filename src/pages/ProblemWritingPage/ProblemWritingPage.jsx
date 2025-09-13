import React, { useState } from 'react';
import { generateProblemSet } from '../../api/problemGeneration';
import './ProblemWritingPage.css';

export default function ProblemWritingPage() {
  // 상태 관리
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedSubUnits, setSelectedSubUnits] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(0);
  const [subjectiveCount, setSubjectiveCount] = useState(0);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' 또는 'answer'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // 문제지와 정답을 분리하는 함수
  const separateProblemAndAnswer = (content) => {
    if (!content) return { problem: '', answer: '' };
    
    // 정답 섹션 찾기 (더 정확한 패턴)
    const answerPatterns = [
      /\[정답\]/i,
      /\[답\]/i,
      /정답:/i,
      /답:/i,
      /정답\s*$/i,
      /답\s*$/i
    ];
    
    let answerIndex = -1;
    for (const pattern of answerPatterns) {
      const match = content.match(pattern);
      if (match) {
        answerIndex = match.index;
        break;
      }
    }
    
    if (answerIndex !== -1) {
      const problem = content.substring(0, answerIndex).trim();
      const answer = content.substring(answerIndex).trim();
      return { problem, answer };
    }
    
    // 정답 섹션이 없으면 전체를 문제로 처리
    return { problem: content, answer: '정답이 포함되지 않았습니다.' };
  };

                // 과목 옵션
              const subjects = [
                { value: 'korean', label: '국어' },
                { value: 'math', label: '수학' },
                { value: 'english', label: '영어' },
                { value: 'social', label: '사회' },
                { value: 'science', label: '과학' }
              ];

                              // 단원 옵션 (과목별로 다르게 표시)
              const getUnits = (subject) => {
                const unitMap = {
                  math: [
                    { value: 'unit1', label: '1단원: 분수의 나눗셈' },
                    { value: 'unit2', label: '2단원: 소수의 나눗셈' },
                    { value: 'unit3', label: '3단원: 공간과 입체' },
                    { value: 'unit4', label: '4단원: 비례식과 비례배분' },
                    { value: 'unit5', label: '5단원: 원의 넓이' },
                    { value: 'unit6', label: '6단원: 원기둥, 원뿔, 구' }
                  ],
                  korean: [
                    { value: 'unit1', label: '1단원: 읽기' },
                    { value: 'unit2', label: '2단원: 쓰기' },
                    { value: 'unit3', label: '3단원: 문법' },
                    { value: 'unit4', label: '4단원: 문학' }
                  ],
                  english: [
                    { value: 'unit1', label: '1단원: Speaking' },
                    { value: 'unit2', label: '2단원: Reading' },
                    { value: 'unit3', label: '3단원: Writing' },
                    { value: 'unit4', label: '4단원: Grammar' }
                  ],
                  science: [
                    { value: 'unit1', label: '1단원: 물리' },
                    { value: 'unit2', label: '2단원: 화학' },
                    { value: 'unit3', label: '3단원: 생물' },
                    { value: 'unit4', label: '4단원: 지구과학' }
                  ],
                  social: [
                    { value: 'unit1', label: '1단원: 역사' },
                    { value: 'unit2', label: '2단원: 지리' },
                    { value: 'unit3', label: '3단원: 정치' },
                    { value: 'unit4', label: '4단원: 경제' }
                  ]
                };
                return unitMap[subject] || [];
              };

              // 소단원 옵션 (수학 1단원만 구현)
              const getSubUnits = (subject, unit) => {
                if (subject === 'math' && unit === 'unit1') {
                  return [
                    { value: 'sub1', label: '1. 분수 ÷ 자연수' },
                    { value: 'sub2', label: '2. 자연수 ÷ 분수' },
                    { value: 'sub3', label: '3. 분수 ÷ 분수' }
                  ];
                }
                return [];
              };

  // 난이도 옵션
  const difficulties = [
    { value: 'easy', label: '하', color: 'text-green-600' },
    { value: 'medium', label: '중', color: 'text-yellow-600' },
    { value: 'hard', label: '상', color: 'text-red-600' }
  ];

                // 문제 유형 옵션
              const questionTypes = [
                { value: 'basic', label: '기본 개념 문제' },
                { value: 'application', label: '실생활 응용 문제' },
                { value: 'critical', label: '비판적 사고 문제' },
                { value: 'creative', label: '창의적 해결 문제' }
              ];

  // 문제지 생성 함수 (스트리밍 방식)
  const generateTest = async () => {
    if (!selectedSubject || selectedUnits.length === 0 || !selectedDifficulty) {
      alert('과목, 단원, 난이도를 선택해주세요.');
      return;
    }

    if (multipleChoiceCount === 0 && subjectiveCount === 0) {
      alert('객관식 또는 주관식 문제 수를 선택해주세요.');
      return;
    }

    try {
      // 스트리밍 상태 초기화
      setIsStreaming(true);
      setStreamingContent('');
      setGeneratedTest({ loading: true, content: '' });
      // 탭 상태는 유지 (사용자가 선택한 탭 그대로 유지)

      // API 호출을 위한 설정 객체 생성
      const settings = {
        subject: subjects.find(s => s.value === selectedSubject)?.label || selectedSubject,
        units: selectedUnits,
        sub_units: selectedSubUnits,
        difficulty: difficulties.find(d => d.value === selectedDifficulty)?.label || selectedDifficulty,
        multiple_choice_count: multipleChoiceCount,
        subjective_count: subjectiveCount,
        question_types: selectedQuestionTypes
      };

      // 스트리밍 콜백 함수들
      const onChunk = (chunk) => {
        setStreamingContent(prev => prev + chunk);
      };

      const onComplete = (finalContent) => {
        setIsStreaming(false);
        // 스트리밍 완료 시에도 같은 영역에서 자연스럽게 완성된 상태로 유지
        setGeneratedTest(prev => {
          const finalText = finalContent || streamingContent || prev.content || '';
          return {
          loading: false,
          content: finalText,
          settings: settings
          };
        });
        console.log('스트리밍 완료:', finalContent);
      };

      const onError = (error) => {
        setIsStreaming(false);
        setGeneratedTest({
          loading: false,
          content: '문제지 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
          error: true
        });
        console.error('스트리밍 오류:', error);
      };

      // 스트리밍 API 호출
      await generateProblemSet(settings, onChunk, onComplete, onError);
      
    } catch (error) {
      console.error('문제지 생성 오류:', error);
      setIsStreaming(false);
      setGeneratedTest({
        loading: false,
        content: '문제지 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        error: true
      });
    }
  };


  // 문제 유형 토글 함수
  const toggleQuestionType = (type) => {
    setSelectedQuestionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 편집 모드 토글 함수
  const toggleEditMode = () => {
    if (!isEditMode) {
      // 편집 모드 진입 시 현재 내용을 편집용 상태에 복사
      const content = streamingContent || generatedTest?.content || '';
      setEditedContent(content);
    }
    setIsEditMode(!isEditMode);
  };

  // 편집된 내용 저장 함수
  const saveEditedContent = () => {
    if (editedContent.trim()) {
      setGeneratedTest(prev => ({
        ...prev,
        content: editedContent
      }));
      setStreamingContent(editedContent);
      setIsEditMode(false);
    }
  };

  // 편집 취소 함수
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditedContent('');
  };

  // PDF 생성 함수
  const generatePDF = () => {
    // 문제지와 정답과 해설만 포함된 새 창 열기
    const content = streamingContent || generatedTest?.content || '';
    const { problem, answer } = separateProblemAndAnswer(content);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>수학 문제지</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left { content: ""; }
            @bottom-center { content: ""; }
            @bottom-right { content: ""; }
          }
          body {
            font-family: 'Malgun Gothic', sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
          }
          .problem-section {
            page-break-after: always;
            margin-bottom: 0;
          }
          .answer-section {
            page-break-before: always;
            margin-top: 0;
          }
          .print-title {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20pt;
            border-bottom: 2pt solid #000;
            padding-bottom: 10pt;
          }
          .print-problem-number {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 8pt;
          }
          .print-choice {
            margin-left: 20pt;
            margin-bottom: 4pt;
          }
          .print-answer-box {
            border: 2pt dashed #000;
            height: 80pt;
            margin: 10pt 0;
            padding: 8pt;
          }
          .print-answer {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 8pt;
          }
          .print-explanation {
            font-size: 11pt;
            margin-bottom: 4pt;
          }
          .print-divider {
            border-top: 2pt solid #000;
            margin: 20pt 0;
            text-align: center;
            padding-top: 10pt;
            font-weight: bold;
          }
          pre {
            white-space: pre-wrap;
            font-family: 'Malgun Gothic', sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="problem-section">
          <div class="print-title">수학 문제지</div>
          <pre>${problem}</pre>
        </div>
        
        <div class="answer-section">
          <div class="print-title">정답과 해설</div>
          <pre>${answer}</pre>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    
    // 인쇄 대화상자 열기
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="px-6 pb-6 bg-gray-50 min-h-screen">

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 왼쪽: 통합된 설정 영역 */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 min-h-[1000px]">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">문제 출제 설정</h2>
              <p className="text-sm text-gray-600">과목, 단원, 난이도를 선택하여 맞춤형 문제지를 생성하세요</p>
            </div>

                        <div className="space-y-3">
              {/* 과목 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  과목 선택
                </label>
                                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedUnits([]);
                    }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
              </div>

              {/* 단원 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    단원 선택
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !selectedUnits.find(unit => unit.value === e.target.value)) {
                        const selectedUnit = getUnits(selectedSubject).find(unit => unit.value === e.target.value);
                        setSelectedUnits([...selectedUnits, selectedUnit]);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                  >
                    <option value="" style={{display: 'none'}}>단원을 선택하세요</option>
                    {getUnits(selectedSubject)
                      .filter(unit => !selectedUnits.find(selected => selected.value === unit.value))
                      .map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                  </select>
                  
                  {/* 선택된 단원 태그들 */}
                  {selectedUnits.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedUnits.map((unit, index) => (
                        <div
                          key={unit.value}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-sm border border-green-200 shadow-sm"
                        >
                          <span className="font-medium">{unit.label}</span>
                          <button
                            onClick={() => {
                              setSelectedUnits(selectedUnits.filter((_, i) => i !== index));
                              setSelectedSubUnits([]);
                            }}
                            className="text-green-500 hover:text-green-700 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              {/* 소단원 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    소단원 선택
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !selectedSubUnits.find(subUnit => subUnit.value === e.target.value)) {
                        const selectedSubUnit = getSubUnits('math', 'unit1').find(subUnit => subUnit.value === e.target.value);
                        setSelectedSubUnits([...selectedSubUnits, selectedSubUnit]);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                  >
                    <option value="" style={{display: 'none'}}>소단원을 선택하세요</option>
                    {getSubUnits('math', 'unit1')
                      .filter(subUnit => !selectedSubUnits.find(selected => selected.value === subUnit.value))
                      .map((subUnit) => (
                        <option key={subUnit.value} value={subUnit.value}>
                          {subUnit.label}
                        </option>
                      ))}
                  </select>
                  
                  {/* 선택된 소단원 태그들 */}
                  {selectedSubUnits.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedSubUnits.map((subUnit, index) => (
                        <div
                          key={subUnit.value}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-lg text-sm border border-purple-200 shadow-sm"
                        >
                          <span className="font-medium">{subUnit.label}</span>
                          <button
                            onClick={() => setSelectedSubUnits(selectedSubUnits.filter((_, i) => i !== index))}
                            className="text-purple-500 hover:text-purple-700 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              {/* 난이도 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  난이도 설정
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => setSelectedDifficulty(difficulty.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
                        selectedDifficulty === difficulty.value
                          ? 'border-amber-400 bg-white text-amber-600 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-sm ${
                        selectedDifficulty === difficulty.value ? 'text-amber-600' : difficulty.color
                      }`}>
                        {difficulty.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 문제 수 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  문제 구성
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* 객관식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      객관식 문제
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={multipleChoiceCount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setMultipleChoiceCount(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setMultipleChoiceCount(numValue);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                      placeholder="0"
                    />
                  </div>

                  {/* 주관식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      주관식 문제
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={subjectiveCount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setSubjectiveCount(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setSubjectiveCount(numValue);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* 문제 유형 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  문제 유형
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleQuestionType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left text-sm font-medium ${
                        selectedQuestionTypes.includes(type.value)
                          ? 'border-teal-500 bg-white text-teal-600 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 문제지 생성 버튼 */}
            <button
              onClick={generateTest}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 mt-4"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              문제지 생성하기
              </div>
            </button>
          </div>
        </div>

                {/* 오른쪽: 문제지 미리보기 */}
        <div className="lg:col-span-9">
          {generatedTest ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6 min-h-[1000px]">
              
              {/* 실시간 스트리밍 콘텐츠 표시 */}
              {(isStreaming || (generatedTest && generatedTest.content)) && (
              <div className="mb-6">
                  <div className="text-left">
                    {/* 상태 표시 */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isStreaming 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200' 
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          isStreaming 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-green-500'
                        }`}></div>
                        <span>
                          {isStreaming ? '생성중...' : '완료'}
                        </span>
                      </div>
                    </div>
                    
                    {/* 탭 메뉴와 수정하기 버튼 */}
                    <div className="mb-4 flex justify-between items-center">
                      <div className="inline-flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <button
                          onClick={() => setActiveTab('problem')}
                          className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeTab === 'problem'
                              ? 'bg-white text-slate-700 shadow-sm border border-gray-200'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          문제지
                        </button>
                        <button
                          onClick={() => setActiveTab('answer')}
                          className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeTab === 'answer'
                              ? 'bg-white text-slate-700 shadow-sm border border-gray-200'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          정답과 해설
                        </button>
                      </div>
                      
                      {/* 수정하기/저장/취소/PDF생성 버튼 */}
                      <div className="flex items-center gap-2">
                        {!isEditMode ? (
                          <>
                            <button 
                              onClick={toggleEditMode}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              수정하기
                            </button>
                            <button 
                              onClick={generatePDF}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              PDF 생성
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={saveEditedContent}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                              저장
                        </button>
                            <button 
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              취소
                            </button>
                          </>
                        )}
                      </div>
                    </div>
              
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-[800px] overflow-y-auto">
                      {isEditMode ? (
                        <div className="h-full p-8">
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg no-print">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="font-medium">편집 모드</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">문제지 내용을 직접 수정할 수 있습니다. 저장 버튼을 클릭하여 변경사항을 적용하세요.</p>
                          </div>
                          
                          {/* 문제지 섹션 */}
                          <div className="mb-8 problem-section">
                            <div className="text-center border-b border-gray-200 pb-4 mb-6">
                              <h1 className="text-2xl font-bold text-gray-800">수학 문제지</h1>
                            </div>
                            <textarea
                              value={(() => {
                                const content = editedContent || streamingContent || generatedTest?.content || '';
                                const { problem } = separateProblemAndAnswer(content);
                                return problem;
                              })()}
                              onChange={(e) => {
                                const content = editedContent || streamingContent || generatedTest?.content || '';
                                const { answer } = separateProblemAndAnswer(content);
                                setEditedContent(e.target.value + '\n\n[정답]\n\n' + answer);
                              }}
                              className="w-full h-[500px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                              placeholder="문제지 내용을 입력하세요..."
                            />
                            </div>

                          {/* 페이지 분할 */}
                          <div className="page-break-before mb-8">
                            <div className="border-t-2 border-gray-300 my-8 page-divider">
                              <div className="text-center text-gray-500 text-sm py-2">정답과 해설</div>
                          </div>
                        </div>

                          {/* 정답과 해설 섹션 */}
                          <div className="answer-section">
                            <div className="text-center border-b border-gray-200 pb-4 mb-6">
                              <h1 className="text-2xl font-bold text-gray-800">정답과 해설</h1>
                              <p className="text-sm text-gray-500">각 문제의 정답과 상세한 해설을 확인하세요</p>
                            </div>
                            <textarea
                              value={(() => {
                                const content = editedContent || streamingContent || generatedTest?.content || '';
                                const { answer } = separateProblemAndAnswer(content);
                                return answer;
                              })()}
                              onChange={(e) => {
                                const content = editedContent || streamingContent || generatedTest?.content || '';
                                const { problem } = separateProblemAndAnswer(content);
                                setEditedContent(problem + '\n\n[정답]\n\n' + e.target.value);
                              }}
                              className="w-full h-[500px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                              placeholder="정답과 해설 내용을 입력하세요..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-8">
                          {(() => {
                            const content = streamingContent || generatedTest?.content || '';
                            const { problem, answer } = separateProblemAndAnswer(content);
                            
                            if (activeTab === 'problem') {
                              return (
                                <div className="simple-problem-layout">
                                  <div className="problem-header mb-8">
                                    <div className="text-center border-b border-gray-200 pb-4">
                                      <h1 className="text-2xl font-bold text-gray-800 mb-2">수학 문제지</h1>
                                    </div>
                                  </div>
                                  
                                  <div className="problem-content">
                                    {problem.split('\n').map((line, index) => {
                                      // 문제 번호 감지 (1번, 2번 등)
                                      if (line.match(/^\d+번\./)) {
                                        return (
                                          <div key={index} className="mb-6">
                                            <div className="text-lg font-bold text-gray-800 mb-3">{line}</div>
                                          </div>
                                        );
                                      }
                                      
                                      // 선택지 감지 (①, ②, ③, ④)
                                      if (line.match(/^[①②③④⑤⑥⑦⑧⑨⑩]/)) {
                                        return (
                                          <div key={index} className="ml-6 mb-2">
                                            <span className="text-gray-700 leading-relaxed">{line}</span>
                                          </div>
                                        );
                                      }
                                      
                                      // 서술형 답란 감지 (답:)
                                      if (line.includes('답:')) {
                                        return (
                                          <div key={index} className="mt-4 mb-6">
                                            <div 
                                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-colors"
                                              contentEditable
                                              suppressContentEditableWarning={true}
                                              style={{ outline: 'none' }}
                                            >
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      // 빈 줄
                                      if (line.trim() === '') {
                                        return <div key={index} className="mb-3"></div>;
                                      }
                                      
                                      // 일반 텍스트
                                      return (
                                        <div key={index} className="mb-3 text-gray-800 leading-relaxed">
                                          {line}
                                        </div>
                                      );
                                    })}
                                    
                                  </div>
                                  
                                  {isStreaming && (
                                    <div className="mt-6 text-center">
                                      <span className="inline-flex items-center gap-2 text-blue-500">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        생성 중...
                                </span>
                                    </div>
                              )}
                            </div>
                              );
                            } else {
                              return (
                                <div className="simple-answer-layout">
                                  <div className="answer-header mb-8">
                                    <div className="text-center border-b border-gray-200 pb-4">
                                      <h1 className="text-2xl font-bold text-gray-800 mb-2">정답과 해설</h1>
                                      <p className="text-sm text-gray-500">각 문제의 정답과 상세한 해설을 확인하세요</p>
                          </div>
                                  </div>
                                  
                                  <div className="answer-content">
                                    {(() => {
                                      const lines = answer.split('\n');
                                      const problems = [];
                                      let currentProblem = null;
                                      
                                      for (let i = 0; i < lines.length; i++) {
                                        const line = lines[i];
                                        
                                        // 정답 섹션 헤더는 건너뛰기
                                        if (line.includes('[정답]') || line.includes('정답:')) {
                                          continue;
                                        }
                                        
                                        // 문제 번호 감지 (1번, 2번 등)
                                        if (line.match(/^\d+번\./)) {
                                          // 이전 문제가 있으면 저장
                                          if (currentProblem) {
                                            problems.push(currentProblem);
                                          }
                                          
                                          // 새 문제 시작
                                          const parts = line.split('.');
                                          const problemNum = parts[0];
                                          const answer = parts[1]?.trim() || '';
                                          
                                          currentProblem = {
                                            number: problemNum,
                                            answer: answer,
                                            explanation: []
                                          };
                                        } else if (currentProblem && line.trim()) {
                                          // 해설 내용 추가
                                          currentProblem.explanation.push(line.trim());
                                        }
                                      }
                                      
                                      // 마지막 문제 추가
                                      if (currentProblem) {
                                        problems.push(currentProblem);
                                      }
                                      
                                      return problems.map((problem, index) => (
                                        <div key={index} className="mb-6 pb-6 border-b border-gray-100 last:border-b-0">
                                          <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
                                              {problem.number}
                                            </div>
                                            <div className="flex-1">
                                              {problem.answer && (
                                                <div className="mb-3">
                                                  <div className="text-lg font-semibold text-gray-800">{problem.answer}</div>
                                                </div>
                                              )}
                                              {problem.explanation.length > 0 && (
                                                <div className="space-y-1">
                                                  {problem.explanation.map((line, lineIndex) => (
                                                    <p key={lineIndex} className="text-gray-700 leading-relaxed">
                                                      {line}
                                                    </p>
                                                  ))}
                            </div>
                              )}
                          </div>
                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 에러 상태 */}
              {!generatedTest.loading && generatedTest.error && (
                <div className="text-center py-8">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-red-600 font-medium">{generatedTest.content}</p>
                  <button 
                    onClick={generateTest}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6 min-h-[1000px]">
              
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">문제지 생성 준비</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  왼쪽에서 설정을 완료하고<br />
                  <span className="font-semibold text-emerald-600">문제지 생성하기</span> 버튼을 클릭하면<br />
                  여기에 문제지가 생성됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 