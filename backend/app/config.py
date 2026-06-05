from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_db: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    admin_email: str = "admin@starpoultry.com"
    admin_password: str = "admin123"
    admin_business_name: str = "Star Poultry Admin"
    admin_phone: str = "0000000000"
    frontend_url: str = "http://localhost:8080"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "Star Poultry Farm"
    password_reset_expire_minutes: int = 30
    ai_provider: str = "gemini"
    gemini_api_key: str = ""
    openai_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
