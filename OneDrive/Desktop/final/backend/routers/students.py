from fastapi import APIRouter, HTTPException, Body
from schemas.students import StudentAttendance
import csv
import os

router = APIRouter()

# 📌 CSV 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "attendance.csv")

# ✅ [CREATE] 출석 정보 추가
@router.post("/attendance")
def add_attendance(attendance: StudentAttendance):
    with open(CSV_PATH, mode='a', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=StudentAttendance.__annotations__.keys())
        if csvfile.tell() == 0:  # 파일이 비어있다면 헤더 추가
            writer.writeheader()
        writer.writerow(attendance.dict())
    return {"message": "출석 정보가 추가되었습니다."}


# ✅ [READ] 전체 출석 정보 조회
@router.get("/attendance", response_model=list[StudentAttendance])
def get_all_attendance():
    result = []
    with open(CSV_PATH, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            result.append(StudentAttendance(**row))
    return result


# ✅ [READ] 특정 날짜로 필터링
@router.get("/attendance/date/{date}", response_model=list[StudentAttendance])
def get_attendance_by_date(date: str):
    results = []
    with open(CSV_PATH, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["date"] == date:
                try:
                    results.append(StudentAttendance(**row))
                except Exception as e:
                    print("[ERROR] 변환 실패:", e)
                    raise HTTPException(status_code=500, detail=str(e))
    return results


# ✅ [UPDATE] 특정 학생 + 날짜로 수정
@router.put("/attendance/{name}/{date}")
def update_attendance(name: str, date: str, updated: StudentAttendance = Body(...)):
    updated_flag = False
    updated_rows = []

    with open(CSV_PATH, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["name"] == name and row["date"] == date:
                row = updated.dict()
                updated_flag = True
            updated_rows.append(row)

    if not updated_flag:
        raise HTTPException(status_code=404, detail="해당 학생의 출석 기록을 찾을 수 없습니다.")

    with open(CSV_PATH, mode='w', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=StudentAttendance.__annotations__.keys())
        writer.writeheader()
        writer.writerows(updated_rows)

    return {"message": "출석 정보가 수정되었습니다."}


# ✅ [DELETE] 특정 학생 + 날짜로 삭제
@router.delete("/attendance/{name}/{date}")
def delete_attendance(name: str, date: str):
    deleted_flag = False
    new_rows = []

    with open(CSV_PATH, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["name"] == name and row["date"] == date:
                deleted_flag = True
                continue
            new_rows.append(row)

    if not deleted_flag:
        raise HTTPException(status_code=404, detail="해당 출석 정보를 찾을 수 없습니다.")

    with open(CSV_PATH, mode='w', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=StudentAttendance.__annotations__.keys())
        writer.writeheader()
        writer.writerows(new_rows)

    return {"message": "출석 정보가 삭제되었습니다."}
