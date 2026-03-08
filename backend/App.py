import os
import math
import asyncio
import httpx
from flask import Flask, redirect, request, jsonify, session, g, url_for
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from Auth import auth0

load_dotenv()

# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.getenv('AUTH0_SECRET', 'dev-secret-placeholder')

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.config.update(
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
)

# ── Supabase ───────────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Google Places ──────────────────────────────────────────────────────────────
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby"
GOOGLE_PLACES_KEY = os.getenv("GOOGLE_PLACES_KEY")

# ── Known chains ───────────────────────────────────────────────────────────────
KNOWN_CHAINS = {
    "no frills", "walmart", "costco", "metro", "food basics", "loblaws", "farah foods"
}

def is_known_chain(name: str) -> bool:
    name_lower = name.lower().strip()
    return any(chain in name_lower for chain in KNOWN_CHAINS)

# ── In-memory cache ────────────────────────────────────────────────────────────
_stores_cache = {}

def _cache_key(lat, lng, radius):
    return (round(lat, 3), round(lng, 3), radius)

# ── Auth0 helper: build store_options from current request ────────────────────
def get_store_options():
    return {"request": request, "session": session}


# ── Root redirect ──────────────────────────────────────────────────────────────
@app.route('/')
async def index():
    return redirect("http://localhost:5173")


# ── Auth0: Login ───────────────────────────────────────────────────────────────
@app.route('/login')
async def login():
    store_options = get_store_options()
    try:
        authorization_url = await auth0.start_interactive_login({}, store_options)
        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"error": f"Login error: {str(e)}"}), 500


# ── Auth0: Callback ────────────────────────────────────────────────────────────
@app.route('/callback')
async def callback():
    store_options = get_store_options()
    try:
        await auth0.complete_interactive_login(str(request.url), store_options)
        return redirect("http://localhost:5173/?auth=success")
    except Exception as e:
        return redirect(f"http://localhost:5173/?auth=error&msg={str(e)}")


# ── Auth0: Logout ──────────────────────────────────────────────────────────────
@app.route('/logout')
async def logout():
    store_options = get_store_options()
    try:
        logout_url = await auth0.logout(store_options)
        return redirect(logout_url)
    except Exception as e:
        session.clear()
        return redirect("http://localhost:5173")


# ── Auth0: Current user ────────────────────────────────────────────────────────
@app.route('/api/me')
async def api_me():
    store_options = get_store_options()
    try:
        user = await auth0.get_user(store_options)
        if not user:
            return jsonify({"user": None}), 401
        return jsonify({
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "picture": user.get("picture"),
                "sub": user.get("sub"),
                "nickname": user.get("nickname"),
            }
        })
    except Exception:
        return jsonify({"user": None}), 401


# ── Grocery stores ─────────────────────────────────────────────────────────────
@app.route("/api/grocery-stores")
async def get_grocery_stores():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius = request.args.get("radius", default=2000, type=int)

    if lat is None or lng is None:
        return jsonify({"error": "lat and lng are required"}), 400

    key = _cache_key(lat, lng, radius)
    if key in _stores_cache:
        cached = _stores_cache[key]
        return jsonify({"stores": cached, "count": len(cached), "cached": True})

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.formattedAddress,places.types,places.businessStatus",
    }

    bodies = [
        {
            "includedTypes": ["supermarket"],
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {"center": {"latitude": lat, "longitude": lng}, "radius": float(radius)}
            },
        },
        {
            "includedTypes": ["grocery_store"],
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {"center": {"latitude": lat, "longitude": lng}, "radius": float(radius)}
            },
        },
    ]

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            responses = await asyncio.gather(*[
                client.post(GOOGLE_PLACES_URL, json=body, headers=headers)
                for body in bodies
            ])
        except Exception as e:
            return jsonify({"error": f"Google Places error: {str(e)}"}), 502

    seen_ids = set()
    all_places = []
    for resp in responses:
        for place in resp.json().get("places", []):
            pid = place.get("id")
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                all_places.append(place)

    candidates = []
    for place in all_places:
        if place.get("businessStatus") == "CLOSED_PERMANENTLY":
            continue
        name = place.get("displayName", {}).get("text", "")
        if not name or not is_known_chain(name):
            continue
        loc = place.get("location", {})
        elat = loc.get("latitude")
        elng = loc.get("longitude")
        if not elat or not elng:
            continue
        candidates.append((place, name, elat, elng))

    stores = []
    for (place, name, elat, elng) in candidates:
        dlat = math.radians(elat - lat)
        dlng_r = math.radians(elng - lng)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat))
            * math.cos(math.radians(elat))
            * math.sin(dlng_r / 2) ** 2
        )
        dist_m = int(6371000 * 2 * math.asin(math.sqrt(a)))
        types = place.get("types", [])
        shop_type = "supermarket" if "supermarket" in types else "grocery"
        stores.append({
            "id": place.get("id"),
            "name": name,
            "lat": elat,
            "lng": elng,
            "address": place.get("formattedAddress"),
            "distance_m": dist_m,
            "shop_type": shop_type,
        })

    stores.sort(key=lambda x: x["distance_m"])
    _stores_cache[key] = stores
    return jsonify({"stores": stores, "count": len(stores), "cached": False})


# ── Reverse geocode ────────────────────────────────────────────────────────────
@app.route("/api/reverse-geocode")
async def reverse_geocode():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    if lat is None or lng is None:
        return jsonify({"address": "Unknown location"}), 400

    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}"
    headers = {"User-Agent": "CartlyApp/1.0"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return jsonify({"address": data.get("display_name", f"{lat:.4f}, {lng:.4f}")})
        except Exception:
            return jsonify({"address": f"{lat:.4f}, {lng:.4f}"})


# ── User preferences ───────────────────────────────────────────────────────────
@app.route("/api/user/preferences", methods=["GET"])
async def load_preferences():
    user_id = request.args.get("user_id", "guest")
    try:
        result = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        if result.data:
            return jsonify(result.data[0])
    except Exception as e:
        print(f"Supabase load error: {e}")
    return jsonify({
        "user_id": user_id,
        "selected_stores": [],
        "radius_meters": 2000,
        "location_lat": None,
        "location_lng": None,
        "location_address": None,
    })


@app.route("/api/user/preferences", methods=["POST"])
async def save_preferences():
    body = request.get_json()
    if not body:
        return jsonify({"error": "No body provided"}), 400

    user_id = body.get("user_id", "guest")
    data = {
        "user_id": user_id,
        "selected_stores": body.get("selected_stores", []),
        "radius_meters": body.get("radius_meters", 2000),
        "location_lat": body.get("location_lat"),
        "location_lng": body.get("location_lng"),
        "location_address": body.get("location_address"),
    }

    try:
        result = supabase.table("user_preferences").upsert(data, on_conflict="user_id").execute()
        return jsonify({"ok": True, "data": result.data})
    except Exception as e:
        print(f"Supabase save error: {e}")
        return jsonify({"ok": False, "error": str(e)}), 500

# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)