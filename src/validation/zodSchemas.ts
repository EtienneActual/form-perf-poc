import { z } from 'zod';
import type { FieldTypeConfig } from '../types/form';
import { generateFields } from '../utils/formUtils';

// Individual field schemas
export const zodFieldSchemas = {
  textField: z.string()
    .min(1, 'Field is required')
    .min(3, 'Field must be at least 3 characters'),
  
  select: z.string()
    .min(1, 'Please select an option'),
  
  autocomplete: z.string()
    .min(1, 'Please select or enter an option'),
  
  checkbox: z.boolean(),
  
  datePicker: z.date().nullable().optional()
};

// Create dynamic form schema based on field configuration
export function createZodFormSchema(fieldTypeConfig: FieldTypeConfig) {
  const fields = generateFields(fieldTypeConfig);
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  
  fields.forEach((field) => {
    switch (field.type) {
      case 'textField':
        schemaShape[field.name] = zodFieldSchemas.textField;
        break;
      case 'select':
        schemaShape[field.name] = zodFieldSchemas.select;
        break;
      case 'autocomplete':
        schemaShape[field.name] = zodFieldSchemas.autocomplete;
        break;
      case 'checkbox':
        schemaShape[field.name] = zodFieldSchemas.checkbox;
        break;
      case 'datePicker':
        schemaShape[field.name] = zodFieldSchemas.datePicker;
        break;
    }
  });

  return z.object({
    fields: z.object(schemaShape)
  });
}

// Form-level validation with cross-field rules
export function createZodFormSchemaWithCrossValidation(fieldTypeConfig: FieldTypeConfig) {
  const baseSchema = createZodFormSchema(fieldTypeConfig);
  const fields = generateFields(fieldTypeConfig);
  
  return baseSchema.refine((data) => {
    // Check if at least one required field is filled
    const hasRequiredFields = fields.some(field => 
      field.type === 'textField' || field.type === 'select' || field.type === 'autocomplete'
    );
    
    if (hasRequiredFields) {
      const hasFilledRequiredField = fields.some(field => {
        if (field.type === 'textField' || field.type === 'select' || field.type === 'autocomplete') {
          const value = data.fields[field.name];
          return typeof value === 'string' && value.trim().length > 0;
        }
        return false;
      });
      
      if (!hasFilledRequiredField) {
        return false;
      }
    }
    
    return true;
  }, {
    message: 'At least one field must be filled',
    path: ['fields']
  }).refine((data) => {
    // Check if dates are in the future (if any date is selected)
    const dateFields = fields.filter(field => field.type === 'datePicker');
    const now = new Date();
    
    for (const field of dateFields) {
      const dateValue = data.fields[field.name];
      if (dateValue instanceof Date && dateValue <= now) {
        return false;
      }
    }
    
    return true;
  }, {
    message: 'Selected date must be in the future',
    path: ['fields']
  });
}

// Individual field validators for direct use in form.Field
export function getZodFieldValidator(fieldType: string) {
  return ({ value }: { value: unknown }) => {
    // Don't validate empty values for optional fields initially
    if ((value === '' || value === null || value === undefined) && fieldType !== 'textField' && fieldType !== 'select' && fieldType !== 'autocomplete') {
      return undefined;
    }
    
    try {
      switch (fieldType) {
        case 'textField':
          // Only validate if there's a value or it's been touched
          if (value === '' || value === null || value === undefined) {
            return 'Field is required';
          }
          if (typeof value === 'string' && value.length < 3) {
            return 'Field must be at least 3 characters';
          }
          break;
        case 'select':
          if (value === '' || value === null || value === undefined) {
            return 'Please select an option';
          }
          break;
        case 'autocomplete':
          if (value === '' || value === null || value === undefined) {
            return 'Please select or enter an option';
          }
          break;
        case 'checkbox':
          // Checkboxes don't need validation
          break;
        case 'datePicker':
          // DatePicker is optional
          break;
        default:
          break;
      }
      return undefined; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Validation error';
      }
      return 'Validation error';
    }
  };
}