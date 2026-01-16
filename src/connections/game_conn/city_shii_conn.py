import flask_socketio as sio
import flask as f
from flask import request
import src.tools.tools as tools
import random as rand
import src.connections.game_conn.city_shii_tools as gt

class CityShiiNamespace:
    def __init__(self, socket_io):
        self.socket_io = socket_io
        self.namespace = "/city-shii"
        
        self.register_events()
        
    def register_events(self):
        @self.socket_io.on("user-innit", namespace=self.namespace)
        def on_user_innit(data):
            print("ON USER INNIT")
            room_id = int(data["room_id"])         
            user_id = int(data["user_id"])
            
            sio.join_room(room_id, sid=request.sid, namespace=self.namespace)
            print(f"User {user_id} joined room {room_id}:", sio.rooms(request.sid, self.namespace))
        
            room = tools.get_room(room_id)
            
            print(f"User {user_id}: {sio.rooms(request.sid, self.namespace)}")
            
            admin = 1 if room["admin"] == user_id else 0
            color_id = room["users"].index(user_id) + 1 
            
            return {"admin": admin, "color_id": color_id}
            
            
        @self.socket_io.on("game-innit", namespace=self.namespace)
        def on_game_innit(data):
            print("ON GAME INNIT")
            print("ROOMS:", sio.rooms(request.sid, self.namespace))
            room_id = int(data["room_id"])
            room = tools.get_room(room_id)
            
            config_data = room["config_data"]
            if config_data == None:
                config_data = dict()
                for c in tools.get_game(room["game_id"])["config"]:
                    config_data[c["title_"]] = c["default"]
            
            n_rounds = config_data["spectr_rounds"]
            
            spectr_order = []
            user_list = room["users"]
            rand.shuffle(user_list)
            
            for i in range(n_rounds):
                spectr_order.extend(room["users"])
            
            game_data = {
                "round": 1,
                "stage": 1,
                "spectr_order": spectr_order,
                "playing_city": gt.get_first_city(),
                "playing_dist": 10000,
                "rounds_scores": {},
            }
            
            spectr_id =  spectr_order[game_data["round"] - 1] 
            for i in range(1, len(game_data["spectr_order"]) + 1):
                game_data["rounds_scores"][i] = {}
                
                for j, id in enumerate(room["users"]):
                    
                    user = tools.get_user_data(id)
                    
                    game_data["rounds_scores"][i][id] = {
                        "username": user["username"],   
                        "color_id": j + 1, 
                        "city": None,     
                        "lat": None, 
                        "lon": None,
                        "delta_d": None,
                        "points": None, 
                        "total_points": 0, 
                        "ready1": spectr_id == id, # ready for the results
                        "ready2": False, # ready for the next round
                        "spectr": spectr_id == id
                    }
            
            room["game_data"] = game_data
            tools.set_room(room_id, room)
            
            print(spectr_order[game_data["round"] - 1])
            self.socket_io.emit("next-round", 
                {
                    "playing_city": 
                    {
                        **game_data["playing_city"],
                        "distance": game_data["playing_dist"],
                        "color_id": game_data
                            ["rounds_scores"]
                            [game_data["round"]]
                            [spectr_order[game_data["round"] - 1]]
                            ["color_id"]
                    },
                    "spectr": int(spectr_order[game_data["round"] - 1]),
                    "is_end": 0, #false
                    "screen":        int(gt.Screens.PLAYER_WAITING),
                    "screen_spectr": int(gt.Screens.SPECTR_ENTER_DIST),
                }, 
                namespace=self.namespace, to=room_id
            )
            
        @self.socket_io.on("send-dist", namespace=self.namespace) 
        def on_send_dist(data):
            distance = int(data["dist"])
            room_id = int(data["room_id"])
            
            room = tools.get_room(room_id)
            room["game_data"]["playing_dist"] = distance
            tools.set_room(room_id, room)
            
            self.socket_io.emit(
                "set-dist",
                {
                    "dist": distance
                },
                namespace=self.namespace, to=room_id
            )
            
            self.socket_io.emit(
                "set-screen",
                {
                    "screen":        int(gt.Screens.PLAYER_ENTER_CITY),
                    "screen_spectr": int(gt.Screens.SPECTR_WAITING),
                },
                namespace=self.namespace, to=room_id
            )
            
        @self.socket_io.on("get-cities", namespace=self.namespace) 
        def on_get_cities(data):
            city_input = data["city"]
            
            city_list = gt.get_cities(city_input)
            return city_list
        
        @self.socket_io.on("get-player-list", namespace=self.namespace)
        def on_get_player_list(data):
            room_id = int(data["room_id"])
            
            game_data = tools.get_room(room_id)["game_data"]
            return game_data["rounds_scores"][game_data["round"]]
        
        @self.socket_io.on("send-city", namespace=self.namespace)
        def on_send_city(data):
            user_id = int(data["user_id"])
            room_id = int(data["room_id"])
            
            room = tools.get_room(room_id)
            
            city_id = int(data["city_id"])
            city_data = gt.get_city_id(city_id)
            
            round_indx = room["game_data"]["round"]
            room["game_data"]["rounds_scores"][round_indx][user_id]["city"]   = city_data["name"]
            room["game_data"]["rounds_scores"][round_indx][user_id]["lat"]    = city_data["lat"]
            room["game_data"]["rounds_scores"][round_indx][user_id]["lon"]    = city_data["lon"]
            room["game_data"]["rounds_scores"][round_indx][user_id]["ready1"] = True
            
            tools.set_room(room_id, room)
            
            for id, d in room["game_data"]["rounds_scores"][round_indx].items():
                if not d["ready1"]:
                    self.socket_io.emit("set-screen", 
                        {
                            "screen": gt.Screens.SPECTR_WAITING
                        }, 
                        namespace=self.namespace, to=request.sid
                    ) 
                    break
            else:
                self.socket_io.emit("set-screen", 
                    {
                        "screen": gt.Screens.RESULTS
                    }, 
                    namespace=self.namespace, to=room_id
                ) 