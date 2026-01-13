from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
    answer_correctness,
    answer_similarity
)
from datasets import Dataset
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import pandas as pd
from typing import List, Dict, Optional
import json
from datetime import datetime
import os

class RAGEvaluator:
    """Evaluator for RAG system using Ragas metrics"""

    def __init__(self, openai_api_key: str):
        """
        Setup evaluator for ragas testing
        """
        self.openai_api_key = openai_api_key
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=openai_api_key,
            temperature=0
        )
        self.embeddings = OpenAIEmbeddings(api_key=openai_api_key)
    
    def prepare_evaluation_dataset(self, questions: List[str], answers: List[str], contexts: List[List[str]], ground_truths: Optional[List[str]] = None) -> Dataset:
        """
        Prepare dataset for Ragas evaluation
        
        Args:
            questions: List of user questions
            answers: List of generated answers from your RAG system
            contexts: List of retrieved context chunks (list of lists)
            ground_truths: Optional list of reference answers for comparison
            
        Returns:
            Dataset object ready for Ragas evaluation
        """

        data = {
            "question": questions,
            "answer": answers,
            "contexts": contexts
        }

        if ground_truths:
            data["ground_truth"] = ground_truths
        
        return Dataset.from_dict(data)
    
    def evaluate_rag(self, dataset: Dataset, metrics: Optional[List] = None) -> Dict:
        """
        Evaluate RAG system using Ragas metrics
        
        Args:
            dataset: Prepared dataset with questions, answers, contexts
            metrics: List of Ragas metrics to use. If None, uses default set
            
        Returns:
            Dictionary containing evaluation results
        """

        if metrics is None:
            metrics = [
                faithfulness,
                answer_relevancy,
                context_precision,
                context_recall
            ]

            if "ground_truth" in dataset.column_names:
                metrics.extend([
                    answer_correctness,
                    answer_similarity
                ])
        
        result = evaluate(
            dataset,
            metrics=metrics,
            llm=self.llm,
            embeddings=self.embeddings
        )

        return result
    
    def save_results(self, results: Dict, output_path: str = "evaluation_results"):
        """
        Save evaluation results in file
        """

        os.makedirs(output_path, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Save as json
        json_path = f"{output_path}/ragas_results_{timestamp}.json"
        with open(json_path, "w") as f:
            json.dump(results, f, indent=2, default=str)
        
        # Save as csv
        if hasattr(results, "to_pandas"):
            csv_path = f"{output_path}/ragas_results_{timestamp}.csv"
            results.to_pandas().to_csv(csv_path, index=False)
        
        print(f"Results saved to {output_path}")
        return json_path