window.average = 40; 
window.buf = [];
var step = 10;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

function render() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, canvasHeight / 2, window.average, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.moveTo(0, 0);
  ctx.beginPath();
  for (var i = 0; i < buf.length; i++) {
    ctx.lineTo(i * step, canvasHeight - buf[i]);
  };
  ctx.stroke();

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

function discArray(array, width) {
  var newarray = [];
  var m = Math.floor(array.length / width);
  var buf = 0;
  for (var i = 0; i < width; i++) {
    var res = 0;
    for (var j = 0; j < m; j++) {
      res = res + array[i * m + j];
    };
    res = res / m;
    // console.log(i);
    newarray[i] = res;
  };
  return newarray;
}

var audioElement = document.getElementById('audio');
// audioElement.crossOrigin = "anonymous";

var inputElement = document.getElementById('input');
inputElement.addEventListener('change', inputChangeHandler);

function inputChangeHandler(e) {
  var target = e.currentTarget;
  var file = target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    audioElement.src = e.target.result;

    var audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();
    var track = audioContext.createMediaElementSource(audioElement);
    var javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    track.connect(analyser);
    track.connect(audioContext.destination);

    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        window.buf = discArray(array, canvasWidth / step);
        var values = 0;

        for (var i = 0; i < analyser.frequencyBinCount; i++) {
            values += array[i];
        }

        var average = values / analyser.frequencyBinCount;
        window.average = average;
    }

    audioElement.play();
  }
  reader.readAsDataURL(file);
}

var constraints = {
  audio: true,
  video: false
};


window.audio;
navigator.mediaDevices.getUserMedia(constraints)
    .then(streamHandler)
    .catch(function(err) {
      console.error(err);
    });

function streamHandler(stream) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  track = audioContext.createMediaElementSource(audioElement);
  // microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 1024;

  // microphone.connect(analyser);
  track.connect(analyser);
  track.connect(audioContext.destination);

  analyser.connect(javascriptNode);
  console.log(audioContext.destination);
  javascriptNode.connect(audioContext.destination);
  // analyser.connect(audioContext.destination);

  javascriptNode.onaudioprocess = function() {
      var array =  new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);

      window.buf = discArray(array, canvasWidth / step);
      var values = 0;

      for (var i = 0; i < analyser.frequencyBinCount; i++) {
          values += array[i];
      }

      var average = values / analyser.frequencyBinCount;
      window.average = average;
  }
}