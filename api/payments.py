import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from libsql_client import create_client_sync

app = FastAPI(title="Chathu Wedding Planners Payments API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url = os.environ.get("TURSO_DATABASE_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")


@app.get("/api/payments")
async def get_payments(inquiry_id: int = None):
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        if inquiry_id:
            result = client.execute(
                """
                SELECT * FROM payment_transactions
                WHERE inquiry_id = ?
                ORDER BY payment_date ASC, id ASC
                """,
                [inquiry_id],
            )
        else:
            result = client.execute(
                """
                SELECT * FROM payment_transactions
                ORDER BY payment_date ASC, id ASC
                """
            )

        rows = [dict(zip(result.columns, row)) for row in result.rows]
        client.close()
        return rows

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.post("/api/payments")
async def add_payment(data: dict):
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        inquiry_id = int(data.get("inquiry_id"))
        amount = float(data.get("amount") or 0)
        payment_date = data.get("payment_date") or None
        payment_type = data.get("payment_type") or "Partial"

        if amount <= 0:
            return {
                "success": False,
                "error": "Payment amount must be greater than 0",
            }

        client.execute(
            """
            INSERT INTO payment_transactions (
                inquiry_id,
                amount,
                payment_date,
                payment_type
            )
            VALUES (?, ?, ?, ?)
            """,
            [inquiry_id, amount, payment_date, payment_type],
        )

        inquiry_result = client.execute(
            """
            SELECT agreed_price, paid_amount
            FROM inquiries
            WHERE id = ?
            """,
            [inquiry_id],
        )

        if not inquiry_result.rows:
            client.close()
            return {"success": False, "error": "Inquiry not found"}

        agreed_price = float(inquiry_result.rows[0][0] or 0)
        current_paid = float(inquiry_result.rows[0][1] or 0)

        total_paid = current_paid + amount
        pending_payment = max(agreed_price - total_paid, 0)

        client.execute(
            """
            UPDATE inquiries
            SET paid_amount = ?, pending_payment = ?, paid_date = ?
            WHERE id = ?
            """,
            [total_paid, pending_payment, payment_date, inquiry_id],
        )

        client.close()

        return {
            "success": True,
            "paid_amount": total_paid,
            "pending_payment": pending_payment,
        }

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


handler = app