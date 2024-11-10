from fastapi import APIRouter, HTTPException
from app.api.models import ImprovementRequest, ImprovementResponse
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/improve", response_model=ImprovementResponse)
async def improve_translation(request: ImprovementRequest):
    try:
        system_prompt = f"""You are a professional translator and language expert. 
        For the selected text, provide 3-4 alternative translations that maintain the same meaning but vary in:
        1. Style (formal vs casual)
        2. Sentence structure (active vs passive voice)
        3. Word choice (using different synonyms)
        4. Grammar patterns typical in {request.targetLanguage}

        Provide ONLY the alternative translations, one per line, without any explanations.
        Each alternative should be a complete, fluent translation that sounds natural in {request.targetLanguage}.
        """

        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"""
                    Original text: {request.originalText}
                    Current translation of selected part: {request.selectedText}
                    
                    Provide 3-4 alternative translations for this text.
                    """
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )

        suggestions = [
            suggestion.strip() 
            for suggestion in response.choices[0].message.content.split('\n') 
            if suggestion.strip()
        ][:4]  # Take only first 4 suggestions

        return ImprovementResponse(suggestions=suggestions)

    except Exception as e:
        print(f"Improvement error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to generate alternative translations"
        )