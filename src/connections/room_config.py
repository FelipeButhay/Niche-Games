import flask_socketio as sio
import flask as f
import src.tools.tools as tools

class RoomConfigNamespace:
    def __init__(self, socket_io):
        self.socket_io = socket_io
        self.namespace = "/room-config"
        self.user_rooms = {}
        
        self.register_events()
        
    def register_events(self):
        
        @self.socket_io.on("join-room", namespace=self.namespace)
        def on_join_room(data):
            room_id = int(data["room_id"])
            sio.join_room(room_id)
    
            user_id = f.session["user_id"]

            room = tools.get_room(room_id)

            if room == None:
                return f.Response(status=400)

            game_id = room["game_id"]
            
            if len(room["users"]) == 0:
                room["admin"] = user_id
            
            room["users"].append(user_id)
            tools.set_room(room_id, room)

            user = tools.get_user_data(user_id)
            sio.emit("add-user", {"user_id": user_id, "username": user["username"]}, namespace="/room-config", room=room_id)
            self.user_rooms[user_id] = {"room_id": room_id, "skip": True}

            return {"redirect": f"/room/{tools.add_0s(game_id, 2)}-{tools.add_0s(room_id, 4)}"}


        @self.socket_io.on("connect", namespace=self.namespace)
        def on_connect(auth):       
            pass    
        
        @self.socket_io.on("disconnect", namespace=self.namespace)
        def on_disconnect(auth):            
            user_id = f.session["user_id"]
            
            if self.user_rooms[user_id]["skip"]:
                self.user_rooms[user_id]["skip"] = False
                return
            
            room_id = self.user_rooms[user_id]["room_id"]
            room = tools.get_room(room_id)
            
            if room["playing"]:
                return
            
            if room_id == None:
                return
            
            sio.emit("remove-user", {"user_id": user_id}, namespace="/room-config", room=room_id)
            sio.leave_room(room=room_id)

            room["users"].remove(user_id)
            
            if len(room["users"]) == 0:
                tools.delete_room(room_id)
            
            tools.set_room(room_id, room)
            
            
        @self.socket_io.on("start-game", namespace=self.namespace)
        def on_start_game(data):
            room_id = data["room_id"]
            room_data = tools.get_room(data["room_id"])
            game_id = room_data["game_id"]
            
            room_data["playing"] = True
            tools.set_room(room_id, room_data)
            
            sio.emit(
                "start-game", 
                {"redirect": f"/game/{game_id}-{room_id}"}, 
                namespace="/room-config", 
                room=data["room_id"]
            )