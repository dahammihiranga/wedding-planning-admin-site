import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from libsql_client import create_client_sync
from pydantic import BaseModel


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


# ============================================================
# DEFAULT MASTER CHECKLIST
# ============================================================
# Add/remove/reorder default checklist items here in future.
#
# IMPORTANT:
# Changes here apply when a wedding's checklist is created
# for the first time. Existing wedding checklists are not
# overwritten.
# ============================================================

DEFAULT_WEDDING_CHECKLIST = [
    "Registrar",
    "Hotel - Coordinator",
    "Photography",
    "Cinematography",
    "Salon - Bride",
    "Salon - Groom",
    "Jewellery",
    "Decorations",
    "Band - Music",
    "If it's a Poruwa function - Ashtaka",
    "If it's a Church function - Church",
    "Cake structure",
    "Wedding cake/Brownie or Plant",
    "Wedding Car",
    "Special Items: Dancing, singing, etc.",
    "Wedding dress - Bride side",
    "Wedding dress - Groom side",
    "Wedding Shoes - Bride side",
    "Wedding Shoes - Groom side",
    "Going away dress - Bride",
    "Going away dress - Groom",
    "Bites - Dried",
    "Liquor",
    "Groom/Bridesmaid details",
]


ALLOWED_STATUSES = [
    "Confirmed",
    "In Progress",
    "Action Required",
    "Not Started",
]


class ChecklistCreate(BaseModel):
    inquiry_id: int
    item_name: str
    status: str = "Not Started"
    responsible: str = ""
    deadline: str = ""


class ChecklistUpdate(BaseModel):
    item_name: str
    status: str
    responsible: str = ""
    deadline: str = ""


def get_client():
    return create_client_sync(
        url=url,
        auth_token=auth_token,
    )


def initialize_checklist(client, inquiry_id: int):
    """
    Creates the default checklist only when this wedding
    has no checklist items yet.
    """

    existing = client.execute(
        """
        SELECT COUNT(*)
        FROM wedding_checklist_items
        WHERE inquiry_id = ?
        """,
        [inquiry_id],
    )

    existing_count = int(existing.rows[0][0]) if existing.rows else 0

    if existing_count > 0:
        return

    for index, item_name in enumerate(
        DEFAULT_WEDDING_CHECKLIST,
        start=1,
    ):
        client.execute(
            """
            INSERT INTO wedding_checklist_items (
                inquiry_id,
                item_name,
                status,
                responsible,
                deadline,
                sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                inquiry_id,
                item_name,
                "Not Started",
                None,
                None,
                index,
            ],
        )


@app.get("/api/wedding-checklist")
async def get_checklist(
    inquiry_id: int = Query(...),
):
    client = get_client()

    try:
        initialize_checklist(client, inquiry_id)

        result = client.execute(
            """
            SELECT
                id,
                inquiry_id,
                item_name,
                status,
                responsible,
                deadline,
                sort_order,
                created_at
            FROM wedding_checklist_items
            WHERE inquiry_id = ?
            ORDER BY sort_order ASC, id ASC
            """,
            [inquiry_id],
        )

        columns = result.columns

        return [
            dict(zip(columns, row))
            for row in result.rows
        ]

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }

    finally:
        client.close()


@app.post("/api/wedding-checklist")
async def add_checklist_item(data: ChecklistCreate):
    client = get_client()

    try:
        item_name = data.item_name.strip()

        if not item_name:
            return {
                "success": False,
                "error": "Item name is required",
            }

        status = (
            data.status
            if data.status in ALLOWED_STATUSES
            else "Not Started"
        )

        result = client.execute(
            """
            SELECT COALESCE(MAX(sort_order), 0)
            FROM wedding_checklist_items
            WHERE inquiry_id = ?
            """,
            [data.inquiry_id],
        )

        current_max = (
            int(result.rows[0][0])
            if result.rows
            else 0
        )

        insert_result = client.execute(
            """
            INSERT INTO wedding_checklist_items (
                inquiry_id,
                item_name,
                status,
                responsible,
                deadline,
                sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                data.inquiry_id,
                item_name,
                status,
                data.responsible.strip() or None,
                data.deadline or None,
                current_max + 1,
            ],
        )

        return {
            "success": True,
            "id": insert_result.last_insert_rowid,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }

    finally:
        client.close()


@app.put("/api/wedding-checklist")
async def update_checklist_item(
    id: int = Query(...),
    data: ChecklistUpdate = None,
):
    client = get_client()

    try:
        item_name = data.item_name.strip()

        if not item_name:
            return {
                "success": False,
                "error": "Item name is required",
            }

        if data.status not in ALLOWED_STATUSES:
            return {
                "success": False,
                "error": "Invalid checklist status",
            }

        client.execute(
            """
            UPDATE wedding_checklist_items
            SET
                item_name = ?,
                status = ?,
                responsible = ?,
                deadline = ?
            WHERE id = ?
            """,
            [
                item_name,
                data.status,
                data.responsible.strip() or None,
                data.deadline or None,
                id,
            ],
        )

        return {
            "success": True,
            "id": id,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }

    finally:
        client.close()


@app.delete("/api/wedding-checklist")
async def delete_checklist_item(
    id: int = Query(...),
):
    client = get_client()

    try:
        client.execute(
            """
            DELETE FROM wedding_checklist_items
            WHERE id = ?
            """,
            [id],
        )

        return {
            "success": True,
            "id": id,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }

    finally:
        client.close()


handler = app