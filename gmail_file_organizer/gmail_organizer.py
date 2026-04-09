#!/usr/bin/env python3
"""
Gmail Email Organizer
=====================
Connects to Gmail via the API, fetches emails within a user-specified date range,
categorizes them by subject/content/sender, builds a directory tree of folders
and subfolders, and files every attachment into its relevant folder.

Usage:
    python gmail_organizer.py --start 2024/01/01 --end 2024/12/31
    python gmail_organizer.py --start 2024/06/01 --end 2024/06/30 --output june_emails
    python gmail_organizer.py --start 2024/01/01 --end 2024/12/31 --attachments-only
    python gmail_organizer.py --start 2024/01/01 --end 2024/12/31 --categories my_rules.json
"""

import os
import sys
import json
import csv
import re
import base64
import argparse
import time
from datetime import datetime
from pathlib import Path
from email.utils import parseaddr
from collections import defaultdict

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Gmail API scope - read-only access (we never modify your mailbox)
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# ---------------------------------------------------------------------------
# Default category rules — keyword + sender-pattern matching
# Users can override these entirely via --categories <file.json>
# ---------------------------------------------------------------------------
DEFAULT_CATEGORIES = {
    "Finance & Banking": {
        "keywords": [
            "bank", "statement", "transaction", "wire transfer", "payment",
            "invoice", "billing", "account balance", "credit card", "debit",
            "mortgage", "loan", "tax", "refund", "direct deposit",
            "payroll", "salary", "dividend", "investment", "portfolio",
            "401k", "retirement", "insurance", "premium", "claim"
        ],
        "senders": [
            "chase", "wellsfargo", "bankofamerica", "citibank", "capitalone",
            "paypal", "venmo", "zelle", "square", "stripe", "quickbooks",
            "intuit", "turbotax", "fidelity", "vanguard", "schwab",
            "etrade", "robinhood", "coinbase"
        ]
    },
    "Shopping & Orders": {
        "keywords": [
            "order", "receipt", "shipping", "delivery", "purchase",
            "confirmation", "tracking", "shipped", "dispatched",
            "return", "refund", "exchange", "warranty", "price drop"
        ],
        "senders": [
            "amazon", "ebay", "walmart", "target", "bestbuy", "apple",
            "shopify", "etsy", "aliexpress", "costco", "homedepot",
            "lowes", "ikea", "wayfair"
        ]
    },
    "Travel & Transport": {
        "keywords": [
            "flight", "booking", "hotel", "itinerary", "reservation",
            "boarding pass", "check-in", "travel", "airline", "cruise",
            "rental car", "uber", "lyft", "trip", "vacation", "passport",
            "visa"
        ],
        "senders": [
            "airline", "hotels", "airbnb", "booking.com", "expedia",
            "kayak", "tripadvisor", "uber", "lyft", "hertz", "avis",
            "southwest", "delta", "united", "jetblue", "marriott",
            "hilton", "hyatt"
        ]
    },
    "Work & Professional": {
        "keywords": [
            "meeting", "agenda", "minutes", "project", "deadline",
            "proposal", "contract", "agreement", "nda", "onboarding",
            "performance review", "quarterly", "annual report", "budget",
            "presentation", "conference", "webinar", "training",
            "certification"
        ],
        "senders": [
            "slack", "zoom", "teams", "jira", "confluence", "asana",
            "trello", "monday", "notion", "figma", "github", "gitlab",
            "atlassian", "salesforce", "hubspot", "docusign"
        ]
    },
    "Social Media & Networking": {
        "keywords": [
            "friend request", "connection", "follow", "like", "comment",
            "mention", "tag", "share", "post", "story", "notification"
        ],
        "senders": [
            "facebook", "twitter", "linkedin", "instagram", "tiktok",
            "snapchat", "pinterest", "reddit", "youtube", "discord",
            "whatsapp", "telegram"
        ]
    },
    "Newsletters & Subscriptions": {
        "keywords": [
            "newsletter", "digest", "weekly", "monthly", "daily briefing",
            "unsubscribe", "subscription", "edition", "roundup",
            "curated", "trending", "top stories", "highlights"
        ],
        "senders": [
            "substack", "mailchimp", "constantcontact", "medium",
            "morningbrew", "theskimm", "pocket"
        ]
    },
    "Education & Learning": {
        "keywords": [
            "course", "class", "assignment", "grade", "enrollment",
            "lecture", "syllabus", "exam", "quiz", "homework",
            "scholarship", "tuition", "university", "college",
            "tutorial", "lesson", "certificate", "diploma"
        ],
        "senders": [
            "coursera", "udemy", "edx", "skillshare", "masterclass",
            "khanacademy", "duolingo", "pluralsight", ".edu"
        ]
    },
    "Health & Wellness": {
        "keywords": [
            "appointment", "prescription", "lab results", "diagnosis",
            "doctor", "medical", "health", "dental", "vision", "therapy",
            "pharmacy", "medication", "wellness", "fitness",
            "vaccination", "test results"
        ],
        "senders": [
            "mychart", "healthgrades", "zocdoc", "cvs", "walgreens",
            "kaiser", "unitedhealth", "cigna", "aetna", "bluecross"
        ]
    },
    "Government & Legal": {
        "keywords": [
            "government", "legal", "court", "jury", "summons",
            "license", "permit", "registration", "dmv",
            "social security", "voter", "election", "municipal",
            "federal", "compliance", "notice"
        ],
        "senders": [
            ".gov", "irs", "ssa", "dmv", "usps"
        ]
    }
}


