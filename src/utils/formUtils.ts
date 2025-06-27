import type { FieldTypeConfig, FormField } from '../types/form';
import { SELECT_OPTIONS, AUTOCOMPLETE_OPTIONS } from '../types/form';

export function generateFields(config: FieldTypeConfig): FormField[] {
  const fields: FormField[] = [];
  let fieldIndex = 1;

  // Generate TextField fields
  for (let i = 0; i < config.textField; i++) {
    fields.push({
      id: `field_${fieldIndex}`,
      name: `field_${fieldIndex}`,
      type: 'textField',
      label: `Text Field ${i + 1}`
    });
    fieldIndex++;
  }

  // Generate Select fields
  for (let i = 0; i < config.select; i++) {
    fields.push({
      id: `field_${fieldIndex}`,
      name: `field_${fieldIndex}`,
      type: 'select',
      label: `Select ${i + 1}`,
      options: SELECT_OPTIONS
    });
    fieldIndex++;
  }

  // Generate Autocomplete fields
  for (let i = 0; i < config.autocomplete; i++) {
    fields.push({
      id: `field_${fieldIndex}`,
      name: `field_${fieldIndex}`,
      type: 'autocomplete',
      label: `Autocomplete ${i + 1}`,
      options: AUTOCOMPLETE_OPTIONS
    });
    fieldIndex++;
  }

  // Generate Checkbox fields
  for (let i = 0; i < config.checkbox; i++) {
    fields.push({
      id: `field_${fieldIndex}`,
      name: `field_${fieldIndex}`,
      type: 'checkbox',
      label: `Checkbox ${i + 1}`
    });
    fieldIndex++;
  }

  // Generate DatePicker fields
  for (let i = 0; i < config.datePicker; i++) {
    fields.push({
      id: `field_${fieldIndex}`,
      name: `field_${fieldIndex}`,
      type: 'datePicker',
      label: `Date Picker ${i + 1}`
    });
    fieldIndex++;
  }

  return fields;
}

export function getInitialValues(fields: FormField[]): Record<string, string | boolean | Date | null> {
  const initialValues: Record<string, string | boolean | Date | null> = {};
  
  fields.forEach(field => {
    switch (field.type) {
      case 'textField':
      case 'select':
      case 'autocomplete':
        initialValues[field.name] = '';
        break;
      case 'checkbox':
        initialValues[field.name] = false;
        break;
      case 'datePicker':
        initialValues[field.name] = null;
        break;
    }
  });

  return initialValues;
}