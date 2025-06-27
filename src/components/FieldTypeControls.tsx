import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import type { FieldTypeConfig } from '../types/form';

interface FieldTypeControlsProps {
  config: FieldTypeConfig;
  onChange: (config: FieldTypeConfig) => void;
}

export const FieldTypeControls: React.FC<FieldTypeControlsProps> = ({
  config,
  onChange,
}) => {
  const handleFieldChange = (fieldType: keyof FieldTypeConfig, value: number) => {
    const newConfig = {
      ...config,
      [fieldType]: Math.max(0, Math.min(20, value)), // Limit between 0 and 20
    };
    onChange(newConfig);
  };

  const totalFields = Object.values(config).reduce((sum, count) => sum + count, 0);

  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configuration des champs ({totalFields} champs au total)
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
          <TextField
            label="Text Fields"
            type="number"
            inputProps={{ min: 0, max: 20 }}
            value={config.textField}
            onChange={(e) =>
              handleFieldChange('textField', parseInt(e.target.value) || 0)
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
          <TextField
            label="Select Fields"
            type="number"
            inputProps={{ min: 0, max: 20 }}
            value={config.select}
            onChange={(e) =>
              handleFieldChange('select', parseInt(e.target.value) || 0)
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
          <TextField
            label="Autocomplete Fields"
            type="number"
            inputProps={{ min: 0, max: 20 }}
            value={config.autocomplete}
            onChange={(e) =>
              handleFieldChange('autocomplete', parseInt(e.target.value) || 0)
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
          <TextField
            label="Checkbox Fields"
            type="number"
            inputProps={{ min: 0, max: 20 }}
            value={config.checkbox}
            onChange={(e) =>
              handleFieldChange('checkbox', parseInt(e.target.value) || 0)
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
          <TextField
            label="Date Picker Fields"
            type="number"
            inputProps={{ min: 0, max: 20 }}
            value={config.datePicker}
            onChange={(e) =>
              handleFieldChange('datePicker', parseInt(e.target.value) || 0)
            }
            size="small"
            fullWidth
          />
        </Box>
      </Box>
    </Box>
  );
};