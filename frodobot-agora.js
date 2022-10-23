var frontCamMediaStream = new MediaStream();
var backCamMediaStream = new MediaStream();
var microphoneMediaStream = new MediaStream();
var localTracks = {
  audioTrack: null
};

var rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,
};

var rtm = {
  cleint: null,
  peerId: '6688'
};

async function agoraEnableAudio(state) {

  if(!localTracks.audioTrack) return false;
  //console.log(localTracks.audioTrack);
  await localTracks.audioTrack.setEnabled(state);
  return state;
}


function agoraSendGamepadData(data) {

  
  rtm.client.queryPeersOnlineStatus([rtm.peerId]).then((res) => {
    if(res[rtm.peerId])
      rtm.client.sendMessageToPeer({'text': JSON.stringify(data)}, rtm.peerId)
  });
}

async function agoraDriving(onAgoraOpen, channel, rtcToken, rtmToken, media) {

  const options = {
    appId: '11ad7b9cc6b64477b120e0e8085bd2a5',
    channel: channel,
    rtcToken: rtcToken,
    rtmToken: rtmToken,
    driverUid: channel + '-driver',
  };

  rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
  rtc.client.on("user-published", async (user, mediaType) => {
    await rtc.client.subscribe(user, mediaType);
    //console.log(user);
    console.log("subscribe success");

    if (mediaType === "video" && document.getElementById(media['front-cam']).srcObject == null) {
      let el = document.getElementById(media['front-cam']);
      frontCamMediaStream.addTrack(user.videoTrack._mediaStreamTrack);
      el.srcObject = frontCamMediaStream
      el.autoplay = true;
      el.muted = true
    }
    else if (mediaType === "video") {
      let el = document.getElementById(media['back-cam']);
      backCamMediaStream.addTrack(user.videoTrack._mediaStreamTrack);
      el.srcObject = backCamMediaStream
      el.autoplay = true;
      el.muted = true
    }
    else if (mediaType == "audio") {
      let el = document.getElementById(media['microphone']);
	    console.log(user);
      microphoneMediaStream.addTrack(user.audioTrack._mediaStreamTrack);
      el.srcObject = microphoneMediaStream;
      el.autoplay = true;
      el.controls = true;
      el.muted = true;
    }

  });

  const uid = await rtc.client.join(options.appId, options.channel, options.rtcToken, null);

  //console.log(localTracks.audioTrack);

  rtm.peerId = channel;
  rtm.client = AgoraRTM.createInstance(options.appId)
  rtm.client.login({ uid: options.driverUid, token: options.rtmToken}).then(() => {
    const channel = rtm.client.createChannel(options.channel);
    channel.join();
    onAgoraOpen();
  });

  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  rtc.client.publish(Object.values(localTracks));

}