# ═══════════════════════════════════════════════════════════════════════════
# GmailOrganizer
# ═══════════════════════════════════════════════════════════════════════════

class GmailOrganizer:
    """Core engine: authenticate, fetch, categorize, and organize."""

    def __init__(self, credentials_file='credentials.json',
                 token_file='token.json', output_dir='organized_emails',
                 categories=None):
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.output_dir = Path(output_dir)
        self.categories = categories or DEFAULT_CATEGORIES
        self.service = None

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------
    def authenticate(self):
        """Authenticate with Gmail API using OAuth2."""
        creds = None

        if os.path.exists(self.token_file):
            creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_file):
                    _print_setup_instructions(self.credentials_file)
                    sys.exit(1)

                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, SCOPES
                )
                creds = flow.run_local_server(port=0)

            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())

        self.service = build('gmail', 'v1', credentials=creds)
        print("[OK] Authenticated with Gmail.\n")

    # ------------------------------------------------------------------
    # Fetching
    # ------------------------------------------------------------------
    def fetch_emails(self, start_date, end_date, max_results=500):
        """Return a list of message stubs (id + threadId) in the date range."""
        query = f"after:{start_date} before:{end_date}"
        print(f"Searching emails  {start_date}  ->  {end_date} ...")

        messages = []
        page_token = None

        while True:
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=min(max_results - len(messages), 100),
                pageToken=page_token
            ).execute()

            batch = results.get('messages', [])
            messages.extend(batch)

            page_token = results.get('nextPageToken')
            if not page_token or len(messages) >= max_results:
                break

            print(f"  ... fetched {len(messages)} IDs so far")

        print(f"  Found {len(messages)} emails.\n")
        return messages

    def get_email_details(self, msg_id):
        """Fetch full metadata + attachment info for one message."""
        msg = self.service.users().messages().get(
            userId='me', id=msg_id, format='full'
        ).execute()

        headers = {
            h['name'].lower(): h['value']
            for h in msg.get('payload', {}).get('headers', [])
            if h['name'].lower() in ('subject', 'from', 'to', 'date')
        }

        subject = headers.get('subject', '(No Subject)')
        sender = headers.get('from', 'Unknown')
        to_addr = headers.get('to', '')
        date_str = headers.get('date', '')
        snippet = msg.get('snippet', '')

        _, sender_email = parseaddr(sender)
        sender_domain = (
            sender_email.split('@')[-1] if '@' in sender_email else 'unknown'
        )

        attachments = self._extract_attachments(msg['payload'], msg_id)

        return {
            'id': msg_id,
            'subject': subject,
            'from': sender,
            'from_email': sender_email,
            'from_domain': sender_domain,
            'to': to_addr,
            'date': date_str,
            'snippet': snippet,
            'attachments': attachments,
        }

    # ------------------------------------------------------------------
    # Attachments
    # ------------------------------------------------------------------
    def _extract_attachments(self, payload, msg_id):
        """Recursively collect attachment metadata from a MIME payload."""
        attachments = []

        if payload.get('filename') and payload.get('body', {}).get('attachmentId'):
            attachments.append({
                'filename': payload['filename'],
                'attachment_id': payload['body']['attachmentId'],
                'mime_type': payload.get('mimeType', 'application/octet-stream'),
                'size': payload.get('body', {}).get('size', 0),
            })

        for part in payload.get('parts', []):
            attachments.extend(self._extract_attachments(part, msg_id))

        return attachments

    def _download_attachment(self, msg_id, attachment_id):
        """Download one attachment and return raw bytes."""
        att = self.service.users().messages().attachments().get(
            userId='me', messageId=msg_id, id=attachment_id
        ).execute()
        return base64.urlsafe_b64decode(att.get('data', ''))

    # ------------------------------------------------------------------
    # Categorization
    # ------------------------------------------------------------------
    def categorize_email(self, email):
        """Score every category; return the best match (or 'Other')."""
        subject_lc = email['subject'].lower()
        snippet_lc = email['snippet'].lower()
        sender_lc = email['from'].lower()
        domain_lc = email['from_domain'].lower()
        combined = f"{subject_lc} {snippet_lc}"

        scores = defaultdict(int)

        for category, rules in self.categories.items():
            for kw in rules.get('keywords', []):
                if kw in combined:
                    scores[category] += 2
                if kw in subject_lc:
                    scores[category] += 1          # subject carries extra weight
            for pattern in rules.get('senders', []):
                if pattern in sender_lc or pattern in domain_lc:
                    scores[category] += 3

        if scores:
            best = max(scores, key=scores.get)
            if scores[best] >= 2:
                return best

        return "Other"

    # ------------------------------------------------------------------
    # Directory tree creation
    # ------------------------------------------------------------------
    def create_directory_tree(self, categorized_emails):
        """Build folders, save attachments, write CSV indexes."""
        self.output_dir.mkdir(parents=True, exist_ok=True)

        stats = defaultdict(lambda: {'emails': 0, 'attachments': 0})

        for category, emails in categorized_emails.items():
            cat_dir = self.output_dir / _sanitize(category)
            cat_dir.mkdir(exist_ok=True)

            # Group by sender inside the category
            by_sender = defaultdict(list)
            for em in emails:
                name = _sender_folder_name(em['from'], em['from_domain'])
                by_sender[name].append(em)

            for sender_name, sender_emails in by_sender.items():
                sender_dir = cat_dir / sender_name

                has_att = any(e['attachments'] for e in sender_emails)
                if has_att:
                    sender_dir.mkdir(exist_ok=True)

                for em in sender_emails:
                    stats[category]['emails'] += 1
                    date_pfx = _date_prefix(em['date'])

                    for att in em['attachments']:
                        try:
                            data = self._download_attachment(
                                em['id'], att['attachment_id']
                            )
                            safe = _sanitize(att['filename'], max_len=120)
                            fname = f"{date_pfx}_{safe}" if date_pfx else safe
                            fpath = _unique_path(sender_dir / fname)
                            fpath.write_bytes(data)
                            stats[category]['attachments'] += 1
                            print(f"    Saved: {fpath.relative_to(self.output_dir)}")
                        except Exception as exc:
                            print(f"    [!] Error downloading "
                                  f"'{att['filename']}': {exc}")

            # Per-category CSV index
            _write_csv_index(cat_dir / '_email_index.csv', emails)

        # Master index across all categories
        _write_master_index(self.output_dir / '_master_index.csv',
                            categorized_emails)
        return stats

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------
    def run(self, start_date, end_date, max_results=500,
            attachments_only=False):
        """Full pipeline: auth -> fetch -> categorize -> organize."""
        self.authenticate()

        messages = self.fetch_emails(start_date, end_date, max_results)
        if not messages:
            print("No emails found in the specified date range.")
            return

        # Fetch details + categorize
        categorized = defaultdict(list)
        total = len(messages)
        print(f"Processing {total} emails ...")

        for i, msg in enumerate(messages, 1):
            if i % 25 == 0 or i == total:
                print(f"  [{i}/{total}]")
            try:
                details = self.get_email_details(msg['id'])
                if attachments_only and not details['attachments']:
                    continue
                cat = self.categorize_email(details)
                categorized[cat].append(details)
            except Exception as exc:
                print(f"  [!] Error on message {msg['id']}: {exc}")

        # Print summary
        _print_summary(categorized)

        # Build the tree
        print(f"\nBuilding directory tree -> {self.output_dir.resolve()}\n")
        self.create_directory_tree(categorized)

        print(f"\nDone!  Output -> {self.output_dir.resolve()}")
        print("\nDirectory layout:")
        _print_tree(self.output_dir)


