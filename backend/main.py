from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import json
import io
from datetime import datetime
from bson import ObjectId

from auth import UserContext, get_current_user
from gamification_api import router as gamification_router
from analytics_api import router as analytics_router

from openai import AsyncOpenAI
import asyncio
from functools import lru_cache
from pymongo import MongoClient
from gridfs import GridFS
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from supabase import create_client, Client

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
chroma_api_key = os.getenv("CHROMA_API_KEY")
chroma_tenant = os.getenv("CHROMA_TENANT")
chroma_database = os.getenv("CHROMA_DATABASE")
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB in bytes

# Access level hierarchy
ACCESS_HIERARCHY = {
    "public": 0,
    "partner": 1,
    "internal": 2,
    "admin": 3
}

# Mapping the role to minimum access level. Can access its level and below
ROLE_MIN_ACCESS = {
    "partner": 1,
    "internal-employee": 2,
    "admin": 3
}

# Initialise clients
async_openai_client = AsyncOpenAI(api_key=openai_api_key)
mongodb_client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)
db = mongodb_client["els_db"]
fs = GridFS(db)
company_documents_collection = db["company_documents"]

# Supabase client setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")
supabase: Client = create_client(supabase_url, supabase_secret_key)

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
        "https://employee-learning-system.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Gamification routes
app.include_router(gamification_router)

# Analytics routes
app.include_router(analytics_router)

# Pydantic models
class DocumentResponse(BaseModel):
    id: str
    filename: str
    tags: List[str]
    uploadDate: str
    size: str
    access_level: str

class PaginatedDocumentsResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

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

class DocumentIdsRequest(BaseModel):
    document_ids: List[str]

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str
    access_level: str

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    access_level: Optional[str] = None

class FAQResponse(BaseModel):
    id: str
    question: str
    answer: str
    category: str
    access_level: str
    access_level_num: int
    created_at: str
    updated_at: str

class TagsManagement(BaseModel):
    tags: List[str]

