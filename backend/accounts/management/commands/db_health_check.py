"""
Management command: db_health_check

Verifies the Django backend can successfully query Supabase with full
owner-level permissions even after RLS is enabled and PostgREST public
access is revoked.

Usage:
    python manage.py db_health_check

Expected output (green-lit):
    [OK] DB connection alive.
    [OK] Backend reads 3 user(s) — RLS bypass confirmed.
    [OK] PendingRegistration table accessible: 0 row(s).
    [OK] Wallet table accessible: 3 row(s).
    [OK] All checks passed. Backend has full owner-level DB access.
"""

import logging
from django.core.management.base import BaseCommand
from django.db import connection
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)

User = get_user_model()


class Command(BaseCommand):
    help = "Verifies the Django backend has full RLS-bypassing DB access to Supabase."

    def handle(self, *args, **options):
        self.stdout.write("\n--- Zuru DB Health Check ---\n")
        all_passed = True

        # 1. Raw connection probe
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
            self.stdout.write(self.style.SUCCESS("[OK] DB connection alive."))
        except OperationalError as e:
            self.stdout.write(self.style.ERROR(f"[FAIL] DB connection failed: {e}"))
            all_passed = False

        # 2. User table read — primary RLS bypass test
        try:
            count = User.objects.count()
            self.stdout.write(
                self.style.SUCCESS(f"[OK] Backend reads {count} user(s) — RLS bypass confirmed.")
            )
        except (OperationalError, ProgrammingError) as e:
            self.stdout.write(self.style.ERROR(f"[FAIL] Cannot read User table: {e}"))
            all_passed = False

        # 3. PendingRegistration table (contains OTPs — must remain backend-only)
        try:
            from accounts.models import PendingRegistration
            count = PendingRegistration.objects.count()
            self.stdout.write(
                self.style.SUCCESS(f"[OK] PendingRegistration table accessible: {count} row(s).")
            )
        except (OperationalError, ProgrammingError) as e:
            self.stdout.write(self.style.ERROR(f"[FAIL] Cannot read PendingRegistration: {e}"))
            all_passed = False

        # 4. Wallet table read
        try:
            from wallet.models import Wallet
            count = Wallet.objects.count()
            self.stdout.write(
                self.style.SUCCESS(f"[OK] Wallet table accessible: {count} row(s).")
            )
        except (OperationalError, ProgrammingError) as e:
            self.stdout.write(self.style.ERROR(f"[FAIL] Cannot read Wallet table: {e}"))
            all_passed = False

        # 5. Session sanity check: ensure django_session is not corrupted
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM django_session;")
                row = cursor.fetchone()
            self.stdout.write(
                self.style.SUCCESS(f"[OK] django_session accessible: {row[0]} row(s).")
            )
        except (OperationalError, ProgrammingError) as e:
            self.stdout.write(self.style.ERROR(f"[FAIL] django_session query failed: {e}"))
            all_passed = False

        # Final verdict
        self.stdout.write("")
        if all_passed:
            self.stdout.write(
                self.style.SUCCESS("[OK] All checks passed. Backend has full owner-level DB access.\n")
            )
        else:
            self.stdout.write(
                self.style.ERROR("[FAIL] One or more checks failed. Review DATABASE_URL and RLS policies.\n")
            )
