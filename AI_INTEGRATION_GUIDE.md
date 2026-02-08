# 🤖 AI Components Integration Guide

## Quick Reference for Using Integrated AI Features

---

## 📄 1. Legal Documents - AI Analysis

### How to Access:
1. Navigate to **Legal Documents** page (`/legal`)
2. Click **"View"** button on any document
3. Modal opens with 4 tabs

### Tabs Overview:

#### 📋 Details Tab
- Shows basic document information
- File path and status
- Company association
- Extracted text preview

#### 📊 Terms Tab
- Displays extracted contract terms
- Organized term categories
- Original terms table functionality

#### 🤖 AI Analysis Tab (NEW)
**Features:**
- **Risk Score Circle** - Visual risk indicator (0-100)
  - 🟢 Green (0-39): Low Risk
  - 🟡 Yellow (40-69): Medium Risk
  - 🔴 Red (70-100): High Risk
- **Confidence Badge** - AI analysis confidence %
- **Parties Section** - Identified contract parties with roles
- **Key Terms** - Effective dates, termination, payment terms, renewal, notice period
- **Obligations** - Party responsibilities with deadlines
- **Risks** - Identified risks by severity (high/medium/low)
- **Unusual Clauses** - Flagged unusual contract terms
- **Recommendations** - AI-generated suggestions
- **Regenerate Button** - Re-analyze document

#### 📄 AI Summary Tab (NEW)
**Features:**
- **Confidence Bar** - Summary quality indicator
- **Summary Text** - Concise document overview
- **Key Points** - Bullet list of important items
- **Extracted Entities:**
  - 👥 People
  - 🏢 Organizations
  - 📅 Dates
  - 💰 Amounts
- **Statistics** - Word count, processing time
- **Regenerate Button** - Create new summary

### Use Cases:
- Quick contract review before meetings
- Risk assessment for new agreements
- Extract key dates and obligations
- Identify unusual or problematic clauses
- Generate executive summaries

---

## 🏠 2. Dashboard - Quick Intake Classifier

### How to Access:
1. Navigate to **Dashboard** (`/`)
2. AI Intake Classifier card displays at top

### Features:
- **Inquiry Textarea** - Enter legal inquiry details
- **Client Type Badge** - Shows if client type specified
- **Classify Button** - Triggers AI analysis

### Classification Results:
- **Confidence Badge** - Color-coded confidence level
  - 🟢 Green (80%+): High confidence
  - 🟡 Yellow (60-79%): Medium confidence
  - 🔴 Red (<60%): Low confidence
- **Department** - Recommended department (e.g., Corporate Law, Litigation)
- **Matter Type** - Specific case type
- **Urgency** - Priority level (high/medium/low)
- **Suggested Director** - Recommended lead attorney
- **Estimated Value** - Projected case value in ZAR
- **AI Reasoning** - Explanation of classification

### Use Cases:
- Quick triage of incoming inquiries
- Automated matter routing
- Resource allocation
- Initial case evaluation
- Priority assessment

### Example Flow:
```
User Input:
"Client needs help with a shareholder dispute.
Two partners want to buy out the third.
Urgent meeting scheduled for next week.
Business value approximately R5 million."

AI Classification:
📂 Department: Corporate Law
📋 Matter Type: Shareholder Dispute
⏱️ Urgency: HIGH
👤 Director: Senior Corporate Attorney
💰 Value: R 5,000,000
🧠 Reasoning: "High-urgency corporate matter requiring
experienced attorney for shareholder buyout negotiation..."
```

---

## 🏢 3. Companies - FICA Compliance

### How to Access:
1. Navigate to **Companies** page (`/companies`)
2. Click **"Edit"** on any existing company
3. Click **"🔒 FICA Compliance"** tab

### Features:

#### Compliance Overview:
- **Progress Circle** - Visual completion percentage
  - Shows overall FICA compliance status
  - Color-coded by status
- **Status Badge** - Complete/In Progress/Not Started
- **Quick Stats** - Missing docs count, expiring soon count

#### Missing Documents:
- **Document List** with status icons:
  - ❌ Missing
  - ⏰ Expired
  - ⏳ Pending Verification
- **Overdue Indicators** - Days overdue for each document
- Clickable items for quick action

#### Expiring Soon:
- **Alert List** - Documents expiring within 30 days
- ⚠️ Warning icons
- Days until expiration
- Priority sorting

#### AI Recommendations:
- 🤖 **AI-Generated Action Items**
- Prioritized recommendations
- Specific next steps
- Compliance best practices

#### Actions:
- **Refresh Button** (🔄) - Re-analyze compliance
- Auto-updates when documents added

### Use Cases:
- Pre-engagement compliance checks
- Regular client compliance audits
- Risk management
- Regulatory reporting
- Client onboarding verification

### Compliance Statuses:

| Status | Meaning | Color |
|--------|---------|-------|
| Complete | All FICA docs verified | 🟢 Green |
| In Progress | Some docs missing/pending | 🟡 Orange |
| Not Started | No compliance docs | 🔴 Red |

---

## ⚡ 4. Lightning Path - New Matter Intake

