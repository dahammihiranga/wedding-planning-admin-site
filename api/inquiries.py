import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from libsql_client import create_client_sync

app = FastAPI(title="Chathu Wedding Planners CRM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Turso connection
url = os.environ.get("TURSO_DATABASE_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")

print("DATABASE URL:", url)
print("TOKEN EXISTS:", bool(auth_token))

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

@app.get("/api/inquiries")
async def get_inquiries(tab: str = "all"):

    client = create_client_sync(
        url=url,
        auth_token=auth_token
    )

    try:

        if tab == "completed":
            result = client.execute(
                "SELECT * FROM inquiries WHERE status = 'Completed' ORDER BY id DESC"
            )
        else:
            result = client.execute(
                "SELECT * FROM inquiries ORDER BY id DESC"
            )

        columns = result.columns
        rows = [dict(zip(columns, row)) for row in result.rows]

        client.close()

        return rows

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

@app.post("/api/inquiries")
async def create_inquiry(data: dict):

    client = create_client_sync(
        url=url,
        auth_token=auth_token
    )

    try:

        agreed_price = float(data.get("agreed_price", 0))
        advance_paid = float(data.get("advance_paid", 0))
        pending_payment = agreed_price - advance_paid

        query = """
        INSERT INTO inquiries (
            couple_name,
            wedding_date,
            hotel,
            service_type,
            wedding_type,
            guest_count,
            contact_no,
            bridesmaid_option,
            agreed_price,
            advance_paid,
            pending_payment,
            status,
            remarks,
            country
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        client.execute(
            query,
            [
                data.get("couple_name"),
                data.get("wedding_date"),
                data.get("hotel"),
                data.get("service_type"),
                data.get("wedding_type"),
                int(data.get("guest_count", 0)),
                data.get("contact_no"),
                data.get("bridesmaid_option"),
                agreed_price,
                advance_paid,
                pending_payment,
                data.get("status"),
                data.get("remarks"),
                data.get("country"),
            ]
        )

        client.close()

        return {"success": True}

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.put("/api/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def update_inquiry(inquiry_id: int, inquiry: InquiryBase):
    client = create_client_sync(
        url=url,
        auth_token=auth_token
    )
    agreed = inquiry.agreed_price or 0.0
    advance = inquiry.advance_paid or 0.0
    pending = agreed - advance
    
    res = client.execute("""
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
    client = create_client_sync(
        url=url,
        auth_token=auth_token
    )
    res = client.execute("DELETE FROM inquiries WHERE id = ?", (inquiry_id,))
    if res.affected_rows == 0:
        raise HTTPException(status_code=404, detail="Wedding record not found")
    return {"message": "Record successfully deleted", "id": inquiry_id}

handler = app