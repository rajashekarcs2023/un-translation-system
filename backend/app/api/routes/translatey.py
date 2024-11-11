from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re

# Initialize the router for modular routing
router = APIRouter()

# Load the model and tokenizer
model_name = "ag4sh1/Translate4Good"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Move the model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Request body model
class TranslationRequest(BaseModel):
    text: str

# Translation function
def translate_text(text, max_length=100):
    inputs = tokenizer(text, return_tensors="pt", truncation=True).to(device)
    with torch.no_grad():
        outputs = model.generate(inputs["input_ids"], max_length=max_length, num_beams=4, early_stopping=True)
    translation = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return translation

# Enhanced function to match capitalization and punctuation
def match_format(original_text, translated_text):
    # Tokenize both original and translated texts by words and punctuation
    original_tokens = re.findall(r'\w+|[^\w\s]', original_text, re.UNICODE)
    translated_tokens = re.findall(r'\w+|[^\w\s]', translated_text, re.UNICODE)

    formatted_tokens = []
    translated_index = 0

    for orig_token in original_tokens:
        if re.match(r'\W', orig_token):  # Punctuation token
            # Use original punctuation exactly as it is
            formatted_tokens.append(orig_token)
        else:
            if translated_index < len(translated_tokens):
                trans_token = translated_tokens[translated_index]
                
                # Match capitalization pattern
                if orig_token.isupper():
                    trans_token = trans_token.upper()
                elif orig_token[0].isupper():
                    trans_token = trans_token.capitalize()
                else:
                    trans_token = trans_token.lower()

                formatted_tokens.append(trans_token)
                translated_index += 1

    # Join tokens without adding extra spaces around punctuation
    formatted_text = ""
    for i, token in enumerate(formatted_tokens):
        if i > 0 and not re.match(r'\W', token) and not re.match(r'\W', formatted_tokens[i - 1]):
            formatted_text += " "  # Add space only between words
        formatted_text += token

    return formatted_text

@router.post("/translate", response_model=dict)
async def translate_text_route(request: TranslationRequest):
    try:
        # Generate translation
        raw_translation = translate_text(request.text)
        
        # Format translation to match original text's punctuation and casing
        formatted_translation = match_format(request.text, raw_translation)
        
        return {"translation": formatted_translation}
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Translation failed")
