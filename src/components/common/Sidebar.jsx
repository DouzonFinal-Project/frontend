import React, { useState, useEffect } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";

/** 경로 매핑 */
export const PATHS = { 
  dashboard: "/dashboard",
  attendance: "/attendance",
  grades: "/grades",
  progress: "/progress",
  reports: "/reports",
  counseling: "/counseling",
  LifeGuidance: "/LifeGuidance",
  studentInfo: "/studentInfo",
  homeLetter: "/homeLetter",
  notice: "/notice",
  staffCollaboration: "/staffCollaboration",
  Schedule: "/Schedule",
  timetable: "/timetable",
  events: "/events",
  documents: "/documents",
  facility: "/facility",
  survey: "/survey",
  "problem-writing": "/problem-writing",
  LifeRecord: "/LifeRecord",
};

// 서브메뉴 아이콘 컴포넌트들
const Submenu1Icon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2V8L12 10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const Submenu2Icon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// MenuItem 컴포넌트는 그대로 유지합니다.
const MenuItem = ({ item, isActive = false, onClick }) => (
  <button
    onClick={() => onClick(item.id)}
    className={`flex w-full h-12 px-4 items-center gap-3 transition-colors ${
      isActive
        ? "bg-[#3B82F6] text-white"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-200"
    }`}
  >
    <div className="flex w-5 h-5 items-center justify-center flex-shrink-0">
      {item.icon}
    </div>
    <span className="text-sm font-normal leading-normal">{item.label}</span>
  </button>
);

const SubMenuItem = ({ item, isActive = false, onClick }) => (
  <button
    onClick={() => onClick(item.id)}
    className={`flex w-full h-10 pr-4 items-center gap-2 transition-colors
      ${
        isActive
          ? "bg-[#3B82F6] text-white"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-200"
      }
      pl-12`}
  >
    <span className="w-4 h-4 flex items-center justify-center">
      {item.icon}
    </span>
    <span className="text-sm">{item.label}</span>
  </button>
);

