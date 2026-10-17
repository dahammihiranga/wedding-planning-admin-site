import hashlib
import hmac
import os
import secrets
import time
from fastapi import HTTPException, Request
from libsql_client import create_client_sync

COOKIE_NAME = 'cwp_session'
SESSION_SECONDS = 3600

def db():
    return create_client_sync(url=os.environ['TURSO_DATABASE_URL'], auth_token=os.environ['TURSO_AUTH_TOKEN'])

def password_valid(password):
    salt = bytes.fromhex(os.environ['ADMIN_PASSWORD_SALT'])
    expected = bytes.fromhex(os.environ['ADMIN_PASSWORD_HASH'])
    actual = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 600_000)
    return hmac.compare_digest(actual, expected)

def require_auth(request: Request):
    token = request.cookies.get(COOKIE_NAME, '')
    if len(token) != 64:
        raise HTTPException(status_code=401, detail='Authentication required')
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    client = db()
    try:
        result = client.execute('SELECT expires_at FROM admin_sessions WHERE token_hash=?', [token_hash])
        if not result.rows or int(result.rows[0][0]) <= int(time.time()):
            raise HTTPException(status_code=401, detail='Session expired or invalid')
    finally:
        client.close()
    if request.method not in ('GET', 'HEAD', 'OPTIONS'):
        origin = request.headers.get('origin', '')
        host = request.headers.get('host', '')
        # Browsers send Origin on fetch POST/PUT/DELETE. Reject missing or cross-origin.
        allowed = {f'https://{host}', f'http://{host}'}
        if not origin or origin not in allowed:
            raise HTTPException(status_code=403, detail='Invalid request origin')
    return True

def new_token():
    return secrets.token_hex(32)

def token_digest(token):
    return hashlib.sha256(token.encode()).hexdigest()
