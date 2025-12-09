// Professor de Programação: App.jsx (VERSÃO FINAL - Com Layout, Rotas e Favoritos)

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; 

// Importamos o AuthContext e o Footer
import { useAuth } from './contexto/AuthContext';
import Footer from './components/Footer';

// Importamos todas as nossas páginas
import PaginaHome from './paginas/PaginaHome';
import PaginaAdmin from './paginas/PaginaAdmin';
import PaginaLogin from './paginas/PaginaLogin';
import RotaProtegida from './paginas/RotaProtegida';
import PaginaFavoritos from './paginas/PaginaFavoritos'; // (NOVO!)

// O App agora é um componente "Layout" + "Roteador"
function App() {

  // Lógica para ler o estado de login e navegar
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Função para limpar o crachá e redirecionar para o login
  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <div className="App">
      
      {/* --- 1. CABEÇALHO (Layout Fixo) --- */}
      <header className="app-header">
        <img src="/portal/logo-branca.png" alt="Hospital São Vicente de Paulo" className="header-logo" />
        <div className="header-texto">
          <h1>Portal de Protocolos</h1>
          <h2>Hospital São Vicente de Paulo</h2>
        </div>
        
        {/* (NOVO!) Navegação Condicional */}
        <nav className="header-nav">
          <Link to="/">Portal (Leitura)</Link>
          
          {/* SE o usuário estiver logado... */}
          {usuario ? (
            <>
              <Link to="/favoritos">Meus Favoritos</Link> {/* (LINK FALTANDO AQUI!) */}
              <Link to="/admin">Administração</Link>
              <button onClick={handleLogout} className="btn-logout">Sair (Logout)</button>
            </>
          ) : (
            // ...SENÃO, mostre apenas o link de Login
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      {/* --- 2. ÁREA DE PÁGINA (Layout Dinâmico) --- */}
      <div className="conteudo-pagina">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<PaginaHome />} />
          <Route path="/login" element={<PaginaLogin />} />
          
          {/* Rotas Protegidas (Guarda) */}
          <Route element={<RotaProtegida />}>
            <Route path="/favoritos" element={<PaginaFavoritos />} /> {/* (ROTA FAVORITOS) */}
            <Route path="/admin" element={<PaginaAdmin />} />
          </Route>
          
        </Routes>
      </div>

      {/* --- 3. RODAPÉ --- */}
      <Footer />

    </div>
  );
}

export default App;