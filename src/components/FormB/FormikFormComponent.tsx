import { useFormik } from "formik";
import { useState, useMemo } from "react";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Alert from "@mui/material/Alert";
import type { FormComponentProps, FormValues } from "../../types/form";
import { generateFields, getInitialValues } from "../../utils/formUtils";
import { createYupFormSchemaWithCrossValidation } from "../../validation/yupSchemas";

export const FormikFormComponent = ({
  onSubmit,
  fieldTypeConfig,
}: FormComponentProps) => {
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const fields = useMemo(() => generateFields(fieldTypeConfig), [fieldTypeConfig]);
  const initialValues = useMemo(() => getInitialValues(fields), [fields]);
  const validationSchema = useMemo(() => createYupFormSchemaWithCrossValidation(fieldTypeConfig), [fieldTypeConfig]);

  // Create initial values
  const formikInitialValues: FormValues = {
    fields: initialValues,
  };

  // Custom validation function for form-level validation
  const customValidate = async (values: FormValues) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setFormErrors([]);
      return {};
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const formLevelErrors = error.errors || [];
        setFormErrors(formLevelErrors);
        
        // Return field-specific errors for Formik
        const fieldErrors: Record<string, string> = {};
        error.inner?.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path] = err.message;
          }
        });
        return fieldErrors;
      }
      return {};
    }
  };

  const formik = useFormik({
    initialValues: formikInitialValues,
    validationSchema,
    validate: customValidate,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await validationSchema.validate(values, { abortEarly: false });
        setFormErrors([]);
        setStatus(null);
        setSubmittedAt(performance.now());
        onSubmit(values);
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const errors = error.errors || ['Validation failed'];
          setFormErrors(errors);
          setStatus('Please fix the validation errors above');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box className="form-container">
      <h2>Formik Form</h2>

      {formErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {formik.status && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.status}
        </Alert>
      )}

      {submittedAt && (
        <div className="success-message">
          Form submitted at: {submittedAt.toFixed(2)}ms
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit(e);
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {fields.map((fieldConfig) => {
            const fieldName = fieldConfig.name;
            const fieldPath = `fields.${fieldName}`;
            const fieldValue = formik.values.fields[fieldName];
            const fieldTouched = formik.touched.fields?.[fieldName];
            const fieldError = fieldTouched && formik.errors.fields?.[fieldName];
            const hasError = Boolean(fieldError);

            return (
              <Box key={fieldName} className="form-group" sx={{ mb: 2 }}>
                {fieldConfig.type === 'textField' && (
                  <TextField
                    id={`formik-${fieldName}`}
                    name={fieldPath}
                    label={fieldConfig.label}
                    variant="outlined"
                    fullWidth
                    value={fieldValue || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={hasError}
                    helperText={fieldError ? String(fieldError) : " "}
                  />
                )}
                
                {fieldConfig.type === 'select' && (
                  <FormControl fullWidth error={hasError}>
                    <InputLabel id={`formik-${fieldName}-label`}>{fieldConfig.label}</InputLabel>
                    <Select
                      labelId={`formik-${fieldName}-label`}
                      id={`formik-${fieldName}`}
                      name={fieldPath}
                      value={fieldValue || ''}
                      label={fieldConfig.label}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {fieldConfig.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldError && (
                      <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                        {String(fieldError)}
                      </Box>
                    )}
                  </FormControl>
                )}
                
                {fieldConfig.type === 'autocomplete' && (
                  <Autocomplete
                    id={`formik-${fieldName}`}
                    options={fieldConfig.options || []}
                    value={(typeof fieldValue === 'string' ? fieldValue : null) || null}
                    onChange={(_, newValue) => {
                      formik.setFieldValue(fieldPath, newValue || '');
                    }}
                    onBlur={() => formik.setFieldTouched(fieldPath, true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name={fieldPath}
                        label={fieldConfig.label}
                        error={hasError}
                        helperText={fieldError ? String(fieldError) : " "}
                      />
                    )}
                  />
                )}
                
                {fieldConfig.type === 'checkbox' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        id={`formik-${fieldName}`}
                        name={fieldPath}
                        checked={Boolean(fieldValue)}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    }
                    label={fieldConfig.label}
                  />
                )}
                
                {fieldConfig.type === 'datePicker' && (
                  <DatePicker
                    label={fieldConfig.label}
                    value={fieldValue as Date | null}
                    onChange={(newValue) => {
                      formik.setFieldValue(fieldPath, newValue);
                    }}
                    slotProps={{
                      textField: {
                        id: `formik-${fieldName}`,
                        name: fieldPath,
                        fullWidth: true,
                        error: hasError,
                        helperText: fieldError ? String(fieldError) : " ",
                        onBlur: () => formik.setFieldTouched(fieldPath, true)
                      }
                    }}
                  />
                )}
              </Box>
            );
          })}
        </LocalizationProvider>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={formik.isSubmitting || !(formik.isValid && formik.dirty)}
          sx={{ mt: 2 }}
        >
          {formik.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Box>
  );
};
