from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_verification_email(email, otp):
    subject = "Verify your Zuru Account"
    
    html_message = render_to_string('emails/otp_template.html', {'otp_code': otp})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL
    
    msg = EmailMultiAlternatives(subject, plain_message, from_email, [email])
    msg.attach_alternative(html_message, "text/html")
    msg.send()
