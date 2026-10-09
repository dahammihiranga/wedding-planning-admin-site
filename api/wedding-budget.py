import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from libsql_client import create_client_sync
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

DEFAULT_BUDGET_ITEMS = [{'name': 'Registration', 'remarks': '', 'subitems': ['Registration Fee', 'Registar - Gift']}, {'name': 'Auspicious timing(Nekath)', 'remarks': '', 'subitems': []}, {'name': 'Venue / Hotel', 'remarks': '', 'subitems': ['{hotel_name}']}, {'name': 'Poruwa Ceremony', 'remarks': '', 'subitems': ['Astaka', 'Dancing group', 'Jayamangala gatha', 'Poruwa ingredients']}, {'name': 'Photographer', 'remarks': '', 'subitems': ['Wedding day morning shoot', 'Wedding Shoot ', 'Wedding function coverage']}, {'name': 'Videography', 'remarks': '', 'subitems': []}, {'name': 'Salon - Bride', 'remarks': '', 'subitems': ['{salon_name} Salon wedding day makeup', 'Going away change']}, {'name': 'Salon - Groom', 'remarks': '', 'subitems': ['Salon wedding day makeup', 'Going away change']}, {'name': 'Jewellery', 'remarks': '', 'subitems': []}, {'name': 'Decorations', 'remarks': '', 'subitems': []}, {'name': 'Band - Music (Wanted Band)', 'remarks': '', 'subitems': ['Wedding day full coverage']}, {'name': 'Wedding planner', 'remarks': '', 'subitems': []}, {'name': 'Cake boxes & cards', 'remarks': '', 'subitems': ['CAKE BOX- {count} , CARD- {count}']}, {'name': 'Wedding cake', 'remarks': '', 'subitems': ['Per cake piece - {number of peaces*peace price)']}, {'name': 'Wedding Car', 'remarks': 'Depends on the vehicle type', 'subitems': []}, {'name': 'Wedding Shoes - Bride side', 'remarks': '', 'subitems': []}, {'name': 'Wedding Shoes - Groom side', 'remarks': '', 'subitems': []}, {'name': "Wedding dress - Bride side(without bride'smaids)", 'remarks': 'First fitton or rent price would be lower cost', 'subitems': ['Bride - Wedding']}, {'name': 'Wedding dress - Groom side(withthout bestman)', 'remarks': '', 'subitems': []}, {'name': 'Going away dress - Bride', 'remarks': '', 'subitems': []}, {'name': 'Going away dress - Groom', 'remarks': '', 'subitems': []}, {'name': 'Bites - Cooked (From hotel)', 'remarks': '', 'subitems': []}, {'name': 'Bites - Dried (From Outside)', 'remarks': '', 'subitems': []}, {'name': 'Liquor (Depends on the bottle brand)', 'remarks': '', 'subitems': []}, {'name': 'Preshoot', 'remarks': '', 'subitems': []}, {'name': 'Honey moon', 'remarks': '', 'subitems': []}, {'name': 'Cake Strcture', 'remarks': '', 'subitems': []}, {'name': 'Bridesmaids / Bestman', 'remarks': '', 'subitems': []}, {'name': 'Parent dress and other family expences', 'remarks': '', 'subitems': []}, {'name': 'Other expences', 'remarks': '', 'subitems': []}]

class BudgetCreate(BaseModel):
    inquiry_id: int
    item_name: str
    subitems: str = ""
    remarks: str = ""
    estimated_amount: str = ""

class BudgetUpdate(BaseModel):
    item_name: str
    subitems: str = ""
    remarks: str = ""
    estimated_amount: str = ""

def client_open():
    return create_client_sync(url=os.environ.get("TURSO_DATABASE_URL"), auth_token=os.environ.get("TURSO_AUTH_TOKEN"))

def parse_amount(value):
    if value is None or str(value).strip() == "":
        return None
    amount = float(str(value).replace(",", ""))
    if not 0 <= amount <= 1_000_000_000_000:
        raise ValueError("Amount must be between 0 and 1 trillion")
    return amount

def ensure_budget(client, inquiry_id):
    # One-time initialization marker prevents deleted default items from reappearing.
    client.execute("INSERT OR IGNORE INTO wedding_budget_initialized (inquiry_id) VALUES (?)", [inquiry_id])
    changed = client.execute("SELECT changes()").rows[0][0]
    if not changed:
        return
    for index, item in enumerate(DEFAULT_BUDGET_ITEMS, start=1):
        client.execute("INSERT INTO wedding_budget_items (inquiry_id, item_name, subitems, remarks, estimated_amount, sort_order) VALUES (?, ?, ?, ?, NULL, ?)", [inquiry_id, item["name"], "\n".join(item["subitems"]), item["remarks"], index])

@app.get("/api/wedding-budget")
async def get_budget(inquiry_id: int = Query(...)):
    client = client_open()
    try:
        ensure_budget(client, inquiry_id)
        result = client.execute("SELECT id, inquiry_id, item_name, subitems, remarks, estimated_amount, sort_order FROM wedding_budget_items WHERE inquiry_id=? ORDER BY sort_order, id", [inquiry_id])
        return [dict(zip(result.columns, row)) for row in result.rows]
    finally:
        client.close()

@app.post("/api/wedding-budget")
async def create_budget(data: BudgetCreate):
    if not data.item_name.strip():
        raise HTTPException(400, "Item name required")
    try:
        amount = parse_amount(data.estimated_amount)
    except ValueError as e:
        raise HTTPException(400, str(e))
    client = client_open()
    try:
        ensure_budget(client, data.inquiry_id)
        max_order = client.execute("SELECT COALESCE(MAX(sort_order),0) FROM wedding_budget_items WHERE inquiry_id=?", [data.inquiry_id]).rows[0][0]
        result = client.execute("INSERT INTO wedding_budget_items (inquiry_id,item_name,subitems,remarks,estimated_amount,sort_order) VALUES (?,?,?,?,?,?)", [data.inquiry_id,data.item_name.strip(),data.subitems,data.remarks,amount,int(max_order)+1])
        return {"success":True,"id":result.last_insert_rowid}
    finally:
        client.close()

@app.put("/api/wedding-budget")
async def update_budget(id: int = Query(...), data: BudgetUpdate = None):
    if not data or not data.item_name.strip():
        raise HTTPException(400, "Item name required")
    try:
        amount = parse_amount(data.estimated_amount)
    except ValueError as e:
        raise HTTPException(400, str(e))
    client = client_open()
    try:
        result = client.execute("UPDATE wedding_budget_items SET item_name=?,subitems=?,remarks=?,estimated_amount=? WHERE id=?", [data.item_name.strip(),data.subitems,data.remarks,amount,id])
        return {"success":bool(result.rows_affected),"id":id}
    finally:
        client.close()

@app.delete("/api/wedding-budget")
async def delete_budget(id: int = Query(...)):
    client = client_open()
    try:
        result = client.execute("DELETE FROM wedding_budget_items WHERE id=?", [id])
        return {"success":bool(result.rows_affected),"id":id}
    finally:
        client.close()

handler = app
