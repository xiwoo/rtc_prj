
import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("server!");

// app.listen(3000, handleListen);

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
// const wss = new WebSocket.Server();//websocket만 사용할 때

// function handleConnection(socket) {
//     //socket:: 브라우저에서 넘어온 socket
//     console.log(socket);
// }
// wss.on("connection", handleConnection);
const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    console.log("Connected to Browser ");
    socket.on("close", () => console.log("Disconnected from Browser X"))
    socket.on("message", (message) => {
        console.log(message);
        sockets.forEach(sk => sk.send(message.toString("utf8")));
    });
    socket.send("hello!");
});


server.listen(3000, handleListen);