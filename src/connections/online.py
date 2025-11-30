import flask_socketio as sio
import flask as f

class OnlineStatusNamespace:
    def __init__(self, socket_io, redis, namespace):
        self.socket_io = socket_io
        self.namespace = namespace
        self.redis = redis
        
        self.register_events()
        
    def register_events(self):
        
        @self.socket_io.on("connect", namespace=self.namespace)
        def connect(auth):
            print("connect: ", auth)
            user_id = f.session.get("user_id")
            if user_id:
                self.redis.sadd("connected_users", user_id)
            
        @self.socket_io.on("disconnect", namespace=self.namespace)
        def disconnect(auth):
            print("disconnect: ", auth)
            user_id = f.session.get("user_id")
            if user_id:
                self.redis.srem("connected_users", user_id)