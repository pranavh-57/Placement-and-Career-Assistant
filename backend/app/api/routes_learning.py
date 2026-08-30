from __future__ import annotations
from fastapi import APIRouter
from app.models.schemas import LearningRequest, LearningRoadmapResponse
from app.agents.learning_agent import run_learning_agent

router = APIRouter(prefix="/api/learning", tags=["learning"])


@router.post("/roadmap", response_model=LearningRoadmapResponse)
async def learning_roadmap(req: LearningRequest):
    return run_learning_agent(req.missing_skills, req.context)
