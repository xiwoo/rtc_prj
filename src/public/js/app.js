
// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");

// const socket = new WebSocket(`ws://${window.location.host}`);
// //socket:: 서버에서 넘어온 socket
// //socket.send() 메소드에서 우린 string으로 보내줄 필요가 있다. js object로 보내주게 되었을 때
// //만약 백엔드가 js가 아니라고 한다면 어떤 처리를 해야할 지 난감하게 된다.
// //해서 서버로 보낼때는 string문자열 처리를 할 필요가 있다. 아마 서버에서 넘어올 때도 비슷한 이유로 string문자열로 오지 않을까...

// function makeMessage(type, payload) {
//     const msg = {type, payload};
//     return JSON.stringify(msg);   
// }


// socket.addEventListener("open", () => {
//     console.log("Connected to Server ");
// });

// socket.addEventListener("message", (message) => {
//     // console.log("Just got this: ", message, "from the server");
//     console.log("New massage", message.data);
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnected from Server X");
// });

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     console.log(input.value);
//     socket.send(makeMessage("new_message", input.value));
//     input.value = "";
// }

// function handleNickSubmit(event) {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     console.log(input.value);
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);

const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const room = document.getElementById("room");

room.hidden = true;

let roomName;

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${input.value}`);
    });
}

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit)
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit(
        "enter_room", 
        input.value,
        showRoom
    );
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
    addMessage("Someone joined!!");
});

socket.on("bye", () => {
    addMessage("someon left!!");
});

socket.on("new_message", addMessage);