// Professor de Programação: App.jsx (VERSÃO FINAL - Acesso Colaborativo)
// ARQUITETURA: React Router com Layout e Navegação Condicional

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; 

import { useAuth } from './contexto/AuthContext';
import Footer from './components/Footer';

import PaginaHome from './paginas/PaginaHome';
import PaginaAdmin from './paginas/PaginaAdmin';
import PaginaLogin from './paginas/PaginaLogin';
import RotaProtegida from './paginas/RotaProtegida';
import PaginaFavoritos from './paginas/PaginaFavoritos'; 

function App() {

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <div className="App">
      
      {/* --- CABEÇALHO (Layout Fixo) --- */}
      <header className="app-header">
        <img src="/logo-branca.png" alt="Hospital São Vicente de Paulo" className="header-logo" />
        <div className="header-texto">
          <h1>Portal de Protocolos</h1>
          <h2>Hospital São Vicente de Paulo</h2>
        </div>
        
        {/* Navegação Condicional */}
        <nav className="header-nav">
          <Link to="/">Portal (Leitura)</Link>
          
          {usuario ? (
            <>
              <Link to="/favoritos">Meus Favoritos</Link>
              {/* UX/UI: Agora o link 'Administração' aparece para TODOS os logados, incluindo enfermagem */}
              <Link to="/admin">Administração</Link>
              <button onClick={handleLogout} className="btn-logout">Sair (Logout)</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      {/* --- ÁREA DE PÁGINA (Layout Dinâmico) --- */}
      <div className="conteudo-pagina">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<PaginaHome />} />
          <Route path="/login" element={<PaginaLogin />} />
          
          {/* Rotas Protegidas - Nível Básico (Apenas Login Necessário) */}
          <Route element={<RotaProtegida />}>
            <Route path="/favoritos" element={<PaginaFavoritos />} /> 
            {/* O painel de administração agora está acessível a todos os logados. O bloqueio granular será feito DENTRO da página */}
            <Route path="/admin" element={<PaginaAdmin />} />
          </Route>
          
        </Routes>
      </div>

      <Footer />

    </div>
  );
}

export default App;