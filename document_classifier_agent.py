from uagents import Agent, Context, Model
from typing import List, Optional
from enum import Enum

class DocumentType(str, Enum):
    TECHNICAL = "technical"
    LEGAL = "legal"
    POLICY = "policy"
    GENERAL = "general"

class DocumentRequest(Model):
    text: str
    source_language: str
    target_language: str

class DocumentAnalysis(Model):
    text: str
    doc_type: DocumentType
    source_language: str
    target_language: str
    priority_level: int
    metadata: dict

classifier_agent = Agent(
    name="classifier_agent",
    port=8001,
    seed="classifier_agent_seed",
    endpoint=["http://127.0.0.1:8001/submit"],
)

# Address of terminology agent (you'll get this after running terminology agent)
TERMINOLOGY_AGENT_ADDRESS = ""

@classifier_agent.on_event("startup")
async def classifier_start(ctx: Context):
    ctx.logger.info(f"Document Classifier Agent's address: {ctx.address}")

@classifier_agent.on_message(model=DocumentRequest)
async def handle_document(ctx: Context, sender: str, msg: DocumentRequest):
    ctx.logger.info(f"Received document request from {sender}")
    
    # Analyze document (simplified for example)
    doc_type = DocumentType.TECHNICAL if "technical" in msg.text.lower() else DocumentType.GENERAL
    
    # Create analysis response
    response = DocumentAnalysis(
        text=msg.text,
        doc_type=doc_type,
        source_language=msg.source_language,
        target_language=msg.target_language,
        priority_level=1,
        metadata={
            "timestamp": "2024-11-10",
            "word_count": len(msg.text.split()),
            "requires_review": True
        }
    )
    
    # Send to terminology agent
    await ctx.send(TERMINOLOGY_AGENT_ADDRESS, response)
    ctx.logger.info("Document analysis sent to terminology agent")

if __name__ == "__main__":
    classifier_agent.run()