from __future__ import annotations
from fastapi import APIRouter
from app.models.schemas import RagIngestRequest, RagSearchRequest, RagSearchResponse, RagSearchResult
from app.rag.vector_store import add_document, search
from app.rag.ingest import ingest_seed_kb

router = APIRouter(prefix="/api/rag", tags=["rag"])


@router.post("/ingest")
async def ingest_document(req: RagIngestRequest):
    chunks = add_document(req.text, req.source, req.doc_type)
    return {"chunks_added": chunks}


@router.post("/ingest-seed")
async def ingest_seed():
    return ingest_seed_kb()


@router.post("/search", response_model=RagSearchResponse)
async def search_kb(req: RagSearchRequest):
    results = search(req.query, req.k, req.doc_type)
    return RagSearchResponse(
        results=[
            RagSearchResult(
                content=doc.page_content,
                source=doc.metadata.get("source", ""),
                doc_type=doc.metadata.get("doc_type", ""),
                score=score,
            )
            for doc, score in results
        ]
    )
