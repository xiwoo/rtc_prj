
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

let roomName;

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        console.log(devices);
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.id === camera.id) {
                option.selected = true;
            }
            cameraSelect.append(option);
        });
    } catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {

    const initialConstrains = {
        audio: !muted,
        video: {
            facingMode: "user"
        },
    };
    const cameraConstrains = {
        audio: !muted,
        video: { deviceId: { exact: deviceId } },
    }

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        myFace.srcObject = myStream;
        if(!deviceId) {
            await getCameras();
        }
    } catch(e) {
        console.log(e);
    }
}

function handleMuteClick() {

    myStream.getAudioTracks()
        .forEach(track => {
            return track.enabled = !track.enabled;
        });

        muteBtn.innerText = muted ? "Mute" : "Unmute";
        muted = !muted;
    // if(!muted) {
    // }
    // else {
    //     muteBtn.innerText = "Mute";
    //     muted = false;
    // }
}

function handleCameraClick() {

    myStream.getVideoTracks()
        .forEach(track => {
            return track.enabled = !track.enabled;
        });

    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }
    else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("click", handleCameraChange);

//Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

function startMedia() {
    welcome.hidden = true;
    call.hidden = false;
    getMedia();
}

function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room", input.value, startMedia);
    roomName = input.value
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Socket Code

socket.on("welcome", () => {
    console.log("someone join!");
});