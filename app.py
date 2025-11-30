import flask as f
import flask_socketio as sio
import os

app = f.Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

import redis 
r = redis.Redis(host='localhost', port=6379, db=0) 
socket_io = sio.SocketIO(app, async_mode='threading')

app.redis = r

from src.routes import home, auth
app.register_blueprint(auth.blueprint, url_prefix="/auth")
app.register_blueprint(home.blueprint, url_prefix="/home")

from src.connections import online
online.OnlineStatusNamespace(socket_io, r, "/online-status")

@app.route("/", methods=["GET", "POST"])
def main():
    if "user_id" not in f.session:
        return f.redirect("/auth/signin")
    else:
        return f.redirect("/home/news")

DEBUG = os.getenv("DEBUG")
if __name__ == "__main__":
    socket_io.run(app, debug=DEBUG)