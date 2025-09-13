// src/pages/Dashboard/sections/Notices.jsx
import React from "react";

import headerIcon from "../../../assets/icons/dashboard/notiIcon01.svg";
export default function Notices({
  title = "알림 및 공지사항",
  items = [],          // 프로젝트 포맷: [{ title, summary }]
  notifications,       // Builder 포맷:  [{ id, title, content }]
  className = "",
}) {
  // 우선순위: items → notifications → 기본 더미
  const data =
    items.length
      ? items
      : notifications?.length
      ? notifications.map((n) => ({
          id: n.id,
          title: n.title,
          summary: n.content, // Builder의 content를 summary로 매핑
        }))
      : [
          { title: "새로운 기능 업데이트", summary: "생활기록부 문구 추천 기능이 추가되었습니다." },
          { title: "사용법 가이드", summary: "AI 챗봇 활용 팁 가이드를 확인해보세요." },
        ];

  return (
    <section className={`mt-6 ${className}`}>
      {/* 섹션 헤더: 기존 골격 유지 */}
      <header className="mb-3 flex items-center gap-2">
        <img
          src={headerIcon}
          className="h-5 w-5"
          alt=""
          loading="lazy"
        />
        <h3 className="text-lg font-semibold">{title}</h3>
      </header>

      {/* 카드 컨테이너 */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {data.map((n, i) => (
          <div
            key={n.id ?? i}
            className="p-4 border-t first:border-t-0 border-slate-100"
          >
            {/* Builder 느낌(좌측 파란 보더 + 연한 배경) */}
            <div className="flex items-start gap-3 rounded-lg bg-[#F8FAFC] border-l-8 border-[#3498DB] p-4">
              <div>
                <div className="font-medium text-[#2C3E50]">{n.title}</div>
                <p className="mt-0.5 text-sm text-slate-600">
                  {n.summary ?? n.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
