
// UI buttons
function enableUiControls() {

  jQuery("#mic-btn").prop("disabled", false);
  jQuery("#video-btn").prop("disabled", false);
  jQuery("#exit-btn").prop("disabled", false);
  jQuery("#add-rtmp-btn").prop("disabled", false);

  jQuery("#mic-btn").click(function(){
    toggleMic();
  });

  jQuery("#video-btn").click(function(){
    toggleVideo();
  });

  jQuery("#cloud-recording-btn").click(function(){
    toggleRecording();
  });

  jQuery("#exit-btn").click(function(){
    console.log("so sad to see you leave the channel");
    leaveChannel(); 
  });

  jQuery("#start-RTMP-broadcast").click(function(){
    startLiveTranscoding();
    jQuery('#addRtmpConfigModal').modal('toggle');
    jQuery('#rtmp-url').val('');
  });

  jQuery("#add-external-stream").click(function(){  
    addExternalSource();
    jQuery('#add-external-source-modal').modal('toggle');
  });

  jQuery("#screen-share-btn").click(function(){
    toggleScreenShareBtn(); // set screen share button icon
    var loaderIcon = jQuery(this).find('.spinner-border');
    var closeIcon = jQuery('#screen-share-icon');
    loaderIcon.show();
    closeIcon.hide();

    var toggleLoader = function(err, next) {
      loaderIcon.hide();
      closeIcon.show();
      // TODO: is not needed but I could capture the callback result here...
    }

    jQuery("#screen-share-btn").prop("disabled",true); // disable the button on click
    if(window.screenShareActive){
      stopScreenShare(toggleLoader);
    } else {
      initScreenShare(toggleLoader);
    }
  });

  // keyboard listeners 
  jQuery(document).keypress(function(e) {
    // ignore keyboard events when the modals are open
    if ((jQuery("#addRtmpUrlModal").data('bs.modal') || {})._isShown ||
        (jQuery("#addRtmpConfigModal").data('bs.modal') || {})._isShown){
      return;
    }

    switch (e.key) {
      case "m":
        console.log("squick toggle the mic");
        toggleMic();
        break;
      case "v":
        console.log("quick toggle the video");
        toggleVideo();
        break; 
      case "q":
        console.log("so sad to see you quit the channel");
        leaveChannel(); 
        break;   
      default:  // do nothing
    }
  });
}

function toggleBtn(btn){
  btn.toggleClass('btn-dark').toggleClass('btn-danger');
}

function toggleVisibility(elementID, visible) {
  if (visible) {
    jQuery(elementID).attr("style", "display:block");
  } else {
    jQuery(elementID).attr("style", "display:none");
  }
}

