from email.message import EmailMessage
import smtplib

from app.config import settings


def send_password_reset_email(to_email: str, reset_url: str) -> None:
    if not settings.smtp_host:
        print(f"Password reset link for {to_email}: {reset_url}")
        return

    message = EmailMessage()
    message["Subject"] = "Reset your Star Poultry Farm password"
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email or settings.smtp_username}>"
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                "We received a request to reset your Star Poultry Farm password.",
                "",
                f"Open this link to choose a new password: {reset_url}",
                "",
                f"This link expires in {settings.password_reset_expire_minutes} minutes.",
                "If you did not request this, you can ignore this email.",
            ]
        )
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_username:
            server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)
