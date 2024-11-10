from fastapi import APIRouter, HTTPException
from app.api.models import TranslationRequest, TranslationResponse
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    try:
        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a professional translator for English to {request.target_language}."
                },
                {
                    "role": "user",
                    "content": f"Translate this text to {request.target_language}: {request.text}"
                }
            ],
            temperature=0.3
        )
        
        return TranslationResponse(
            translated_text=response.choices[0].message.content
        )
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Translation failed")