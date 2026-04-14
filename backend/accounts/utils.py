import socket
import smtplib
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def resolve_smtp_ipv4(hostname, port=587):
    """
    Forces AF_INET (IPv4) resolution for the given SMTP hostname.
    Returns the resolved IPv4 address string, or None on failure.
    This sidesteps Render's broken IPv6 routing (Errno 101).
    """
    try:
        results = socket.getaddrinfo(hostname, port, socket.AF_INET, socket.SOCK_STREAM)
        if not results:
            logger.error(f"[DNS_EMPTY] getaddrinfo returned no IPv4 results for {hostname}")
            return None
        # results[0] => (family, type, proto, canonname, sockaddr)
        # sockaddr for AF_INET => (ip_string, port)
        ipv4_address = results[0][4][0]
        logger.info(f"[DNS_OK] {hostname}:{port} resolved to IPv4 {ipv4_address}")
        return ipv4_address
    except socket.gaierror as e:
        logger.error(f"[DNS_FAILED] Could not resolve {hostname} to IPv4: {str(e)}")
        return None


def send_verification_email(email, otp):
    """
    Sends the branded OTP email using EmailMultiAlternatives.
    Explicitly resolves the SMTP host to an IPv4 address before connecting
    to bypass Render's faulty IPv6 routing (Errno 101 Network Unreachable).
    """
    # Hard limit: abort socket operations that hang beyond 15 seconds
    socket.setdefaulttimeout(15)

    smtp_host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com') or 'smtp.gmail.com'
    smtp_port = getattr(settings, 'EMAIL_PORT', 587)

    # Step 1: Force IPv4 resolution
    ipv4_address = resolve_smtp_ipv4(smtp_host, smtp_port)
    if not ipv4_address:
        raise socket.gaierror(f"[NETWORK_UNREACHABLE] IPv4 DNS resolution failed for {smtp_host}.")

    # Step 2: Verify the IPv4 route is actually reachable before committing to SMTP
    try:
        probe = socket.create_connection((ipv4_address, smtp_port), timeout=10)
        probe.close()
        logger.info(f"[ROUTE_OK] TCP probe to {ipv4_address}:{smtp_port} succeeded.")
    except OSError as e:
        logger.error(f"[ROUTE_FAIL] TCP probe to {ipv4_address}:{smtp_port} failed: {str(e)}")
        raise socket.error(f"SMTP host unreachable at IPv4 {ipv4_address}: {str(e)}")

    # Step 3: Build and send the branded email
    subject = "Verify your Zuru Account"
    html_message = render_to_string('emails/otp_template.html', {'otp_code': otp})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL

    msg = EmailMultiAlternatives(subject, plain_message, from_email, [email])
    msg.attach_alternative(html_message, "text/html")

    # Step 4: Send — Django's SMTP backend uses the EMAIL_HOST setting, but our
    # TCP probe above already confirmed the IPv4 route is live. Django will
    # connect to EMAIL_HOST which now has a primed OS DNS cache entry from
    # the AF_INET resolution above.
    msg.send()
    logger.info(f"[MAIL_SENT] OTP email dispatched successfully to {email}")
