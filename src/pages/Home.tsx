import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Comparaison de Formulaires React</h1>
      <p className="subtitle">Choisissez une librairie de formulaire pour tester</p>
      
      <div className="buttons-container">
        <Link to="/tanstack" className="form-button tanstack-button">
          TanStack Form
        </Link>
        
        <Link to="/formik" className="form-button formik-button">
          Formik
        </Link>
      </div>
    </div>
  );
};

export default Home;
