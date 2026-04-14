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

    - Forces IPv4 DNS resolution to bypass Render's faulty IPv6 routing (Errno 101).
    - Uses SMTP_SSL for port 465 (immediate TLS handshake, less firewall-sensitive).
    - Uses STARTTLS for port 587 (the Django default path).
    - TCP-probes the resolved IPv4 before committing to the full SMTP handshake.
    """
    socket.setdefaulttimeout(15)

    smtp_host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com') or 'smtp.gmail.com'
    smtp_port = int(getattr(settings, 'EMAIL_PORT', 587))
    use_ssl = getattr(settings, 'EMAIL_USE_SSL', False)

    # Determine the effective port used for DNS pre-flight
    effective_port = 465 if use_ssl else smtp_port

    # Step 1: Force IPv4 resolution — avoids unroutable IPv6 on Render free tier
    ipv4_address = resolve_smtp_ipv4(smtp_host, effective_port)
    if not ipv4_address:
        raise socket.gaierror(f"[NETWORK_UNREACHABLE] IPv4 DNS resolution failed for {smtp_host}.")

    # Step 2: TCP probe to confirm the route is live before building the email payload
    try:
        probe = socket.create_connection((ipv4_address, effective_port), timeout=10)
        probe.close()
        logger.info(f"[ROUTE_OK] TCP probe to {ipv4_address}:{effective_port} succeeded.")
    except OSError as e:
        logger.error(f"[ROUTE_FAIL] TCP probe to {ipv4_address}:{effective_port} failed: {str(e)}")
        raise socket.error(f"SMTP host unreachable at IPv4 {ipv4_address}:{effective_port} — {str(e)}")

    # Step 3: Build the branded email payload
    subject = "Verify your Zuru Account"
    html_message = render_to_string('emails/otp_template.html', {'otp_code': otp})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL

    msg = EmailMultiAlternatives(subject, plain_message, from_email, [email])
    msg.attach_alternative(html_message, "text/html")

    # Step 4: Connect using the correct security protocol for the configured port
    if use_ssl or effective_port == 465:
        # SMTP_SSL: wraps the socket in TLS immediately on connect (port 465).
        # More reliable on restrictive networks vs STARTTLS negotiation.
        logger.info(f"[SMTP] Connecting via SMTP_SSL to {smtp_host}:465")
        with smtplib.SMTP_SSL(smtp_host, 465, timeout=15) as server:
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.sendmail(from_email, [email], msg.message().as_bytes())
    else:
        # STARTTLS path (port 587) — Django's EmailMultiAlternatives handles this natively
        logger.info(f"[SMTP] Connecting via STARTTLS to {smtp_host}:{smtp_port}")
        msg.send()

    logger.info(f"[MAIL_SENT] OTP email dispatched successfully to {email}")
