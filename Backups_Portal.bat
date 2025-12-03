@echo off
title SISTEMA DE BACKUP - PORTAL PROTOCOLOS HSVP
color 0A
echo ====================================================
echo      INICIANDO BACKUP DO BANCO DE DADOS
echo      Hospital Sao Vicente de Paulo
echo ====================================================
echo.

:: --- 1. CONFIGURAÇÕES (AJUSTE SE NECESSÁRIO) ---

:: Usuário e Senha do Banco (Padrão XAMPP)
set DB_USER=root
set DB_PASS=

:: Nome do Banco de Dados
set DB_NAME=portal_protocolos

:: Onde guardar os backups? (Sugestão: Pasta no Google Drive ou Servidor)
set BACKUP_FOLDER=C:\Backups_Portal

:: Caminho da ferramenta mysqldump (Padrão do XAMPP)
:: Se instalaste o XAMPP em outro lugar, ajusta esta linha:
set MYSQLDUMP_PATH=C:\xampp\mysql\bin\mysqldump.exe

:: --- 2. GERAR NOME DO ARQUIVO COM DATA/HORA ---
:: Isso garante que o nome seja único (ex: 2025-11-27_14-00)
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%"
set "TIMESTAMP=%YY%-%MM%-%DD%_%HH%h%Min%"

set ARQUIVO_FINAL=%BACKUP_FOLDER%\backup_portal_%TIMESTAMP%.sql

:: --- 3. CRIAR PASTA SE NÃO EXISTIR ---
if not exist "%BACKUP_FOLDER%" mkdir "%BACKUP_FOLDER%"

:: --- 4. EXECUTAR O BACKUP ---
echo [INFO] Exportando dados para: %ARQUIVO_FINAL%...

:: Comando mágico que extrai os dados
"%MYSQLDUMP_PATH%" -u %DB_USER% --databases %DB_NAME% > "%ARQUIVO_FINAL%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCESSO] Backup realizado com sucesso!
    echo Arquivo salvo em: %BACKUP_FOLDER%
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao realizar o backup. Verifique se o XAMPP esta ligado.
)

:: --- 5. LIMPEZA AUTOMÁTICA (Opcional) ---
:: Remove backups mais antigos que 30 dias para não encher o disco
echo.
echo [INFO] Limpando backups antigos (+30 dias)...
forfiles /p "%BACKUP_FOLDER%" /s /m *.sql /d -30 /c "cmd /c del @path" 2>nul

echo.
echo ====================================================
echo PROCESSO FINALIZADO.
echo Esta janela fechara em 5 segundos.
timeout /t 5