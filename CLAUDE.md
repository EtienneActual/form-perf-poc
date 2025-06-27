# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a form performance comparison POC that benchmarks two React form libraries:
- **TanStack Form** (@tanstack/react-form) - Accessible via `/tanstack` route
- **Formik** (with Yup validation) - Accessible via `/formik` route

The app allows users to dynamically configure different field types and compare performance between implementations. Supported field types:
- **TextField**: Standard text input with 3+ character validation
- **Select**: Dropdown with predefined options
- **Autocomplete**: Searchable dropdown with predefined options
- **Checkbox**: Boolean toggle input
- **DatePicker**: Material UI date picker with date-fns adapter

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview

# Clean build artifacts and dependencies
npm run clean
```

## Architecture

### Core Structure
- **Router**: React Router v7 with browser routing (src/router.tsx)
- **Theme**: Material UI custom theme with primary (#6c5ce7) and secondary (#0081cb) colors
- **Entry Point**: StrictMode + ThemeProvider + CssBaseline wrapper in main.tsx

### Form Implementations
- **FormA**: TanStack Form component with real-time validation and performance timestamps
- **FormB**: Formik component with Yup schema validation and performance timestamps
- **Shared Interface**: Both use `FormValues` type with dynamic `fields` record

### Key Files
- `/src/components/FormA/TanStackFormComponent.tsx` - TanStack Form implementation
- `/src/components/FormB/FormikFormComponent.tsx` - Formik implementation  
- `/src/pages/` - Route pages for Home, TanStack, and Formik forms
- `/src/theme.tsx` - Material UI theme configuration
- `/src/router.tsx` - Application routing

### Technology Stack
- React 19 + TypeScript
- Vite build system
- Material UI components (TextField, Select, Autocomplete, Checkbox, Button, Box)
- Material UI DatePicker (@mui/x-date-pickers) with date-fns adapter
- ESLint with TypeScript and React rules
- **Zod** for TanStack Form validation (direct Standard Schema support)
- **Yup** for Formik validation schema

## Development Notes

The project uses TypeScript strict mode with project references. Form components accept `onSubmit` callback and `fieldTypeConfig` prop to dynamically generate different field types. Performance is measured using `performance.now()` timestamps on form submission.

### Field Configuration
Each form page allows configuring the count (0-20) for each field type through the `FieldTypeControls` component. The configuration object shape:
```typescript
interface FieldTypeConfig {
  textField: number;
  select: number;
  autocomplete: number;
  checkbox: number;
  datePicker: number;
}
```

### Validation Implementation

#### TanStack Form + Zod
- Uses **direct Zod schema integration** (no adapter needed with v1)
- Field-level validation: Individual Zod schemas per field type
- Form-level validation: Cross-field validation with `onSubmitAsync`
- Error display: Form errors and field-specific errors with Material UI Alerts

#### Formik + Yup  
- Enhanced Yup schema validation with field-level and form-level rules
- Custom validation function for cross-field validation
- onSubmit validation with comprehensive error handling
- Consistent error display matching TanStack Form

### Validation Rules
- **TextField**: Required + minimum 3 characters
- **Select/Autocomplete**: Required selection  
- **Checkbox**: No validation (boolean)
- **DatePicker**: Optional, but if selected must be in future
- **Form-level**: At least one required field must be filled

### Validation Architecture
- `/src/validation/zodSchemas.ts` - Zod schemas for TanStack Form
- `/src/validation/yupSchemas.ts` - Yup schemas for Formik
- Both libraries provide similar validation behavior for performance comparison