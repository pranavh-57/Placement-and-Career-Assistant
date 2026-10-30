from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.models.schemas import (
    RagIngestRequest,
    RagSearchRequest,
    RagSearchResponse,
    RagSearchResult,
)
from app.rag.vector_store import USER_SCOPED_TYPES, add_document, search

router = APIRouter(prefix="/api/rag", tags=["rag"])


@router.post("/ingest")
async def ingest_document(
    req: RagIngestRequest, current_user: User = Depends(get_current_user)
):
    # Users can only add private notes; they can't write into the shared KB.
    chunks = await asyncio.to_thread(
        add_document, req.text, req.source, "user_note", current_user.id
    )
    return {"chunks_added": chunks}


@router.post("/search", response_model=RagSearchResponse)
async def search_kb(
    req: RagSearchRequest, current_user: User = Depends(get_current_user)
):
    uid = current_user.id if req.doc_type in USER_SCOPED_TYPES else None
    results = await asyncio.to_thread(search, req.query, req.k, req.doc_type, uid)
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
