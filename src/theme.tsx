import { createTheme } from '@mui/material/styles'

// Créer un thème personnalisé pour l'application
export const theme = createTheme({
  palette: {
    primary: {
      main: '#6c5ce7', // Couleur primaire correspondant à la couleur du bouton Formik
    },
    secondary: {
      main: '#0081cb', // Couleur secondaire correspondant à la couleur du bouton TanStack
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: '500',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#6c5ce7',
            },
          },
        },
      },
    },
  },
})
