import getpass
import hashlib
import secrets
password = getpass.getpass('Enter your NEW admin password: ')
if len(password) < 14:
    raise SystemExit('Please use a password with at least 14 characters.')
salt = secrets.token_bytes(16)
password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 600_000)
print('ADMIN_PASSWORD_SALT=' + salt.hex())
print('ADMIN_PASSWORD_HASH=' + password_hash.hex())
