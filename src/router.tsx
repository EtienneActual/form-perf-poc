import { createBrowserRouter } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import TanStackFormPage from './pages/TanStackFormPage';
import FormikFormPage from './pages/FormikFormPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/tanstack',
    element: <TanStackFormPage />
  },
  {
    path: '/formik',
    element: <FormikFormPage />
  }
]);
