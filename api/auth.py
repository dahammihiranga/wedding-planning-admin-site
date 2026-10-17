import os
import secrets
import time
from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel
from api.auth_utils import COOKIE_NAME, SESSION_SECONDS, db, new_token, password_valid, require_auth, token_digest

app = FastAPI()

class LoginInput(BaseModel):
    username: str
    password: str

def check_origin(request):
    origin = request.headers.get('origin', '')
    host = request.headers.get('host', '')
    if not origin or origin not in {f'https://{host}', f'http://{host}'}:
        raise HTTPException(403, 'Invalid request origin')

@app.post('/api/auth')
def login(data: LoginInput, request: Request, response: Response):
    check_origin(request)
    now = int(time.time())
    identifier = 'owner'
    client = db()
    try:
        row = client.execute('SELECT attempts, locked_until FROM admin_login_attempts WHERE identifier=?', [identifier]).rows
        if row and int(row[0][1]) > now:
            raise HTTPException(429, 'Too many attempts. Try again later.')
        username_ok = secrets.compare_digest(data.username, os.environ['ADMIN_USERNAME'])
        password_ok = password_valid(data.password)
        if not (username_ok and password_ok):
            attempts = int(row[0][0]) + 1 if row else 1
            locked_until = now + 900 if attempts >= 5 else 0
            client.execute('INSERT INTO admin_login_attempts(identifier, attempts, locked_until) VALUES (?, ?, ?) ON CONFLICT(identifier) DO UPDATE SET attempts=excluded.attempts, locked_until=excluded.locked_until', [identifier, attempts, locked_until])
            raise HTTPException(401, 'Invalid username or password')
        client.execute('DELETE FROM admin_login_attempts WHERE identifier=?', [identifier])
        token = new_token()
        client.execute('INSERT INTO admin_sessions(token_hash, created_at, expires_at) VALUES (?, ?, ?)', [token_digest(token), now, now + SESSION_SECONDS])
        response.set_cookie(COOKIE_NAME, token, httponly=True, secure=True, samesite='lax', max_age=SESSION_SECONDS, path='/')
        return {'success': True}
    finally:
        client.close()

@app.get('/api/auth')
def session(request: Request):
    require_auth(request)
    return {'authenticated': True}

@app.delete('/api/auth')
def logout(request: Request, response: Response):
    check_origin(request)
    token = request.cookies.get(COOKIE_NAME, '')
    if token:
        client = db()
        try:
            client.execute('DELETE FROM admin_sessions WHERE token_hash=?', [token_digest(token)])
        finally:
            client.close()
    response.delete_cookie(COOKIE_NAME, path='/', secure=True, httponly=True, samesite='lax')
    return {'success': True}

handler = app