class DocumentUpdate(BaseModel):
    tags: Optional[List[str]] = None
    access_level: Optional[str] = None

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
def process_and_store_document(file_content: bytes, doc_id: str, filename: str, tags_list: List[str], access_level: str, chroma_client: Chroma):
    try:
        # Extract text from PDF
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = "".join(page.extract_text() or "" for page in pdf.pages)
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)

        # Convert tags_list to a string for Chroma compatibility
        tags_str = ",".join(tags_list) if tags_list else ""

        # Store numeric access level
        access_level_num = ACCESS_HIERARCHY.get(access_level, 0)

        # Generate metadata for each chunk
        metadatas = [
            {
                "doc_id": doc_id,
                "filename": filename,
                "tags": tags_str,
                "access_level": access_level,
                "access_level_num": access_level_num
            }
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

# Function to return retriever instance, retriever instances are cached per access level
@lru_cache(maxsize=10)
def get_cached_retriever_with_scores(access_level: int):
    def search_with_scores(query: str, k: int = 3):
        return chroma_client.similarity_search_with_score(
            query,
            k=k,
            filter={"access_level_num": {"$lte": access_level}}
        )
    return search_with_scores

# Upload endpoint
@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...), tags: str = Form(...), access_level: str = Form(...), current_user: UserContext = Depends(get_current_user)):
    try:
        # Only admins and internal employees can upload documents
        if current_user.role not in ["admin", "internal-employee"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to upload documents")
        
        # Validate access level
        if access_level not in ACCESS_HIERARCHY:
            raise HTTPException(status_code=400, detail="Invalid access level")

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

        # Validate file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size allowed is {MAX_FILE_SIZE // (1024*1024)}MB.")
        
        # Validate file is not empty
        if file_size == 0:
            raise HTTPException(status_code=400, detail="File is empty.")
        
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
            "access_level": access_level,
            "access_level_num": ACCESS_HIERARCHY[access_level],
            "uploaded_by": current_user.email,
            "upload_date": datetime.now(),
            "size": format_file_size(file_size),
            "size_bytes": file_size
        }
        
        # Insert document metadata to company_documents_collection
        result = company_documents_collection.insert_one(document_data)
        doc_id = str(result.inserted_id)
        
        # Process and store uploaded document embeddings in Chroma
        try:
            process_and_store_document(file_content, doc_id, file.filename, tags_list, access_level, chroma_client)
        except Exception as e:
            # If embedding fails, clean up Mongodb entries
            company_documents_collection.delete_one({"_id": result.inserted_id})
            fs.delete(file_id)
            raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

        return {
            "message": "Document uploaded successfully",
            "document_id": str(result.inserted_id),
            "filename": file.filename,
            "size": format_file_size(file_size),
            "access_level": access_level
        }
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Retrieve documents endpoint
@app.get("/api/documents", response_model=PaginatedDocumentsResponse)
async def get_documents(page: int = 1, page_size: int = 10, current_user: UserContext = Depends(get_current_user)):
    try:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10
        
        query = {"access_level_num": {"$lte": current_user.min_access_level}}

        # Get total count
        total_documents = company_documents_collection.count_documents(query)

        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = (total_documents + page_size - 1) // page_size

        # Fetch paginated documents
        documents = [
            DocumentResponse(
                id=str(doc["_id"]),
                filename=doc["filename"],
                tags=doc.get("tags", []),
                uploadDate=doc["upload_date"].isoformat(),
                size=doc["size"],
                access_level=doc["access_level"]
            )
            for doc in company_documents_collection.find(query)
                .sort("filename", 1)
                .skip(skip) # Ignore the first N documents, then start returning results
                .limit(page_size)
        ]

        return PaginatedDocumentsResponse(
            documents=documents,
            total=total_documents,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        print(f"Error fetching documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")

# Download document endpoint
@app.get("/api/documents/{document_id}/download")
async def download_document(document_id: str, current_user: UserContext = Depends(get_current_user)):
    try:
        # Find document metadata in MongoDB
        document = company_documents_collection.find_one({
            "_id": ObjectId(document_id),
            "access_level_num": {"$lte": current_user.min_access_level}
        })

        if not document:
            raise HTTPException(status_code=404, detail="Document not found or access denied")
        
        # Get the actual binary PDF file from GridFS using file_id
        file_data = fs.get(document["file_id"])
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        # For inline viewing (not download)
        headers = {
            "Content-Disposition": f"inline; filename={document['filename']}",
            "Content-Type": "application/pdf",
            "Cache-Control": "public, max-age=3600" # cache for 1 hour
        }

        pdf_bytes = file_data.read()
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers=headers
        )
    except Exception as e:
        print(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")

# Delete documents endpoint
@app.delete("/api/documents")
async def delete_documents(request: DocumentDelete, current_user: UserContext = Depends(get_current_user)):
    try:
        # Only admins and internal employees can delete documents
        if current_user.role not in ["admin", "internal-employee"]:
            raise HTTPException(status_code=403, detail="Only administrators or internal employees can delete documents")
        
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
                try:
                    # Get all chunk IDs for this document
                    results = chroma_client.get(where={"doc_id": doc_id})
                    if results and results['ids']:
                        chroma_client.delete(ids=results['ids'])
                except Exception as e:
                    print(f"Error deleting from Chroma: {e}")

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
async def chat(request: ChatRequest, current_user: UserContext = Depends(get_current_user)):
    try:
        # Retriever
        search_func = get_cached_retriever_with_scores(current_user.min_access_level)

        # Relevance threshold
        # For cosine distance: lower is better (typically 0.3-0.5)
        RELEVANCE_THRESHOLD = 0.5
        
        # Parallel execution for chromadb retrieval
        docs_task = asyncio.create_task(
            asyncio.to_thread(search_func, request.message, k=3)
        )

        general_system_message = (
            "You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd. "
            "The user's question doesn't match specific company documents, "
            "so provide a helpful general response based on your knowledge."
        )
        
        context_system_message = (
            "You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd "
            "Answer based on the provided context. "
            "If the context is insufficient, provide a general response."
        )

        docs_with_scores = await docs_task

        # Filter by relevance score
        relevant_docs = [
            doc for doc, score in docs_with_scores
            if score <= RELEVANCE_THRESHOLD
        ]

        # Determine if should show sources
        # show_sources = len(relevant_docs) > 0

        # Prepare context and messages
        if relevant_docs:
            context = "\n\n".join([doc.page_content for doc in relevant_docs])
            user_content = f"Context:\n{context}\n\nQuestion: {request.message}"
            system_message = context_system_message
        else:
            user_content = f"Question: {request.message}"
            system_message = general_system_message
        
        # OpenAI call
        response = await async_openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_content}
            ],
            temperature=0.2,
            max_tokens=500
        )

        answer = response.choices[0].message.content.strip()

        # Process sources
        sources_info = []
        seen_doc_ids = set()
        for doc in relevant_docs:
            doc_id = doc.metadata.get("doc_id")
            if doc_id and doc_id not in seen_doc_ids:
                sources_info.append(SourceInfo(
                    document_id=doc_id,
                    filename=doc.metadata.get("filename", "Unknown Document"),
                    tags=doc.metadata.get("tags", "")
                ))
                seen_doc_ids.add(doc_id)

        return ChatResponse(response=answer, sources=sources_info)
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return ChatResponse(response="Error: An issue occured. Please try again.")

