"""
Email service for SwapHubu - handles all email sending functionality.
Uses FastAPI-Mail for email delivery with template support.
"""

import os
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
import logging
from ..utils.env_utils import get_boolean_env, get_env

# Configure logging
logger = logging.getLogger(__name__)

# Configuration
FRONTEND_URL = get_env("FRONTEND_URL")


class EmailConfig:
    """Email configuration class to manage SMTP settings."""

    def __init__(self):
        self.MAIL_USERNAME = get_env("MAIL_USERNAME")
        self.MAIL_PASSWORD = get_env("MAIL_PASSWORD")
        self.MAIL_FROM = get_env("MAIL_FROM")
        self.MAIL_FROM_NAME = get_env("MAIL_FROM_NAME")
        self.MAIL_PORT = int(get_env("MAIL_PORT"))
        self.MAIL_SERVER = get_env("MAIL_SERVER")
        self.MAIL_STARTTLS = get_boolean_env("MAIL_STARTTLS")
        self.MAIL_SSL_TLS = get_boolean_env("MAIL_SSL_TLS")
        self.USE_CREDENTIALS = get_boolean_env("USE_CREDENTIALS")
        self.VALIDATE_CERTS = get_boolean_env("VALIDATE_CERTS")

        # Template directory
        self.TEMPLATE_FOLDER = Path(__file__).parent.parent / "mail_templates"

    def get_connection_config(self) -> ConnectionConfig:
        """Get FastAPI-Mail connection configuration."""
        return ConnectionConfig(
            MAIL_USERNAME=self.MAIL_USERNAME,
            MAIL_PASSWORD=self.MAIL_PASSWORD,
            MAIL_FROM=self.MAIL_FROM,
            MAIL_FROM_NAME=self.MAIL_FROM_NAME,
            MAIL_PORT=self.MAIL_PORT,
            MAIL_SERVER=self.MAIL_SERVER,
            MAIL_STARTTLS=self.MAIL_STARTTLS,
            MAIL_SSL_TLS=self.MAIL_SSL_TLS,
            USE_CREDENTIALS=self.USE_CREDENTIALS,
            VALIDATE_CERTS=self.VALIDATE_CERTS,
            TEMPLATE_FOLDER=self.TEMPLATE_FOLDER,
        )

    def is_configured(self) -> bool:
        """Check if email is properly configured."""
        return bool(self.MAIL_USERNAME and self.MAIL_PASSWORD and self.MAIL_SERVER)


