"""Central app configuration, loaded from environment / .env."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    google_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"
    gemini_embedding_model: str = "models/text-embedding-004"

    github_token: str = ""
    tavily_api_key: str = ""

    chroma_persist_dir: str = str(BASE_DIR / "data" / "chroma")
    knowledge_base_dir: str = str(BASE_DIR / "data" / "knowledge_base")
    uploads_dir: str = str(BASE_DIR / "data" / "uploads")

    # --- Auth ---
    google_client_id: str = ""
    jwt_secret_key: str = "change-me-in-.env"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    database_url: str = f"sqlite:///{BASE_DIR / 'data' / 'app.db'}"

    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

# Ensure runtime directories exist
for d in (
    settings.chroma_persist_dir,
    settings.knowledge_base_dir,
    settings.uploads_dir,
):
    Path(d).mkdir(parents=True, exist_ok=True)
