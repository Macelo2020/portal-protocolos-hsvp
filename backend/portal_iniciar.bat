@echo off
title SERVIDOR PORTAL PROTOCOLOS
echo --- INICIANDO O PROCESSO ---

:: 1. Entra na pasta correta (Garante que o caminho está certo)
cd /d "C:\Users\marcelo.santos\Documents\portal-protocolos\backend"

:: 2. Limpeza: Para processos antigos para evitar duplicidade
echo Parando processos antigos...
call pm2 stop "protocolos-hsvp-api"
call pm2 delete "protocolos-hsvp-api"

:: 3. Inicia o servidor com PM2 (Isso roda em SEGUNDO PLANO)
echo.
echo --- LIGANDO O SERVIDOR ---
call pm2 start index.js --name "protocolos-hsvp-api"

:: 4. Salva a lista para garantir que o PM2 lembre
call pm2 save

echo.
echo ---------------------------------------------------
echo VERIFIQUE A TABELA ACIMA.
echo Se o status estiver verde (online), DEU CERTO!
echo.
echo O site ja esta rodando no fundo.
echo Voce pode fechar esta janela agora ou deixar aberta.
echo ---------------------------------------------------
:: Este comando impede a janela de fechar sozinha
cmd /k