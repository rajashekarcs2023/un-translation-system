from fastapi import APIRouter, UploadFile, File
import pdfplumber
import io

router = APIRouter()

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Create a PDF reader object
        pdf_file = io.BytesIO(contents)
        
        text = ""
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        
        return {"text": text}
    except Exception as e:
        return {"error": str(e)}, 500