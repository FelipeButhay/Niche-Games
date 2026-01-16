import { io } from "socket.io-client";
const socket = io("http://127.0.0.1:5000/city-shii", {
    withCredentials: true,
});

export default socket;