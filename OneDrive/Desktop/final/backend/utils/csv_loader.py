import csv

def load_students_from_csv(file_path: str):
    students = []
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            students.append(row)
    return students