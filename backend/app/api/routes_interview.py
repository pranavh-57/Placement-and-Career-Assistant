from __future__ import annotations
from fastapi import APIRouter
from app.models.schemas import (
    InterviewGenerateRequest,
    InterviewGenerateResponse,
    InterviewEvaluateRequest,
    InterviewEvaluateResponse,
)
from app.agents.interview_agent import run_interview_generate, run_interview_evaluate

router = APIRouter(prefix="/api/interview", tags=["interview"])


@router.post("/generate", response_model=InterviewGenerateResponse)
async def generate_questions(req: InterviewGenerateRequest):
    return run_interview_generate(req.role, req.profile, req.num_questions)


@router.post("/evaluate", response_model=InterviewEvaluateResponse)
async def evaluate_answer(req: InterviewEvaluateRequest):
    return run_interview_evaluate(req.question, req.answer, req.role)
