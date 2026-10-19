"""Single place to construct the Gemini chat model used by every agent."""
from __future__ import annotations
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings

_llm: ChatGoogleGenerativeAI | None = None


def get_llm(temperature: float = 0.3) -> ChatGoogleGenerativeAI:
    """Lazily construct a shared Gemini chat model instance."""
    global _llm
    if _llm is None:
        if not settings.google_api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY is not set. Add it to backend/.env "
                "(see .env.example)."
            )
        _llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.google_api_key,
            temperature=temperature,
        )
    return _llm


def extract_json(text: str) -> dict | list:
    """Best-effort extraction of a JSON object/array from an LLM response
    that may be wrapped in markdown fences, contain extra prose, or have
    minor syntax issues (e.g. literal newlines or stray quotes inside a
    string value — common when the model is asked to return markdown-
    formatted text inside a JSON field)."""
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    candidate = fence.group(1) if fence else text
    candidate = candidate.strip()

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        pass

    match = re.search(r"(\{.*\}|\[.*\])", candidate, re.DOTALL)
    strict_candidate = match.group(1) if match else candidate
    try:
        return json.loads(strict_candidate)
    except json.JSONDecodeError:
        pass

    # Last resort: repair common LLM JSON mistakes (unescaped newlines/quotes
    # inside string values, trailing commas, etc.) rather than failing outright.
    import json_repair
    repaired = json_repair.loads(strict_candidate)
    if not repaired:
        raise ValueError(f"Could not parse JSON from LLM output: {text[:200]!r}")
    return repaired
