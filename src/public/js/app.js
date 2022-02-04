
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new WebSocket(`ws://${window.location.host}`);
//socket:: 서버에서 넘어온 socket

socket.addEventListener("open", () => {
    console.log("Connected to Server ");
});

socket.addEventListener("message", (message) => {
    // console.log("Just got this: ", message, "from the server");
    console.log("New massage", message.data)
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server X");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    console.log(input.value);
    socket.send(input.value);
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit)