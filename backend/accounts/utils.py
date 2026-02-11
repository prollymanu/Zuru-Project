from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_verification_email(email, otp):
    subject = "Verify your Zuru Account"
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #333; }}
            .otp-code {{ font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; letter-spacing: 5px; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #888; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Zuru</div> 
                <!-- Replace with <img src="..." alt="Zuru Logo"> in production -->
            </div>
            <p>Hello,</p>
            <p>Thank you for registering with Zuru. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
            <div class="otp-code">{otp}</div>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">
                &copy; 2026 Zuru Inc. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    plain_message = strip_tags(html_message)
    from_email = settings.EMAIL_HOST_USER
    
    send_mail(subject, plain_message, from_email, [email], html_message=html_message)