function toggleMic() {
  toggleBtn(jQuery("#mic-btn")); // toggle button colors
  toggleBtn(jQuery("#mic-dropdown"));
  jQuery("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash'); // toggle the mic icon
  if (jQuery("#mic-icon").hasClass('fa-microphone')) {
    window.localStreams.camera.stream.unmuteAudio(); // enable the local mic
  } else {
    window.localStreams.camera.stream.muteAudio(); // mute the local mic
  }
}

function toggleRecording() {
  if (window.loadingRecord) {
    return false;
  }

  if (!window.restfulAuth) {
    alert('To enable the Cloud Recording, please define your RESTFul Customer on the Agora plugin Settings');
    return false;
  }

  var btn = jQuery("#cloud-recording-btn");
  if (btn.hasClass('start-rec')) {
    window.loadingRecord = true;
    btn.removeClass('start-rec').addClass('load-rec').attr('title', 'Stop Recording');
    // console.log("Start rec");
    setTimeout(function() {
      window.loadingRecord = false;
      btn.removeClass('load-rec').addClass('stop-rec');
    }, 1500);
  } else {
    btn.removeClass('stop-rec').addClass('start-rec').attr('title', 'Start Recording');
    console.log("Stop rec");
  }
}

function toggleVideo() {
  toggleBtn(jQuery("#video-btn")); // toggle button colors
  toggleBtn(jQuery("#cam-dropdown"));
  if (jQuery("#video-icon").hasClass('fa-video')) {
    window.localStreams.camera.stream.muteVideo(); // enable the local video
    // console.log("muteVideo");
  } else {
    window.localStreams.camera.stream.unmuteVideo(); // disable the local video
    // console.log("unMuteVideo");
  }
  jQuery("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
}

// keep the spinners honest
jQuery("input[type='number']").change(event, function() {
  var maxValue = jQuery(this).attr("max");
  var minValue = jQuery(this).attr("min");
  if(jQuery(this).val() > maxValue) {
    jQuery(this).val(maxValue);
  } else if(jQuery(this).val() < minValue) {
    jQuery(this).val(minValue);
  }
});

// keep the background color as a proper hex
jQuery("#background-color-picker").change(event, function() {
  // check the background color
  var backgroundColorPicker = jQuery(this).val();
  if (backgroundColorPicker.split('#').length > 1){
    backgroundColorPicker = '0x' + backgroundColorPicker.split('#')[1];
    jQuery('#background-color-picker').val(backgroundColorPicker);
  } 
});

function calculateVideoScreenSize() {
  var container = jQuery('#full-screen-video');
  console.log('Video SIZE:', container.outerWidth());
  var size = getSizeFromVideoProfile();

  // https://math.stackexchange.com/a/180805
  var newHeight = container.outerWidth() * size.height / size.width;
  container.outerHeight(newHeight);
}

function getSizeFromVideoProfile() {
  // https://docs.agora.io/en/Interactive%20Broadcast/videoProfile_web?platform=Web#video-profile-table
  switch(window.cameraVideoProfile) {
    case '480p_8':
    case '480p_9': return { width: 848, height: 480 };
    case '720p':
    case '720p_1':
    case '720p_2':
    case '720p_3': return { width: 1280, height: 720 };
    case '720p_6': return { width: 960, height: 720 };
    case '1080p':
    case '1080p_1':
    case '1080p_2':
    case '1080p_3':
    case '1080p_5': return { width: 1920, height: 1080 };
  }
}

function startVideoRecording() {
  var params = {
    action: 'cloud_record', // wp ajax action
    sdk_action: 'start-recording',
    cid: window.channelId,
    cname: window.channelName,
    uid: window.userID,
    token: window.agoraToken
  };
  agoraApiRequest(ajax_url, params).done(function(res) {
    // var startRecordURL = agoraAPI + window.agoraAppId + '/cloud_recording/resourceid/' + res.resourceId + '/mode/mix/start';
    console.log(res);
    window.resourceId = res.resourceId
    window.recordingId = res.sid;
    setTimeout(function(){
      window.resourceId = null;
    }, 1000*60*5); // Agora DOCS: The resource ID is valid for five minutes.
  }).fail(function(err) {
    console.error('API Error:',err);
  })
}


function stopVideoRecording() {
  var params = {
    action: 'cloud_record', // wp ajax action
    sdk_action: 'stop-recording',
    cid: window.channelId,
    cname: window.channelName,
    uid: window.userID,
    resourceId: window.resourceId,
    recordingId: window.recordingId
  };
  agoraApiRequest(ajax_url, params).done(function(res) {
    // var startRecordURL = agoraAPI + window.agoraAppId + '/cloud_recording/resourceid/' + res.resourceId + '/mode/mix/start';
    console.log('Stop:', res);
    window.recording = res.serverResponse;
  }).fail(function(err) {
    console.error('API Error:',err);
  })
}

// Ajax simple requests
function agoraApiRequest(endpoint_url, endpoint_data) {
  var ajaxRequestParams = {
    method: 'POST',
    url: endpoint_url,
    data: endpoint_data
  };
  return jQuery.ajax(ajaxRequestParams)
}