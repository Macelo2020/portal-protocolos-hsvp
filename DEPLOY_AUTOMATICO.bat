@echo off
title DEPLOY AUTOMATICO - PORTAL PROTOCOLOS HSVP
color 0B

echo ==========================================
echo      INICIANDO ATUALIZACAO DO SISTEMA
echo ==========================================
echo.

:: 1. Compilar o Frontend (Vite)
echo [1/4] Gerando nova versao do site (Build)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Falha no build do Frontend.
    pause
    exit /b
)
cd ..

:: 2. Limpar a pasta Public do Backend (MANTENDO UPLOADS)
echo [2/4] Limpando versao antiga do servidor...
:: Apaga arquivos soltos (index.html, favicon, etc)
del /Q "backend\public\*.*"
:: Apaga a pasta assets do build anterior
rmdir /S /Q "backend\public\assets"

:: NOTA: Não apagamos as pastas 'images' e 'pdfs' para não perder os uploads!

:: 3. Copiar os novos arquivos
echo [3/4] Copiando novos arquivos para o Backend...
xcopy /E /I /Y "frontend\dist\*" "backend\public\"

:: 4. Reiniciar o serviço no PM2 (Para garantir que pegue configs novas)
echo [4/4] Reiniciando o servidor...
cd backend
call pm2 restart "PortalProtocolosHSVP" 2>nul || call pm2 restart all
cd ..

echo.
echo ==========================================
echo      SUCESSO! O SISTEMA FOI ATUALIZADO
echo ==========================================
echo Agora acesse: http://192.168.0.201:3001
echo (Nao precisa mais do XAMPP para o site!)
echo.
pause