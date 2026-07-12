import os
import json
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
    wedding_date_2: Optional[str] = None
    hotel_2: Optional[str] = None
    service_type_2: Optional[str] = None
    guest_count_2: Optional[int] = None
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

    client = create_client_sync(url=url, auth_token=auth_token)

    try:

        if tab == "completed":
            result = client.execute(
                "SELECT * FROM inquiries WHERE status = 'Completed' ORDER BY id ASC"
            )
        else:
            result = client.execute("SELECT * FROM inquiries ORDER BY id ASC")

        columns = result.columns
        rows = [dict(zip(columns, row)) for row in result.rows]

        client.close()

        return rows

    except Exception as e:

        return {"success": False, "error": str(e)}


@app.post("/api/inquiries")
async def create_inquiry(data: dict):
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        couple_name = (data.get("couple_name") or "").strip()

        if not couple_name:
            return {"success": False, "error": "Couple name is required"}

        service_discounts_raw = data.get("service_discounts") or "{}"

        try:
            service_prices = json.loads(data.get("service_prices") or "{}")
            service_discounts = json.loads(service_discounts_raw)
        except Exception:
            service_prices = {}
            service_discounts = {}

        service_discount_total = 0

        for service, discount in service_discounts.items():
            service_price = float(service_prices.get(service) or 0)
            discount_value = float(discount.get("value") or 0)
            discount_type_each = discount.get("type") or "percentage"

            if discount_type_each == "fixed":
                service_discount_total += discount_value
            else:
                service_discount_total += (service_price * discount_value) / 100

        package_price = float(data.get("package_price") or 0)
        discount_rate = float(data.get("discount_rate") or 0)
        discount_type = data.get("discount_type") or "percentage"
        transport_cost = float(data.get("transport_cost") or 0)

        if discount_type == "fixed":
            agreed_price = package_price - discount_rate
        else:
            agreed_price = package_price - ((package_price * discount_rate) / 100)

        agreed_price = max(agreed_price - service_discount_total, 0) + transport_cost

        advance_paid = float(data.get("advance_paid") or 0)
        paid_amount = float(data.get("paid_amount") or 0)

        if paid_amount < advance_paid:
            paid_amount = advance_paid

        pending_payment = agreed_price - paid_amount

        guest_count_raw = data.get("guest_count")
        guest_count = (
            int(guest_count_raw) if guest_count_raw not in [None, ""] else None
        )
        guest_count_2_raw = data.get("guest_count_2")
        guest_count_2 = (
            int(guest_count_2_raw) if guest_count_2_raw not in [None, ""] else None
        )

        is_two_day = data.get("wedding_type") == "Two days"

        query = """
        INSERT INTO inquiries (
            couple_name,
            wedding_date,
            hotel,
            service_type,
            wedding_type,
            guest_count,

            wedding_date_2,
            hotel_2,
            service_type_2,
            guest_count_2,

            contact_no,
            bridesmaid_option,
            package_price,
            discount_rate,
            agreed_price,
            advance_paid,
            pending_payment,
            status,
            remarks,
            country,
            advance_paid_date,
            paid_amount,
            paid_date,
            discount_type,
            transport_cost,
            service_prices,
            service_discounts
        )
        VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        """

        client.execute(
            query,
            [
                couple_name,
                data.get("wedding_date") or None,
                data.get("hotel") or None,
                data.get("service_type") or None,
                data.get("wedding_type") or "One day",
                guest_count,

                data.get("wedding_date_2") or None if is_two_day else None,
                data.get("hotel_2") or None if is_two_day else None,
                data.get("service_type_2") or None if is_two_day else None,
                guest_count_2 if is_two_day else None,

                data.get("contact_no") or None,
                data.get("bridesmaid_option") or "-",
                package_price,
                discount_rate,
                agreed_price,
                advance_paid,
                pending_payment,
                data.get("status") or "Inquiry",
                data.get("remarks") or None,
                data.get("country") or "Local",
                data.get("advance_paid_date") or None,
                paid_amount,
                data.get("paid_date") or None,
                data.get("discount_type") or "percentage",
                transport_cost,
                data.get("service_prices") or None,
                data.get("service_discounts") or None,
            ],
        )

        client.close()
        return {"success": True}

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.put("/api/inquiries")
async def update_inquiry(id: int, data: dict):
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        couple_name = (data.get("couple_name") or "").strip()

        if not couple_name:
            return {"success": False, "error": "Couple name is required"}

        service_discounts_raw = data.get("service_discounts") or "{}"

        try:
            service_prices = json.loads(data.get("service_prices") or "{}")
            service_discounts = json.loads(service_discounts_raw)
        except Exception:
            service_prices = {}
            service_discounts = {}

        service_discount_total = 0

        for service, discount in service_discounts.items():
            service_price = float(service_prices.get(service) or 0)
            discount_value = float(discount.get("value") or 0)
            discount_type_each = discount.get("type") or "percentage"

            if discount_type_each == "fixed":
                service_discount_total += discount_value
            else:
                service_discount_total += (service_price * discount_value) / 100

        package_price = float(data.get("package_price") or 0)
        discount_rate = float(data.get("discount_rate") or 0)
        discount_type = data.get("discount_type") or "percentage"
        transport_cost = float(data.get("transport_cost") or 0)

        if discount_type == "fixed":
            agreed_price = package_price - discount_rate
        else:
            agreed_price = package_price - ((package_price * discount_rate) / 100)

        agreed_price = max(agreed_price - service_discount_total, 0) + transport_cost

        advance_paid = float(data.get("advance_paid") or 0)
        paid_amount = float(data.get("paid_amount") or 0)

        if paid_amount < advance_paid:
            paid_amount = advance_paid

        pending_payment = agreed_price - paid_amount

        guest_count_raw = data.get("guest_count")
        guest_count = (
            int(guest_count_raw) if guest_count_raw not in [None, ""] else None
        )
        guest_count_2_raw = data.get("guest_count_2")
        guest_count_2 = (
            int(guest_count_2_raw)
            if guest_count_2_raw not in [None, ""]
            else None
        )

        is_two_day = data.get("wedding_type") == "Two days"

        second_wedding_date = (
            data.get("wedding_date_2") or None
            if is_two_day
            else None
        )

        second_hotel = (
            data.get("hotel_2") or None
            if is_two_day
            else None
        )

        second_service_type = (
            data.get("service_type_2") or None
            if is_two_day
            else None
        )

        second_guest_count = guest_count_2 if is_two_day else None

        client.execute(
            """
            UPDATE inquiries SET 
                couple_name=?,
                wedding_date=?,
                hotel=?,
                service_type=?,
                wedding_type=?,
                guest_count=?,

                wedding_date_2=?,
                hotel_2=?,
                service_type_2=?,
                guest_count_2=?,

                contact_no=?,
                bridesmaid_option=?,
                package_price=?,
                discount_rate=?,
                discount_type=?,
                transport_cost=?,
                service_prices=?,
                service_discounts=?,
                agreed_price=?,
                advance_paid=?,
                advance_paid_date=?,
                paid_amount=?,
                paid_date=?,
                pending_payment=?,
                status=?,
                remarks=?,
                country=?
            WHERE id=?
            """,
            [
                couple_name,
                data.get("wedding_date") or None,
                data.get("hotel") or None,
                data.get("service_type") or None,
                data.get("wedding_type") or "One day",
                guest_count,

                second_wedding_date,
                second_hotel,
                second_service_type,
                second_guest_count,

                data.get("contact_no") or None,
                data.get("bridesmaid_option") or "-",
                package_price,
                discount_rate,
                data.get("discount_type") or "percentage",
                transport_cost,
                data.get("service_prices") or None,
                data.get("service_discounts") or None,
                agreed_price,
                advance_paid,
                data.get("advance_paid_date") or None,
                paid_amount,
                data.get("paid_date") or None,
                pending_payment,
                data.get("status") or "Inquiry",
                data.get("remarks") or None,
                data.get("country") or "Local",
                id,
            ],
        )

        client.close()
        return {"success": True, "id": id, "pending_payment": pending_payment}

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.delete("/api/inquiries")
async def delete_inquiry(id: int):

    client = create_client_sync(url=url, auth_token=auth_token)

    try:

        client.execute("DELETE FROM inquiries WHERE id = ?", [id])

        client.close()

        return {"success": True, "id": id}

    except Exception as e:

        client.close()

        return {"success": False, "error": str(e)}


handler = app
