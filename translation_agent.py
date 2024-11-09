from uagents import Agent, Context, Model
from typing import List, Optional

# Define the same message models
class TranslationRequest(Model):
    text: str
    source_language: str
    target_language: str
    technical_terms: Optional[List[str]] = []

class TranslationResponse(Model):
    translated_text: str
    preserved_terms: List[str]
    confidence: float

# Create Translation Agent
translation_agent = Agent(
    name="translation_agent",
    port=8007,
    seed="translation_agent_seed",
    endpoint=["http://127.0.0.1:8007/submit"],
)

@translation_agent.on_event("startup")
async def translator_start(ctx: Context):
    ctx.logger.info(f"Translation Agent's address: {ctx.address}")
    # Save this address to use in input_agent.py
    ctx.logger.info("Use this address in input_agent.py")

@translation_agent.on_message(model=TranslationRequest)
async def handle_translation(ctx: Context, sender: str, msg: TranslationRequest):
    ctx.logger.info(f"Received translation request from {sender}")
    
    # Here you would integrate with a translation API
    # For MVP, using a simple example
    translated_text = "L'impact de la dégradation des terres sur la productivité agricole"
    
    response = TranslationResponse(
        translated_text=translated_text,
        preserved_terms=msg.technical_terms,
        confidence=0.95
    )
    
    await ctx.send(sender, response)
    ctx.logger.info("Translation sent back")

if __name__ == "__main__":
    translation_agent.run()