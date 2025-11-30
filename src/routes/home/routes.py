import flask as f
import src.routes.home.sql_friends as sql
import functools
import json

blueprint = f.Blueprint("home", __name__)

def verify_conn(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in f.session:
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


@blueprint.route("/friends")
@verify_conn
def home_friends():
    user_id = f.session.get("user_id")
    
    friend_list = sql.get_friends(user_id)
    request_list = sql.get_requests(user_id)

    id_list = [li["id"] for li in friend_list]
    status = []
    
    if len(id_list) != 0:
        status = f.current_app.redis.smismember("connected_users", id_list)    
        
    for i, s in zip(friend_list, status):
        i.update({"status": "Online" if s else "Offline"})
    
    data_json = f.jsonify({
        "friends": friend_list,
        "requests": request_list,
    })
    
    return f.render_template("home/friends.html.j2", data=data_json)


@blueprint.route("/games")
@verify_conn
def home_games():
    return f.render_template("home/games.html")


@blueprint.route("/friends/send-request")
def home_friends_send_request():
    receiver_un = f.request.args.get("username")
    receiver_id = f.request.args.get("user-id")
    
    exit_code, sender_id = sql.user_exists(receiver_un, receiver_id)
    str_response = ""
    
    if exit_code == sql.friendsExitCodes.SUCCESS:
        receiver_id = f.session.get("user_id")
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
            str_response = "You already have sent or received this request."
        
    return f.jsonify({"message": str_response})