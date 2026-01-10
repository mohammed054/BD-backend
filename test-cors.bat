@echo off
echo Testing BD Backend - CORS Fix Verification
echo =========================================
echo.

echo 1. Testing health endpoint...
curl -s https://bd-backend.up.railway.app/api/health
echo.
echo.

echo 2. Testing with CORS headers (OPTIONS request)...
curl -X OPTIONS -H "Origin: https://mohammed054.github.io" -H "Access-Control-Request-Method: GET" -v https://bd-backend.up.railway.app/api/health 2>&1 | findstr "Access-Control"
echo.
echo.

echo 3. Getting categories...
curl -s https://bd-backend.up.railway.app/api/categories
echo.
echo.

echo 4. Getting guests...
curl -s https://bd-backend.up.railway.app/api/guests
echo.
echo.

echo =========================================
echo If you see JSON responses above, backend is working!
echo.
echo Expected:
echo - Status 200 OK responses
echo - Access-Control-Allow-Origin header in OPTIONS request
echo - JSON data for categories and guests
echo.
pause