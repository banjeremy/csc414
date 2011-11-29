var Taunt = {};
Taunt.workers = [];

Taunt.initWorker = function(clientId) {
		Taunt.workers[clientId] = new Worker("js/tauntWorker.js");
		Taunt.workers[clientId].addEventListener('message', function(e) {
            Taunt.play(AI(e.data));
		});
	}
	
    Taunt.play = function(audio) {
        console.log('playing');
        document.getElementById("player").src = "data:audio/x-wav;base64, " + audio;
        document.getElementById("player").play();
    }