// CategoryHeader 컴포넌트는 그대로 유지합니다.
const CategoryHeader = ({ title }) => (
  <div className="flex px-4 py-2 items-center bg-slate-600">
    <span className="text-slate-400 text-xs font-semibold leading-normal tracking-wide">
      {title}
    </span>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setActiveSub(null);
    const to = PATHS[menuId];
    if (to) navigate(to);
  };

  const [activeSub, setActiveSub] = useState(null);

  const gradesSubItems = [
    { id: "problem-writing", label: "문제작성", icon: <Submenu1Icon /> },
  ];

  const reportsSubItems = [
    { id: "LifeRecord", label: "생활기록부작성", icon: <Submenu2Icon /> },
  ];

  const MAIN_TO_SUB = {
    grades: ["problem-writing"],
    reports: ["LifeRecord"],
  };

  const isMenuActive = (id) => {
    if (activeMenu !== id) return false;
    const subs = MAIN_TO_SUB[id];
    // 자식이 활성화돼 있으면 부모는 비활성 처리
    if (subs && activeSub && subs.includes(activeSub)) return false;
    return true;
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "홈",
      icon: (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.16667 1.25H1.25V4.16667H4.16667V1.25Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
          <path
            d="M8.74992 1.25H5.83325V4.16667H8.74992V1.25Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
          <path
            d="M8.74992 5.83337H5.83325V8.75004H8.74992V5.83337Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
          <path
            d="M4.16667 5.83337H1.25V8.75004H4.16667V5.83337Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
  ];

  const academicMenuItems = [
    {
      id: "attendance",
      label: "출결관리",
      icon: (
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.99992 3.66667H4.66659C4.31296 3.66667 3.97382 3.80714 3.72378 4.05719C3.47373 4.30724 3.33325 4.64638 3.33325 5V9.66667C3.33325 10.0203 3.47373 10.3594 3.72378 10.6095C3.97382 10.8595 4.31296 11 4.66659 11H11.3333C11.6869 11 12.026 10.8595 12.2761 10.6095C12.5261 10.3594 12.6666 10.0203 12.6666 9.66667V5C12.6666 4.64638 12.5261 4.30724 12.2761 4.05719C12.026 3.80714 11.6869 3.66667 11.3333 3.66667H9.99992H5.99992ZM5.99992 3.66667V2.33333C5.99992 1.97971 6.14039 1.64057 6.39044 1.39052C6.64049 1.14048 6.97963 1 7.33325 1C7.68687 1 8.02601 1.14048 8.27606 1.39052C8.52611 1.64057 8.66659 1.97971 8.66659 2.33333V3.66667"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "grades",
      label: "성적평가",
      icon: (
        <svg
          width="12"
          height="10"
          viewBox="0 0 12 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 10V3.75M6 10V0M1 10V6.25"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "progress",
      label: "진도 및 과제관리",
      icon: (
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.3333 9H10.6667L8.66667 15L4.66667 3L2.66667 9H0"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "reports",
      label: "보고서 작성",
      icon: (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_324_5453)">
            <path
              d="M6.25 0H1.25C0.918479 0 0.600537 0.105357 0.366116 0.292893C0.131696 0.48043 0 0.734783 0 1V9C0 9.26522 0.131696 9.51957 0.366116 9.70711C0.600537 9.89464 0.918479 10 1.25 10H8.75C9.08152 10 9.39946 9.89464 9.63388 9.70711C9.8683 9.51957 10 9.26522 10 9V3M6.25 0L10 3M6.25 0L6.25 3H10"
              stroke="currentColor"
              strokeWidth="1.33333"
            />
          </g>
          <defs>
            <clipPath id="clip0_324_5453">
              <rect width="10" height="10" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
  ];

  const counselingMenuItems = [
    {
      id: "counseling",
      label: "상담관리",
      icon: (
        <svg
          width="12"
          height="13"
          viewBox="0 0 12 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 7.66667C11 7.96135 10.8829 8.24397 10.6746 8.45234C10.4662 8.66071 10.1836 8.77778 9.88889 8.77778H3.22222L1 11V2.11111C1 1.81643 1.11706 1.53381 1.32544 1.32544C1.53381 1.11706 1.81643 1 2.11111 1H9.88889C10.1836 1 10.4662 1.11706 10.6746 1.32544C10.8829 1.53381 11 1.81643 11 2.11111V7.66667Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "LifeGuidance",
      label: "생활지도",
      icon: (
        <svg
          width="12"
          height="11"
          viewBox="0 0 12 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 0V10M1 4C1 4 1 6 3.5 6C6 6 6 4 6 4C6 4 6 6 8.5 6C11 6 11 4 11 4M3.5 10H8.5"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>
      ),
    },
    {
      id: "studentInfo",
      label: "학생 특이사항",
      icon: (
        <svg
          width="12"
          height="11"
          viewBox="0 0 12 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.81818 11V9.88889C7.81818 9.29952 7.62662 8.73429 7.28565 8.31754C6.94467 7.90079 6.48221 7.66667 6 7.66667H2.81818C2.33597 7.66667 1.87351 7.90079 1.53253 8.31754C1.19156 8.73429 1 9.29952 1 9.88889V11M8.27273 5.44444L9.18182 6.55556L11 4.33333M6.22727 3.22222C6.22727 4.44952 5.41325 5.44444 4.40909 5.44444C3.40494 5.44444 2.59091 4.44952 2.59091 3.22222C2.59091 1.99492 3.40494 1 4.40909 1C5.41325 1 6.22727 1.99492 6.22727 3.22222Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
  ];

  const communicationMenuItems = [
    {
      id: "homeLetter",
      label: "가정통신문",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 2.25C11 1.5625 10.55 1 10 1H2C1.45 1 1 1.5625 1 2.25M11 2.25V9.75C11 10.4375 10.55 11 10 11H2C1.45 11 1 10.4375 1 9.75V2.25M11 2.25L6 6.625L1 2.25"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "notice",
      label: "공지사항",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 1L2 3.5C1.5 3.5 1 4.125 1 4.75V7.25C1 7.875 1.5 8.5 2 8.5L7 11M7 1V11M7 1C9 1 11 2.875 11 6C11 9.125 9 11 7 11M8 3.5C9 3.5 10 4.5 10 6C10 7.5 9 8.5 8 8.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ),
    },
    {
      id: "staffCollaboration",
      label: "교직원 협업",
      icon: (
        <svg
          width="12"
          height="11"
          viewBox="0 0 12 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.27273 11V9.88889C8.27273 9.29952 8.08117 8.73429 7.74019 8.31754C7.39922 7.90079 6.93676 7.66667 6.45455 7.66667H2.81818C2.33597 7.66667 1.87351 7.90079 1.53253 8.31754C1.19156 8.73429 1 9.29952 1 9.88889V11M11 11V9.88889C10.9997 9.39651 10.8656 8.91821 10.6188 8.52906C10.372 8.13992 10.0264 7.86198 9.63636 7.73889M7.81818 1.07222C8.20928 1.19461 8.55593 1.47261 8.80347 1.86239C9.05102 2.25218 9.18538 2.73157 9.18538 3.225C9.18538 3.71843 9.05102 4.19782 8.80347 4.5876C8.55593 4.97739 8.20928 5.25539 7.81818 5.37778M6.45455 3.22222C6.45455 4.44952 5.64052 5.44444 4.63636 5.44444C3.63221 5.44444 2.81818 4.44952 2.81818 3.22222C2.81818 1.99492 3.63221 1 4.63636 1C5.64052 1 6.45455 1.99492 6.45455 3.22222Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
  ];

  const scheduleMenuItems = [
    {
      id: "Schedule",
      label: "학급 일정",
      icon: (
        <svg
          width="12"
          height="11"
          viewBox="0 0 12 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.22222 0V2M3.77778 0V2M1 4H11M2.11111 1H9.88889C10.5025 1 11 1.44772 11 2V9C11 9.55228 10.5025 10 9.88889 10H2.11111C1.49746 10 1 9.55228 1 9V2C1 1.44772 1.49746 1 2.11111 1Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "timetable",
      label: "시간표 관리",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 3V6L8 7M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "events",
      label: "교내 행사",
      icon: (
        <svg
          width="14"
          height="15"
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 3L8 6.63636H12L9 9.36364L10 13L7 11.1818L4 13L5 9.36364L2 6.63636H6L7 3Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ),
    },
  ];

  const adminMenuItems = [
    {
      id: "documents",
      label: "행정 서류",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.25 1H2.25C1.91848 1 1.60054 1.10536 1.36612 1.29289C1.1317 1.48043 1 1.73478 1 2V10C1 10.2652 1.1317 10.5196 1.36612 10.7071C1.60054 10.8946 1.91848 11 2.25 11H9.75C10.0815 11 10.3995 10.8946 10.6339 10.7071C10.8683 10.5196 11 10.2652 11 10V4M7.25 1L11 4M7.25 1L7.25 4H11M8.5 6.5H3.5M8.5 8.5H3.5"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "facility",
      label: "교실 환경",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.33333 11V6H7.66667V11M1 4.5L6 1L11 4.5V10C11 10.2652 10.8829 10.5196 10.6746 10.7071C10.4662 10.8946 10.1836 11 9.88889 11H2.11111C1.81643 11 1.53381 10.8946 1.32544 10.7071C1.11706 10.5196 1 10.2652 1 10V4.5Z"
            stroke="currentColor"
            strokeWidth="1.33333"
          />
        </svg>
      ),
    },
    {
      id: "survey",
      label: "조사·설문",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 4.84615H8.5M3.5 6.38462H8.5M3.5 7.92308H6M2.25 1.76923H9.75C10.4404 1.76923 11 2.11363 11 2.53846V10.2308C11 10.6556 10.4404 11 9.75 11H2.25C1.55964 11 1 10.6556 1 10.2308V2.53846C1 2.11363 1.55964 1.76923 2.25 1.76923ZM4.125 1H7.875C8.22018 1 8.5 1.1722 8.5 1.38462V2.15385C8.5 2.36626 8.22018 2.53846 7.875 2.53846H4.125C3.77982 2.53846 3.5 2.36626 3.5 2.15385V1.38462C3.5 1.1722 3.77982 1 4.125 1Z"
            stroke="currentColor"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const path = location.pathname || "/";

    // 1) 서브 라우트 우선 처리: 하이라이트를 상위 메뉴로 매핑
    if (path.startsWith(PATHS["problem-writing"])) {
      setActiveMenu("grades");
      setActiveSub("problem-writing");
      return;
    }
    if (path.startsWith(PATHS["LifeRecord"])) {
      setActiveMenu("reports");
      setActiveSub("LifeRecord");
      return;
    }

    // 2) 그 외: PATHS에서 일치하는 키를 활성화
    const foundMain = Object.entries(PATHS).find(([, p]) => path.startsWith(p));
    if (foundMain) {
      const [key] = foundMain;
      setActiveMenu(key);
    } else {
      setActiveMenu("dashboard");
    }
    setActiveSub(null);
  }, [location.pathname]);

  return (
    <aside className="flex flex-col w-[250px] bg-slate-800 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col justify-center items-center min-h-[94px] px-4 py-3 gap-1.5 bg-slate-800">
        <h1 className="text-white text-lg font-bold leading-normal text-center">
          티봇초등학교
        </h1>
        <p className="text-white text-sm font-normal leading-normal text-center opacity-80">
          6학년 3반
        </p>
      </div>

      <div className="flex flex-col">
        {/* Dashboard */}
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeMenu === item.id}
            onClick={handleMenuClick}
          />
        ))}

        {/* Academic Management Section */}
        <CategoryHeader title="학사 관리" />
        {academicMenuItems.map((item) => (
          <React.Fragment key={item.id}>
            <MenuItem
              item={item}
              isActive={isMenuActive(item.id)}
              onClick={handleMenuClick}
            />
            {/* 성적평가 바로 다음에 문제작성 서브메뉴 */}
            {item.id === "grades" && (
              <div className="bg-slate-800">
                {gradesSubItems.map((sub) => (
                  <SubMenuItem
                    key={sub.id}
                    item={sub}
                    isActive={activeSub === sub.id}
                    onClick={(id) => {
                      setActiveSub(id);
                      const to = PATHS[id];
                      if (to) navigate(to);
                    }}
                  />
                ))}
              </div>
            )}
            {/* 보고서 작성 바로 다음에 생활기록부작성 서브메뉴 */}
            {item.id === "reports" && (
              <div className="bg-slate-800">
                {reportsSubItems.map((sub) => (
                  <SubMenuItem
                    key={sub.id}
                    item={sub}
                    isActive={activeSub === sub.id}
                    onClick={(id) => {
                      setActiveSub(id);
                      const to = PATHS[id];
                      if (to) navigate(to);
                    }}
                  />
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        {/* 성적평가 밑에: 문제작성 - 중복 제거 */}

        {/* 보고서 작성 밑에: 생활기록부작성 - 중복 제거 */}

        {/* Life & Counseling Section */}
        <CategoryHeader title="생활·상담" />
        {counselingMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeMenu === item.id}
            onClick={handleMenuClick}
          />
        ))}

        {/* Communication Section */}
        <CategoryHeader title="소통" />
        {communicationMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeMenu === item.id}
            onClick={handleMenuClick}
          />
        ))}

        {/* Schedule Management Section */}
        <CategoryHeader title="일정 관리" />
        {scheduleMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeMenu === item.id}
            onClick={handleMenuClick}
          />
        ))}

        {/* Administrative Tasks Section */}
        <CategoryHeader title="행정 업무" />
        {adminMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeMenu === item.id}
            onClick={handleMenuClick}
          />
        ))}

        <button
          className="flex w-full h-12 px-4 justify-center items-center gap-2.5 bg-red-600 hover:bg-red-700 transition-colors"
          onClick={() => {
            navigate("/"); // [ADD] 로그아웃 후 이동
          }}
        >          <span className="text-white text-sm font-bold leading-normal tracking-wide text-center">
            로그아웃
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
