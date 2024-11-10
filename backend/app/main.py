from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.translate import router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include only the translation router
app.include_router(router, prefix="/api")