# ═══════════════════════════════════════════════════════════════════════════
# Helpers (module-level)
# ═══════════════════════════════════════════════════════════════════════════

def _sanitize(name, max_len=80):
    """Make a string safe for use as a file / folder name."""
    s = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', name)
    s = re.sub(r'[\s_]+', '_', s).strip('_.')
    return (s[:max_len].rstrip('_.') if len(s) > max_len else s) or 'unnamed'


def _sender_folder_name(from_field, domain):
    """Derive a tidy folder name from the sender."""
    display, _ = parseaddr(from_field)
    if display:
        return _sanitize(display)
    return _sanitize(domain.split('.')[0] if '.' in domain else domain)


def _date_prefix(date_str):
    """Try to extract YYYY-MM-DD from an RFC-2822 date string."""
    if not date_str:
        return ''
    clean = re.sub(r'\s*\(.*?\)\s*$', '', date_str).strip()
    for fmt in ('%a, %d %b %Y %H:%M:%S %z',
                '%d %b %Y %H:%M:%S %z',
                '%a, %d %b %Y %H:%M:%S',
                '%d %b %Y %H:%M:%S'):
        try:
            return datetime.strptime(clean, fmt).strftime('%Y-%m-%d')
        except ValueError:
            continue
    return ''


def _unique_path(path):
    """If *path* already exists, append _1, _2, ... until unique."""
    if not path.exists():
        return path
    stem, suffix = path.stem, path.suffix
    parent = path.parent
    n = 1
    while True:
        candidate = parent / f"{stem}_{n}{suffix}"
        if not candidate.exists():
            return candidate
        n += 1


