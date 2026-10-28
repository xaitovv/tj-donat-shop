import os, json
from dotenv import load_dotenv
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))
MINIAPP_URL = os.getenv("MINIAPP_URL", "")
ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")
PORT = int(os.getenv("PORT", "8080"))
CARD = os.getenv("CARD_NUMBER", "")
HOLDER = os.getenv("CARD_HOLDER", "")
SUPPORT = os.getenv("SUPPORT_USERNAME", "")
REF_PERCENT = 2  # referal bonus, %
CATALOG = json.load(open(os.path.join(os.path.dirname(__file__), "catalog.json"), encoding="utf-8"))
def find_item(game_id, item_id):
    for g in CATALOG["games"]:
        if g["id"] == game_id:
            for items in g["tabs"].values():
                for i in items:
                    if i["id"] == item_id:
                        return g, i
    return None, None
