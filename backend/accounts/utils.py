import socket
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def verify_smtp_dns():
    smtp_host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com') or 'smtp.gmail.com'
    try:
        # gethostbyname explicitly resolves to IPv4.
        ipv4 = socket.gethostbyname(smtp_host)
        logger.info(f"DNS pre-flight successful: {smtp_host} resolved to IPv4 {ipv4}")
        return True
    except socket.gaierror as e:
        logger.error(f"DNS Resolution failed for {smtp_host}: {str(e)}")
        return False

def send_verification_email(email, otp):
    # Enforce strict socket timeouts to prevent indefinite hanging before the SMTP request even begins.
    socket.setdefaulttimeout(15)
    
    if not verify_smtp_dns():
        raise Exception("Network Unreachable: SMTP DNS Pre-flight check failed.")

    subject = "Verify your Zuru Account"
    
    html_message = render_to_string('emails/otp_template.html', {'otp_code': otp})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL
    
    msg = EmailMultiAlternatives(subject, plain_message, from_email, [email])
    msg.attach_alternative(html_message, "text/html")
    msg.send()
