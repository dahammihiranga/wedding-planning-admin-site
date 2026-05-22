import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from libsql_client import Client, ResultSet # Added for Turso

app = FastAPI(title="Chathu Wedding Planners CRM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Cloud Client
# These environment variables must be set in Vercel Settings
url = os.environ.get("TURSO_DATABASE_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")
client = Client(url=url, auth_token=auth_token)

# Note: Turso handles table creation via the Dashboard SQL console
# or a migration script. We no longer need init_db() local function.

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

@app.get("/api/inquiries", response_model=List[InquiryResponse])
async def get_inquiries(tab: str = "all"):
    if tab == "completed":
        result = await client.execute("SELECT * FROM inquiries WHERE status = 'Completed' ORDER BY updated_at ASC")
    else:
        result = await client.execute("SELECT * FROM inquiries ORDER BY id ASC")
    
    # Convert rows to a list of dictionaries
    return [row._asdict() for row in result.rows]

@app.post("/api/inquiries", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_inquiry(inquiry: InquiryBase):
    agreed = inquiry.agreed_price or 0.0
    advance = inquiry.advance_paid or 0.0
    pending = agreed - advance
    
    await client.execute("""
        INSERT INTO inquiries (
            couple_name, wedding_date, hotel, service_type, wedding_type, 
            guest_count, contact_no, bridesmaid_option, agreed_price, 
            advance_paid, pending_payment, status, remarks, country
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inquiry.couple_name, inquiry.wedding_date, inquiry.hotel, inquiry.service_type,
        inquiry.wedding_type, inquiry.guest_count, inquiry.contact_no, inquiry.bridesmaid_option,
        agreed, advance, pending, inquiry.status, inquiry.remarks, inquiry.country
    ))
    
    # Get the last inserted ID
    res = await client.execute("SELECT last_insert_rowid() as id")
    new_id = res.rows[0]["id"]
    
    return {**inquiry.model_dump(), "id": new_id, "pending_payment": pending}

@app.put("/api/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def update_inquiry(inquiry_id: int, inquiry: InquiryBase):
    agreed = inquiry.agreed_price or 0.0
    advance = inquiry.advance_paid or 0.0
    pending = agreed - advance
    
    res = await client.execute("""
        UPDATE inquiries SET 
            couple_name=?, wedding_date=?, hotel=?, service_type=?, wedding_type=?, 
            guest_count=?, contact_no=?, bridesmaid_option=?, agreed_price=?, 
            advance_paid=?, pending_payment=?, status=?, remarks=?, country=?
        WHERE id=?
    """, (
        inquiry.couple_name, inquiry.wedding_date, inquiry.hotel, inquiry.service_type,
        inquiry.wedding_type, inquiry.guest_count, inquiry.contact_no, inquiry.bridesmaid_option,
        agreed, advance, pending, inquiry.status, inquiry.remarks, inquiry.country, inquiry_id
    ))
    
    if res.affected_rows == 0:
        raise HTTPException(status_code=404, detail="Wedding file record not found")
        
    return {**inquiry.model_dump(), "id": inquiry_id, "pending_payment": pending}

@app.delete("/api/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: int):
    res = await client.execute("DELETE FROM inquiries WHERE id = ?", (inquiry_id,))
    if res.affected_rows == 0:
        raise HTTPException(status_code=404, detail="Wedding record not found")
    return {"message": "Record successfully deleted", "id": inquiry_id}