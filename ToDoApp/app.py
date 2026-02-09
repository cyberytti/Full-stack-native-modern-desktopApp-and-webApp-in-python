from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import sqlite3

app = FastAPI(title="ToDo API")
conn = sqlite3.connect('tasks.db', check_same_thread=False)  # Critical for async
cursor = conn.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL
);""")
conn.commit()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class Task(BaseModel):
    content: str

class TaskResponse(BaseModel):
    tasks: List[str]

# API Endpoints
@app.get("/api/tasks", response_model=TaskResponse)
async def get_tasks():
    """Get all tasks"""
    tasks_db = []
    lis = cursor.execute("SELECT task FROM Tasks").fetchall()
    for l in lis:
        tasks_db.append(l[0])
    return {"tasks": tasks_db}

@app.post("/api/tasks")  # FIXED: Removed trailing space in route
async def add_task(task: Task):
    """Add a new task"""
    cursor.execute("INSERT INTO Tasks (task) VALUES (?)", (task.content,))
    conn.commit()
    return {"message": "Task added successfully"}

@app.delete("/api/tasks/{item}")  # FIXED: Removed trailing space in route AND parameter
async def delete_task(item: str):
    """Delete a task by content"""
    # item is URL-decoded by FastAPI automatically
    cursor.execute("DELETE FROM Tasks WHERE task = ?", (item,))
    conn.commit()
    return {"message": "Task deleted successfully"}

@app.get("/")
async def serve_frontend():
    """Serve the main HTML page"""
    return FileResponse("static/test.html")