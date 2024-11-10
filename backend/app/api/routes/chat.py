from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    translatedText: str
    context: List[Message]

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        messages = [
            {
                "role": "system",
                "content": """You are a helpful translation assistant. Help users understand and improve their translations.
                When appropriate, provide specific suggestions for improving the translation."""
            }
        ]
        
        # Add context messages
        for msg in request.context:
            messages.append({"role": msg.role, "content": msg.content})
            
        # Add current message with translation context
        messages.append({
            "role": "user",
            "content": f"""Translation: {request.translatedText}

User question: {request.message}"""
        })

        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        assistant_message = response.choices[0].message.content

        return {
            "message": assistant_message,
            "suggestions": [] # Add logic for suggestions if needed
        }

    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))