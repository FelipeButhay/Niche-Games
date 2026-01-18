import flask_socketio as sio
import flask as f
from flask import request
import src.tools.tools as tools
import random as rand
import src.connections.game_conn.city_shii_tools as gt
import time

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
                "spectr_order": spectr_order,
                "playing_city": gt.get_first_city(),
                "playing_dist": 10000,
                "rounds_scores": {},
            }
            
            for i in range(1, len(game_data["spectr_order"]) + 1):
                spectr_id = spectr_order[i - 1] 
                game_data["rounds_scores"][i] = {}
                
                for j, id in enumerate(room["users"]):
                    
                    user = tools.get_user_data(id)
                    
                    game_data["rounds_scores"][i][id] = {
                        "username": user["username"],   
                        "color_id": j + 1, 
                        
                        "city": game_data["playing_city"]["name"] if spectr_id == id and i == 1 else None,     
                        "lat":  game_data["playing_city"]["lat"]  if spectr_id == id and i == 1 else None, 
                        "lon":  game_data["playing_city"]["lon"]  if spectr_id == id and i == 1 else None,
                        "delta_d": None,
                        "points": None, 
                        "total_points": 0, 
                        "ready1": spectr_id == id, # ready for the results
                        "ready2": False, # ready for the next round
                        "spectr": spectr_id == id
                    }
            
            room["game_data"] = game_data
            tools.set_room(room_id, room)
            
            # print(spectr_order[game_data["round"] - 1])
    
        @self.socket_io.on("get-game-innit", namespace=self.namespace)
        def on_get_game_innit(data):
            
            room_id = int(data["room_id"])
            
            room = tools.get_room(room_id)
            game_data = room["game_data"]
            
            if game_data == None or game_data == {}:
                return {"status": "wait"}
            
            print(game_data)
            spectr_order = game_data["spectr_order"]
            return {
                "playing_city": 
                {
                    **game_data["playing_city"],
                    "distance": game_data["playing_dist"],
                    "color_id": game_data
                        ["rounds_scores"]
                        [str(game_data["round"])]
                        [str(spectr_order[game_data["round"] - 1])]
                        ["color_id"]
                },
                "spectr": int(spectr_order[game_data["round"] - 1]),
                "is_end": 0, #false
                "screen":        int(gt.Screens.PLAYER_WAITING),
                "screen_spectr": int(gt.Screens.SPECTR_ENTER_DIST),
                "round": game_data["round"],
                "status": "run",
            }, 
            
            # self.socket_io.emit("next-round", 
            #     {
            #         "playing_city": 
            #         {
            #             **game_data["playing_city"],
            #             "distance": game_data["playing_dist"],
            #             "color_id": game_data
            #                 ["rounds_scores"]
            #                 [game_data["round"]]
            #                 [spectr_order[game_data["round"] - 1]]
            #                 ["color_id"]
            #         },
            #         "spectr": int(spectr_order[game_data["round"] - 1]),
            #         "is_end": 0, #false
            #         "screen":        int(gt.Screens.PLAYER_WAITING),
            #         "screen_spectr": int(gt.Screens.SPECTR_ENTER_DIST),
            #     }, 
            #     namespace=self.namespace, to=room_id
            # )
           
            
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
            return {"player_list": game_data["rounds_scores"][str(game_data["round"])] }
        
        @self.socket_io.on("send-city", namespace=self.namespace)
        def on_send_city(data):
            user_id = int(data["user_id"])
            user_id_str = str(user_id)
            room_id = int(data["room_id"])
            
            room = tools.get_room(room_id)
            
            city_id = int(data["city_id"])
            city_data = gt.get_city_id(city_id)
            city_coords = (city_data["lat"], city_data["lon"])
            
            round_indx = str(room["game_data"]["round"])
            room["game_data"]["rounds_scores"][round_indx][user_id_str]["city"]   = city_data["name"]
            room["game_data"]["rounds_scores"][round_indx][user_id_str]["lat"]    = city_data["lat"]
            room["game_data"]["rounds_scores"][round_indx][user_id_str]["lon"]    = city_data["lon"]
            room["game_data"]["rounds_scores"][round_indx][user_id_str]["ready1"] = True
            
            playing_city = room["game_data"]["playing_city"]
            playing_dist = room["game_data"]["playing_dist"]
            
            p_city_coords = (playing_city["lat"], playing_city["lon"])
            
            dist = gt.get_delta_d(p_city_coords, city_coords)
            delta_points = int(gt.get_points(playing_dist, dist))
            
            room["game_data"]["rounds_scores"][round_indx][user_id_str]["delta_d"] = dist - playing_dist
            room["game_data"]["rounds_scores"][round_indx][user_id_str]["points"]  = delta_points
            if round_indx == "1":
                room["game_data"]["rounds_scores"][round_indx][user_id_str]["total_points"] = delta_points
            else:
                prev_round_indx = str(room["game_data"]["round"] - 1)
                room["game_data"]["rounds_scores"][round_indx][user_id_str]["total_points"] = \
                room["game_data"]["rounds_scores"][prev_round_indx][user_id_str]["total_points"] + delta_points
            
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
                        "screen":        gt.Screens.RESULTS,
                        "screen_spectr": gt.Screens.RESULTS
                    }, 
                    namespace=self.namespace, to=room_id
                ) 
                
           
        @self.socket_io.on("get-results", namespace=self.namespace)     
        def on_get_results(data):
            room_id = int(data["room_id"])
            room = tools.get_room(room_id)
            
            # playing_city = room["game_data"]["playing_city"]
            # p_city_coords = (playing_city["lat"], playing_city["lon"])
            
            round_indx = str(room["game_data"]["round"])
            scores = room["game_data"]["rounds_scores"][round_indx]
            
            return { "results": list(scores.values()) }
        
        @self.socket_io.on("set-ready2", namespace=self.namespace)     
        def on_set_ready2(data):
            user_id = int(data["user_id"])
            room_id = int(data["room_id"])
            ready2 = bool(data["ready2"])
            
            room = tools.get_room(room_id)
            round_indx = str(room["game_data"]["round"])
            
            room["game_data"]["rounds_scores"][round_indx][str(user_id)]["ready2"] = ready2
            
            for id, d in room["game_data"]["rounds_scores"][round_indx].items():
                if not d["ready2"]:
                    break
            else:
                room["game_data"]["round"] += 1
                
                game_data = room["game_data"]
                spectr_order = game_data["spectr_order"]
                
                scores = list(room["game_data"]["rounds_scores"][round_indx].values())
                scores.sort(lambda x: x["points"], reverse=True)
                
                new_playing_city = {
                    "name": scores["city"],
                    "lat":  scores["lat"],
                    "lon":  scores["lon"]
                }
                
                self.socket_io.emit("next-round", 
                    {
                        "playing_city": 
                        {
                            
                            "distance": game_data["playing_dist"],
                            "color_id": game_data
                                ["rounds_scores"]
                                [str(game_data["round"])]
                                [str(spectr_order[game_data["round"] - 1])]
                                ["color_id"]
                        },
                        "spectr": int(spectr_order[game_data["round"] - 1]),
                        "is_end": 1 if game_data["round"] == len(spectr_order) else 0, # 0 -> false, 1 -> True
                        "screen":        int(gt.Screens.PLAYER_WAITING),
                        "screen_spectr": int(gt.Screens.SPECTR_ENTER_DIST),
                    }, 
                    namespace=self.namespace, to=room_id
                )
                
            tools.set_room(room_id, room)