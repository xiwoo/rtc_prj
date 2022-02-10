
import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("server!");

// app.listen(3000, handleListen);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {

    socket.onAny((event) => {//모든 이벤트 이전에 동작
        console.log(`Socket Event:${event}`);
    });

    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye"));
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", msg);
        done();
    })
});

// const wss = new WebSocket.Server({server});
// const wss = new WebSocket.Server();//websocket만 사용할 때

// function handleConnection(socket) {
//     //socket:: 브라우저에서 넘어온 socket
//     console.log(socket);
// }
// wss.on("connection", handleConnection);
// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon"
//     console.log("Connected to Browser ");
//     socket.on("close", () => console.log("Disconnected from Browser X"))
//     socket.on("message", (data) => {
//         // console.log(data);
//         const message = JSON.parse(data);
//         switch(message.type) {
//             case "new_message": 
//                 sockets.forEach(sk => 
//                     sk.send(`${socket.nickname}: ${message.payload}`)
//                 );
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
        
//     });
//     socket.send("hello!");
// });


httpServer.listen(3000, handleListen);