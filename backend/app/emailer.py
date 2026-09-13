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


def send_contact_inquiry_email(name: str, email: str, message_text: str, phone: str = "") -> None:
    if not settings.smtp_host:
        print(f"Contact inquiry from {name} ({email}): {message_text}")
        return

    admin_targets = [
        "startpoultrybarnala@gmail.com",
        "adityatayal2610@gmail.com",
    ]
    if settings.smtp_from_email and settings.smtp_from_email not in admin_targets:
        admin_targets.append(settings.smtp_from_email)

    message = EmailMessage()
    message["Subject"] = f"New Contact Inquiry from {name} - Star Poultry Farm"
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email or settings.smtp_username}>"
    message["To"] = ", ".join(admin_targets)
    message["Reply-To"] = email

    lines = [
        "Hello Star Poultry Team,",
        "",
        "You have received a new contact inquiry through the website form:",
        "",
        f"• Name: {name}",
        f"• Email: {email}",
    ]
    if phone:
        lines.append(f"• Phone: {phone}")
    lines.extend([
        "",
        "• Message:",
        message_text,
        "",
        "--------------------------------------------------",
        "Tip: Click 'Reply' in your email client to reply directly to the customer.",
    ])

    message.set_content("\n".join(lines))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            if settings.smtp_username:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except Exception as exc:
        print(f"Failed to send contact inquiry email: {exc}")

