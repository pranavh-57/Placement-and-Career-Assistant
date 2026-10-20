"""Skill Gap Agent — takes a student profile and target job, identifies
missing skills, and orders them by priority (what to learn first to
maximize interview readiness). Separate from Job Matching Agent so it can
be called standalone once a job is already selected.
"""

from __future__ import annotations

from langchain_core.messages import HumanMessage, SystemMessage

from app.models.schemas import JobListing, SkillGapResponse, StudentProfile
from app.utils.llm import extract_json, get_llm

SYSTEM_PROMPT = """You are a Skill Gap Agent for a college placement assistant.
Given a student's current skills and a target job description, respond with
ONLY valid JSON (no markdown fences) matching:

{
  "missing_skills": ["skill", ...],
  "priority_order": ["skill", ...],
  "explanation": "1-3 sentences on why these are prioritized this way"
}

"priority_order" must be a re-ordering of "missing_skills" (same set), ranked from
highest-impact/most-frequently-required first to nice-to-have last.
"""


def run_skill_gap_agent(profile: StudentProfile, job: JobListing) -> SkillGapResponse:
    llm = get_llm(temperature=0.2)
    user_content = f"""STUDENT SKILLS: {", ".join(profile.skills) or "none listed"}
JOB TITLE: {job.title}
JOB DESCRIPTION: {job.description}
"""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_content),
    ]
    response = llm.invoke(messages)
    data = extract_json(response.content)

    missing = data.get("missing_skills", []) or []
    priority = data.get("priority_order", []) or missing

    return SkillGapResponse(
        missing_skills=missing,
        priority_order=priority,
        explanation=data.get("explanation", ""),
    )