# Chat endpoint (streaming)
@app.post("/api/chat-streaming")
async def chat_stream(request: ChatRequest, current_user: UserContext = Depends(get_current_user)):
    try:
        # Retriever
        search_func = get_cached_retriever_with_scores(current_user.min_access_level)

        # Relevance threshold
        # For cosine distance: lower is better (typically 0.3-0.5)
        RELEVANCE_THRESHOLD = 0.5
        
        # Parallel execution for chromadb retrieval
        docs_task = asyncio.create_task(
            asyncio.to_thread(search_func, request.message, k=3)
        )

        general_system_message = (
            "You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd. "
            "The user's question doesn't match specific company documents. "
            "Provide a helpful general response using markdown formatting for clarity:\n"
            "- Use **bold** for key points\n"
            "- Use bullet points for lists\n"
            "- Use headings (##) to organize longer responses\n"
            "- Break content into digestible paragraphs"
        )
        
        context_system_message = (
            "You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd. "
            "Answer based on the provided context. "
            "Format your responses using markdown for better readability:\n"
            "- Use **bold** for key points\n"
            "- Use bullet points for lists\n"
            "- Use headings (##) to organize longer responses\n"
            "- Break content into digestible paragraphs"
            "If the context is insufficient, provide a general response."
        )

        docs_with_scores = await docs_task

        # Filter by relevance score
        relevant_docs = [
            doc for doc, score in docs_with_scores
            if score <= RELEVANCE_THRESHOLD
        ]

        # Determine if should show sources
        show_sources = len(relevant_docs) > 0

        # Prepare context and messages
        if relevant_docs:
            context = "\n\n".join([doc.page_content for doc in relevant_docs])
            user_content = f"Context:\n{context}\n\nQuestion: {request.message}"
            system_message = context_system_message
        else:
            user_content = f"Question: {request.message}"
            system_message = general_system_message

        # Async OpenAI client with streaming
        stream = await async_openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_content}
            ],
            temperature=0.2,
            max_tokens=500,
            stream=True
        )

        # Process sources
        async def process_sources():
            if not show_sources:
                return []
            
            sources_info = []
            seen_doc_ids = set()

            for doc in relevant_docs:
                doc_id = doc.metadata.get("doc_id")
                if doc_id and doc_id not in seen_doc_ids:
                    sources_info.append(SourceInfo(
                        document_id=doc_id,
                        filename=doc.metadata.get("filename", "Unknown Document"),
                        tags=doc.metadata.get("tags", "")
                    ))
                    seen_doc_ids.add(doc_id)
            
            sources_list = [source.model_dump() for source in sources_info]
            return sources_list
        
        sources_task = asyncio.create_task(process_sources())

        # Stream response to client
        async def generate():
            try:
                # Stream content chunks
                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                # Send sources after content completes
                sources = await sources_task
                yield f"data: {json.dumps({'sources': sources, 'done': True, 'used_context': show_sources})}\n\n"
                
            except Exception as e:
                print(f"Streaming error: {str(e)}")
                yield f"data: {json.dumps({'error': 'Streaming failed', 'done': True})}\n\n"

        return StreamingResponse(
            generate(), 
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat processing failed")

# Endpoint to fetch metadata of multiple specific documents from mongodb, to display a user's bookmarked documents in YourBookmarks page
@app.post("/api/documents/batch", response_model=List[DocumentResponse])
async def get_documents_batch(request: DocumentIdsRequest):
    try:
        # Convert string Ids to ObjectIds
        object_ids = []
        for doc_id in request.document_ids:
            try:
                object_ids.append(ObjectId(doc_id))
            except Exception as e:
                print(f"Invalid document ID {doc_id}: {str(e)}")
                continue
        
        # Fetch all documents in a single database query
        docs_cursor = company_documents_collection.find({
            "_id": {"$in": object_ids}
        })

        # Format the results
        documents = []
        for doc in docs_cursor:
            documents.append(DocumentResponse(
                id=str(doc["_id"]),
                filename=doc["filename"],
                tags=doc.get("tags", []),
                uploadDate=doc["upload_date"].isoformat(),
                size=doc["size"],
                access_level=doc["access_level"]
            ))
        
        return documents
    except Exception as e:
        print(f"Error in batch fetch: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")

# Endpoint to get all FAQs (filtered by user access level)
@app.get("/api/faqs", response_model=List[FAQResponse])
async def get_faqs(current_user: UserContext = Depends(get_current_user)):
    try:
        response = supabase.table("faqs").select("*").lte(
            "access_level_num", current_user.min_access_level
            ).order("category").order("created_at").execute()
        
        return response.data
    except Exception as e:
        print(f"Error fetching FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch FAQs")

# Endpoint to create FAQ (admin only)
@app.post("/api/faqs", response_model=FAQResponse)
async def create_faq(faq: FAQCreate, current_user: UserContext = Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can create FAQs")
        
        # Convert access_level string to number
        access_level_num = ACCESS_HIERARCHY.get(faq.access_level, 0)

        response = supabase.table("faqs").insert({
            "question": faq.question,
            "answer": faq.answer,
            "category": faq.category,
            "access_level": faq.access_level,
            "access_level_num": access_level_num,
            "created_by": current_user.user_id
        }).execute()

        return response.data[0]
    except Exception as e:
        print(f"Error creating FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create FAQ")

# Endpoint to update FAQ (admin only)
@app.put("/api/faqs/{faq_id}", response_model=FAQResponse)
async def update_faq(faq_id: str, faq: FAQUpdate, current_user: UserContext = Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can update FAQs")
        
        update_data = {k: v for k, v in faq.dict().items() if v is not None}

        # If access_level is being updated, also update access_level_num
        if "access_level" in update_data:
            update_data["access_level_num"] = ACCESS_HIERARCHY.get(update_data["access_level"], 0)
        
        response = supabase.table("faqs").update(update_data).eq("id", faq_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="FAQ not found")

        return response.data[0]
    except Exception as e:
        print(f"Error updating FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update FAQ")

# Endpoint to delete FAQ (admin only)
@app.delete("/api/faqs/{faq_id}")
async def delete_faq(faq_id: str, current_user: UserContext = Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can delete FAQs")
        
        response = supabase.table("faqs").delete().eq("id", faq_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="FAQ not found")

        return {"message": "FAQ deleted successfully"}
    except Exception as e:
        print(f"Error deleting FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete FAQ")

# Endpoint to get current tags list
@app.get("/api/tags")
async def get_tags(current_user: UserContext = Depends(get_current_user)):
    try:
        tags_config = db["system_config"].find_one({"type": "tags"})
        if isinstance(tags_config, dict) and "values" in tags_config:
            return {"tags": sorted(tags_config["values"])}
        else:
            default_tags = ["HR", "IT", "Policies", "Operations", "Products", "Services"]
            return {"tags": default_tags}
    except Exception as e:
        print(f"Error fetching tags: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch tags")

# Endpoint to update tags list (admin only)
@app.put("/api/tags")
async def update_tags(request: TagsManagement, current_user: UserContext = Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can update tags")
        
        if not request.tags or len(request.tags) == 0:
            raise HTTPException(status_code=400, detail="Tags list cannot be empty")
        
        cleaned_tags = list(set([tag.strip() for tag in request.tags if tag.strip()]))

        # Update or create tags configuration
        db["system_config"].update_one(
            {"type": "tags"},
            {"$set": {"values": cleaned_tags, "updated_at": datetime.now()}},
            upsert=True
        )

        return {
            "message": "Tags updated successfully",
            "tags": cleaned_tags
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating tags: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update tags")

# Endpoint to update document metadata (admin)
@app.patch("/api/documents/{document_id}")
async def update_document(document_id: str, request: DocumentUpdate, current_user: UserContext = Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can update document metadata")
        
        # Find document
        document = company_documents_collection.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Prepare update data
        update_data = {}

        if request.tags is not None:
            if len(request.tags) == 0:
                raise HTTPException(status_code=400, detail="Tags cannot be empty")
            update_data["tags"] = request.tags
        
        if request.access_level is not None:
            if request.access_level not in ACCESS_HIERARCHY:
                raise HTTPException(status_code=400, detail="Invalid access level")
            update_data["access_level"] = request.access_level
            update_data["access_level_num"] = ACCESS_HIERARCHY[request.access_level]
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        update_data["updated_at"] = datetime.now()
        update_data["updated_by"] = current_user.email

        # Update mongodb
        company_documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": update_data}
        )

        # Update chroma
        try:
            results = chroma_client.get(where={"doc_id": document_id})
            if results and results.get("ids"):
                chroma_metadata = {}
                if request.tags is not None:
                    chroma_metadata["tags"] = ",".join(request.tags)
                if request.access_level is not None:
                    chroma_metadata["access_level"] = request.access_level
                    chroma_metadata["access_level_num"] = ACCESS_HIERARCHY[request.access_level]
                
                # Update all chunks for this document
                for chunk_id in results["ids"]:
                    chroma_client._collection.update(
                        ids=[chunk_id],
                        metadatas=[chroma_metadata]
                    )
        except Exception as e:
            print(f"Error updating Chroma metadata: {e}")
        
        return {
            "message": "Document updated successfully",
            "document_id": document_id,
            "updates": update_data
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating document metadata: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update document metadata")

# Health check endpoint
@app.get("/healthcheck")
def health_check():
    return {"status": "Backend running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)