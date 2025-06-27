import * as Yup from 'yup';
import type { FieldTypeConfig } from '../types/form';
import { generateFields } from '../utils/formUtils';

// Individual field schemas
export const yupFieldSchemas = {
  textField: Yup.string()
    .required('Field is required')
    .min(3, 'Field must be at least 3 characters'),
  
  select: Yup.string()
    .required('Please select an option'),
  
  autocomplete: Yup.string()
    .required('Please select or enter an option'),
  
  checkbox: Yup.boolean(),
  
  datePicker: Yup.date().nullable()
};

// Create dynamic form schema based on field configuration
export function createYupFormSchema(fieldTypeConfig: FieldTypeConfig) {
  const fields = generateFields(fieldTypeConfig);
  const schemaShape: Record<string, Yup.Schema> = {};
  
  fields.forEach((field) => {
    switch (field.type) {
      case 'textField':
        schemaShape[field.name] = yupFieldSchemas.textField;
        break;
      case 'select':
        schemaShape[field.name] = yupFieldSchemas.select;
        break;
      case 'autocomplete':
        schemaShape[field.name] = yupFieldSchemas.autocomplete;
        break;
      case 'checkbox':
        schemaShape[field.name] = yupFieldSchemas.checkbox;
        break;
      case 'datePicker':
        schemaShape[field.name] = yupFieldSchemas.datePicker;
        break;
    }
  });

  return Yup.object().shape({
    fields: Yup.object().shape(schemaShape)
  });
}

// Form-level validation with cross-field rules
export function createYupFormSchemaWithCrossValidation(fieldTypeConfig: FieldTypeConfig) {
  const baseSchema = createYupFormSchema(fieldTypeConfig);
  const fields = generateFields(fieldTypeConfig);
  
  return baseSchema.test('form-validation', function(value) {
    const errors: Yup.ValidationError[] = [];
    
    // Check if at least one required field is filled
    const hasRequiredFields = fields.some(field => 
      field.type === 'textField' || field.type === 'select' || field.type === 'autocomplete'
    );
    
    if (hasRequiredFields) {
      const hasFilledRequiredField = fields.some(field => {
        if (field.type === 'textField' || field.type === 'select' || field.type === 'autocomplete') {
          const fieldValue = value?.fields?.[field.name];
          return typeof fieldValue === 'string' && fieldValue.trim().length > 0;
        }
        return false;
      });
      
      if (!hasFilledRequiredField) {
        errors.push(
          this.createError({
            path: 'fields',
            message: 'At least one field must be filled'
          })
        );
      }
    }
    
    // Check if dates are in the future (if any date is selected)
    const dateFields = fields.filter(field => field.type === 'datePicker');
    const now = new Date();
    
    for (const field of dateFields) {
      const dateValue = value?.fields?.[field.name];
      if (dateValue instanceof Date && dateValue <= now) {
        errors.push(
          this.createError({
            path: `fields.${field.name}`,
            message: 'Selected date must be in the future'
          })
        );
      }
    }
    
    if (errors.length > 0) {
      throw new Yup.ValidationError(errors);
    }
    
    return true;
  });
}

// Individual field validators for direct use
export function getYupFieldValidator(fieldType: string) {
  switch (fieldType) {
    case 'textField':
      return yupFieldSchemas.textField;
    case 'select':
      return yupFieldSchemas.select;
    case 'autocomplete':
      return yupFieldSchemas.autocomplete;
    case 'checkbox':
      return yupFieldSchemas.checkbox;
    case 'datePicker':
      return yupFieldSchemas.datePicker;
    default:
      return Yup.mixed();
  }
}

// Custom validation function for field-level validation in Formik
export function createFieldValidator(fieldType: string) {
  const schema = getYupFieldValidator(fieldType);
  
  return async (value: unknown) => {
    try {
      await schema.validate(value);
      return undefined;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return error.message;
      }
      return 'Validation error';
    }
  };
}