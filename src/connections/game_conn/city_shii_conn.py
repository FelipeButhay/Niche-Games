import flask_socketio as sio
import flask as f
import src.tools.tools as tools
import random as rand
import src.connections.game_conn.city_shii_tools as gt

class CityShiiNamespace:
    def __init__(self, socket_io):
        self.socket_io = socket_io
        self.namespace = "/city-shii"
        
        self.register_events()
        
    def register_events(self):
        @self.socket_io.on("game-innit", namespace=self.namespace)
        def on_innit_game(data):
            room_id = data["room_id"]
            room = tools.get_room(room_id)
            
            n_rounds = room["game_data"]["rounds"]
            
            spectr_order = []
            for i in range(n_rounds):
                spectr_order.extend(room["users"])
                
            rand.shuffle(spectr_order)
            
            game_data = {
                "rounds": n_rounds,
                "spectr_order": spectr_order,
                "first_city": gt.get_first_city()
            }