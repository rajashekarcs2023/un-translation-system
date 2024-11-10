from pydantic import BaseModel
from typing import List

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "English"
    target_language: str

class TranslationResponse(BaseModel):
    translated_text: str
 
class ImprovementRequest(BaseModel):
    originalText: str
    translatedText: str
    selectedText: str
    targetLanguage: str

class ImprovementResponse(BaseModel):
    suggestions: List[str]