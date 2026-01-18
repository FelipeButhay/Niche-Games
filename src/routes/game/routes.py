import flask as f
import src.tools.tools as tools
import flask_socketio as sio

blueprint = f.Blueprint("game", __name__)

@blueprint.route("/<string:room_id>")
@tools.verify_conn
def game(room_id):
    print("REDIRECT TO REACT")
    room_id = int(room_id)
    game_id = int(tools.get_room(room_id)["game_id"])
    user_id = f.session["user_id"]
    
    return f.redirect(f"http://localhost:5173/?room_id={room_id}&game_id={game_id}&user_id={user_id}", code=302)
 