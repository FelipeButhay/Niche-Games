import flask_socketio as sio
import flask as f

class OnlineStatusNamespace:
    def __init__(self, socket_io):
        self.socket_io = socket_io
        self.namespace = "/online-status"
        
        self.register_events()
        
    def register_events(self):
        
        @self.socket_io.on("connect", namespace=self.namespace)
        def connect(auth):
            # print("connect: ", auth)
            user_id = f.session.get("user_id")
            if user_id:
                f.current_app.redis.set(f"online_status:{user_id}", "Online")
            
        @self.socket_io.on("disconnect", namespace=self.namespace)
        def disconnect(auth):
            # print("disconnect: ", auth)
            user_id = f.session.get("user_id")
            if user_id:
                f.current_app.redis.set(f"online_status:{user_id}", "Offline")
                
        @self.socket_io.on("status", namespace=self.namespace)
        def status(data):
            # print("disconnect: ", auth)
            user_id = f.session.get("user_id")
            if user_id:
                f.current_app.redis.set(f"online_status:{user_id}", data["status"])