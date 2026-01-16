import sqlite3 as sql
import pandas as pd
import json
import flask as f
import functools
import flask_socketio as sio
import src.tools.tools as tools

# it verifies if the user is loged in, otherwise it redirects it to the auth section
def verify_conn(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in f.session:
            f.session["last_url"] = f.request.url
            return f.redirect("/auth/signin")
        return func(*args, **kwargs)
    
    return wrapper

# it veryfies if the user is connecting from de room
def verify_conn_room(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "room_hash" not in f.session:
            return f.redirect("/home/news")
        else:
            room_hash = f.session["room_hash"]
            
        return func(*args, **kwargs)
    
    return wrapper


# get the all the user information from the main "user" sql table
def get_user_data(user_id: int) -> dict:
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return dict(df.iloc[0])


# gets the room from a given id

# new_room = {
#     "room_id": new_room_id,
#     "game_id": game_id,
#     "users": [],
#     "admin": admin
#     "playing": False,
# }

def get_room(room_id: int):
    room_redis = f.current_app.redis.get(f"room:{tools.add_0s(int(room_id), 4)}")
    return json.loads(room_redis) if room_redis != None else None


# set a room info
def set_room(room_id:int, new_room: dict):
    f.current_app.redis.set(f"room:{tools.add_0s(int(room_id), 4)}", json.dumps(new_room))
    
    
def delete_room(room_id:int):
    f.current_app.redis.delete(f"room:{tools.add_0s(int(room_id), 4)}")


# gets the game from a given id
def get_game(game_id: int):
    game_list = None
    with open("logs/games.json", "r", encoding="utf-8") as games_json:
        game_list = json.load(games_json)
        
    for g in game_list:
        if int(g["id"]) == game_id:
            return g
        
        
# completes a number with zeros returning it with a given number of digits
def add_0s(n, digits):
    n_dig = len(str(n))
    str_0s = (digits - n_dig) * "0"
    return f"{str_0s}{n}"