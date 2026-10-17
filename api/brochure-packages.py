import json
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field
from api.auth_utils import db, require_auth

app = FastAPI(dependencies=[Depends(require_auth)])

DEFAULTS = [
    ('Full Wedding Planning', '', '', ''),
    ('Partial Wedding Planning', '', '', ''),
    ('Wedding Day Coordination', '', '', ''),
    ('Wedding Agenda Making', '', '', ''),
]

class PackageItem(BaseModel):
    id: int = Field(ge=1, le=4)
    name: str = Field(min_length=1, max_length=80)
    price: str = Field(default='', max_length=40)
    offer: str = Field(default='', max_length=70)
    description: str = Field(default='', max_length=450)

class PackagePayload(BaseModel):
    packages: list[PackageItem] = Field(min_length=4, max_length=4)

def get_packages(client):
    result = client.execute('SELECT id, name, price, offer, description FROM brochure_packages ORDER BY id')
    return [dict(zip(result.columns, row)) for row in result.rows]

@app.get('/api/brochure-packages')
def read_packages():
    client = db()
    try:
        result = get_packages(client)
        return {'packages': result}
    finally:
        client.close()

@app.put('/api/brochure-packages')
def save_packages(payload: PackagePayload):
    if sorted(p.id for p in payload.packages) != [1, 2, 3, 4]:
        raise HTTPException(400, 'Exactly four unique package IDs are required')
    client = db()
    try:
        for p in payload.packages:
            client.execute('UPDATE brochure_packages SET name=?, price=?, offer=?, description=? WHERE id=?',
                           [p.name.strip(), p.price.strip(), p.offer.strip(), p.description.strip(), p.id])
        return {'success': True, 'packages': get_packages(client)}
    finally:
        client.close()

handler = app
