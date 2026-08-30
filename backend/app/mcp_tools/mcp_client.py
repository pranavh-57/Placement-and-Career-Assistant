"""Thin async client that spawns our MCP tool servers over stdio and calls
their tools. Agents import `call_job_search` / `call_github_analysis`
instead of talking to the underlying APIs directly — this keeps the
"agent decides to invoke an external tool via MCP" boundary real rather
than simulated.
"""
from __future__ import annotations
import json
import sys
from contextlib import asynccontextmanager
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

_JOB_SERVER = StdioServerParameters(
    command=sys.executable, args=["-m", "app.mcp_tools.job_search_server"]
)
_GITHUB_SERVER = StdioServerParameters(
    command=sys.executable, args=["-m", "app.mcp_tools.github_server"]
)


@asynccontextmanager
async def _session(params: StdioServerParameters):
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            yield session


async def call_job_search(query: str, location: str = "", limit: int = 5) -> dict:
    async with _session(_JOB_SERVER) as session:
        result = await session.call_tool(
            "search_jobs", {"query": query, "location": location, "limit": limit}
        )
        text = result.content[0].text if result.content else "{}"
        return json.loads(text)


async def call_github_analysis(username: str) -> dict:
    async with _session(_GITHUB_SERVER) as session:
        result = await session.call_tool(
            "analyze_github_profile", {"username": username}
        )
        text = result.content[0].text if result.content else "{}"
        return json.loads(text)
