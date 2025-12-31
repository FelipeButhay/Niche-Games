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

            if not room:
                return f.Response(status=400)

            game_id = room["game_id"]
            room["users"].append(user_id)
            tools.set_room(room_id, room)

            user = tools.get_user_data(user_id)
            sio.emit("add-user", {"user_id": user_id, "username": user["username"]}, namespace="/room-config")
            self.user_rooms[user_id] = {"room_id": room_id, "skip": True}

            return {"redirect": f"/room/{tools.add_0s(game_id, 2)}-{tools.add_0s(room_id, 4)}"}
        
        @self.socket_io.on("disconnect", namespace=self.namespace)
        def on_disconnect(auth):            
            user_id = f.session["user_id"]
            
            if self.user_rooms[user_id]["skip"]:
                self.user_rooms[user_id]["skip"] = False
                return None
            
            room_id = self.user_rooms[user_id]["room_id"]
            
            
            if not room_id:
                return {"redirect": f"/home/games"}
            
            sio.leave_room(room=room_id)

            room = tools.get_room(room_id)
            room["users"].remove(user_id)
            
            if len(room["users"]) == 0:
                tools.delete_room(room_id)
            
            tools.set_room(room_id, room)

            sio.emit("delete-user", {"user_id": user_id}, namespace="/room-config")
            
            return {"redirect": f"/home/games"}