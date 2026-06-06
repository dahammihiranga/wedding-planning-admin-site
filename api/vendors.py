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


@app.get("/api/vendors")
def get_vendors():
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        result = client.execute("SELECT * FROM vendors ORDER BY id ASC")

        rows = [dict(zip(result.columns, row)) for row in result.rows]

        client.close()

        return rows

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.post("/api/vendors")
async def create_vendor(request: Request):
    data = await request.json()

    if not data.get("name"):
        return {"success": False, "error": "Vendor name is required"}

    vendor_package_price = float(data.get("vendor_package_price") or 0)


    commission_value = float(data.get("commission_value") or 0)
    commission_type = data.get("commission_type") or "percentage"

    if commission_type == "fixed":
        commission_amount = commission_value
    else:
        commission_amount = (vendor_package_price * commission_value) / 100

    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        client.execute(
            """
    INSERT INTO vendors (
        name,
        service,
        contact_number,
        location,
        remarks,
        customer_name,
        vendor_package_price,
        commission_type,
        commission_value,
        commission_amount
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
            [
                data.get("name"),
                data.get("service"),
                data.get("contact_number"),
                data.get("location"),
                data.get("remarks"),
                data.get("customer_name"),
                vendor_package_price,
                commission_type,
                commission_value,
                commission_amount,
            ],
        )

        client.close()

        return {"success": True}

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.put("/api/vendors")
async def update_vendor(request: Request):
    vendor_id = request.query_params.get("id")
    data = await request.json()

    if not vendor_id:
        return {"success": False, "error": "Vendor id is required"}

    client = create_client_sync(url=url, auth_token=auth_token)

    vendor_package_price = float(data.get("vendor_package_price") or 0)


    commission_value = float(data.get("commission_value") or 0)
    commission_type = data.get("commission_type") or "percentage"

    if commission_type == "fixed":
        commission_amount = commission_value
    else:
        commission_amount = (vendor_package_price * commission_value) / 100

    try:
        client.execute(
            """
    UPDATE vendors SET
        name = ?,
        service = ?,
        contact_number = ?,
        location = ?,
        remarks = ?,
        customer_name = ?,
        vendor_package_price = ?,
        commission_type = ?,
        commission_value = ?,
        commission_amount = ?
    WHERE id = ?
    """,
            [
                data.get("name"),
                data.get("service"),
                data.get("contact_number"),
                data.get("location"),
                data.get("remarks"),
                data.get("customer_name"),
                vendor_package_price,
                commission_type,
                commission_value,
                commission_amount,
                int(vendor_id),
            ],
        )

        client.close()

        return {"success": True}

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.delete("/api/vendors")
def delete_vendor(request: Request):
    vendor_id = request.query_params.get("id")

    if not vendor_id:
        return {"success": False, "error": "Vendor id is required"}

    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        client.execute(
            "DELETE FROM vendors WHERE id = ?",
            [int(vendor_id)],
        )

        client.close()

        return {"success": True}

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


handler = app
