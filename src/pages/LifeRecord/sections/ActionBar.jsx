
// src/pages/LifeRecord/sections/ActionBar.jsx
import React from "react";
export default function ActionBar({
  onRegenerate,
  onSave = () => {},
  onPreview = () => {},
  onPrint = () => {},
  regenerateText = "다시생성",
  saveText = "저장",
  previewText = "미리보기",
  printText = "인쇄",
  disabled = false,   
  className = "",
}) {
  const baseBtn =
    "flex h-[35px] px-6 justify-center items-center rounded-md text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className={["w-full flex flex-col gap-6", className].join(" ")}>
      <div className="flex gap-7">
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}                                  
          className={`${baseBtn} w-[110px] bg-[#27AE60] hover:bg-green-600 text-white`}
        >
          {saveText}
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={disabled || !onRegenerate}                 
          className={`${baseBtn} w-[110px] bg-[rgba(110,101,198,0.93)] hover:bg-[rgba(110,101,198,1)] text-white`}
          aria-label="AI 코멘트 다시 생성"
        >
          {regenerateText}
        </button>

        <button
          type="button"
          onClick={onPreview}
          disabled={disabled}                                  
          className={`${baseBtn} w-[110px] bg-[#E1ECF9] hover:bg-blue-100 text-[#2C6EB1]`}
        >
          {previewText}
        </button>

        <button
          type="button"
          onClick={onPrint}
          disabled={disabled}                                  
          className={`${baseBtn} w-[110px] bg-[#F1F4F8] hover:bg-gray-200 text-[#2D3A4B]`}
        >
          {printText}
        </button>
      </div>
    </div>
  );
}
