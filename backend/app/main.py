from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import translate, improve

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(translate.router, prefix="/api")
app.include_router(improve.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Translation API is running"}