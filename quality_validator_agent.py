from uagents import Agent, Context, Model
from typing import List, Optional, Dict
from enum import Enum

class DocumentType(str, Enum):
    TECHNICAL = "technical"
    LEGAL = "legal"
    POLICY = "policy"
    GENERAL = "general"

class TranslationResult(Model):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    preserved_terms: Dict[str, str]
    doc_type: DocumentType
    confidence_score: float

class ValidationReport(Model):
    original_text: str
    translated_text: str
    quality_score: float
    terminology_accuracy: float
    style_compliance: float
    formatting_score: float
    issues_found: List[str]
    suggestions: List[str]
    status: str

validator_agent = Agent(
    name="validator_agent",
    port=8004,
    seed="validator_agent_seed",
    endpoint=["http://127.0.0.1:8004/submit"],
)

@validator_agent.on_event("startup")
async def validator_start(ctx: Context):
    ctx.logger.info(f"Quality Validator Agent's address: {ctx.address}")

@validator_agent.on_message(model=TranslationResult)
async def handle_validation(ctx: Context, sender: str, msg: TranslationResult):
    ctx.logger.info(f"Received translation result from {sender}")
    
    # Perform validation checks
    issues = []
    suggestions = []
    
    # Check preserved terms
    for original, translated in msg.preserved_terms.items():
        if translated not in msg.translated_text:
            issues.append(f"Term not properly preserved: {original}")
            suggestions.append(f"Consider keeping '{original}' as '{translated}'")
    
    # Check basic quality indicators (simplified)
    term_score = 1.0 - (len(issues) * 0.1)
    style_score = 0.95 if msg.translated_text[0].isupper() else 0.8
    format_score = 0.90
    
    # Calculate overall quality score
    quality_score = (term_score + style_score + format_score) / 3
    
    # Determine status
    status = "APPROVED" if quality_score >= 0.8 else "NEEDS_REVISION"
    
    # Create validation report
    report = ValidationReport(
        original_text=msg.original_text,
        translated_text=msg.translated_text,
        quality_score=quality_score,
        terminology_accuracy=term_score,
        style_compliance=style_score,
        formatting_score=format_score,
        issues_found=issues,
        suggestions=suggestions,
        status=status
    )
    
    # Log the final report
    ctx.logger.info(f"Validation completed with status: {status}")
    ctx.logger.info(f"Quality Score: {quality_score:.2f}")
    if issues:
        ctx.logger.info("Issues found:")
        for issue in issues:
            ctx.logger.info(f"- {issue}")
    
    # In a real system, you might want to:
    # 1. Store the report in a database
    # 2. Send notifications to relevant parties
    # 3. Trigger revision workflow if needed
    # 4. Generate detailed documentation

@Agent.on_interval(period=3600)
async def cleanup_task(ctx: Context):
    """Periodic cleanup of old validation reports"""
    ctx.logger.info("Running periodic cleanup task")

if __name__ == "__main__":
    validator_agent.run()