from uagents import Agent, Context, Model
from typing import List, Optional, Dict
from enum import Enum
import requests
import json

# Groq API Key (replace with your key)
GROQ_API_KEY = "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"

class DocumentType(str, Enum):
    TECHNICAL = "technical"
    LEGAL = "legal"
    POLICY = "policy"
    GENERAL = "general"

# Input model from terminology agent
class TerminologyAnalysis(Model):
    text: str
    source_language: str
    target_language: str
    technical_terms: List[str]
    un_phrases: List[str]
    acronyms: Dict[str, str]
    doc_type: DocumentType

# Output model to validator agent
class TranslationResult(Model):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    preserved_terms: Dict[str, str]
    doc_type: DocumentType
    confidence_score: float

# Create Translation Agent
translation_agent = Agent(
    name="translation_agent",
    port=8003,
    seed="translation_agent_seed",
    endpoint=["http://127.0.0.1:8003/submit"],
)

# Address of quality validator agent (you'll get this after running validator agent)
VALIDATOR_AGENT_ADDRESS = ""

def perform_translation(text: str, source_lang: str, target_lang: str, terms: List[str]) -> str:
    """Perform translation using Groq API"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = f"""You are a UN translator. Translate the following text from {source_lang} to {target_lang}.
    Important rules:
    1. Preserve these technical terms and translate them using official UN translations: {terms}
    2. Maintain formal UN writing style
    3. Keep any acronyms in their original form
    
    Provide only the translated text, no explanations."""
    
    try:
        response = requests.post(
            url,
            headers=headers,
            json={
                "model": "mixtral-8x7b-32768",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                "temperature": 0.3
            }
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"Translation Error: {str(e)}"

@translation_agent.on_event("startup")
async def translation_start(ctx: Context):
    ctx.logger.info(f"Translation Agent's address: {ctx.address}")
    ctx.logger.info("Ready to process translations")

@translation_agent.on_message(model=TerminologyAnalysis)
async def handle_translation(ctx: Context, sender: str, msg: TerminologyAnalysis):
    ctx.logger.info(f"Received terminology analysis from {sender}")
    ctx.logger.info(f"Processing text: {msg.text[:100]}...")
    
    # Combine terms for preservation
    all_terms = msg.technical_terms + msg.un_phrases
    
    # Perform translation
    translated_text = perform_translation(
        msg.text,
        msg.source_language,
        msg.target_language,
        all_terms
    )
    
    # Track preserved terms and their translations
    preserved_terms = {}
    
    # Add technical terms and UN phrases
    for term in all_terms:
        if term in translated_text:
            preserved_terms[term] = translated_text  # In real implementation, you'd extract the exact translation
    
    # Add acronyms
    preserved_terms.update(msg.acronyms)
    
    # Create translation result
    response = TranslationResult(
        original_text=msg.text,
        translated_text=translated_text,
        source_language=msg.source_language,
        target_language=msg.target_language,
        preserved_terms=preserved_terms,
        doc_type=msg.doc_type,
        confidence_score=0.9 if "Error" not in translated_text else 0.0
    )
    
    # Send to validator agent
    if VALIDATOR_AGENT_ADDRESS:
        await ctx.send(VALIDATOR_AGENT_ADDRESS, response)
        ctx.logger.info("Translation sent to validator agent")
    else:
        ctx.logger.warning("Validator agent address not set, translation completed but not forwarded")

    # Log completion
    ctx.logger.info(f"Translation completed with confidence: {response.confidence_score}")

@translation_agent.on_interval(period=300)
async def status_check(ctx: Context):
    """Periodic status check"""
    ctx.logger.info("Translation agent running normally")
    ctx.logger.info("Waiting for terminology analysis requests...")

if __name__ == "__main__":
    translation_agent.run()