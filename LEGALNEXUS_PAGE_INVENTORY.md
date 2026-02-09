# LegalNexus Enterprise
## Complete Page Inventory & User Interface Guide

**Visual Guide to Every Screen in the Application**

---

## Table of Contents

1. [Login & Authentication](#1-login--authentication)
2. [Dashboard](#2-dashboard)
3. [Companies Module](#3-companies-module)
4. [Contacts Module](#4-contacts-module)
5. [Sales Pipeline](#5-sales-pipeline)
6. [Matter Management](#6-matter-management)
7. [Lightning Path](#7-lightning-path)
8. [Legal Documents](#8-legal-documents)
9. [Time Tracking](#9-time-tracking)
10. [Billing Packs](#10-billing-packs)
11. [Invoicing](#11-invoicing)
12. [Financials](#12-financials)
13. [Reporting Dashboard](#13-reporting-dashboard)
14. [Settings](#14-settings)
15. [Audit Logs](#15-audit-logs)
16. [AI Assistant](#16-ai-assistant)

---

## 1. Login & Authentication

### Page: `/login`

**Purpose:** Secure entry point to the system

**What Users See:**
- LegalNexus logo and branding
- "Powered by Vicktoria AI" tagline
- Soul Logic technology badge
- Email address input field
- Password input field
- "Remember Me" checkbox
- "Sign In" button
- "Forgot Password?" link

**Features:**
- Secure JWT authentication
- Session management
- Password visibility toggle
- Error messages for invalid credentials
- Loading indicator during login

**User Flow:**
1. User enters email and password
2. Clicks "Sign In"
3. System validates credentials
4. If valid → redirects to Dashboard
5. If invalid → shows error message

**Security:**
- Encrypted password transmission
- Failed login attempt tracking
- Session timeout after inactivity
- Optional two-factor authentication

---

## 2. Dashboard

### Page: `/` (Home)

**Purpose:** Central command center showing firm performance at a glance

**Layout:**
- Top navigation bar (always present)
- Sidebar menu (collapsible)
- Main content area with widgets
- Floating AI assistant button (bottom right)

**Key Widgets Displayed:**

**1. Revenue Card**
- 💰 Current month revenue total
- 📊 Percentage change from last month
- ↗️ Green arrow if increasing, ↘️ red if decreasing
- Clickable → goes to Financial reports

**2. Active Matters Card**
- 📁 Total number of active matters
- 📊 Change from last month
- Clickable → goes to Matter List

**3. Billable Hours Card**
- ⏰ Total billable hours this month
- 📊 Comparison to target
- Progress bar visualization
- Clickable → goes to Timesheet

**4. Outstanding Invoices Card**
- 💵 Total amount outstanding
- ⚠️ Number of overdue invoices
- Aging breakdown (30/60/90 days)
- Clickable → goes to Invoice List

**5. Recent Activity Feed**
- 📝 Last 10 activities across the system
- Time-stamped entries
- "View All" link → Audit Logs

**6. Quick Actions Section**
- ➕ New Matter button
- ➕ New Contact button
- ➕ New Company button
- ⏰ Log Time button
- 📄 Create Invoice button

**7. Performance Charts**
- Revenue trend (last 6 months)
- Hours tracked per attorney
- Matter status breakdown pie chart

**8. AI Insights Panel**
- 🤖 Vicktoria AI suggestions
- Today's top 3 recommended actions
- Clickable to open AI Assistant

**User Actions:**
- View overview metrics
- Click any card to drill down
- Access quick actions
- View recent activity
- Interact with AI insights

---

## 3. Companies Module

### Page: `/companies`

**Purpose:** Manage all client companies

**Main View - Company List:**

**Header:**
- 🏢 "Companies" title
- ➕ "New Company" button (top right)
- 🔍 Search bar (search by name, industry, etc.)
- 📊 View options (Grid / List)

**Company Cards (Grid View):**
Each card shows:
- 🏢 Company name (large, bold)
- 🏭 Industry icon and name
- 👤 Primary contact name
- 📧 Email and phone
- 💰 Total revenue (all-time)
- 📁 Number of active matters
- 🟢 Status indicator (Active / Inactive)
- "View Details" button

**List View:**
Table with columns:
- Company Name
- Industry
- Primary Contact
- Revenue
- Active Matters
- Status
- Actions (View / Edit / Delete)

**Filters Panel (Left Sidebar):**
- Filter by industry
- Filter by status
- Filter by revenue range
- Filter by department
- "Reset Filters" button

**Pagination:**
- Results per page selector (10 / 25 / 50)
- Page navigation (← 1 2 3 4 5 →)
- Total count displayed

---

### Page: `/companies/:id` (Company Detail)

**Purpose:** Complete view of a single company

**Layout:**

**Header Section:**
- 🏢 Company name (large)
- ✏️ Edit button
- 🗑️ Delete button
- 🔙 Back to Companies list

**Tab Navigation:**
1. Overview
2. Matters
3. Contacts
4. Documents
5. Financials

**Tab 1: Overview**
- **Company Information:**
  - Full legal name
  - Industry
  - Address
  - Phone, email, website
  - Tax ID / Registration number
  - Billing address
  - Notes

- **Primary Contact:**
  - Name, title
  - Email, phone
  - Photo (if available)
  - Link to contact details

- **Department Assignment:**
  - Which practice area handles this client
  - Assigned attorneys

- **Statistics:**
  - Total revenue (all-time)
  - Number of matters (active / closed)
  - Average matter value
  - Payment history summary

**Tab 2: Matters**
- Table of all matters for this company
- Columns: Matter Name, Type, Status, Assigned Attorney, Value, Start Date
- Click any row → go to Matter Detail
- ➕ "New Matter" button

**Tab 3: Contacts**
- List of all contacts at this company
- Cards showing: Name, Title, Email, Phone, Photo
- Primary contact highlighted
- ➕ "Add Contact" button

**Tab 4: Documents**
- All documents associated with this company
- Categories: Contracts, Correspondence, Agreements
- Search and filter
- Upload new documents

**Tab 5: Financials**
- Revenue breakdown by matter
- Invoice history (paid / outstanding)
- Payment trends chart
- Billing rates applicable to this client

---

### Page: `/companies/new` or `/companies/:id/edit` (Company Form)

**Purpose:** Create new company or edit existing

**Form Fields:**

**Basic Information:**
- Company Name (required)
- Legal Name
- Industry (dropdown)
- Company Type (Corporation / Partnership / etc.)

**Contact Details:**
- Email (required)
- Phone
- Website
- Fax

**Address:**
- Street Address
- City
- State / Province
- Postal Code
- Country

**Billing Details:**
- Billing Address (checkbox: same as above)
- Tax ID Number
- Payment Terms (dropdown: Net 30 / Net 60 / etc.)
- Preferred Payment Method

**Assignment:**
- Primary Director (dropdown: list of attorneys)
- Department (dropdown: Corporate / Litigation / etc.)

**Notes:**
- Large text area for additional information

**Buttons:**
- 💾 Save Company
- ❌ Cancel (returns to list)

**Validation:**
- Required fields highlighted in red if empty
- Email format validation
- Phone format validation
- Success message on save

---

## 4. Contacts Module

### Page: `/contacts`

**Purpose:** Manage individual people (contacts)

**Main View - Contact List:**

**Header:**
- 👥 "Contacts" title
- ➕ "New Contact" button
- 🔍 Search bar

**Contact Cards:**
Each card shows:
- 👤 Photo (or placeholder)
- Full name (large)
- 🏢 Company name (linked)
- 💼 Job title
- 📧 Email
- 📞 Phone
- 🏷️ Tags (if any)
- "View Details" button

**List View Option:**
Table with columns:
- Photo
- Name
- Company
- Title
- Email
- Phone
- Actions

**Filters:**
- Filter by company
- Filter by role
- Filter by tags
- "Reset Filters"

**Quick Actions:**
- 📧 Email contact directly
- 📞 Click to call (if integrated)
- 💬 Send message

---

### Page: `/contacts/:id` (Contact Detail)

**Purpose:** Complete contact information

**Layout:**

**Header:**
- 👤 Photo (large)
- Full name
- Job title at company
- ✏️ Edit / 🗑️ Delete buttons

**Contact Information Panel:**
- Email (primary and secondary)
- Phone (office, mobile, home)
- Address
- Social media links (LinkedIn, etc.)

**Associated Company:**
- Company name (linked)
- Industry
- Relationship to company

**Related Matters:**
- List of matters this contact is involved in
- Click to view matter details

**Communication History:**
- Timeline of interactions
- Emails, calls, meetings
- Notes from attorneys

**Documents:**
- Contracts signed by this contact
- Correspondence sent to them

**Notes Section:**
- Free-form text area
- Add notes about the contact
- Timestamped entries

---

### Page: `/contacts/new` or `/contacts/:id/edit` (Contact Form)

**Form Fields:**

**Personal Information:**
- First Name (required)
- Last Name (required)
- Job Title
- Photo upload

**Contact Details:**
- Email (primary, required)
- Email (secondary)
- Phone (office)
- Phone (mobile)
- Phone (home)

**Company Association:**
- Company (dropdown, searchable)
- Role at company
- Decision maker? (checkbox)

**Address:**
- Street, City, State, Postal Code, Country

**Social Media:**
- LinkedIn URL
- Twitter handle

**Tags:**
- Add searchable tags (e.g., "Decision Maker", "Finance", "Technical")

**Notes:**
- Additional information

**Buttons:**
- 💾 Save Contact
- ❌ Cancel

---

## 5. Sales Pipeline

### Page: `/sales`

**Purpose:** Visual management of potential deals

**Header:**
- 💼 "Sales Pipeline" title
- ➕ "New Deal" button
- 🔍 Search deals
- 📊 Pipeline summary stats

**Pipeline Statistics (Top Bar):**
- 💰 Total Pipeline Value (sum of all deals)
- 🎯 Weighted Value (probability-adjusted)
- 📈 Conversion Rate
- ⏱️ Average Days in Pipeline

**Kanban Board Layout:**

Five vertical columns representing stages:
1. **Lead** (🔵 Blue)
2. **Qualified** (🟢 Green)
3. **Proposal** (🟡 Yellow)
4. **Negotiation** (🟠 Orange)
5. **Closed** (🔴 Red / 🟢 Green)

**Each Column Shows:**
- Column title
- Deal count in that stage
- Total value in that stage
- Drag-and-drop zone

**Deal Cards (draggable):**
Each card displays:
- Deal name (e.g., "ABC Corp - Merger Advisory")
- 🏢 Company name
- 💰 Deal value (e.g., "R250,000")
- 🎯 Close probability (e.g., "65%")
- 📅 Expected close date
- ⏰ Days in current stage (e.g., "12 days")
- 👤 Assigned attorney avatar
- 🤖 AI confidence indicator (color-coded)

**AI Insights Panel (Right Sidebar):**
- 🤖 "Vicktoria AI Insights" header
- Pipeline health score (0-100)
- Top 3 at-risk deals
- Top 3 high-potential deals
- Recommended actions

**User Actions:**
- Drag cards between stages
- Click card → view deal details
- Filter by attorney, value, probability
- Sort by various criteria
- Export pipeline report

---

### Page: `/sales/:id` (Deal Detail)

**Purpose:** Complete information about a deal

**Layout:**

**Header:**
- Deal name (large)
- Current stage badge (colored)
- ✏️ Edit / 🗑️ Delete / 🔙 Back

**Deal Information:**
- Company name (linked)
- Contact person (linked)
- Deal value
- Probability of closing
- Expected close date
- Assigned attorney
- Deal source (referral, marketing, etc.)

**AI Prediction Panel:**
- 🤖 "AI Close Probability"
- Percentage with confidence level
- Key factors affecting probability
- Recommended next actions

**Stage History:**
- Timeline showing movement through stages
- Dates entered each stage
- Duration in each stage

**Activities Timeline:**
- All activities related to this deal
- Meetings, calls, emails
- Proposal sent, follow-ups
- Add new activity button

**Documents:**
- Proposals sent
- Contracts
- Presentations
- Upload new documents

**Notes:**
- Internal notes about the deal
- Strategy discussions
- Next steps

**Related Matters:**
- If deal closed, link to created matter

---

### Page: `/sales/new` or `/sales/:id/edit` (Deal Form)

**Form Fields:**

**Basic Information:**
- Deal Name (required)
- Company (dropdown, searchable)
- Contact Person (dropdown)
- Deal Description

**Financial:**
- Estimated Value (required)
- Probability (slider: 0-100%)
- Expected Close Date (date picker)

**Assignment:**
- Assigned Attorney (dropdown)
- Department / Practice Area

**Source:**
- How did we get this lead? (dropdown)

**Stage:**
- Current stage (dropdown)

**Notes:**
- Internal notes

**Buttons:**
- 💾 Save Deal
- ❌ Cancel

---

## 6. Matter Management

### Page: `/matters`

**Purpose:** List and manage all legal matters

**Header:**
- ⚖️ "Matters" title
- ➕ "New Matter" button
- ⚡ "Lightning Path" button (guided matter creation)
- 🔍 Search bar

**Matter Cards/List:**

Each matter shows:
- 📁 Matter name (e.g., "Smith v. Jones - Litigation")
- 🏷️ Matter type badge (Litigation / Corporate / etc.)
- 🏢 Client company name
- 👤 Assigned attorney
- 💰 Total billed / Total time tracked
- 📅 Start date
- 🟢 Status indicator (Active / On Hold / Closed)
- ⏰ Last activity timestamp
- "View" button

**Filters (Left Sidebar):**
- Filter by status
- Filter by matter type
- Filter by assigned attorney
- Filter by client
- Filter by department
- Date range filter

**Quick Stats (Top):**
- Total active matters
- Total billed this month
- Average matter value
- Matters needing attention (flag)

**List View Columns:**
- Matter Name
- Client
- Type
- Assigned Attorney
- Status
- Start Date
- Value
- Actions

---

### Page: `/matters/:id` (Matter View)

**Purpose:** Complete details and management of a matter

**Header:**
- 📁 Matter name (large)
- 🏷️ Matter type badge
- 🟢 Status badge
- ✏️ Edit / 🗑️ Delete / 🔙 Back

**Tab Navigation:**
1. Overview
2. Time Entries
3. Documents
4. Invoices
5. Activity Log

**Tab 1: Overview**

**Matter Details:**
- Client name (linked)
- Matter type
- Description
- Start date / Expected end date
- Status

**Team:**
- Lead attorney (photo + name)
- Supporting attorneys
- Paralegals / Support staff
- External counsel (if any)

**Billing Information:**
- Fee structure (hourly / fixed / contingency)
- Hourly rates per attorney
- Total time tracked
- Total billed to date
- Outstanding balance

**Related Information:**
- Related matters (if any)
- Related deals (if converted from pipeline)
- Court case number (if litigation)
- Deadlines and milestones

**Quick Actions:**
- ⏰ Log Time
- 📄 Upload Document
- 💵 Create Invoice
- 📧 Email Client

**Tab 2: Time Entries**

- Table of all time logged on this matter
- Columns: Date, Attorney, Hours, Description, Billed Status, Amount
- Filter by date range, attorney
- Total hours and value displayed
- ➕ "Add Time Entry" button
- 📊 Time tracking chart (by week/month)

**Tab 3: Documents**

- All documents associated with matter
- Folders: Pleadings, Contracts, Correspondence, Discovery, etc.
- Search and filter documents
- Preview documents inline
- ⬆️ Upload new documents
- 📥 Download documents

**Tab 4: Invoices**

- All invoices related to this matter
- Invoice number, date, amount, status
- Outstanding balance highlighted
- ➕ "Create Invoice" button
- Click invoice → view details

**Tab 5: Activity Log**

- Complete timeline of matter activity
- Time logged, documents added, invoices created
- Status changes, notes added
- Who did what, when
- Filter by activity type

---

### Page: `/matters/new` or `/matters/:id/edit` (Matter Form)

**Form Fields:**

**Basic Information:**
- Matter Name (required)
- Client (dropdown, searchable)
- Matter Type (dropdown: Litigation, Corporate, Real Estate, etc.)
- Description (text area)

**Dates:**
- Start Date (required)
- Expected End Date
- Actual End Date (for closed matters)

**Status:**
- Current status (Active / On Hold / Closed)

**Assignment:**
- Lead Attorney (dropdown, required)
- Supporting Attorneys (multi-select)
- Department

**Billing:**
- Fee Structure (Hourly / Fixed Fee / Contingency / Hybrid)
- Hourly Rate (if hourly)
- Fixed Fee Amount (if fixed)
- Contingency Percentage (if contingency)
- Billing Contact (dropdown from client contacts)

**Court Information (if litigation):**
- Court name
- Case number
- Judge name

**Related Matters:**
- Link to related matters (multi-select)

**Notes:**
- Internal notes

**Buttons:**
- 💾 Save Matter
- ❌ Cancel

---

## 7. Lightning Path

### Page: `/lightning-path`

**Purpose:** Guided workflow for common matter types

**Header:**
- ⚡ "Lightning Path" title
- Subtitle: "Guided Matter Creation"

**Main Content:**

**Matter Type Selection:**
Cards for common matter types:
- ⚖️ **Litigation** - Court cases, disputes
- 🏢 **Corporate** - M&A, governance
- 🏠 **Real Estate** - Property transactions
- 👥 **Employment** - Labor matters
- 👨‍👩‍👧 **Family Law** - Divorce, custody
- 💼 **Commercial** - Contracts, negotiations

**Each Card Shows:**
- Icon
- Matter type name
- Brief description
- "Start" button

**When User Clicks "Start":**

**Step-by-Step Wizard:**

**Step 1: Basic Information**
- Matter name
- Client selection
- Matter description
- ➡️ Next button

**Step 2: Team Assignment**
- Lead attorney (required)
- Supporting team members
- ⬅️ Back / ➡️ Next

**Step 3: Billing Setup**
- Fee structure selection
- Rates configuration
- Billing contact
- ⬅️ Back / ➡️ Next

**Step 4: Checklist & Tasks**
- Pre-populated checklist for this matter type
- Example for Litigation:
  - ✅ Initial client consultation
  - ✅ Gather evidence
  - ✅ Draft complaint
  - ✅ File with court
  - ✅ Serve defendant
  - etc.
- User can add/remove tasks
- ⬅️ Back / ➡️ Next

**Step 5: Documents**
- Template documents for this matter type
- Select which to use
- Upload initial documents
- ⬅️ Back / ➡️ Next

**Step 6: Review & Create**
- Summary of all information entered
- ✅ "Create Matter" button
- ❌ "Cancel"

**After Creation:**
- Matter created with all details
- Checklist tasks added
- Template documents attached
- Redirect to Matter View
- Success message displayed

**Benefits:**
- Ensures nothing is forgotten
- Standardizes matter setup
- Reduces setup time by 70%
- Includes best practices

---

## 8. Legal Documents

### Page: `/legal`

**Purpose:** Central repository for all legal documents

**Header:**
- 📄 "Legal Documents" title
- ⬆️ "Upload Document" button
- 🔍 Search documents

**Main View:**

**Document List/Grid:**

Each document card shows:
- 📄 Document icon (based on type: PDF, DOCX, etc.)
- Document name
- 🏷️ Category badge
- 📅 Upload date
- 👤 Uploaded by
- 🏢 Associated company
- ⚖️ Associated matter (if any)
- 📏 File size
- Actions: View / Download / Edit / Delete

**Categories (Left Sidebar):**
- All Documents
- Contracts & Agreements
- Court Filings
- Correspondence
- Client Documents
- Internal Memos
- Research
- Templates

**Filters:**
- Date range
- Document type
- Associated company
- Associated matter
- Uploaded by

**Document Preview:**
- Click any document → preview pane opens
- PDF viewer for PDFs
- Office document viewer for DOCX/XLSX
- "Download" and "Print" options

**Bulk Actions:**
- Select multiple documents (checkboxes)
- Download selected (ZIP file)
- Delete selected
- Move to folder
- Tag selected

---

### Page: `/legal/:id` (Document Viewer)

**Purpose:** View and manage a single document

**Layout:**

**Left Panel: Document Viewer**
- Full-screen document preview
- Zoom controls (+ / -)
- Page navigation (for multi-page docs)
- Download button
- Print button

**Right Panel: Document Details**

**Information:**
- Document name
- Category
- File type and size
- Upload date and time
- Uploaded by (user name)

**Associations:**
- Company (linked)
- Matter (linked)
- Contact (if relevant)

**Version History:**
- List of all versions
- Who uploaded each version
- When it was uploaded
- "Restore" option for previous versions

**Tags:**
- Searchable tags
- Add new tags

**Terms & Conditions (if contract):**
- Automatically extracted key terms
- Effective dates
- Expiry dates
- Parties involved
- Key clauses

**Notes:**
- Add notes about this document
- Timestamped entries
- Visible to team members

**Actions:**
- ✏️ Edit metadata
- 🗑️ Delete document
- 📧 Email to client
- 🔗 Copy link to document

---

## 9. Time Tracking

### Page: `/time-tracking/timesheet`

**Purpose:** Log billable time entries

**Header:**
- ⏰ "Timesheet" title
- 📅 Date range selector (This Week / This Month / Custom)
- ➕ "New Time Entry" button

**Calendar View (Primary View):**

**Weekly Calendar:**
- 7 columns (Mon-Sun)
- Each day shows:
  - Date
  - Total hours logged that day
  - List of time entries

**Time Entry Cards (on calendar):**
Each entry shows:
- ⏰ Duration (e.g., "2.5 hours")
- 📁 Matter name
- 📝 Description (truncated)
- 💰 Billable amount (e.g., "R3,750")
- ✏️ Edit icon
- 🗑️ Delete icon

**Daily Summary (below calendar):**
- Total hours this week
- Total billable amount
- Billable vs. non-billable breakdown
- Chart visualization

**Filter Options:**
- Show all entries / My entries only
- Billable / Non-billable / Both
- By matter
- By client

---

### Page: `/time-tracking/timesheet/new` (Time Entry Form)

**Purpose:** Create a new time entry

**Form (Modal or Slide-in Panel):**

**Date & Duration:**
- Date (date picker)
- Start time (optional)
- End time (optional)
- **OR** Duration (hours, e.g., 2.5)

**Matter:**
- Matter selection (dropdown, searchable)
- Displays client name automatically
- Shows applicable rate

**Description:**
- Text area for work description
- Character count
- Autocomplete suggestions (based on previous entries)

**Task Type:**
- Dropdown: Research, Writing, Meeting, Court Appearance, Travel, etc.

**Billable:**
- Toggle: Billable / Non-Billable
- If non-billable, reason dropdown

**Amount:**
- Auto-calculated (Duration × Rate)
- Can be overridden manually

**Buttons:**
- 💾 Save Entry
- ❌ Cancel

**Validation:**
- Matter required
- Description required (min 10 characters)
- Duration required and > 0

**Success:**
- Entry saved
- Calendar updates
- Success message shown
- Form resets for quick entry of another

---

## 10. Billing Packs

### Page: `/time-tracking/billing-packs`

**Purpose:** Manage collections of time entries ready for invoicing

**Header:**
- 📦 "Billing Packs" title
- ➕ "Generate New Billing Pack" button
- 🔍 Search billing packs

**Billing Pack List:**

Each billing pack card shows:
- 📦 Pack name (e.g., "February 2026 - Corporate")
- 📅 Date range (e.g., "Feb 1 - Feb 28, 2026")
- 👤 Attorney / Department
- ⏰ Total hours
- 💰 Total value
- 🟢 Status badge (Draft / Ready / Invoiced)
- 📊 Number of entries
- "View" button

**Filters:**
- Filter by status
- Filter by attorney
- Filter by date range
- Filter by client

**List View Columns:**
- Pack Name
- Date Range
- Attorney
- Hours
- Value
- Status
- Actions

---

### Page: `/time-tracking/billing-packs/new` (Generate Billing Pack)

**Purpose:** Create a new billing pack

**Step 1: Selection Criteria**

**Date Range:**
- Start date (date picker)
- End date (date picker)
- Quick options: This Month / Last Month / This Quarter

**Filter By:**
- Attorney (dropdown, multi-select)
- Matter (dropdown, multi-select)
- Client (dropdown, multi-select)
- Department (dropdown)

**Include:**
- ✅ Billable entries only (default)
- ⬜ Non-billable entries
- ⬜ Previously billed entries

**Preview Button:**
- Shows count and total value of matching entries
- "X entries found, total value: R XXX,XXX"

**Step 2: Review Entries**

**Entries Table:**
- Columns: Date, Attorney, Matter, Client, Hours, Description, Amount
- Checkboxes to include/exclude specific entries
- Edit entry inline (adjust hours or amount)
- Total hours and value displayed at bottom

**Bulk Actions:**
- Select all / Deselect all
- Remove selected entries
- Adjust rates for selected

**Step 3: Pack Details**

**Pack Information:**
- Pack name (auto-generated, editable)
- Notes (optional)
- Status (Draft / Ready for invoicing)

**Grouping Options:**
- Group by client (creates multiple packs)
- Group by matter
- Single pack for all

**Buttons:**
- 📦 Create Billing Pack(s)
- ⬅️ Back
- ❌ Cancel

**After Creation:**
- Pack(s) created
- Redirect to Billing Pack View
- Success message
- Option to create invoice immediately

---

### Page: `/time-tracking/billing-packs/:id` (Billing Pack View)

**Purpose:** View and manage a billing pack

**Header:**
- 📦 Pack name
- 🟢 Status badge
- ✏️ Edit / 🗑️ Delete / 🔙 Back

**Pack Information:**
- Date range
- Created by
- Created date
- Attorney(s) included
- Client(s) included

**Summary Statistics:**
- Total hours
- Total value
- Number of entries
- Average hourly rate

**Entries Table:**
- All time entries in this pack
- Sortable columns
- Filter/search within pack
- Export to Excel/CSV

**Actions:**
- 📄 "Create Invoice" button (if not invoiced)
- 📧 "Email Pack" (send to client for review)
- 📄 "Export PDF"
- ✏️ "Edit Pack" (add/remove entries)

**Status Actions:**
- If Draft → "Mark as Ready"
- If Ready → "Create Invoice"
- If Invoiced → "View Invoice" (link)

---

## 11. Invoicing

### Page: `/invoicing/invoices`

**Purpose:** Manage all invoices

**Header:**
- 💵 "Invoices" title
- ➕ "New Invoice" button
- 🔍 Search invoices

**Invoice Cards/List:**

Each invoice shows:
- 📄 Invoice number (e.g., "INV-2026-0042")
- 🏢 Client name
- 📅 Invoice date
- 📅 Due date
- 💰 Total amount
- 💵 Amount paid
- 🟡 Status badge (Draft / Sent / Paid / Overdue)
- ⚠️ Days overdue (if applicable)
- "View" button

**Status Colors:**
- 🟦 Draft (blue)
- 🟨 Sent (yellow)
- 🟩 Paid (green)
- 🟥 Overdue (red)

**Summary Cards (Top):**
- Total Outstanding
- Total Overdue
- Total Paid This Month
- Average Days to Payment

**Filters (Left Sidebar):**
- Filter by status
- Filter by client
- Filter by date range
- Filter by amount range
- Aging: 0-30 / 31-60 / 61-90 / 90+ days

**Charts:**
- Revenue by month (bar chart)
- Aging analysis (pie chart)
- Payment trends

---

### Page: `/invoicing/invoices/:id` (Invoice View)

**Purpose:** View complete invoice details

**Layout:**

**Professional Invoice Format:**

**Header:**
- 🏢 Your firm's logo
- Firm name and address
- "INVOICE" (large, prominent)

**Invoice Information:**
- Invoice number
- Invoice date
- Due date
- Payment terms

**Bill To:**
- Client company name
- Client address
- Client contact

**Line Items Table:**
- Columns: Date, Description, Quantity (hours), Rate, Amount
- Each time entry as a line item
- Subtotal

**Additional Charges:**
- Expenses (if any)
- Disbursements
- Subtotal of additional charges

**Totals:**
- Subtotal (time + expenses)
- Tax (if applicable)
- **Total Due** (bold, large)
- Amount Paid (if any)
- **Balance Due** (if partially paid)

**Payment Information:**
- Bank details
- Payment methods accepted
- Payment instructions

**Notes:**
- Terms and conditions
- Thank you message

**Action Buttons (Top Right):**
- 📧 Email to Client
- 🖨️ Print / Download PDF
- ✏️ Edit Invoice
- 💵 Record Payment
- 🗑️ Delete Invoice

**Payment History (Below Invoice):**
- Table of payments received
- Date, amount, method, reference
- ➕ "Add Payment" button

**Status Actions:**
- If Draft → "Send to Client"
- If Sent → "Mark as Paid" / "Record Partial Payment"
- If Overdue → "Send Reminder"

---

### Page: `/invoicing/invoices/new` or `/invoicing/invoices/:id/edit` (Invoice Form)

**Purpose:** Create or edit an invoice

**Step 1: Basic Information**

**Client:**
- Select client (dropdown, searchable)
- Auto-populates billing address

**Invoice Details:**
- Invoice number (auto-generated, editable)
- Invoice date (default: today)
- Due date (default: based on payment terms)
- Payment terms (Net 30 / Net 60 / Due on Receipt)

**Step 2: Line Items**

**Option 1: From Billing Pack**
- "Import from Billing Pack" button
- Select billing pack
- All entries imported as line items

**Option 2: Manual Entry**
- ➕ "Add Line Item" button
- For each item:
  - Date
  - Description
  - Quantity (hours or units)
  - Rate
  - Amount (auto-calculated)
  - Remove item (🗑️)

**Line Items Display:**
- Table showing all items
- Editable inline
- Drag to reorder
- Subtotal displayed

**Step 3: Additional Charges**

**Expenses:**
- ➕ "Add Expense"
- Description, amount
- Receipts (attach if available)

**Disbursements:**
- Court fees, filing fees, etc.

**Step 4: Totals & Tax**

**Calculations:**
- Subtotal (line items)
- Expenses total
- Subtotal before tax
- Tax (percentage, if applicable)
- **Total Due** (bold)

**Step 5: Notes & Terms**

**Payment Instructions:**
- Bank account details
- Payment methods

**Notes to Client:**
- Thank you message
- Additional instructions

**Terms & Conditions:**
- Late payment fees
- Dispute resolution
- Other terms

**Step 6: Review & Send**

**Preview:**
- Shows invoice as client will see it
- "Edit" button returns to form

**Actions:**
- 💾 Save as Draft
- 📧 Save and Send to Client
- ❌ Cancel

**After Creation:**
- Invoice saved
- If "Send": email sent to client immediately
- Redirect to Invoice View
- Success message

---

## 12. Financials

### Page: `/financials`

**Purpose:** Financial overview and transaction management

**Header:**
- 💰 "Financials" title
- Tab navigation: Overview / Transactions / Bank Accounts / Projections

**Tab 1: Overview**

**Key Metrics (Cards):**
- 💵 Current Balance
- 📈 Income This Month
- 📉 Expenses This Month
- 💰 Net Income (Income - Expenses)

**Charts:**
- Income vs. Expenses (bar chart, last 6 months)
- Expense Categories (pie chart)
- Cash Flow Trend (line chart)

**AI Insights Panel:**
- 🤖 "Financial Insights by Vicktoria AI"
- Top 3 insights about spending
- Recommendations
- Warnings (e.g., "Expenses up 15% this month")

**Tab 2: Transactions**

**Transaction List:**

Each transaction shows:
- 📅 Date
- 📝 Description
- 🏷️ Category (with icon)
- 💰 Amount (red for expenses, green for income)
- 🏦 Account
- 🤖 AI Confidence (% badge)
- ✏️ Edit category

**Filters:**
- Date range
- Category
- Amount range
- Account
- Type (Income / Expense)

**CSV Upload:**
- ⬆️ "Upload CSV" button (prominent)
- Click → opens CSV upload modal

**Transaction Details (Click any):**
- Full description
- Original category (from bank)
- AI suggested category
- Confidence level
- Override category (dropdown)
- Add notes
- Attach receipt

**Tab 3: Bank Accounts**

**Account List:**

Each account card shows:
- 🏦 Bank name
- Account type (Checking / Savings / etc.)
- Account number (last 4 digits)
- 💰 Current balance
- 📊 Transaction count this month
- "View Transactions" button
- ✏️ Edit / 🗑️ Delete

**Add Account:**
- ➕ "New Bank Account" button
- Form: Bank name, account type, account number, starting balance

**Tab 4: Projections**

**12-Month Projection Chart:**
- Line chart showing:
  - Projected balance (blue line)
  - Projected income (green bars)
  - Projected expenses (red bars)
- 🔮 "AI Seasonal Adjustment" badge (if active)

**Projection Metadata:**
- Historical period analyzed (e.g., "Based on 365 days")
- Average income per month
- Average expenses per month
- Seasonal adjustment active: Yes/No

**Seasonal Patterns Section:**
- Shows detected spending patterns
- Pattern strength indicator
- Highest expense months
- Lowest expense months
- Year-over-year growth
- AI insights about patterns

**Actions:**
- 📄 Export Projection PDF
- 🔄 Refresh Projections
- ⚙️ Adjust Parameters

---

### CSV Upload Modal

**Purpose:** Upload bank statements for automatic categorization

**Step 1: Upload File**
- Drag-and-drop zone
- "Choose File" button
- Supported formats: CSV
- Max file size: 10MB

**Step 2: Select Account**
- Dropdown: Which bank account is this for?
- "Create New Account" option

**Step 3: Format Detection**
- System auto-detects CSV format
- Shows detected columns
- Preview first 5 rows
- Format options: Standard / Chase / Bank of America / Custom

**Step 4: Processing**
- Progress bar
- "Analyzing transactions with AI..."
- "Categorizing X transactions..."
- "Detecting duplicates..."

**Step 5: Review Results**
- Summary:
  - ✅ X transactions imported
  - ⚠️ Y duplicates skipped
  - 🤖 Z transactions categorized
  - 📊 Average confidence: XX%

**Uploaded Transactions Table:**
- All newly imported transactions
- Show AI category and confidence
- Allow override before saving
- Checkboxes to include/exclude

**Final Actions:**
- 💾 "Save Transactions"
- ❌ "Cancel Import"

**After Import:**
- Transactions added to database
- Success message with summary
- Option to view transactions
- CSV file auto-deleted from server

---

### Seasonal Patterns Component

**Purpose:** Visualize spending patterns

**AI Insights Section:**
- Gradient background
- 💡 Icon
- "Spending Pattern Insights" title
- 3-4 bullet points with insights
- Examples:
  - "December expenses are typically 15% higher due to year-end costs"
  - "March shows consistent spike in marketing spend"
  - "Your summer months (Jun-Aug) average 10% lower expenses"

**Pattern Strength Indicator:**
- Visual gauge (0-100%)
- Color-coded: Low (red), Medium (yellow), High (green)
- Text: "Strong seasonal patterns detected"

**Chart Toggle:**
- Buttons: "Balance View" / "Income vs Expenses"
- Switch between chart types

**Monthly Pattern Chart:**
- Bar chart showing:
  - Income (green bars)
  - Expenses (red bars)
- Hover: exact amounts
- Highlight highest/lowest

**Year-over-Year Growth:**
- For each month, show % change from previous year
- Badges with + or - values
- Color-coded (green = good, red = concerning)

---

## 13. Reporting Dashboard

### Page: `/reporting` (LegalNexus)

**Purpose:** Executive intelligence and firm analytics

**Header:**
- 📊 "LegalNexus Reporting" title
- 🔮 "Powered by Vicktoria AI" subtitle
- 📅 Period selector (Month / Quarter / Year / Custom)
- 🔄 Refresh button

**Tab Navigation:**
1. Executive Summary
2. Fee Earner Rankings
3. Practice Area Analytics
4. Workload Analysis
5. Billing Inertia
6. Practice Velocity

**Date Range Picker (Top Right):**
- Quick select buttons: Month / Quarter / Year / Custom
- Custom: Start date & end date pickers
- "Apply" button

**All Tabs Have:**
- 📄 "Export PDF" button (top right)
- Loading indicator while data loads
- Last updated timestamp

---

### Tab 1: Executive Summary

**Key Metrics (Cards):**
- 💰 Total Revenue
- ⏰ Billable Hours
- 💵 Outstanding Invoices
- 🎯 Realization Rate
- 📊 Average Rate
- 👥 Active Matters

**Revenue Chart:**
- Bar chart: Revenue by month (last 12 months)
- Trend line
- Target line (if set)

**Practice Area Breakdown:**
- Pie chart: Revenue by practice area
- Legend with percentages

**Top Fee Earners:**
- List of top 5 attorneys by revenue
- Photo, name, revenue amount
- Change from previous period

**Top Clients:**
- List of top 5 clients by revenue
- Company name, revenue, number of matters

**Summary Text:**
- AI-generated executive summary paragraph
- Highlights key trends
- Calls out concerns or opportunities

---

### Tab 2: Fee Earner Rankings

**Attorney Ranking Table:**

Columns:
1. **Rank** (1, 2, 3, etc.)
   - 🥇 Gold medal for #1
   - 🥈 Silver for #2
   - 🥉 Bronze for #3
2. **Attorney** (photo + name)
3. **Revenue Generated**
4. **Billable Hours**
5. **Average Rate**
6. **Realization Rate** (%)
7. **Active Matters**
8. **Trend** (↗️ up, ↘️ down, → flat)

**Features:**
- Sortable by any column
- Search attorney name
- Color-coded rows (alternating)
- Hover: shows more details

**Charts:**
- Bar chart: Revenue by attorney
- Pie chart: Hours distribution

**Insights:**
- 🤖 AI commentary on performance
- "Top performer: [Name] generated R XXX,XXX"
- "Concern: [Name] has low realization rate"

---

### Tab 3: Practice Area Analytics

**Practice Area Cards:**

Each practice area (Corporate, Litigation, etc.) gets a card:
- 🏷️ Practice area name
- 💰 Total revenue
- ⏰ Billable hours
- 📊 Percentage of firm revenue
- 📈 Growth (% change from previous period)
- "View Details" button

**Revenue Comparison Chart:**
- Stacked bar chart: Revenue by practice area over time
- Shows trends and shifts

**Hours Distribution:**
- Pie chart: Hours by practice area
- Legend with percentages

**Profitability Analysis:**
- Table: Practice Area / Revenue / Costs / Profit Margin
- Sortable
- Color-coded margins

**AI Insights:**
- Growth opportunities
- Underperforming areas
- Resource allocation recommendations

---

### Tab 4: Workload Analysis

**Purpose:** Understand matter distribution and capacity

**Attorney Workload Table:**

Columns:
- Attorney name
- Active matters count
- Total hours logged this period
- Hours per matter (average)
- Utilization rate (% of capacity)
- Status indicator (🟢 Good / 🟡 High / 🔴 Overloaded)

**Workload Distribution Chart:**
- Bar chart: Matters per attorney
- Horizontal bars
- Color-coded by utilization

**Capacity Planning:**
- Total firm capacity
- Current utilization
- Available capacity
- Recommendation: "Can take on X more matters"

**Matter Type Distribution:**
- Pie chart: Active matters by type
- Shows where firm is focused

**Department Analysis:**
- Table: Department / Attorneys / Matters / Utilization
- Identifies bottlenecks

---

### Tab 5: Billing Inertia

**Purpose:** Critical revenue at risk report

**Alert Banner (if critical):**
- ⚠️ Red banner
- "REVENUE AT RISK: R X,XXX,XXX"
- "X attorneys with critical inertia scores"

**Summary Cards:**
- 💰 Total Unbilled Amount
- 👥 Attorneys Affected
- 🔥 Critical Cases (score > 75)
- 📅 Oldest Unbilled Entry (days)

**Attorney Inertia Table:**

Columns:
- **Rank** (by inertia score)
- **Attorney** (photo + name)
- **Inertia Score** (0-100, color-coded)
  - 🔴 Red: 75-100 (Critical)
  - 🟡 Yellow: 50-74 (Warning)
  - 🟢 Green: 0-49 (Good)
- **Unbilled Amount**
- **Days Overdue** (average)
- **Critical Cases** (count with score > 75)
- **Action** (button: "Review & Bill")

**Critical Cases Detail:**
- Expandable section for each attorney
- Shows top 5 critical matters
- Matter name, unbilled amount, days overdue, score

**Trend Chart:**
- Line chart: Billing inertia over time
- Shows if problem is improving or worsening

**AI Recommendations:**
- Specific actions to take
- Priority order
- Estimated revenue recovery

**Email Alert Status:**
- "Last alert sent: [date/time]"
- "Next alert: Tomorrow at 9:00 AM"
- "Recipients: [list of partners]"

---

### Tab 6: Practice Velocity

**Purpose:** Measure efficiency and speed

**Velocity Metrics (Cards):**
- ⚡ Average Time to Invoice (days)
- 💰 Average Time to Payment (days)
- 📊 Billing Cycle Time (days)
- 🎯 Realization Rate (%)

**Efficiency Chart:**
- Timeline visualization
- Work Done → Time Logged → Invoice Created → Payment Received
- Shows average days for each step

**Matter Velocity Table:**
- Matter type
- Average days from start to completion
- Average days to first invoice
- Average total duration
- Comparison to firm average

**Attorney Efficiency:**
- Table: Attorney / Avg Days to Bill / Avg Days to Collect
- Identifies fast vs. slow billers

**Trends:**
- Line chart: Velocity metrics over time
- Shows if firm is getting faster or slower

**Benchmarks:**
- Compare to industry standards
- Show firm's position

**AI Insights:**
- Bottlenecks identified
- Process improvement suggestions
- Best practices from top performers

---

### PDF Export (All Reports)

**When User Clicks "Export PDF":**

**PDF Generation:**
- Professional document with firm branding
- LegalNexus header with logo
- Report title and period
- All data from current report
- Charts exported as images
- Tables with formatting preserved

**PDF Structure:**
- Cover page with report title
- Table of contents
- Summary page
- Detailed sections
- Charts and visualizations
- Footer with page numbers and "Generated by LegalNexus"

**Download:**
- Progress indicator during generation
- File downloads automatically
- Filename: "LegalNexus_[ReportType]_[Date].pdf"
- Typical size: 3-5 KB per report

**After Download:**
- Success message
- Option to email PDF
- Option to generate another report

---

## 14. Settings

### Page: `/settings/departments` (Department Management)

**Purpose:** Manage practice areas/departments

**Header:**
- 🏢 "Departments" title
- ➕ "New Department" button

**Department List:**

Each department card shows:
- Department name
- Department code (abbreviation)
- Number of attorneys assigned
- Number of active matters
- ✏️ Edit / 🗑️ Delete

**Add/Edit Department Form:**
- Department name (required)
- Department code (e.g., "CORP" for Corporate)
- Description
- Department head (dropdown: select attorney)
- Save / Cancel buttons

---

### Page: `/settings/roles` (Role Management)

**Purpose:** Manage user roles and permissions

**Header:**
- 🔐 "Roles & Permissions" title
- ➕ "New Role" button

**Role List:**

Each role card shows:
- Role name (e.g., "Partner", "Associate", "Admin")
- Number of users with this role
- Permission summary
- ✏️ Edit / 🗑️ Delete (can't delete system roles)

**Add/Edit Role Form:**

**Basic Information:**
- Role name (required)
- Description

**Permissions (Checkboxes):**

**Matters:**
- ✅ View all matters
- ✅ Create matters
- ✅ Edit matters
- ✅ Delete matters

**Clients:**
- ✅ View clients
- ✅ Create clients
- ✅ Edit clients
- ✅ Delete clients

**Time Tracking:**
- ✅ Log time for self
- ✅ Log time for others
- ✅ Edit time entries
- ✅ Delete time entries

**Billing:**
- ✅ Create invoices
- ✅ View all invoices
- ✅ Edit invoices
- ✅ Delete invoices

**Reports:**
- ✅ View reports
- ✅ Export reports
- ✅ View billing inertia
- ✅ View fee earner rankings

**Administration:**
- ✅ Manage users
- ✅ Manage roles
- ✅ Manage departments
- ✅ View audit logs
- ✅ System settings

**Buttons:**
- 💾 Save Role
- ❌ Cancel

---

### Page: `/settings/users` (User Management - hypothetical)

**Purpose:** Manage firm users

**User List:**

Each user card shows:
- 👤 Photo
- Name
- Email
- Role badge
- Department
- Status (Active / Inactive)
- Last login
- ✏️ Edit / 🗑️ Delete

**Add/Edit User Form:**
- First name, last name
- Email (required, unique)
- Role (dropdown)
- Department (dropdown)
- Password (when creating new)
- Status (Active / Inactive)
- Photo upload

---

## 15. Audit Logs

### Page: `/audit-logs`

**Purpose:** Complete activity history for security and compliance

**Header:**
- 📜 "Audit Logs" title
- 🔍 Search logs
- 📅 Date range filter

**Filters (Left Sidebar):**
- Date range
- User (dropdown)
- Action type (Created, Updated, Deleted, Viewed, Logged In, etc.)
- Module (Matters, Clients, Invoices, etc.)
- Entity (specific matter, client, etc.)

**Audit Log Table:**

Columns:
- **Timestamp** (date & time, sortable)
- **User** (photo + name)
- **Action** (colored badge)
  - 🟢 Created
  - 🟡 Updated
  - 🔴 Deleted
  - 🔵 Viewed
  - 🟣 Logged In
- **Module** (Matters, Clients, etc.)
- **Entity** (specific item, e.g., "Smith v. Jones")
- **Details** (what changed)
- **IP Address**

**Action Details (Click any row):**
- Expandable panel showing:
  - Full action description
  - Before/after values (for updates)
  - User agent (browser/device)
  - Session ID

**Export:**
- 📥 "Export Logs" button
- CSV format
- Filtered by current view

**Use Cases:**
- Security monitoring (who accessed what)
- Compliance audits (complete trail)
- Troubleshooting (what changed when)
- User activity tracking

---

## 16. AI Assistant

### Component: Floating AI Widget (Available on All Pages)

**Purpose:** 24/7 intelligent assistant

**Appearance:**
- 🤖 Circular button (bottom right corner)
- Gradient color (gold to orange)
- Vicktoria AI icon
- Subtle glow animation
- Badge: "Vicktoria" label on hover

**When Closed:**
- Small floating button
- Pulsing animation
- Click to open

**When Opened:**

**Chat Window:**
- Slides up from button
- Width: ~400px
- Height: ~600px
- Semi-transparent background
- Close button (×) top right

**Header:**
- 🤖 Vicktoria AI avatar (circular)
- "Vicktoria" name
- "Powered by Soul Logic" tagline
- Status: Online

**Chat Area:**

**Message Types:**

**Vicktoria's Messages (Left-aligned):**
- Avatar icon
- Light background bubble
- Text content
- Timestamp (hover)

**User's Messages (Right-aligned):**
- User avatar (if photo set)
- Darker background bubble
- Text content
- Timestamp

**Suggestion Chips (Below Vicktoria's responses):**
- Small clickable buttons
- Examples:
  - "Show pipeline health"
  - "Billing inertia report"
  - "Top revenue risks"
  - "Revenue forecast"
- Click → auto-sends as message

**Input Area:**

**Text Input:**
- Large text box
- Placeholder: "Ask Vicktoria anything..."
- Auto-resize as typing
- Character count (if approaching limit)

**Send Button:**
- ➡️ Send icon
- Disabled if empty
- Loading spinner when processing

**Features:**
- Markdown formatting in responses
- Code blocks (if relevant)
- Links to relevant pages
- Inline charts (if applicable)
- "Copy" button for responses

**Example Interactions:**

**User:** "What's my revenue this month?"
**Vicktoria:** "Your firm has generated **R450,320** in revenue this month, which is **12% higher** than last month (R401,893). You're on track to exceed your monthly target of R425,000. 📈

Would you like to see:
- [Suggestion Chip: Revenue by practice area]
- [Suggestion Chip: Top fee earners]
- [Suggestion Chip: Revenue forecast]"

**User:** "Show me billing inertia"
**Vicktoria:** "I found **R1,100,531.67** in unbilled time across **8 attorneys**. Here are the top 3 critical cases:

1. **Michael Chen** - R200,620 unbilled for 351 days (Score: 100) ⚠️
2. **Sarah Mitchell** - R149,250 unbilled for 347 days (Score: 100) ⚠️
3. **David Thompson** - R142,707 unbilled for 346 days (Score: 100) ⚠️

[Button: View Full Report] [Button: Generate Billing Packs]"

**Conversation History:**
- Scrollable chat history
- Persists during session
- "Clear Chat" option in menu

**Context Awareness:**
- Knows which page you're on
- Knows who you are (user role)
- References current data
- Understands follow-up questions

**Error Handling:**
- If AI unavailable: "I'm temporarily offline. Please try again."
- If question unclear: "Could you clarify what you mean by..."
- If no data: "I don't have any data for that period."

---

## Navigation & Layout

### Top Navigation Bar (All Pages)

**Left Side:**
- 🏢 LegalNexus logo (clickable → Dashboard)
- "LegalNexus Enterprise" text

**Center:**
- Current page title (breadcrumbs if applicable)
- Example: Dashboard / Companies / ABC Corp

**Right Side:**
- 🔍 Global search (magnifying glass icon)
- 🔔 Notifications (bell icon with badge if unread)
- 👤 User menu (avatar, dropdown)
  - Profile
  - Settings
  - Help
  - Logout

### Sidebar Menu (All Pages Except Login)

**Collapsible sidebar (left side):**

**Menu Items (with icons):**
- 🏠 Dashboard
- 🏢 Companies
- 👥 Contacts
- 💼 Sales Pipeline
- ⚖️ Matters
- ⚡ Lightning Path
- 📄 Legal Documents
- ⏰ Time Tracking
  - Timesheet
  - Billing Packs
- 💵 Invoicing
- 💰 Financials
- 📊 Reporting (LegalNexus)
- ⚙️ Settings
  - Departments
  - Roles
  - Users (if admin)
- 📜 Audit Logs

**Each menu item:**
- Icon + text label
- Hover: highlight background
- Active page: bold + colored background
- Collapsible submenu (if applicable)

**Bottom of Sidebar:**
- ⚙️ Collapse/Expand toggle
- 🌙 Dark mode toggle (future)
- 📖 Help documentation link

---

## Responsive Design Notes

**All pages are responsive:**
- **Desktop (>1200px):** Full layout with sidebar
- **Tablet (768-1199px):** Collapsed sidebar, expandable on click
- **Mobile (<768px):** Bottom navigation bar, hamburger menu

**Touch-Friendly:**
- Large tap targets (buttons, links)
- Swipe gestures (where appropriate)
- Mobile-optimized forms

---

## Common UI Elements

### Loading States
- Spinner icon
- "Loading..." text
- Skeleton screens (for cards/tables)

### Empty States
- Icon + message
- Call-to-action button
- Examples:
  - "No matters found. Create your first matter?"
  - "No invoices yet. Ready to bill your first client?"

### Error States
- ⚠️ Error icon
- Error message
- Troubleshooting tips
- "Try Again" button

### Success Messages
- ✅ Green toast notification
- Auto-dismiss after 3 seconds
- Examples:
  - "Matter created successfully"
  - "Invoice sent to client"

### Confirmation Dialogs
- Modal overlay
- Question + explanation
- "Confirm" and "Cancel" buttons
- Examples:
  - "Delete this matter? This action cannot be undone."

### Form Validation
- Real-time validation
- Red borders on invalid fields
- Error messages below fields
- Disabled submit until valid

---

## Summary

This page inventory covers **all 16 major sections** of LegalNexus Enterprise:

1. ✅ Login
2. ✅ Dashboard
3. ✅ Companies (List, Detail, Form)
4. ✅ Contacts (List, Detail, Form)
5. ✅ Sales Pipeline (Kanban, Detail, Form)
6. ✅ Matter Management (List, View, Form)
7. ✅ Lightning Path (Guided workflows)
8. ✅ Legal Documents (List, Viewer)
9. ✅ Time Tracking (Timesheet, Entry Form)
10. ✅ Billing Packs (List, View, Generate)
11. ✅ Invoicing (List, View, Form)
12. ✅ Financials (Overview, Transactions, Accounts, Projections)
13. ✅ Reporting Dashboard (6 reports + PDF export)
14. ✅ Settings (Departments, Roles, Users)
15. ✅ Audit Logs
16. ✅ AI Assistant (Vicktoria - available everywhere)

**Total: 30+ individual screens/pages** with complete functionality described.

---

*This document provides a visual blueprint of the entire LegalNexus user interface.*

**Document Version:** 1.0
**Date:** February 2026
**Status:** Complete Page Inventory
