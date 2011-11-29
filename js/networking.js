var networking = {};
EasyWebSocket.serverUrl = document.location.origin + ":8950";
networking.socket = new EasyWebSocket(document.location.href);

window.onbeforeunload = function () {
    networking.disconnect();
}

networking.socket.onopen = function() {
    console.log(networking.socket._clientId + " connected");
    networking.socket.send(JSON.stringify(
        {
            "message": {
                "type": "join",
                "clientId": networking.socket._clientId,
                "position": {x:camera.position.x, y:camera.position.y, z:camera.position.z},
                "rotation": {x:0, y:camera.dir, z:0}
            }
        }
    ));
}

networking.socket.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.message.clientId == networking.socket._clientId) {
        return;
    }

    switch (data.message.type){
        case "join":
            console.log(data.message.clientId + " joined");
            networking.sendGreeting();
            clients.push(data.message.clientId);
            Taunt.initWorker(data.message.clientId);
            if (smurf.loadComplete) {
                avatars[data.message.clientId] = new animation(smurf.newInstance(), 40000, 2, 0); //init with idle
                avatars[data.message.clientId].addMode("walk", 3000, 10, 2, true);
                avatars[data.message.clientId].update = avatars[data.message.clientId].animate;
                var obj = avatars[data.message.clientId].mesh;
                obj.scale.set(0.05, 0.05, 0.05);
                obj.clientId = data.message.clientId;
                obj.position.set(data.message.position.x,
                    data.message.position.y,
                data.message.position.z);
                obj.rotation.set(data.message.rotation.x,
                    data.message.rotation.y,
                data.message.rotation.z);
            }
            break;
        case "leave":
            console.log(data.message.clientId + " left");
            scene.removeObject(avatars[data.message.clientId]);
            delete avatars[data.message.clientId];
            break;
        case "update":
            var obj = avatars[data.message.clientId];
            if (obj) {
                obj.mesh.position.set(data.message.position.x,
                    data.message.position.y - 3,
                data.message.position.z);
                obj.mesh.rotation.set(data.message.rotation.x,
                    data.message.rotation.y,
                data.message.rotation.z); 
            }
            break;
        case "animation":
            var obj = avatars[data.message.clientId];
            if (obj) {
            obj.mesh.position.set(data.message.position.x,
            data.message.position.y - 3,
            data.message.position.z);
            obj.mesh.rotation.set(data.message.rotation.x,
            data.message.rotation.y,
            data.message.rotation.z);

            obj.setMode(data.message.mode);
            }
            break;
        case "greeting":
            if (!avatars[data.message.clientId]) {
                console.log(data.message.clientId + " says hello");
                clients.push(data.message.clientId);
                Taunt.initWorker(data.message.clientId);
                var obj = avatars[data.message.clientId];
            }
            break;
        case "taunt":
            console.log(data.message.text);
            Taunt.workers[data.message.clientId].postMessage(data.message.text);
            break; 
        case "hit":
            if (networking.socket._clientId == data.message.who) {
                console.log(data.message.clientId + " hit you for " + data.message.amount);
                stats.hit(data.message.clientID,data.message.amount);
            }
            break;
	case "kill":
	    stats.killcount(data.message.who)
	    break;
    } 
}

networking.socket.onclose = function() {
    console.log("socket onclose");
}

networking.sendUpdate = function() {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "update",
                "clientId": networking.socket._clientId,
                "position": {x:camera.position.x, y:camera.position.y, z:camera.position.z},
                "rotation": {x:0, y:camera.dir, z:0}
            }
        }
    ));
}

networking.sendTaunt = function(text) {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "taunt",
                "clientId": networking.socket._clientId,
                "text": text
            }
        }
    ));
}

networking.sendGreeting = function() {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "greeting",
                "clientId": networking.socket._clientId,
                "position": {x:camera.position.x, y:camera.position.y, z:camera.position.z},
                "rotation": {x:0, y:camera.dir, z:0}
            }
        }
    ));
}

networking.disconnect = function() {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "leave",
                "clientId": networking.socket._clientId
            }
        }
    ));
    networking.socket.close();
}

networking.sendAnimation = function(mode) {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "animation",
                "clientId": networking.socket._clientId,
                "position": {x:camera.position.x, y:camera.position.y, z:camera.position.z},
                "rotation": {x:0, y:camera.dir, z:0},
                "mode": mode
            }
        }
    ));
}
networking.sendHit = function(who, amount) {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "hit",
                "clientId": networking.socket._clientId,
                "who": who,
                "amount": amount
            }
        }
    ));
}

networking.sendKill = function(who) {
    networking.socket.send(JSON.stringify(
        {
            "message":{
                "type": "kill",
                "clientId": networking.socket._clientId,
                "who": who
            }
        }
    ));
}
