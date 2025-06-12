from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from openai import OpenAI
from pymongo import MongoClient
from gridfs import GridFS
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import retrieval_qa
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import pdfplumber
import datetime

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
upload_dir = "uploads"

# Initialise clients
openai_client = OpenAI(api_key=openai_api_key)
mongodb_client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)
db = mongodb_client["els_db"]
fs = GridFS(db)
company_documents_collection = db["company_documents"]

chroma_client = Chroma(
    persist_directory="./chroma_db",
    embedding_function=OpenAIEmbeddings(api_key=openai_api_key)
)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
llm = ChatOpenAI(api_key=openai_api_key, model="gpt-3.5-turbo")

# Initialise FastAPI app
app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Define request model for chat messages
class ChatRequest(BaseModel):
    message: str

# Define response model for data returned by the API
class ChatResponse(BaseModel):
    response: str

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Call openai api to generate a chat response
        completion = client.chat.completions.create(
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