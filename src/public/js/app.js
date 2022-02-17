
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");


call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

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

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall()
    socket.emit("join_room", input.value);
    roomName = input.value
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Socket Code

socket.on("welcome", async () => {
    console.log("someone join!");
    const offer = await myPeerConnection.createOffer();
    //offer는 RTC를 위한 현재 자신의 브라우저 정보(다른 유저에게 초대장이 될)
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer);
});

//RTC Code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myStream.getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
    console.log();
}