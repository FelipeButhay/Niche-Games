import { io } from "socket.io-client";
const socket = io("/city-shii", {withCredentials: true});

export default socket;