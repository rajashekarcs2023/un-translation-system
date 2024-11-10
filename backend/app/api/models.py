from pydantic import BaseModel

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "English"
    target_language: str

class TranslationResponse(BaseModel):
    translated_text: str
