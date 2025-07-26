from pydantic import BaseModel
from typing import Optional

class StudentAttendance(BaseModel):
    student_id: int
    name: str
    date: str
    status: str
    reason: Optional[str] = None
