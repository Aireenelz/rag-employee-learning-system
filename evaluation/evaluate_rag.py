import asyncio
from typing import List, Dict
from ragas_evaluation import RAGEvaluator
from pymongo import MongoClient
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
import json

load_dotenv()

class EmployeeLearningRAGEvaluator:
    def __init__(self):
        # Load environment variables
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.chroma_api_key = os.getenv("CHROMA_API_KEY")
        self.chroma_tenant = os.getenv("CHROMA_TENANT")
        self.chroma_database = os.getenv("CHROMA_DATABASE")

        # Initialize clients
        self.async_openai_client = AsyncOpenAI(api_key=self.openai_api_key)
        self.mongodb_client = MongoClient(self.mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)

        embeddings = OpenAIEmbeddings(api_key=self.openai_api_key)
        self.chroma_client = Chroma(
            collection_name="company_documents",
            embedding_function=embeddings,
            chroma_cloud_api_key=self.chroma_api_key,
            tenant=self.chroma_tenant,
            database=self.chroma_database
        )

        # Initialize Ragas evaluator
        self.ragas_evaluator = RAGEvaluator(self.openai_api_key)

        # Relevance threshold
        self.RELEVANCE_THRESHOLD = 0.45
    
    async def get_rag_response(self, question: str, access_level: int = 3) -> Dict[str, any]:
        """
        Get RAG response just like in app logic
        """

        docs_with_scores = await asyncio.to_thread(
            self.chroma_client.similarity_search_with_score,
            question,
            k=3,
            filter={"access_level_num": {"$lte": access_level}}
        )

        relevant_docs = [
            doc for doc, score in docs_with_scores
            if score <= self.RELEVANCE_THRESHOLD
        ]

        if relevant_docs:
            context = "\n\n".join([doc.page_content for doc in relevant_docs])
            user_content = f"Context:\n{context}\n\nQuestion: {question}"
            system_message = (
                "You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd. "
                "Answer based on the provided context. "
            )
        else:
            user_content = f"Question: {question}"
            system_message = (
                "You are an AI assistant for an employee learning system in ThinkCodex Sdn Bhd. "
                "The user's question doesn't match specific company documents, "
                "so provide a helpful general response based on your knowledge."
            )
        
        response = await self.async_openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_content}
            ],
            temperature=0.2,
            max_tokens=500
        )

        answer = response.choices[0].message.content.strip()

        contexts = [doc.page_content for doc in relevant_docs] if relevant_docs else []

        return {
            "answer": answer,
            "contexts": contexts,
            "used_context": len(relevant_docs) > 0
        }
    
    async def evaluate_test_set(self, test_cases: List[Dict[str, str]], access_level: int = 3):
        """
        Evaluate test cases set
        """
        questions = []
        answers = []
        contexts = []
        ground_truths = []

        print("Generating responses for test cases...")

        for i, test_case in enumerate(test_cases):
            print(f"Processing {i+1}/{len(test_cases)}: {test_case['question'][:50]}...")

            # Get RAG response
            result = await self.get_rag_response(
                test_case["question"],
                access_level=access_level
            )

            questions.append(test_case["question"])
            answers.append(result["answer"])
            contexts.append(result["contexts"])

            if "ground_truth" in test_case:
                ground_truths.append(test_case["ground_truth"])
        
        print("\nPreparing dataset for Ragas evaluation...")

        # Prepare dataset
        dataset = self.ragas_evaluator.prepare_evaluation_dataset(
            questions=questions,
            answers=answers,
            contexts=contexts,
            ground_truths=ground_truths if ground_truths else None
        )

        print("Running Ragas evaluation...\n")

        # Run evaluation
        results = self.ragas_evaluator.evaluate_rag(dataset)

        return results

def load_test_cases(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
    
async def main():
    """Main evaluation function"""
    
    # Initialize evaluator
    evaluator = EmployeeLearningRAGEvaluator()
    
    # Load test cases
    test_cases = load_test_cases("test_cases3.json")

    print("="*60)
    print("RAG EVALUATION FOR EMPLOYEE LEARNING SYSTEM")
    print("="*60)
    print(f"\nEvaluating {len(test_cases)} test cases...\n")

    # Run evaluation
    results = await evaluator.evaluate_test_set(test_cases)
    
    # Save results
    print("\n" + "="*60)
    evaluator.ragas_evaluator.save_results(results)
    print("="*60)
    
    return results
    
if __name__ == "__main__":
    results = asyncio.run(main())