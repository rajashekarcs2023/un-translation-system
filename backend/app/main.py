from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import translate, improve, upload, highlight, chat  # Added upload here

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(translate.router, prefix="/api")
app.include_router(improve.router, prefix="/api")
app.include_router(upload.router, prefix="/api") 
app.include_router(highlight.router, prefix="/api") 
app.include_router(chat.router, prefix="/api")  # Added this line

@app.get("/")
async def root():
    return {"message": "Translation API is running"}