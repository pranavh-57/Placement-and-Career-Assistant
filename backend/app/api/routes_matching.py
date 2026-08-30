from __future__ import annotations
from fastapi import APIRouter
from app.models.schemas import JobMatchRequest, JobMatchResponse
from app.agents.job_matching_agent import run_job_matching_agent

router = APIRouter(prefix="/api/matching", tags=["matching"])


@router.post("/score", response_model=JobMatchResponse)
async def score_match(req: JobMatchRequest):
    return run_job_matching_agent(req.profile, req.job)
