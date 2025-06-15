from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json
from typing import List
import io

from openai import OpenAI
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
from datetime import datetime

from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import retrieval_qa
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import pdfplumber

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")

# Initialise clients
openai_client = OpenAI(api_key=openai_api_key)
mongodb_client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)
db = mongodb_client["els_db"]
fs = GridFS(db)
company_documents_collection = db["company_documents"]

# Initialise FastAPI app
app = FastAPI()

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Models
class DocumentCreate(BaseModel):
    filename: str
    tags: List[str] = []
    version: str
    size: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    tags: List[str]
    uploadDate: str
    size: str

class DocumentDelete(BaseModel):
    document_ids: List[str]

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []

# Helper function to format file size
def format_file_size(size_bytes: int) -> str:
    if size_bytes == 0:
        return "0 B"
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{size_bytes:.1f} {size_names[i]}"

# Upload endpoint
@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...), tags: str = ""):
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Parse tags from JSON string
        try:
            tags_list = json.loads(tags) if tags else []
        except json.JSONDecodeError:
            tags_list = []
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Store file in GridFS
        file_id = fs.put(
            file_content,
            filename=file.filename,
            content_type="application/pdf",
            upload_date=datetime.now()
        )
        
        # Create document metadata
        document_data = {
            "file_id": file_id,
            "filename": file.filename,
            "tags": tags_list,
            "upload_date": datetime.now(),
            "size": format_file_size(file_size),
            "size_bytes": file_size
        }
        
        # Insert document metadata
        result = company_documents_collection.insert_one(document_data)
        
        return {
            "message": "Document uploaded successfully",
            "document_id": str(result.inserted_id),
            "filename": file.filename,
            "size": format_file_size(file_size)
        }
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Retrieve documents endpoint
@app.get("/api/documents", response_model=List[DocumentResponse])
async def get_documents():
    try:
        documents = []
        for doc in company_documents_collection.find().sort("filename", 1):
            documents.append(DocumentResponse(
                id=str(doc["_id"]),
                filename=doc["filename"],
                tags=doc.get("tags", []),
                uploadDate=doc["upload_date"].isoformat(),
                size=doc["size"]
            ))
        return documents
    except Exception as e:
        print(f"Error fetching documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")

# Download document endpoint
@app.get("/api/documents/{document_id}/download")
async def download_document(document_id: str):
    try:
        # Find document metadata
        document = company_documents_collection.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get file from GridFS
        file_data = fs.get(document["file_id"])
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Create streaming response
        def generate():
            yield file_data.read()
        
        return StreamingResponse(
            io.BytesIO(file_data.read()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={document['filename']}"}
        )
    
    except Exception as e:
        print(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")

# Delete documents endpoint
@app.delete("/api/documents")
async def delete_documents(request: DocumentDelete):
    try:
        deleted_count = 0
        
        for doc_id in request.document_ids:
            # Find document
            document = company_documents_collection.find_one({"_id": ObjectId(doc_id)})
            if document:
                # Delete file from GridFS
                fs.delete(document["file_id"])
                
                # Delete document metadata
                company_documents_collection.delete_one({"_id": ObjectId(doc_id)})
                deleted_count += 1
        
        return {
            "message": f"Successfully deleted {deleted_count} document(s)",
            "deleted_count": deleted_count
        }
    
    except Exception as e:
        print(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Delete failed")

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Call openai api to generate a chat response
        completion = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant for an employee learning system. Provide helpful and concise answers."},
                {"role": "user", "content": request.message}
            ],
            max_tokens=150
        )

        # Extract the AI's response text from the openai api response
        response_text = completion.choices[0].message.content.strip()
        return ChatResponse(response=response_text)
    except Exception as e:
        print(f"Error log: {str(e)}") # log for debugging
        return ChatResponse(response="Error: An issue occured. Please try again later.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)