from uagents import Agent, Context, Model
from typing import List, Optional, Dict
from enum import Enum

class DocumentType(str, Enum):
    TECHNICAL = "technical"
    LEGAL = "legal"
    POLICY = "policy"
    GENERAL = "general"

class DocumentAnalysis(Model):
    text: str
    doc_type: DocumentType
    source_language: str
    target_language: str
    priority_level: int
    metadata: dict

class TerminologyAnalysis(Model):
    text: str
    source_language: str
    target_language: str
    technical_terms: List[str]
    un_phrases: List[str]
    acronyms: Dict[str, str]
    doc_type: DocumentType

terminology_agent = Agent(
    name="terminology_agent",
    port=8002,
    seed="terminology_agent_seed",
    endpoint=["http://127.0.0.1:8002/submit"],
)

# Address of translation agent (you'll get this after running translation agent)
TRANSLATION_AGENT_ADDRESS = ""

@terminology_agent.on_event("startup")
async def terminology_start(ctx: Context):
    ctx.logger.info(f"Terminology Agent's address: {ctx.address}")

@terminology_agent.on_message(model=DocumentAnalysis)
async def handle_terminology(ctx: Context, sender: str, msg: DocumentAnalysis):
    ctx.logger.info(f"Received document analysis from {sender}")
    
    # Extract terminology (simplified for example)
    technical_terms = ["land degradation", "agricultural productivity"] if "degradation" in msg.text else []
    un_phrases = ["impact assessment", "sustainable development"] if "sustainable" in msg.text else []
    acronyms = {"UNCCD": "United Nations Convention to Combat Desertification"} if "UNCCD" in msg.text else {}
    
    # Create terminology response
    response = TerminologyAnalysis(
        text=msg.text,
        source_language=msg.source_language,
        target_language=msg.target_language,
        technical_terms=technical_terms,
        un_phrases=un_phrases,
        acronyms=acronyms,
        doc_type=msg.doc_type
    )
    
    # Send to translation agent
    await ctx.send(TRANSLATION_AGENT_ADDRESS, response)
    ctx.logger.info("Terminology analysis sent to translation agent")

if __name__ == "__main__":
    terminology_agent.run()
