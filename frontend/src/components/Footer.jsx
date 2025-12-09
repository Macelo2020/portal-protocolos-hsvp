// src/components/Footer.jsx
import React from 'react';
import '../App.css'; // Importamos o CSS para estilizar

function Footer() {
  // Pega o ano atual automaticamente (ex: 2025)
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        
        {/* 1. Logo do Desenvolvedor */}
        <div className="footer-logo-section">
            {/* Certifique-se de colocar a imagem na pasta public */}
            <img src="/portal/logo-bluefrog.png" alt="Blue Frog Smart Solutions" className="footer-logo-img" />
        </div>

        {/* 2. Textos Legais */}
        <div className="footer-text">
            <p>
                &copy; {anoAtual} - <strong>Hospital São Vicente de Paulo</strong> - Todos os direitos reservados.
            </p>
            <p>
                Criação e desenvolvimento: <strong>Blue Frog Smart Solutions</strong>
            </p>
            <p className="footer-version">
                Versão 1.7.1
            </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;