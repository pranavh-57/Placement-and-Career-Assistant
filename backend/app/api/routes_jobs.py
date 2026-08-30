from __future__ import annotations
from fastapi import APIRouter
from app.models.schemas import JobSearchRequest, JobSearchResponse, JobListing
from app.mcp_tools.mcp_client import call_job_search

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(req: JobSearchRequest):
    result = await call_job_search(req.query, req.location or "", req.limit)
    jobs = [JobListing(**j) for j in result.get("jobs", [])]
    return JobSearchResponse(jobs=jobs, tool_used=result.get("tool_used", "unknown"))
