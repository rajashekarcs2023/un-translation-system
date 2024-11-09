from uagents import Agent, Context, Model
from typing import List, Optional

# Define the message models
class TranslationRequest(Model):
    text: str
    source_language: str
    target_language: str
    technical_terms: Optional[List[str]] = []

class TranslationResponse(Model):
    translated_text: str
    preserved_terms: List[str]
    confidence: float

# Create Input Agent
input_agent = Agent(
    name="input_agent",
    port=8008,
    seed="input_agent_seed",
    endpoint=["http://127.0.0.1:8008/submit"],
)

# Address of translation agent (you'll get this after running translation agent)
TRANSLATION_AGENT_ADDRESS = "agent1qvhztjvxxrzuyeu4fy6qsag8c9zcn055q8mye90s5kcqejpzvjw7skllkfs"

@input_agent.on_event("startup")
async def input_start(ctx: Context):
    ctx.logger.info(f"Input Agent's address: {ctx.address}")
    # Send test translation on startup
    await send_translation_request(ctx)

@input_agent.on_message(model=TranslationResponse)
async def handle_translation_response(ctx: Context, sender: str, msg: TranslationResponse):
    ctx.logger.info(f"Received translation with confidence: {msg.confidence}")
    ctx.logger.info(f"Translated text: {msg.translated_text}")
    ctx.logger.info(f"Preserved terms: {msg.preserved_terms}")

async def send_translation_request(ctx: Context):
    request = TranslationRequest(
        text="The impact of land degradation on agricultural productivity",
        source_language="english",
        target_language="french",
        technical_terms=["land degradation", "agricultural productivity"]
    )
    await ctx.send(TRANSLATION_AGENT_ADDRESS, request)
    ctx.logger.info("Translation request sent")

if __name__ == "__main__":
    input_agent.run()