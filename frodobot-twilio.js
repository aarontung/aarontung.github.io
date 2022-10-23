var pc;
var sendChannel;
var frontCamMediaStream = new MediaStream();
var backCamMediaStream = new MediaStream();
var microphoneMediaStream = new MediaStream();
var iceServers = []
var done = 0;

var log = msg => { console.log(msg); };

function gatheringTimeout() {
  if(!done) {
    console.log("timeout...");
    sendOffer(pc.localDescription.sdp);
    done = 1;
  }
}

function twilioDriving(iceServers, sendOffer, onOpen, media) {

  pc = new RTCPeerConnection({'iceTransportPolicy': 'all', 'iceServers': iceServers});
  //pc = new RTCPeerConnection({'iceTransportPolicy': 'all', 'iceServers': [{"url": "stun:global.stun.twilio.com:3478?transport=udp", }]});

  pc.ontrack = function (event) {
  
    if(event.track.kind == 'video' && event.transceiver.mid == 0) {
      let el = document.getElementById(media['front-cam']);
      frontCamMediaStream.addTrack(event.track);
      el.srcObject = frontCamMediaStream
      el.autoplay = true;
      el.muted = true
    }
    else if(event.track.kind == 'video' && event.transceiver.mid == 1) {
      let el = document.getElementById(media['back-cam']);
      backCamMediaStream.addTrack(event.track);
      el.srcObject = backCamMediaStream
      el.autoplay = true;
      //el.controls = true
      el.muted = true
    }
    else if(event.track.kind == 'audio') {
      let el = document.getElementById(media['microphone']);
      microphoneMediaStream.addTrack(event.track);
      el.srcObject = microphoneMediaStream;
      el.autoplay = true;
      el.controls = true;
      el.muted = true;
    }
  }

  pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)
  pc.onicecandidate = event => {
    console.log(event.candidate);
    if(event.candidate === null && done == 0) {
      sendOffer(pc.localDescription.sdp);
      done = 1;
    }
  };

  pc.addTransceiver('video', {'direction': 'sendrecv'})
  pc.addTransceiver('video', {'direction': 'sendrecv'})
  pc.addTransceiver('audio', {'direction': 'sendrecv'})
  sendChannel = pc.createDataChannel('control')
  pc.ondatachannel = () => {
    console.log('ondatachannel');
  }
  sendChannel.onclose = () => console.log('sendChannel has closed');
  sendChannel.onopen = () => {
    console.log('sendChannel has opened');
    onOpen();
  }
  sendChannel.onmessage = e => log(`Message from DataChannel '${sendChannel.label}' payload '${e.data}'`);

  navigator.mediaDevices.getUserMedia({ video: false, audio: true })
   .then(stream => {
   stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }).catch(log)
  

  pc.createOffer().then(d => {
    setTimeout(gatheringTimeout, 2000);
    pc.setLocalDescription(d);
  }).catch(log);

}

function twilioSendGamepadData(data) {
  //console.log(JSON.stringify(data))
  sendChannel.send(JSON.stringify(data));
}

function twilioSetAnswer(answer) { 

  console.log(answer);
  pc.setRemoteDescription(new RTCSessionDescription({'type': 'answer', 'sdp': answer}));
} 

function gatheringTimeout() {
  if(!done) {
    console.log("timeout...");
    sendOffer(pc.localDescription.sdp);
    done = 1;
  }
}


