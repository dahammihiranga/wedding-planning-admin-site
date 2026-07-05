import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from libsql_client import create_client_sync

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url = os.environ.get("TURSO_DATABASE_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")


@app.get("/api/vendor-commissions")
def get_vendor_commissions():
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        result = client.execute("SELECT * FROM vendor_commissions ORDER BY id DESC")
        rows = [dict(zip(result.columns, row)) for row in result.rows]
        client.close()
        return rows

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.post("/api/vendor-commissions")
async def create_vendor_commission(request: Request):
    data = await request.json()

    if not data.get("vendor_name"):
        return {"success": False, "error": "Vendor name is required"}

    vendor_package_price = float(data.get("vendor_package_price") or 0)
    commission_value = float(data.get("commission_value") or 0)
    commission_type = data.get("commission_type") or "percentage"

    commission_amount = (
        commission_value
        if commission_type == "fixed"
        else (vendor_package_price * commission_value) / 100
    )

    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        client.execute(
            """
            INSERT INTO vendor_commissions (
                vendor_id,
                vendor_name,
                customer_name,
                service,
                vendor_package_price,
                commission_type,
                commission_value,
                commission_amount,
                remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                data.get("vendor_id"),
                data.get("vendor_name"),
                data.get("customer_name"),
                data.get("service"),
                vendor_package_price,
                commission_type,
                commission_value,
                commission_amount,
                data.get("remarks"),
            ],
        )

        client.close()
        return {"success": True}

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


handler = app