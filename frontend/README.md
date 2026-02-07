# AI CRM Frontend

A complete React frontend for the AI-enabled CRM system built with TypeScript, Redux Toolkit, and modern React patterns.

## Features

### Core Modules

1. **Authentication**
   - Login with JWT token management
   - Protected routes with automatic redirect
   - Token auto-refresh and logout handling

2. **CRM Management**
   - Companies CRUD operations
   - Contacts management with company filtering
   - Real-time data synchronization

3. **Sales Pipeline**
   - Interactive Kanban board with drag-and-drop
   - Deal management across pipeline stages
   - Visual pipeline metrics and value tracking

4. **Legal Documents**
   - Document upload and management
   - AI-powered term extraction viewing
   - Confidence score visualization
   - Document status tracking

5. **Financial Management**
   - Transaction tracking and categorization
   - CSV import for bulk transactions
   - Cash flow projections with interactive charts
   - Account and category management

6. **Dashboard**
   - Overview of all metrics
   - Recent activity tracking
   - Quick navigation to all modules

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router v6** - Navigation
- **@dnd-kit** - Drag and drop functionality
- **Recharts** - Data visualization
- **Axios** - API communication
- **date-fns** - Date formatting
- **Vite** - Build tool

## Project Structure

```
frontend/src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Layout.tsx    # Main layout with sidebar
│   │   ├── Button.tsx    # Button component
│   │   ├── Input.tsx     # Form input
│   │   ├── Modal.tsx     # Modal dialog
│   │   ├── Table.tsx     # Data table with pagination
│   │   ├── Card.tsx      # Card container
│   │   ├── Loading.tsx   # Loading spinner
│   │   └── PrivateRoute.tsx # Protected route wrapper
│   └── sales/
│       └── KanbanBoard/  # Sales pipeline Kanban
│           ├── index.tsx # Main board
│           ├── Column.tsx # Stage column
│           └── Card.tsx   # Deal card
├── pages/
│   ├── Dashboard/        # Dashboard with metrics
│   ├── Login/            # Login page
│   ├── Companies/        # Companies list and form
│   ├── Contacts/         # Contacts list and form
│   ├── SalesPipeline/    # Kanban board and deal form
│   ├── LegalDocuments/   # Document list, viewer, and upload
│   └── Financials/       # Transactions, CSV upload, projections
├── services/             # API service layer
│   ├── api.ts           # Axios instance with interceptors
│   ├── auth.service.ts  # Authentication API
│   ├── crm.service.ts   # CRM API
│   ├── sales.service.ts # Sales API
│   ├── legal.service.ts # Legal API
│   └── financial.service.ts # Financial API
├── store/               # Redux store
│   ├── index.ts         # Store configuration
│   ├── hooks.ts         # Typed Redux hooks
│   └── slices/          # Redux slices
│       ├── authSlice.ts
│       ├── crmSlice.ts
│       ├── salesSlice.ts
│       ├── legalSlice.ts
│       └── financialSlice.ts
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Component Usage Examples

### Common Components

```tsx
// Button
import Button from './components/common/Button';
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>

// Input
import Input from './components/common/Input';
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
/>

// Modal
import Modal from './components/common/Modal';
<Modal isOpen={open} onClose={handleClose} title="My Modal" size="medium">
  Content here
</Modal>

// Table
import Table from './components/common/Table';
<Table
  data={items}
  columns={columns}
  onRowClick={handleRowClick}
  pageSize={10}
/>

// Card
import Card from './components/common/Card';
<Card title="Title" actions={<Button>Action</Button>}>
  Content
</Card>

// Loading
import Loading from './components/common/Loading';
<Loading size="medium" message="Loading data..." />
```

### Redux Usage

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCompanies } from './store/slices/crmSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { companies, loading, error } = useAppSelector((state) => state.crm);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Component content */}</div>;
}
```

### Service Layer

```tsx
import { crmService } from './services/crm.service';

// Fetch all companies
const response = await crmService.getCompanies();
const companies = response.data;

// Create company
await crmService.createCompany({
  name: 'Acme Corp',
  industry: 'Technology'
});

// Update company
await crmService.updateCompany(id, { name: 'New Name' });

// Delete company
await crmService.deleteCompany(id);
```

## Features in Detail

### Authentication Flow

1. User enters credentials on login page
2. Redux action dispatches login request to API
3. JWT token stored in localStorage
4. Token automatically added to all subsequent API requests
5. PrivateRoute component protects authenticated routes
6. Auto-logout on 401 errors

### Sales Pipeline Kanban

- Drag and drop deals between pipeline stages
- Real-time visual feedback during drag
- Automatic API update on drop
- Stage-based organization with color coding
- Value and probability tracking
- Deal filtering and search (can be enhanced)

### Legal Document Processing

- Upload PDF/DOC/DOCX files
- View extracted text from documents
- See AI-extracted terms grouped by type
- Confidence score visualization with color coding
- Status tracking (pending, processing, completed, failed)

### Financial Projections

- AI-powered cash flow forecasting using historical data
- Interactive line charts with Recharts
- Configurable projection periods (3, 6, 12 months)
- Visual trend analysis for income, expenses, and balance
- Export capabilities (can be added)

## Styling Guide

The app uses CSS modules with the following design system:

### Color Palette

```css
Primary: #0f3460
Success: #16c79a
Danger: #e94560
Secondary: #6c757d
Background: #f5f5f5
```

### Layout

- Flexbox and CSS Grid for responsive design
- Sidebar navigation (collapsible)
- Card-based content organization
- Consistent spacing using 8px grid

### Typography

- System fonts for optimal performance
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- Consistent heading hierarchy

## Demo Credentials

```
Email: admin@example.com
Password: password123
```

## API Integration

All API calls are centralized in service files located in `src/services/`. The API client (`api.ts`) automatically:

- Adds JWT tokens to requests via interceptor
- Handles 401 errors with auto-logout
- Provides consistent error handling
- Supports file uploads with multipart/form-data

## Performance Considerations

- Component-level CSS for efficient loading
- Redux state management for optimal re-renders
- Pagination in data tables
- Lazy loading can be added for routes
- Memoization opportunities with React.memo

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search across all modules
- [ ] Data export functionality (PDF, Excel)
- [ ] User preferences and settings page
- [ ] Dark mode support
- [ ] Mobile responsive improvements
- [ ] Offline support with service workers
- [ ] Unit and integration tests
- [ ] Internationalization (i18n)
- [ ] Accessibility (a11y) improvements

## Troubleshooting

### Cannot connect to API

Ensure the backend is running and `VITE_API_URL` is set correctly in `.env`

### Token expired errors

The app should auto-logout on 401 errors. If not, clear localStorage and login again.

### Build errors

Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

## License

MIT
