from fastapi import FastAPI
from app.routes import teams, answers, hints, admin

app = FastAPI(title="Retreat Road Game API")

@app.get("/")
async def root():
    return {"message": "Welcome to the Retreat Road Game API"}

# Include routers
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(hints.router, prefix="/api/hints", tags=["hints"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
