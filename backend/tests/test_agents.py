from unittest.mock import patch, MagicMock
from app.agents.resume_agent import run_resume_agent
from app.agents.job_matching_agent import run_job_matching_agent
from app.models.schemas import StudentProfile, JobListing


def _mock_llm_response(json_str: str):
    mock_response = MagicMock()
    mock_response.content = json_str
    mock_llm = MagicMock()
    mock_llm.invoke.return_value = mock_response
    return mock_llm


@patch("app.agents.resume_agent.get_llm")
def test_resume_agent_parses_profile(mock_get_llm):
    mock_get_llm.return_value = _mock_llm_response("""
    {"name": "Jane Doe", "email": "jane@example.com",
     "skills": ["Python", "FastAPI"], "education": [],
     "projects": ["Built a chatbot"], "experience": [], "certifications": []}
    """)
    profile = run_resume_agent("Jane Doe resume text with Python and FastAPI experience")
    assert profile.name == "Jane Doe"
    assert "Python" in profile.skills


@patch("app.agents.job_matching_agent.search")
@patch("app.agents.job_matching_agent.get_llm")
def test_job_matching_agent_scores(mock_get_llm, mock_search):
    mock_search.return_value = []
    mock_get_llm.return_value = _mock_llm_response("""
    {"match_score": 75, "matched_skills": ["Python"],
     "missing_skills": ["Docker"], "rationale": "Good overlap"}
    """)
    profile = StudentProfile(skills=["Python"], projects=[], experience=[])
    job = JobListing(id="1", title="Backend Intern", company="Acme",
                      description="Needs Python and Docker")
    result = run_job_matching_agent(profile, job)
    assert result.match_score == 75
    assert "Docker" in result.missing_skills
