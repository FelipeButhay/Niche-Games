import flask as f
import src.tools.tools as tools
import flask_socketio as sio
from markupsafe import escape

blueprint = f.Blueprint("room", __name__)

@blueprint.route("/<string:game_id>-<string:room_id>")
@tools.verify_conn
def room(game_id, room_id):
    game_id, room_id = int(game_id), int(room_id)

    game = tools.get_game(game_id)
    room = tools.get_room(room_id)
    
    users = []
    for uid in room["users"]:
        users.append({
            "user_id": uid,
            "username": tools.get_user_data(uid)["username"]
        })
    
    return f.render_template("games/room.html.j2", room_id=room_id, g=game, users=users)

    
@blueprint.route("/join/<string:room_id>")
@tools.verify_conn
def room_join(room_id):
    return f.render_template("games/join_room.html.j2", room_id=int(room_id))


@blueprint.route("/leave/<room_id>")
@tools.verify_conn
def room_leave(room_id):
    pass


@blueprint.route("/get-glsl")
def room_get_glsl():
    with open("assets/shaders/room_shader.frag", "r", encoding="utf-8") as glsl:
        return f.Response(status=200, response=glsl.read())