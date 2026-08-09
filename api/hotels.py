import os
from fastapi import FastAPI
from libsql_client import create_client_sync

app = FastAPI()

url = os.environ.get("TURSO_DATABASE_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")


@app.get("/api/hotels")
async def get_hotels():
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        result = client.execute(
            """
            SELECT id, name
            FROM hotels
            ORDER BY name COLLATE NOCASE ASC
            """
        )

        columns = result.columns
        rows = [dict(zip(columns, row)) for row in result.rows]

        client.close()
        return rows

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


@app.post("/api/hotels")
async def save_hotel(data: dict):
    client = create_client_sync(url=url, auth_token=auth_token)

    try:
        hotel_name = (data.get("name") or "").strip()

        if not hotel_name:
            client.close()
            return {"success": True}

        # Prevent duplicates case-insensitively
        existing = client.execute(
            """
            SELECT id
            FROM hotels
            WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
            LIMIT 1
            """,
            [hotel_name],
        )

        if len(existing.rows) == 0:
            client.execute(
                "INSERT INTO hotels (name) VALUES (?)",
                [hotel_name],
            )

        client.close()

        return {
            "success": True,
            "name": hotel_name,
        }

    except Exception as e:
        client.close()
        return {"success": False, "error": str(e)}


handler = app