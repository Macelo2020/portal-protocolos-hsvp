@echo off
title BACKUP SEGURO (UNIDADE E:) - PORTAL v3.0.0
color 1F

echo =========================================================
echo      INICIANDO BACKUP PARA UNIDADE EXTERNA (E:)
echo      Destino: Disco BlueFrog
echo =========================================================
echo.

:: --- 1. CONFIGURAÇÕES DE DATA ---
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%"
set "TIMESTAMP=%YY%-%MM%-%DD%_%HH%h%Min%"

:: --- 2. DEFININDO ORIGEM E DESTINO ---
set "ORIGEM=%CD%"

:: [MUDANÇA AQUI] Apontando para o Drive E: BlueFrog
set "DESTINO=E:\BlueFrog\Backups_Portal\Full_Backup_%TIMESTAMP%_v3.0.0"

:: --- 3. EXECUTAR O DUMP DO MYSQL ---
echo [1/3] Gerando arquivo SQL (Banco de Dados)...
if exist "Backups_Portal.bat" (
    call Backups_Portal.bat
) else (
    echo [AVISO] Script de banco nao encontrado.
)
echo.

:: --- 4. COPIAR O PROJETO (CODIGO + PDFS) ---
echo [2/3] Copiando arquivos do Sistema para o Drive E:...
echo De: %ORIGEM%
echo Para: %DESTINO%

:: Cria a pasta no E: se não existir
if not exist "%DESTINO%" mkdir "%DESTINO%"

:: Copia o projeto ignorando lixo
robocopy "%ORIGEM%" "%DESTINO%" /E /XD node_modules dist .git .vscode /XO

:: --- 5. COPIAR OS ARQUIVOS SQL GERADOS ---
:: O script de banco geralmente salva no C:\Backups_Portal. Vamos copiar de lá para o E: também.
echo [3/3] Sincronizando arquivos SQL antigos para o Drive E:...
robocopy "C:\Backups_Portal" "E:\BlueFrog\Backups_Portal\SQL_Archives" /E /XO

echo.
echo =========================================================
echo      BACKUP NA UNIDADE E: CONCLUIDO!
echo =========================================================
echo Seus dados estao salvos em: 
echo %DESTINO%
echo.
pause