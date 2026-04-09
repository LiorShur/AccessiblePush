# Gmail File Organizer — Setup Guide

## What It Does

Connects to your Gmail, fetches emails in a date range you specify, automatically
categorizes them (Finance, Shopping, Travel, Work, etc.), and creates an organized
folder tree with all attachments filed in the right place.

## Output Structure

```
organized_emails/
├── _master_index.csv
├── Finance & Banking/
│   ├── _email_index.csv
│   ├── Chase_Bank/
│   │   └── 2024-03-15_Statement_March.pdf
│   └── PayPal/
│       └── 2024-04-01_Receipt.pdf
├── Shopping & Orders/
│   ├── _email_index.csv
│   └── Amazon/
│       └── 2024-02-20_Invoice.pdf
├── Work & Professional/
│   └── ...
└── Other/
    └── ...
```

## One-Time Setup (5 minutes)

### 1. Install Python dependencies

```bash
cd gmail_file_organizer
pip install -r requirements.txt
```

### 2. Create Google Cloud credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a project** (or select an existing one)
3. **Enable the Gmail API**:
   - Navigate to **APIs & Services > Library**
   - Search for **"Gmail API"** and click **Enable**
4. **Configure OAuth consent screen**:
   - Go to **APIs & Services > OAuth consent screen**
   - Choose **External** user type
   - Fill in the required fields (app name, support email)
   - Under **Test users**, add your own Gmail address
5. **Create OAuth credentials**:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Application type: **Desktop app**
   - Click **Create**, then **Download JSON**
6. **Save the file** as `credentials.json` in this directory

### 3. First run — authorize

```bash
python gmail_organizer.py --start 2024/01/01 --end 2024/01/31
```

A browser window will open asking you to sign in and grant read-only access.
After authorizing, a `token.json` file is saved so you won't need to do this again.

> **Note:** The script only requests **read-only** access. It never modifies,
> deletes, or sends emails.

## Usage

### Basic — organize last year's emails

```bash
python gmail_organizer.py --start 2024/01/01 --end 2024/12/31
```

### Only emails with attachments

```bash
python gmail_organizer.py --start 2024/01/01 --end 2024/12/31 --attachments-only
```

### Custom output folder

```bash
python gmail_organizer.py --start 2024/06/01 --end 2024/06/30 --output june_emails
```

### Process more emails (default is 500)

```bash
python gmail_organizer.py --start 2023/01/01 --end 2024/12/31 --max 2000
```

### Use your own category rules

```bash
python gmail_organizer.py --start 2024/01/01 --end 2024/12/31 --categories custom_categories_template.json
```

## Custom Categories

Edit `custom_categories_template.json` to define your own rules. Each category has:

- **keywords** — words/phrases matched against the email subject and snippet
- **senders** — patterns matched against the sender name and domain

```json
{
  "My Category Name": {
    "keywords": ["word1", "phrase two", "word3"],
    "senders": ["example.com", "sender-name"]
  }
}
```

## All Options

| Flag                | Default             | Description                          |
|---------------------|---------------------|--------------------------------------|
| `--start`           | *(required)*        | Start date (YYYY/MM/DD)              |
| `--end`             | *(required)*        | End date (YYYY/MM/DD)                |
| `--output`          | `organized_emails`  | Output directory                     |
| `--credentials`     | `credentials.json`  | Path to Google OAuth JSON            |
| `--token`           | `token.json`        | Path to cached auth token            |
| `--max`             | `500`               | Max emails to process                |
| `--attachments-only`| off                 | Skip emails without attachments      |
| `--categories`      | built-in rules      | Path to custom categories JSON       |

## Security Notes

- **Read-only access**: The script never sends, deletes, or modifies emails.
- **Credentials stay local**: `credentials.json` and `token.json` are in `.gitignore`.
- **No data leaves your machine**: Everything is processed and stored locally.
