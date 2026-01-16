import flask as f
import src.tools.tools as tools
import flask_socketio as sio
from markupsafe import escape
from src.routes.room.config_comps.config_slider import SLIDER

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
        
    user_id = f.session["user_id"]
    is_admin = (user_id == room["admin"])
    
    return f.render_template("games/room.html.j2", room_id=room_id, g=game, users=users, admin=is_admin)

@blueprint.route("/join/<string:room_id>")
@tools.verify_conn
def room_join(room_id):
    return f.render_template("games/join_room.html.j2", room_id=int(room_id))

@blueprint.route("/get-config/<string:room_id>")
@tools.verify_conn
def get_config(room_id):
    room_id = int(room_id)
    
    room = tools.get_room(room_id)
    game_id = room["game_id"]
    config_data = room["config_data"]
    
    config_comps = tools.get_game(game_id)["config"]
    
    html_comps = ["<!-- Imported components -->"]
    
    for c in config_comps:
        match c["type"]:
            case "slider":
                default = None
                
                try:
                    default = config_data[c["title_"]]
                except:
                    pass
                
                html_comps.append(SLIDER.format(
                    min     = c["specs"][0],
                    max     = c["specs"][1],
                    intv    = c["specs"][2],
                    title   = c["title"],
                    title_  = c["title_"],
                    desc    = c["desc"],
                    default = c["default"] if default == None else default
                ))
            
            case _:
                html_comps.append("<!-- Component failed to load -->")
                continue
    
    return f.jsonify({"html": "\n\n".join(html_comps)})


@blueprint.route("/save-config/<string:room_id>", methods=['POST'])
@tools.verify_conn
def save_config(room_id):
    room_id = int(room_id)
    
    room = tools.get_room(room_id)
    new_config_data = f.request.get_json()
    
    room["config_data"] = new_config_data
    
    tools.set_room(room_id, room)
    
    return f.Response(status=200)

    
@blueprint.route("/get-glsl")
def room_get_glsl():
    with open("assets/shaders/room_shader.frag", "r", encoding="utf-8") as glsl:
        return f.Response(status=200, response=glsl.read())