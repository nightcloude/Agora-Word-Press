
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
    localStreams.camera.stream.unmuteAudio(); // enable the local mic
  } else {
    localStreams.camera.stream.muteAudio(); // mute the local mic
  }
}

function toggleVideo() {
  toggleBtn(jQuery("#video-btn")); // toggle button colors
  toggleBtn(jQuery("#cam-dropdown"));
  if (jQuery("#video-icon").hasClass('fa-video')) {
    localStreams.camera.stream.muteVideo(); // enable the local video
    console.log("muteVideo");
  } else {
    localStreams.camera.stream.unmuteVideo(); // disable the local video
    console.log("unMuteVideo");
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