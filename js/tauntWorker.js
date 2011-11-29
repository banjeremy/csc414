importScripts("../thirdParty/speak.js");

var audio;

addEventListener('message', function(e) {
	var data = e.data;
	postMessage(speak(e.data));
});
