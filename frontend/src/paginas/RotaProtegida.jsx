// src/paginas/RotaProtegida.jsx
// Professor de Programação: Este é o "Guarda" da nossa página de admin!

import { useAuth } from '../contexto/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// Este componente "envelopa" as páginas que queremos proteger
function RotaProtegida() {
  
  // 1. Verificamos o "porta-crachá"
  const { usuario } = useAuth();

  // 2. Se NÃO houver crachá (token)...
  if (!usuario) {
    // ...redireciona (chuta) o usuário para a página de login
    // 'replace' impede o usuário de "voltar" para o admin pelo botão do navegador
    return <Navigate to="/login" replace />;
  }

  // 3. Se HOUVER um crachá, mostre a página que está sendo protegida
  // O <Outlet> é o "espaço" onde o React Router vai renderizar a PaginaAdmin
  return <Outlet />;
}

export default RotaProtegida;