### How to Access:
1. Navigate to **Lightning Path** page (`/lightning-path`)
2. Click **"✨ New Intake"** button in header

### Features:

#### New Intake Button:
- Located in page header
- Toggles intake classifier
- Changes to "❌ Close Intake" when open

#### Intake Classifier (Collapsible):
- Slides down smoothly with animation
- Same classification features as Dashboard
- Integrated with matter creation workflow
- Auto-refreshes kanban after classification

### Classification Integration:
After classification completes:
1. Results displayed with confidence
2. Suggested department shown
3. Matter type identified
4. Urgency assessed
5. Director recommended
6. Estimated value calculated
7. **Use data to create new matter** ➔ Navigate to matter creation

### Use Cases:
- Streamline matter intake process
- Consistent matter classification
- Automated routing and assignment
- Quick matter creation from inquiry
- Pipeline management optimization

### Workflow Example:
```
1. Click "✨ New Intake"
2. Enter inquiry: "Client arrested for DUI, court date next week"
3. Click "✨ Classify Inquiry"
4. AI suggests:
   - Department: Criminal Law
   - Type: DUI Defense
   - Urgency: HIGH
   - Director: Criminal Law Specialist
5. Close intake classifier
6. Create new matter with pre-filled data
7. Matter appears in appropriate kanban column
```

---

## 🎨 Visual Design Elements

### Consistent Patterns:

#### Tab Navigation:
- Inactive tabs: Gray text, hover highlight
- Active tabs: **Purple gradient background**, white text
- Smooth transitions between tabs

#### AI Indicators:
- 🤖 Robot emoji for AI features
- ✨ Sparkle emoji for actions
- 🔄 Refresh icon for regeneration
- 🧠 Brain icon for AI reasoning

#### Color Scheme:
- **Primary AI Gradient:** `#667eea` → `#764ba2` (Purple)
- **Success/Low Risk:** `#28a745` (Green)
- **Warning/Medium Risk:** `#ff9800` (Orange)
- **Danger/High Risk:** `#dc3545` (Red)
- **Info:** `#2196f3` (Blue)

#### Status Colors:
| Status | Color | Use |
|--------|-------|-----|
| High Confidence | Green | 80%+ confidence |
| Medium Confidence | Yellow/Orange | 60-79% confidence |
| Low Confidence | Red | <60% confidence |
| High Urgency | Red | Urgent matters |
| Medium Urgency | Orange | Standard priority |
| Low Urgency | Green | Non-urgent |

---

## ⚡ Performance Tips

### Optimization:
1. **First Load** - Components load on-demand (tab activation)
2. **Caching** - AI results cached for 15 minutes
3. **Lazy Loading** - Heavy components load when needed
4. **Background Processing** - AI analysis runs asynchronously

### Best Practices:
- Use **Regenerate** button sparingly (costs API calls)
- Classification results are cached per inquiry text
- FICA compliance updates on document changes
- Tab switching is instant (no re-fetch)

---

## 🐛 Troubleshooting

### Common Issues:

#### "Failed to load AI analysis"
- **Cause:** OpenAI API key not configured or expired
- **Solution:** Check backend `OPENAI_API_KEY` in `.env`

#### "AI is analyzing..." never completes
- **Cause:** Network timeout or API rate limit
- **Solution:** Refresh page, check backend logs

#### Classification confidence very low
- **Cause:** Inquiry text too vague or short
- **Solution:** Provide more detailed inquiry description

#### FICA compliance stuck on loading
- **Cause:** Client documents not found in database
- **Solution:** Verify client ID, check backend logs

---

## 📊 Feature Comparison

| Feature | Documents | Dashboard | Companies | Lightning |
|---------|-----------|-----------|-----------|-----------|
| Contract Analysis | ✅ | ❌ | ❌ | ❌ |
| Document Summary | ✅ | ❌ | ❌ | ❌ |
| Intake Classifier | ❌ | ✅ | ❌ | ✅ |
| FICA Compliance | ❌ | ❌ | ✅ | ❌ |
| Tab Interface | ✅ | ❌ | ✅ | ❌ |
| Collapsible UI | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Advanced Usage

### Keyboard Shortcuts:
- `Tab` - Navigate between form fields in classifier
- `Esc` - Close modals
- `Enter` - Submit classification (when in textarea)

### API Integration:
All AI components use:
- **Endpoint:** `/api/v1/ai/*`
- **Auth:** JWT token from login
- **Model:** OpenAI GPT-4 Turbo
- **Timeout:** 30 seconds per request

### Data Flow:
```
User Input → Frontend Component → API Service → Backend Controller
→ AI Service → OpenAI API → Response → Frontend Display
```

---

## 📞 Support Resources

### Documentation:
- Component source: `frontend/src/components/ai/`
- Services: `frontend/src/services/ai.service.ts`
- Backend: `backend/src/modules/ai/`

### Testing:
- Use `backend/test-ai-features.js` for API testing
- Check `AI_FEATURES_TEST_REPORT.md` for validation

### Issues:
- Check browser console for errors
- Review backend logs for API failures
- Verify OpenAI API key is valid

---

**Last Updated:** 2026-02-08
**Version:** 1.0
**Status:** ✅ Production Ready
