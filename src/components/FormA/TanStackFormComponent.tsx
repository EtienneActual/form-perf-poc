import { useForm } from "@tanstack/react-form";
import { useState, useMemo } from "react";
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
import { createZodFormSchemaWithCrossValidation, getZodFieldValidator } from "../../validation/zodSchemas";

export const TanStackFormComponent = ({
  onSubmit,
  fieldTypeConfig,
}: FormComponentProps) => {
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  
  const fields = useMemo(() => generateFields(fieldTypeConfig), [fieldTypeConfig]);
  const initialValues = useMemo(() => getInitialValues(fields), [fields]);
  const formSchema = useMemo(() => createZodFormSchemaWithCrossValidation(fieldTypeConfig), [fieldTypeConfig]);

  // @ts-expect-error TanStack Form a changé sa signature de type mais la fonctionnalité reste la même
  const form = useForm<FormValues>({
    defaultValues: {
      fields: initialValues,
    },
    validators: {
      onChange: formSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await formSchema.parseAsync(value);
          return undefined;
        } catch (error) {
          const zodError = error as { errors?: Array<{ message: string; path?: string[] }> };
          return {
            form: 'Please fix the validation errors above',
            fields: zodError.errors?.reduce((acc: Record<string, string>, err) => {
              if (err.path) {
                const pathKey = err.path.join('.');
                acc[pathKey] = err.message;
              }
              return acc;
            }, {})
          };
        }
      }
    },
    onSubmit: async ({ value }) => {
      setSubmittedAt(performance.now());
      onSubmit(value);
    },
  });

  return (
    <Box className="form-container">
      <h2>TanStack Form</h2>

      <form.Subscribe selector={(state) => [state.errors, state.errorMap]}>
        {([errors, errorMap]) => (
          <>

            {errors && Array.isArray(errors) && errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.map((error: unknown, index: number) => (
                  <div key={index}>{typeof error === 'string' ? error : 'Validation error'}</div>
                ))}
              </Alert>
            )}

            {errorMap && typeof errorMap === 'object' && !Array.isArray(errorMap) && 'form' in errorMap && errorMap.form && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {String(errorMap.form)}
              </Alert>
            )}
          </>
        )}
      </form.Subscribe>

      {submittedAt && (
        <div className="success-message">
          Form submitted at: {submittedAt.toFixed(2)}ms
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {fields.map((fieldConfig) => {
            const fieldName = fieldConfig.name;

            return (
              <form.Field
                key={fieldName}
                name={`fields.${fieldName}`}
                validators={{
                  onChange: getZodFieldValidator(fieldConfig.type),
                }}
              >
                {(field) => (
                  <Box className="form-group" sx={{ mb: 2 }}>
                    {fieldConfig.type === 'textField' && (
                      <TextField
                        id={`tanstack-${fieldName}`}
                        label={fieldConfig.label}
                        variant="outlined"
                        fullWidth
                        value={field.state.value || ''}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        error={Boolean(field.state.meta.errors && field.state.meta.errors.length > 0)}
                        helperText={
                          field.state.meta.errors && field.state.meta.errors.length > 0
                            ? field.state.meta.errors.join(", ")
                            : " "
                        }
                      />
                    )}
                    
                    {fieldConfig.type === 'select' && (
                      <FormControl fullWidth error={Boolean(field.state.meta.errors && field.state.meta.errors.length > 0)}>
                        <InputLabel id={`tanstack-${fieldName}-label`}>{fieldConfig.label}</InputLabel>
                        <Select
                          labelId={`tanstack-${fieldName}-label`}
                          id={`tanstack-${fieldName}`}
                          value={field.state.value || ''}
                          label={fieldConfig.label}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        >
                          {fieldConfig.options?.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                        {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                          <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                            {field.state.meta.errors.join(", ")}
                          </Box>
                        )}
                      </FormControl>
                    )}
                    
                    {fieldConfig.type === 'autocomplete' && (
                      <Autocomplete
                        id={`tanstack-${fieldName}`}
                        options={fieldConfig.options || []}
                        value={(typeof field.state.value === 'string' ? field.state.value : null) || null}
                        onChange={(_, newValue) => field.handleChange(newValue || '')}
                        onBlur={field.handleBlur}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={fieldConfig.label}
                            error={Boolean(field.state.meta.errors && field.state.meta.errors.length > 0)}
                            helperText={
                              field.state.meta.errors && field.state.meta.errors.length > 0
                                ? field.state.meta.errors.join(", ")
                                : " "
                            }
                          />
                        )}
                      />
                    )}
                    
                    {fieldConfig.type === 'checkbox' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            id={`tanstack-${fieldName}`}
                            checked={Boolean(field.state.value)}
                            onChange={(e) => field.handleChange(e.target.checked)}
                            onBlur={field.handleBlur}
                          />
                        }
                        label={fieldConfig.label}
                      />
                    )}
                    
                    {fieldConfig.type === 'datePicker' && (
                      <DatePicker
                        label={fieldConfig.label}
                        value={field.state.value as Date | null}
                        onChange={(newValue) => field.handleChange(newValue)}
                        slotProps={{
                          textField: {
                            id: `tanstack-${fieldName}`,
                            fullWidth: true,
                            error: Boolean(field.state.meta.errors && field.state.meta.errors.length > 0),
                            helperText: field.state.meta.errors && field.state.meta.errors.length > 0
                              ? field.state.meta.errors.join(", ")
                              : " ",
                            onBlur: field.handleBlur
                          }
                        }}
                      />
                    )}
                  </Box>
                )}
              </form.Field>
            );
          })}
        </LocalizationProvider>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={!canSubmit || isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Box>
  );
};
