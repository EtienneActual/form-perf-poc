export type FieldType = 'textField' | 'select' | 'autocomplete' | 'checkbox' | 'datePicker';

export interface FieldTypeConfig {
  textField: number;
  select: number;
  autocomplete: number;
  checkbox: number;
  datePicker: number;
}

export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  options?: string[]; // For select and autocomplete
}

export interface FormValues {
  fields: Record<string, string | boolean | Date | null>;
}

export interface FormComponentProps {
  onSubmit: (values: FormValues) => void;
  fieldTypeConfig: FieldTypeConfig;
}

// Sample options for select and autocomplete fields
export const SELECT_OPTIONS = [
  'Option 1',
  'Option 2', 
  'Option 3',
  'Option 4',
  'Option 5'
];

export const AUTOCOMPLETE_OPTIONS = [
  'Apple',
  'Banana',
  'Cherry',
  'Date',
  'Elderberry',
  'Fig',
  'Grape',
  'Honeydew'
];