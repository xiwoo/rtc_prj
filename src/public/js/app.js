
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
//host가 되는 쪽은 offer생성하는 곳(현재 welcome이벤트)에서 생성
//guest는 answer를 생성하는 곳(현재 offer이벤트)에서 생성
let myDataChannel;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        // console.log(devices);
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
    if(myPeerConnection) {
        //상단 getMedia에서 myStream을 변경해줬기 때문에 아래 getVideoTracks에서 변경된 track 가져오기 가능
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders()
            .find(sender => sender.track.kind === 'video');
        console.log(videoSender);
        videoSender.replaceTrack(videoTrack);
    }
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
    //dataChannel 사용 시 offer하는 쪽이 채널 생성 주체가 된다.
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log);
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer();
    //offer는 RTC를 위한 현재 자신의 브라우저 정보(다른 유저에게 초대장이 될)
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    //datachannel 받는 쪽에서 rtc로 채널 받는 예약된 이벤트
    myPeerConnection.addEventListener("datachannel", event => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", console.log);
    });
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
    myPeerConnection.addIceCandidate(ice);
});

//RTC Code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({//test용 stun서버
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
    });
    // const channel = myPeerConnection.createDataChannel('chat');
    channel.onopen = function(event) {
        console.log(event);
        channel.send("Hi you!");
    }
    channel.onmessage = function(event) {
        console.log(event.data);
    }

    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
    console.log();
}

function handleIce(data) {
    console.log(data);
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {

    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}