def _write_csv_index(filepath, emails):
    """Write a per-category CSV email index."""
    with open(filepath, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['Date', 'From', 'Subject', 'Has Attachments',
                     'Attachment Files'])
        for em in sorted(emails, key=lambda e: e.get('date', '')):
            att_names = ', '.join(a['filename'] for a in em['attachments'])
            w.writerow([em['date'], em['from'], em['subject'],
                        'Yes' if em['attachments'] else 'No', att_names])


def _write_master_index(filepath, categorized):
    """Write a master CSV covering every category."""
    with open(filepath, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['Category', 'Date', 'From', 'Subject',
                     'Has Attachments', 'Attachment Count'])
        for cat in sorted(categorized):
            for em in sorted(categorized[cat],
                             key=lambda e: e.get('date', '')):
                w.writerow([cat, em['date'], em['from'], em['subject'],
                            'Yes' if em['attachments'] else 'No',
                            len(em['attachments'])])


def _print_summary(categorized):
    """Print a table of categories, email counts, attachment counts."""
    print(f"\n{'=' * 60}")
    print("  CATEGORIZATION SUMMARY")
    print(f"{'=' * 60}")
    total_em = total_att = 0
    for cat in sorted(categorized):
        emails = categorized[cat]
        att = sum(len(e['attachments']) for e in emails)
        total_em += len(emails)
        total_att += att
        print(f"  {cat:<35} {len(emails):>5} emails   {att:>4} attachments")
    print(f"{'=' * 60}")
    print(f"  {'TOTAL':<35} {total_em:>5} emails   {total_att:>4} attachments")
    print(f"{'=' * 60}")


