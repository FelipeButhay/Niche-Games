import flask as f
import src.routes.home.sql_friends as sql
import src.tools.tools as tools
import functools
import json

blueprint = f.Blueprint("home", __name__)

def verify_conn(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in f.session:
            f.session["last_url"] = f.request.url
            return f.redirect("/auth/signin")
        return func(*args, **kwargs)
    
    return wrapper


@blueprint.route("/news")
@verify_conn
def home():
    news = []
    with open("logs/news.json", "r", encoding="utf-8") as news_json:
        news = json.load(news_json)
    
    return f.render_template("home/news.html.j2", news_json = news)


@blueprint.route("/games")
@verify_conn
def home_games():
    game_info_list = []
    with open("logs/games.json", "r", encoding="utf-8") as games_json:
        game_info_list = json.load(games_json)
    
    return f.render_template("home/games.html.j2", games=game_info_list)


@blueprint.route("/friends")
@verify_conn
def home_friends():
    user_id = f.session.get("user_id")
    
    friend_list = sql.get_friends(user_id)
    request_list = sql.get_requests(user_id)
    
    print(request_list)
    
    for i in friend_list:
        i["id"] = int(i["id"])

    id_list = [li["id"] for li in friend_list]
    status = []
    
    if len(id_list) != 0:
        status = f.current_app.redis.smismember("connected_users", id_list)    
        
    for i, s in zip(friend_list, status):
        i.update({"status": "Online" if s else "Offline"})

    return f.render_template("home/friends.html.j2", requests=request_list, friends=friend_list)


@blueprint.route("/friends/send-request")
def home_friends_send_request():
    receiver_un =     f.request.args.get("username")
    receiver_id = int(f.request.args.get("user-id"))
    
    sender_id = f.session.get("user_id")
    
    exit_code, receiver_id = sql.user_exists(receiver_un, receiver_id)
    str_response = ""
    
    if exit_code == sql.friendsExitCodes.SUCCESS:
        exit_code = sql.send_request(sender_id, receiver_id)
    
    match exit_code:
        case sql.friendsExitCodes.SUCCESS:
            str_response = "Request sent successfully."
        case sql.friendsExitCodes.UNKNOWN:
            str_response = "An unkown error has occured."
        case sql.friendsExitCodes.INEXISTENT_USER:
            str_response = "This user doesn't exists."
        case sql.friendsExitCodes.EMPTY_DATA:
            str_response = "Empty request."
        case sql.friendsExitCodes.EXISTENT_REQUEST:
            str_response = "You have already sent or received this request."
        case sql.friendsExitCodes.SAME_IDS:
            str_response = "You sent a friendship request to yourself."
        
    return f.jsonify({"message": str_response})

@blueprint.route("/friends/reject-request")
def home_friends_reject_request():
    request_sender = f.request.args.get("sender")
    request_receiver = f.session["user_id"]
    
    sql.reject_request(request_sender, request_receiver)
    
    return f.Response(status=204)
    
@blueprint.route("/friends/accept-request")
def home_friends_accept_request():
    request_sender = f.request.args.get("sender")
    request_receiver = f.session["user_id"]
    
    sql.accept_request(request_sender, request_receiver)
    
    return f.Response(status=204)
    
@blueprint.route("/my-account")
def home_account():
    user_id = f.session.get("user_id")
    return f.render_template("home/my_account.html.j2", user = tools.getUserData(user_id))

@blueprint.route("/get-glsl")
def get_glsl():
    with open("assets/shaders/home_shader.frag", "r", encoding="utf-8") as glsl:
        return f.Response(status=200, response=glsl.read())