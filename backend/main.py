from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os

app = FastAPI(title="Chathu Wedding Planners CRM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = os.path.join("/tmp", "weddings.db")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            couple_name TEXT NOT NULL,
            wedding_date TEXT,
            hotel TEXT,
            service_type TEXT DEFAULT 'Full wedding planning',
            wedding_type TEXT DEFAULT 'One day',
            guest_count INTEGER,
            contact_no TEXT,
            bridesmaid_option TEXT DEFAULT '-',
            agreed_price REAL DEFAULT 0.0,
            advance_paid REAL DEFAULT 0.0,
            pending_payment REAL DEFAULT 0.0,
            status TEXT DEFAULT 'Inquiry',
            remarks TEXT,
            country TEXT DEFAULT 'Local',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Run safe migration checks for existing setups
    try:
        cursor.execute("ALTER TABLE inquiries ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE inquiries ADD COLUMN country TEXT DEFAULT 'Local'")
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    conn.close()

init_db()

class InquiryBase(BaseModel):
    couple_name: str
    wedding_date: Optional[str] = None
    hotel: Optional[str] = None
    service_type: Optional[str] = "Full wedding planning"      
    wedding_type: Optional[str] = "One day"                
    guest_count: Optional[int] = None
    contact_no: Optional[str] = None
    bridesmaid_option: Optional[str] = "-" 
    agreed_price: Optional[float] = 0.0
    advance_paid: Optional[float] = 0.0
    status: Optional[str] = "Inquiry"                      
    remarks: Optional[str] = None
    country: Optional[str] = "Local"

class InquiryResponse(InquiryBase):
    id: int
    pending_payment: float

def row_to_dict(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.get("/api/inquiries", response_model=List[InquiryResponse])
def get_inquiries(tab: str = "all"):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = row_to_dict
    cursor = conn.cursor()
    if tab == "completed":
        cursor.execute("SELECT * FROM inquiries WHERE status = 'Completed' ORDER BY updated_at ASC")
    else:
        cursor.execute("SELECT * FROM inquiries ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return rows

@app.post("/api/inquiries", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(inquiry: InquiryBase):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    agreed = inquiry.agreed_price if inquiry.agreed_price is not None else 0.0
    advance = inquiry.advance_paid if inquiry.advance_paid is not None else 0.0
    pending = agreed - advance
    
    cursor.execute("""
        INSERT INTO inquiries (
            couple_name, wedding_date, hotel, service_type, wedding_type, 
            guest_count, contact_no, bridesmaid_option, agreed_price, 
            advance_paid, pending_payment, status, remarks, country, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        inquiry.couple_name, inquiry.wedding_date, inquiry.hotel, inquiry.service_type,
        inquiry.wedding_type, inquiry.guest_count, inquiry.contact_no, inquiry.bridesmaid_option,
        agreed, advance, pending, inquiry.status, inquiry.remarks, inquiry.country
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {**inquiry.model_dump(), "id": new_id, "pending_payment": pending}

@app.put("/api/inquiries/{inquiry_id}", response_model=InquiryResponse)
def update_inquiry(inquiry_id: int, inquiry: InquiryBase):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    agreed = inquiry.agreed_price if inquiry.agreed_price is not None else 0.0
    advance = inquiry.advance_paid if inquiry.advance_paid is not None else 0.0
    pending = agreed - advance
    
    cursor.execute("""
        UPDATE inquiries SET 
            couple_name=?, wedding_date=?, hotel=?, service_type=?, wedding_type=?, 
            guest_count=?, contact_no=?, bridesmaid_option=?, agreed_price=?, 
            advance_paid=?, pending_payment=?, status=?, remarks=?, country=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
    """, (
        inquiry.couple_name, inquiry.wedding_date, inquiry.hotel, inquiry.service_type,
        inquiry.wedding_type, inquiry.guest_count, inquiry.contact_no, inquiry.bridesmaid_option,
        agreed, advance, pending, inquiry.status, inquiry.remarks, inquiry.country, inquiry_id
    ))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Wedding file record not found")
    conn.commit()
    conn.close()
    return {**inquiry.model_dump(), "id": inquiry_id, "pending_payment": pending}

@app.delete("/api/inquiries/{inquiry_id}")
def delete_inquiry(inquiry_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inquiries WHERE id = ?", (inquiry_id,))
    rowcount = cursor.rowcount
    conn.commit()
    conn.close()
    if rowcount == 0:
        raise HTTPException(status_code=404, detail="Wedding record not found")
    return {"message": "Record successfully deleted", "id": inquiry_id}

# Add this line so Vercel can find your FastAPI app
app = FastAPI()

# ... your existing code ...

# If you are using 'app' as your variable name:
app = app