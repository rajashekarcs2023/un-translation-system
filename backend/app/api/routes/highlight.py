from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TextRequest(BaseModel):
    text: str

class HighlightResponse(BaseModel):
    highlighted_text: str

@router.post("/highlight-terms")
async def highlight_terms(request: TextRequest):
    try:
        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical term identifier. Identify technical terms in the text and wrap them with [[ ]] brackets."
                },
                {
                    "role": "user",
                    "content": f"Identify technical terms in this text and wrap them with [[ ]]. Text: {request.text}"
                }
            ],
            temperature=0.3
        )
        
        highlighted_text = response.choices[0].message.content
        return {"highlighted_text": highlighted_text}

    except Exception as e:
        print(f"Highlighting error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))