def _print_tree(directory, prefix='', max_depth=3, depth=0):
    """Pretty-print a directory tree."""
    if depth >= max_depth:
        return
    entries = sorted(directory.iterdir(), key=lambda e: (e.is_file(), e.name))
    for i, entry in enumerate(entries):
        last = i == len(entries) - 1
        connector = '└── ' if last else '├── '
        print(f"{prefix}{connector}{entry.name}")
        if entry.is_dir():
            ext = '    ' if last else '│   '
            _print_tree(entry, prefix + ext, max_depth, depth + 1)


def _print_setup_instructions(creds_path):
    """Print first-time setup instructions when credentials are missing."""
    print(f"""
{'=' * 62}
  SETUP REQUIRED — Gmail API Credentials
{'=' * 62}

  Credentials file not found: {creds_path}

  Follow these one-time steps:

  1. Go to  https://console.cloud.google.com/
  2. Create a project (or select an existing one).
  3. Enable the Gmail API:
       APIs & Services  >  Library  >  search "Gmail API"  >  Enable
  4. Create OAuth 2.0 credentials:
       APIs & Services  >  Credentials  >  Create Credentials
       >  OAuth client ID  >  Desktop app
  5. Download the JSON file and save it as:
       {os.path.abspath(creds_path)}
  6. (Optional) Add your Google account as a test user under
       OAuth consent screen  >  Test users.

  Then re-run this script.
{'=' * 62}
""")


# ═══════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description='Gmail Email Organizer — fetch, categorize, '
                    'and organize email attachments into folders.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  python gmail_organizer.py --start 2024/01/01 --end 2024/12/31
  python gmail_organizer.py --start 2024/06/01 --end 2024/06/30 --output june_emails
  python gmail_organizer.py --start 2024/01/01 --end 2024/12/31 --attachments-only
  python gmail_organizer.py --start 2024/01/01 --end 2024/12/31 --categories my_rules.json
        """
    )

    parser.add_argument('--start', required=True,
                        help='Start date  (YYYY/MM/DD)')
    parser.add_argument('--end', required=True,
                        help='End date    (YYYY/MM/DD)')
    parser.add_argument('--output', default='organized_emails',
                        help='Output directory (default: organized_emails)')
    parser.add_argument('--credentials', default='credentials.json',
                        help='Path to Google OAuth credentials JSON')
    parser.add_argument('--token', default='token.json',
                        help='Path to store/load the auth token')
    parser.add_argument('--max', type=int, default=500,
                        help='Max emails to process (default: 500)')
    parser.add_argument('--attachments-only', action='store_true',
                        help='Skip emails without attachments')
    parser.add_argument('--categories', default=None,
                        help='Path to a custom categories JSON file '
                             '(overrides built-in rules)')

    args = parser.parse_args()

    # Validate dates
    for val, label in [(args.start, '--start'), (args.end, '--end')]:
        if not re.match(r'\d{4}/\d{2}/\d{2}$', val):
            parser.error(f"{label} must be YYYY/MM/DD (got '{val}')")

    # Load custom categories if supplied
    custom_cats = None
    if args.categories:
        try:
            with open(args.categories) as f:
                custom_cats = json.load(f)
            print(f"[OK] Loaded custom categories from {args.categories}")
        except Exception as exc:
            print(f"Error loading categories file: {exc}")
            sys.exit(1)

    organizer = GmailOrganizer(
        credentials_file=args.credentials,
        token_file=args.token,
        output_dir=args.output,
        categories=custom_cats,
    )

    organizer.run(
        start_date=args.start,
        end_date=args.end,
        max_results=args.max,
        attachments_only=args.attachments_only,
    )


if __name__ == '__main__':
    main()