class EmailService:
    """Main email service class for SwapHubu."""

    def __init__(self):
        self.config = EmailConfig()
        self._fastmail = None
        self._initialize()

    def _initialize(self):
        """Initialize FastMail with current config."""
        if not self.config.is_configured():
            logger.warning("Email service not configured - check environment variables")
            return

        try:
            connection_config = self.config.get_connection_config()
            self._fastmail = FastMail(connection_config)
            logger.info("Email service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize email service: {str(e)}")
            self._fastmail = None

    @property
    def is_ready(self) -> bool:
        """Check if email service is ready to send emails."""
        return self._fastmail is not None

    async def send_email(
        self,
        recipients: List[EmailStr],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[str]] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> bool:
        """
        Send email to recipients.

        Args:
            recipients: List of email addresses
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
            attachments: List of file paths to attach (optional)
            background_tasks: FastAPI background tasks (optional)

        Returns:
            bool: True if email was queued/sent successfully
        """
        if not self.is_ready:
            logger.error("Email service not ready - check configuration")
            return False

        try:
            # Use HTML body if provided, otherwise plain text
            message_body = html_body if html_body else body
            message_type = MessageType.html if html_body else MessageType.plain

            # Create message schema
            message_data = {
                "subject": subject,
                "recipients": recipients,
                "body": message_body,
                "subtype": message_type,
            }

            if attachments:
                message_data["attachments"] = attachments

            message = MessageSchema(**message_data)

            # Send email in background if background_tasks provided
            if background_tasks:
                background_tasks.add_task(self._send_message, message)
            else:
                await self._send_message(message)

            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    async def send_template_email(
        self,
        recipients: List[EmailStr],
        subject: str,
        template_name: str,
        template_data: Dict[str, Any],
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> bool:
        """
        Send email using Jinja2 template.

        Args:
            recipients: List of email addresses
            subject: Email subject
            template_name: Name of the template file (e.g., 'welcome.html')
            template_data: Dictionary of data to pass to template
            background_tasks: FastAPI background tasks (optional)

        Returns:
            bool: True if email was queued/sent successfully
        """
        if not self.is_ready:
            logger.error("Email service not ready - check configuration")
            return False

        try:
            message = MessageSchema(
                subject=subject,
                recipients=recipients,
                template_body=template_data,
                subtype=MessageType.html,
            )

            # Send email in background if background_tasks provided
            if background_tasks:
                background_tasks.add_task(
                    self._send_template_message, message, template_name
                )
            else:
                await self._send_template_message(message, template_name)

            return True

        except Exception as e:
            logger.error(f"Failed to send template email: {str(e)}")
            return False

    async def _send_message(self, message: MessageSchema):
        """Internal method to send email message."""
        try:
            await self._fastmail.send_message(message)
        except Exception as e:
            logger.error(f"Failed to send email message: {str(e)}")
            raise

    async def _send_template_message(self, message: MessageSchema, template_name: str):
        """Internal method to send template email message."""
        try:
            await self._fastmail.send_message(message, template_name=template_name)
        except Exception as e:
            logger.error(f"Failed to send template email message: {str(e)}")
            raise


# Global email service instance
email_service = EmailService()


# High-level email operation functions
def send_welcome_email(user, background_tasks: BackgroundTasks) -> None:
    """Send welcome email to newly registered user."""
    try:
        subject = f"Welcome to SwapHubu, {user.first_name}!"
        template_data = {
            "user_name": user.first_name,
            "user_email": user.email,
            "frontend_url": FRONTEND_URL,
        }

        background_tasks.add_task(
            send_template_email,
            recipients=[user.email],
            subject=subject,
            template_name="welcome.html",
            template_data=template_data,
        )

        logger.info(f"Welcome email queued for {user.email}")

    except Exception as e:
        logger.error(f"Failed to queue welcome email for {user.email}: {str(e)}")


def send_password_reset_email(
    user, reset_token: str, background_tasks: BackgroundTasks
) -> None:
    """Send password reset email with reset token."""
    try:
        from ..constants.auth_constants import AuthConfig

        subject = "Your SwapHubu Password Reset Code"

        template_data = {
            "user_name": user.first_name,
            "user_email": user.email,
            "reset_token": reset_token,
            "expiry_hours": AuthConfig.RESET_TOKEN_EXPIRE_HOURS,
        }

        background_tasks.add_task(
            send_template_email,
            recipients=[user.email],
            subject=subject,
            template_name="password_reset.html",
            template_data=template_data,
        )

        logger.info(f"Password reset email queued for {user.email}")

    except Exception as e:
        logger.error(f"Failed to queue password reset email for {user.email}: {str(e)}")


def send_password_reset_success_email(user, background_tasks: BackgroundTasks) -> None:
    """Send password reset success confirmation email."""
    try:
        subject = "Password Reset Successful - SwapHubu"
        template_data = {
            "user_name": user.first_name,
            "user_email": user.email,
            "frontend_url": FRONTEND_URL,
        }

        background_tasks.add_task(
            send_template_email,
            recipients=[user.email],
            subject=subject,
            template_name="password_reset_success.html",
            template_data=template_data,
        )

        logger.info(f"Password reset success email queued for {user.email}")

    except Exception as e:
        logger.error(
            f"Failed to queue password reset success email for {user.email}: {str(e)}"
        )


# Convenience function for backward compatibility
async def send_email(
    recipients: List[EmailStr],
    subject: str,
    body: str,
    html_body: Optional[str] = None,
    background_tasks: Optional[BackgroundTasks] = None,
) -> bool:
    """Send email using global email service instance."""
    return await email_service.send_email(
        recipients, subject, body, html_body, None, background_tasks
    )


async def send_template_email(
    recipients: List[EmailStr],
    subject: str,
    template_name: str,
    template_data: Dict[str, Any],
    background_tasks: Optional[BackgroundTasks] = None,
) -> bool:
    """Send template email using global email service instance."""
    return await email_service.send_template_email(
        recipients, subject, template_name, template_data, background_tasks
    )
