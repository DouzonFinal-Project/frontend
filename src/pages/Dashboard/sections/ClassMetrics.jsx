// src/pages/Dashboard/sections/ClassMetrics.jsx
import React from "react";

// 아이콘 import
import classIcon from "../../../assets/icons/dashboard/class.svg";
import attendanceIcon from "../../../assets/icons/dashboard/attendance.svg";
import counselIcon from "../../../assets/icons/dashboard/counseling.svg";
import headerIcon from "../../../assets/icons/dashboard/classinfo.svg";

export default function ClassMetrics({
  title = "학급 정보",
  items = [],
  metrics,
  className = "",
}) {
  const data =
    items.length
      ? items
      : metrics?.length
      ? metrics.map((m) => ({
          iconSvg: m.icon,
          label: m.label,
          value: m.value,
        }))
      : [
          { icon: classIcon, label: "학급", value: "6학년 3반" },
          { icon: attendanceIcon, label: "출석률", value: "96.4%" },
          { icon: counselIcon, label: "이번 주 상담", value: "5건" },
        ];

  return (
    <section className={`mt-6 ${className}`}>
      <header className="mb-3 flex items-center gap-2">
        <img src={headerIcon} className="h-5 w-5" alt="" loading="lazy" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {data.map((m, i) => (
          <div
            key={m.id ?? m.label ?? i}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-center gap-2 text-slate-500">
              {typeof m.icon === "string" ? (
                <img
                  src={m.icon}
                  className="h-5 w-5 shrink-0"
                  alt=""
                  loading="lazy"
                />
              ) : m.iconSvg ? (
                <span className="h-5 w-5 shrink-0 [&>svg]:h-5 [&>svg]:w-5">
                  {m.iconSvg}
                </span>
              ) : m.icon ? (
                <span className="h-5 w-5 shrink-0 [&>svg]:h-5 [&>svg]:w-5">
                  {m.icon}
                </span>
              ) : null}

              <span className="text-sm">{m.label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
