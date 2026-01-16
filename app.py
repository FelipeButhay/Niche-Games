import flask as f
import flask_socketio as sio
import os
import json
import src.tools.tools as tools

# ROOM ID IS STRING ONLY IN URLS AND THE REDIS IDENTIFIER
# GAME ID IS STRING ONLY IN URLS

app = f.Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

import redis 
r = redis.Redis(host='localhost', port=6379, db=0) 
socket_io = sio.SocketIO(
    app, 
    async_mode='threading',
    cors_allowed_origins="*",
    ping_interval=60,
    ping_timeout=180,
)

app.redis = r

from src.routes import home, auth, room, game
app.register_blueprint(auth.blueprint, url_prefix="/auth")
app.register_blueprint(home.blueprint, url_prefix="/home")
app.register_blueprint(room.blueprint, url_prefix="/room")
app.register_blueprint(game.blueprint, url_prefix="/game")

from src.connections import online_status, room_config
online_status   .OnlineStatusNamespace  (socket_io)
room_config     .RoomConfigNamespace    (socket_io)

# import city shii conns
from src.connections.game_conn.city_shii_conn import CityShiiNamespace
CityShiiNamespace(socket_io)

from src.tools import jinja_filters as j2filt
j2filt.register_filters(app)

@app.route("/", methods=["GET", "POST"])
def main():
    if "user_id" not in f.session:
        return f.redirect("/auth/signin")
    else:
        return f.redirect(f.session.get("last_url", "/home/news"))
 
DEBUG = bool(os.getenv("DEBUG"))

if __name__ == "__main__":
    # clears evety room
    for k in r.scan_iter("room:*"):
        r.delete(k)
    
    socket_io.run(app, host="0.0.0.0", port=5000, debug=DEBUG, use_reloader=False)