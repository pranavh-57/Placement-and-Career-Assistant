"""Chroma-backed vector store for the Placement Assistant knowledge base.

Holds five kinds of documents (see doc_type): resume, job_description,
interview_prep, learning_resource, career_guide. All agents retrieve
through `search()` before generating recommendations.
"""
from __future__ import annotations
import uuid
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from app.config import settings

_store: Chroma | None = None
COLLECTION_NAME = "placement_assistant_kb"


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    if not settings.google_api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY is not set. Add it to backend/.env (see .env.example)."
        )
    return GoogleGenerativeAIEmbeddings(
        model=settings.gemini_embedding_model,
        google_api_key=settings.google_api_key,
    )


def get_store() -> Chroma:
    global _store
    if _store is None:
        _store = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=get_embeddings(),
            persist_directory=settings.chroma_persist_dir,
        )
    return _store


def add_document(text: str, source: str, doc_type: str, chunk_size: int = 1200, chunk_overlap: int = 150) -> int:
    """Chunk and index a document. Returns number of chunks added."""
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    chunks = splitter.split_text(text)
    if not chunks:
        return 0

    docs = [
        Document(
            page_content=chunk,
            metadata={"source": source, "doc_type": doc_type},
        )
        for chunk in chunks
    ]
    ids = [str(uuid.uuid4()) for _ in docs]
    store = get_store()
    store.add_documents(docs, ids=ids)
    return len(docs)


def search(query: str, k: int = 4, doc_type: str | None = None) -> list[tuple[Document, float]]:
    store = get_store()
    filter_ = {"doc_type": doc_type} if doc_type else None
    return store.similarity_search_with_relevance_scores(query, k=k, filter=filter_)
