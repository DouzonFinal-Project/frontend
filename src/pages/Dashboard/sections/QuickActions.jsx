// src/pages/Dashboard/sections/QuickActions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// 아이콘 import
import counselIcon from "../../../assets/icons/dashboard/actionIcon.svg";
import examIcon from "../../../assets/icons/dashboard/actionIcon.svg";
import letterIcon from "../../../assets/icons/dashboard/actionIcon.svg";
import lifeRecordIcon from "../../../assets/icons/dashboard/actionIcon.svg";
import actionsCardIcon from "../../../assets/icons/dashboard/actionsCardIcon.svg";

export default function QuickActions({ actions = [] }) {
  const nav = useNavigate();

  // 기본 데이터 (네가 쓰던 아이콘 경로 유지)
  const data = actions.length
    ? actions
    : [
        { icon: counselIcon, label: "상담일지 작성", to: "/Counseling" },
        { icon: examIcon, label: "시험지 출제", to: "/Problem-writing" },
        { icon: letterIcon, label: "가정통신문 작성", to: "/letter/new" },
        { icon: lifeRecordIcon, label: "생활기록부 작성", to: "/LifeRecord" },
      ];

  const handleClick = (a) => {
    if (typeof a.onClick === "function") return a.onClick();
    if (a.to) return nav(a.to);
  };

  return (
    <section className="mt-6">
      <header className="mb-3 flex items-center gap-2">
        <img src={actionsCardIcon} className="h-5 w-5" alt="" loading="lazy" />
        <h3 className="text-lg font-semibold">빠른 업무 처리</h3>
      </header>

      {/* Builder 스타일 흡수: 연한 회색 카드, 파란 아이콘 박스, 호버 보더/섀도우 */}
      <div className="grid gap-3 md:grid-cols-4">
        {data.map((a) => (
          <button
            key={a.key ?? a.label}
            type="button"
            onClick={() => handleClick(a)}
            className="group rounded-xl bg-white px-5 py-4 text-left shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-[#667EEA] hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label={a.label}
          >
            <div className="flex items-center gap-3">
              {/* 35x35 파란 사각 아이콘 박스 (Builder 레이아웃 반영) */}
              <span className="flex items-center justify-center w-[35px] h-[35px] min-w-[35px] min-h-[35px] rounded-md bg-[#667EEA]">
                <img src={a.icon} className="w-[35px] h-[35px]" alt="" loading="lazy" />
              </span>

              {/* 라벨 */}
              <span className="font-medium text-[#1E293B]">{a.label}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
