
import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("server!");

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms() {
    const {
        sockets: {
            adapter: {sids, rooms}
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

wsServer.on("connection", (socket) => {
    socket.nickname = "Anon";

    socket.onAny((event) => {//모든 이벤트 이전에 동작
        console.log(`Socket Event:${event}`);
    });

    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
        // wsServer.sockets.emit("room_change", publicRooms());
        //여기서 동작하면 아직 room연결이 끊어지는 도중이라 room이 존재 한다고 나온다.
        //정확하게 연결이 끊어진 이후 알림이 가게 하려면 -> disconnect 이벤트로 구현하자
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });
}); 

httpServer.listen(3000, handleListen);