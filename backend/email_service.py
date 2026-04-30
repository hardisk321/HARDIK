"""Resend email helper — graceful no-op when keys are missing."""
import os
import asyncio
import logging
from typing import Optional

import resend

logger = logging.getLogger(__name__)


def _html_for_inquiry(inq: dict) -> str:
    name = inq.get("name", "—")
    email = inq.get("email", "—")
    phone = inq.get("phone") or "—"
    company = inq.get("company") or "—"
    interested = inq.get("interested_in") or "—"
    message = (inq.get("message") or "").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
    created = inq.get("created_at", "")

    return f"""
<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;color:#00264d;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid rgba(0,38,77,0.1);">
        <tr><td style="background:#00264d;padding:20px 28px;">
          <div style="font-size:11px;letter-spacing:4px;color:#00ccff;font-family:'Courier New',monospace;">DRISHTI · NEW LEAD</div>
          <div style="font-size:22px;font-weight:700;color:#ffffff;margin-top:4px;letter-spacing:2px;">INQUIRY RECEIVED</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 20px;font-size:15px;color:#4A5568;line-height:1.6;">
            A new lead has just submitted an inquiry on the DRISHTI website.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(0,38,77,0.1);">
            {_row("Name", name)}
            {_row("Email", f'<a href="mailto:{email}" style="color:#0099bb;text-decoration:none;">{email}</a>')}
            {_row("Phone", phone)}
            {_row("Company", company)}
            {_row("Interested in", interested)}
          </table>
          <div style="margin-top:24px;padding:20px;background:#F8FAFC;border-left:3px solid #00ccff;">
            <div style="font-size:10px;letter-spacing:3px;color:#0099bb;font-family:'Courier New',monospace;font-weight:700;">MESSAGE</div>
            <div style="margin-top:8px;font-size:15px;line-height:1.6;color:#00264d;">{message}</div>
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="mailto:{email}?subject=Re:%20DRISHTI%20Inquiry"
               style="display:inline-block;background:#00264d;color:#ffffff;padding:12px 24px;font-weight:600;font-size:14px;text-decoration:none;">
              Reply to {name.split()[0] if name != '—' else 'Lead'}
            </a>
          </div>
          <p style="margin:28px 0 0;font-size:11px;color:#94A3B8;letter-spacing:2px;font-family:'Courier New',monospace;">
            Received {created}
          </p>
        </td></tr>
        <tr><td style="background:#001A33;padding:16px 28px;font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:2px;font-family:'Courier New',monospace;">
          DRISHTI · AUTO ID SOLUTION · AIDC
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def _row(label: str, value: str) -> str:
    return (
        f'<tr>'
        f'<td style="padding:12px 0;border-bottom:1px solid rgba(0,38,77,0.08);width:140px;'
        f'font-size:10px;letter-spacing:3px;color:#0099bb;font-family:\'Courier New\',monospace;'
        f'font-weight:700;text-transform:uppercase;">{label}</td>'
        f'<td style="padding:12px 0;border-bottom:1px solid rgba(0,38,77,0.08);'
        f'font-size:15px;color:#00264d;font-weight:500;">{value}</td>'
        f'</tr>'
    )


async def send_lead_notification(inquiry: dict) -> Optional[str]:
    """Send a notification email for a new lead. Graceful no-op if keys missing.

    Returns the Resend message id on success, None otherwise.
    """
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    recipient = os.environ.get("NOTIFICATION_EMAIL", "").strip()
    sender = os.environ.get("RESEND_FROM", "DRISHTI Leads <onboarding@resend.dev>").strip()

    # Fallback: if NOTIFICATION_EMAIL not in env, try the live site_settings document
    if not recipient:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            mongo_url = os.environ.get("MONGO_URL")
            db_name = os.environ.get("DB_NAME")
            if mongo_url and db_name:
                client = AsyncIOMotorClient(mongo_url)
                doc = await client[db_name].site_settings.find_one({"_id": "singleton"}) or {}
                recipient = (doc.get("notification_email") or "").strip()
                client.close()
        except Exception:
            pass

    if not api_key:
        logger.info("send_lead_notification: skipped (RESEND_API_KEY not set)")
        return None
    if not recipient:
        logger.info("send_lead_notification: skipped (NOTIFICATION_EMAIL not set)")
        return None

    resend.api_key = api_key
    params = {
        "from": sender,
        "to": [recipient],
        "subject": f"New DRISHTI inquiry — {inquiry.get('name', 'lead')}",
        "html": _html_for_inquiry(inquiry),
        "reply_to": inquiry.get("email") or None,
    }
    # Drop None-valued fields
    params = {k: v for k, v in params.items() if v is not None}

    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        msg_id = (result or {}).get("id") if isinstance(result, dict) else getattr(result, "id", None)
        logger.info(f"send_lead_notification: sent to {recipient} (id={msg_id})")
        return msg_id
    except Exception as e:
        logger.warning(f"send_lead_notification: failed — {e}")
        return None
