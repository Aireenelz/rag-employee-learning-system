from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
import json
import io
from datetime import datetime
from bson import ObjectId

from openai import OpenAI
from pymongo import MongoClient
from gridfs import GridFS
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
chroma_api_key = os.getenv("CHROMA_API_KEY")
chroma_tenant = os.getenv("CHROMA_TENANT")
chroma_database = os.getenv("CHROMA_DATABASE")

# Initialise clients
openai_client = OpenAI(api_key=openai_api_key)
mongodb_client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)
db = mongodb_client["els_db"]
fs = GridFS(db)
company_documents_collection = db["company_documents"]

# Initialise Chroma Cloud client
embeddings = OpenAIEmbeddings(api_key=openai_api_key)
chroma_client = Chroma(
    collection_name="company_documents",
    embedding_function=embeddings,
    chroma_cloud_api_key=chroma_api_key,
    tenant=chroma_tenant,
    database=chroma_database
)

# Initialise FastAPI app
app = FastAPI()

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://rag-employee-learning-system.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models
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

class SourceInfo(BaseModel):
    document_id: str
    filename: str
    tags: str

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceInfo] = []

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

# Function to process and store uploaded document embeddings in Chroma
def process_and_store_document(file_content: bytes, doc_id: str, filename: str, tags_list: List[str], chroma_client: Chroma):
    try:
        # Extract text from PDF
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text += page_text
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)

        # Convert tags_list to a string for Chroma compatibility
        tags_str = ",".join(tags_list) if tags_list else ""

        # Generate metadata for each chunk
        metadatas = [
            {"doc_id": doc_id, "filename": filename, "tags": tags_str}
            for _ in range(len(chunks))
        ]

        # Add texts to Chroma Cloud
        chroma_client.add_texts(
            ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
            texts=chunks,
            metadatas=metadatas
        )
    except Exception as e:
        print(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

# Upload endpoint
@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...), tags: str = Form(...)):
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
        # This creates entries in fs.files (one per uploaded file) and fs.chunks (multiple entries per file, depending on its size)
        # The file_id returned is stored in the company_documents_collection as file_id, linking the metadata to the gridfs-stored file
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
        
        # Insert document metadata to company_documents_collection
        result = company_documents_collection.insert_one(document_data)
        doc_id = str(result.inserted_id)
        
        # Call function to process and store uploaded document embeddings in Chroma
        process_and_store_document(file_content, doc_id, file.filename, tags_list, chroma_client)

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
                
                # Delete document metadata from company_documents collection
                company_documents_collection.delete_one({"_id": ObjectId(doc_id)})
                
                # Delete from Chroma Cloud
                chroma_client.delete(ids=[f"{doc_id}_{i}" for i in range(100)])

                deleted_count += 1
        
        return {
            "message": f"Successfully deleted {deleted_count} document(s)",
            "deleted_count": deleted_count
        }
    except Exception as e:
        print(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Delete failed")

# Chat endpoint with naive RAG
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Initialise llm and retriever
        llm = ChatOpenAI(api_key=openai_api_key, model="gpt-3.5-turbo", temperature=0.2)
        retriever = chroma_client.as_retriever(search_kwargs={"k":3})

        # Prompt template
        prompt_template = """
        You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd. Use the following context to answer the question.
        If the context is insufficient, provide a general response based on your knowledge or say you do not know.
        Context: {context}
        Question: {question}
        Answer:
        """
        prompt = PromptTemplate(input_variables=["context", "question"], template=prompt_template)

        # Initialise rag chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

        # Get response and sources
        result = qa_chain.invoke({"query": request.message})
        response_text = result["result"].strip()

        print(result)

        # Process sources directly from metadata
        sources_info = []
        seen_doc_ids = set()

        for doc in result["source_documents"]:
            doc_id = doc.metadata.get("doc_id")
            if doc_id and doc_id not in seen_doc_ids:
                filename = doc.metadata.get("filename", "Unknown Document")
                tags_str = doc.metadata.get("tags", "")
                
                sources_info.append(SourceInfo(
                    document_id=doc_id,
                    filename=filename,
                    tags=tags_str
                ))

                seen_doc_ids.add(doc_id)

        return ChatResponse(response=response_text, sources=sources_info)
    except Exception as e:
        print(f"Error log: {str(e)}") # log for debugging
        return ChatResponse(response="Error: An issue occured. Please try again later.")

# Health check endpoint
@app.get("/healthcheck")
def health_check():
    return {"status": "Backend running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)