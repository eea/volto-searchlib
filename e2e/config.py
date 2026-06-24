from pathlib import Path
from typing import Literal, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Configuration settings loaded from environment variables or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # Search page URLs
    search_base_url: str = Field(
        default="https://www.eea.europa.eu",
        description="Base URL for the site",
    )
    search_path: str = Field(
        default="/en/advanced-search",
        description="Path to the search page",
    )

    # Browser settings
    headless: bool = Field(
        default=True,
        description="Run browser in headless mode",
    )
    browser: Literal["chromium", "firefox", "webkit"] = Field(
        default="chromium",
        description="Browser to use for testing",
    )
    timeout: int = Field(
        default=120000,
        description="Default timeout for operations (ms)",
    )
    expect_timeout: int = Field(
        default=30000,
        description="Default timeout for expect operations (ms)",
    )

    # Directory settings
    reports_dir: str = Field(
        default="./reports",
        description="Directory for test reports",
    )
    fixtures_dir: Optional[str] = Field(
        default=None,
        description="Directory containing test fixtures",
    )

    @property
    def search_url(self) -> str:
        """Full URL to the search page."""
        return f"{self.search_base_url}{self.search_path}"

    @property
    def fixtures_path(self) -> Path:
        """Get the path to the fixtures directory."""
        if self.fixtures_dir:
            return Path(self.fixtures_dir)
        return Path(__file__).parent / "fixtures"

_settings: Optional[Settings] = None

def get_settings() -> Settings:
    """Get the current settings instance."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
