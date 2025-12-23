@echo off
title BACKUP DUPLO (C: + E:) - PORTAL v3.0.0
color 1F

echo =========================================================
echo      INICIANDO BACKUP REDUNDANTE (SEGURANCA MAXIMA)
echo      Destinos: Disco Local (C:) + BlueFrog (E:)
echo =========================================================
echo.

:: --- 1. CONFIGURAÇÕES DE DATA ---
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%"
set "TIMESTAMP=%YY%-%MM%-%DD%_%HH%h%Min%"

:: --- 2. DEFININDO PASTAS ---
set "ORIGEM=%CD%"

:: Destino 1 (Local - C:)
set "DEST_C=C:\Backups_Portal\Full_Backup_%TIMESTAMP%_v3.0.0"

:: Destino 2 (Externo - E:)
set "DEST_E=E:\BlueFrog\Backups_Portal\Full_Backup_%TIMESTAMP%_v3.0.0"

:: --- 3. EXECUTAR O DUMP DO MYSQL ---
echo [ETAPA 1/3] Gerando arquivo SQL (Banco de Dados)...
if exist "Backups_Portal.bat" (
    call Backups_Portal.bat
) else (
    echo [ERRO] Script de banco nao encontrado. O SQL nao sera gerado.
)
echo.

:: --- 4. COPIAR PARA O DISCO LOCAL (C:) ---
echo [ETAPA 2/3] Salvando copia no Disco Local (C:)...
if not exist "%DEST_C%" mkdir "%DEST_C%"

:: Copia Projeto
robocopy "%ORIGEM%" "%DEST_C%" /E /XD node_modules dist .git .vscode /XO /NJH /NJS
:: Copia os SQLs gerados para dentro da pasta do backup também
robocopy "C:\Backups_Portal" "%DEST_C%\Database_SQL" *.sql /XO /NJH /NJS

echo    [OK] Salvo em C: com sucesso.
echo.

:: --- 5. COPIAR PARA O DISCO BLUEFROG (E:) ---
echo [ETAPA 3/3] Salvando copia no Disco BlueFrog (E:)...
if not exist "%DEST_E%" mkdir "%DEST_E%"

:: Copia Projeto
robocopy "%ORIGEM%" "%DEST_E%" /E /XD node_modules dist .git .vscode /XO /NJH /NJS
:: Copia os SQLs
robocopy "C:\Backups_Portal" "%DEST_E%\Database_SQL" *.sql /XO /NJH /NJS

echo    [OK] Salvo em E: com sucesso.
echo.

echo =========================================================
echo      PROCESSO FINALIZADO!
echo =========================================================
echo 1. Copia Local: %DEST_C%
echo 2. Copia Segura: %DEST_E%
echo.
pause