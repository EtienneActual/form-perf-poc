import { Link } from 'react-router-dom';
import { useState } from 'react';
import { TanStackFormComponent } from '../components/FormA/TanStackFormComponent';
import { FieldTypeControls } from '../components/FieldTypeControls';
import type { FormValues, FieldTypeConfig } from '../types/form';
import './FormPage.css';

const TanStackFormPage = () => {
  const [fieldTypeConfig, setFieldTypeConfig] = useState<FieldTypeConfig>({
    textField: 3,
    select: 2, 
    autocomplete: 2,
    checkbox: 2,
    datePicker: 1
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<FormValues | null>(null);

  const handleSubmit = (values: FormValues) => {
    setResult(values);
    setSubmitted(true);
  };

  return (
    <div className="form-page-container">
      <header className="form-page-header">
        <h1>TanStack Form</h1>
        <Link to="/" className="back-button">Retour à l'accueil</Link>
      </header>

      <FieldTypeControls
        config={fieldTypeConfig}
        onChange={setFieldTypeConfig}
      />

      <div className="form-container">
        <TanStackFormComponent 
          onSubmit={handleSubmit}
          fieldTypeConfig={fieldTypeConfig}
        />
      </div>

      {submitted && result && (
        <div className="form-result">
          <h2>Résultat de la soumission</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TanStackFormPage;
