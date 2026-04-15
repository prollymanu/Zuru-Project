import os
import logging
from django.template.loader import render_to_string
from django.utils.html import strip_tags

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Brevo (Sendinblue) Transactional Email — sent over HTTPS (port 443)
# This completely sidesteps SMTP network blocks on Render free tier.
# ---------------------------------------------------------------------------

SENDER_NAME = "Zuru Kenya"
SENDER_EMAIL = "allaboutmanuu@gmail.com"


def _get_brevo_api():
    """Initialise and return a configured Brevo TransactionalEmailsApi instance."""
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = os.getenv('BREVO_API_KEY')
    client = sib_api_v3_sdk.ApiClient(configuration)
    return sib_api_v3_sdk.TransactionalEmailsApi(client)


def send_verification_email(email: str, otp: str) -> bool:
    """
    Sends the branded Zuru OTP email via the Brevo Transactional Email API (HTTPS).

    Returns:
        True  — email dispatched successfully.
        False — API call failed (caller should handle gracefully).

    Raises:
        Nothing — all exceptions are swallowed and logged so the registration
        view can return a structured JSON response instead of a 500 crash.
    """
    # --- Build HTML & plain-text payloads ---
    html_content = render_to_string('emails/otp_template.html', {'otp_code': otp})
    text_content = strip_tags(html_content)

    # --- Assemble the Brevo send object ---
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        sender={"name": SENDER_NAME, "email": SENDER_EMAIL},
        to=[{"email": email}],
        subject="Verify your Zuru Account",
        html_content=html_content,
        text_content=text_content,
    )

    # --- Dispatch via HTTPS API ---
    try:
        api = _get_brevo_api()
        response = api.send_transac_email(send_smtp_email)
        logger.info("[BREVO] Email sent successfully")
        return True

    except ApiException as e:
        logger.error("[BREVO_API_ERROR] Brevo API call failed during email dispatch.")
        return False

    except Exception as e:
        logger.error("[BREVO_UNEXPECTED] Unexpected error during email dispatch.")
        return False
