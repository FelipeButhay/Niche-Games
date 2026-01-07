import flask as f
import src.tools.tools as tools
import flask_socketio as sio

blueprint = f.Blueprint("game", __name__)

@blueprint.route("/<string:game_id>-<string:room_id>")
@tools.verify_conn
def game(game_id, room_id):
    game_id, room_id = int(game_id), int(room_id)
    
    game_data = tools.get_game(game_id)
    return f.redirect("http://localhost:5173", code=302)
