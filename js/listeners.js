listeners = {};
keysDown = [];

listeners.onResize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

listeners.onMouseDown = function(event) {
    event.preventDefault();
    var mouse2d = new THREE.Vector3();
    mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouse2d.z = 1;
    var vector = new THREE.Vector3(mouse2d.x, mouse2d.y, mouse2d.z);
    var projector = new THREE.Projector();
    projector.unprojectVector(vector, camera);
    projectileSound.play();
    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
    var picked = THREE.Collisions.rayCastAll(ray);
    if (picked.length == 0) 
        return;
    for (var i in picked) {
        if (picked[i].mesh.clientId) {
            networking.sendHit(picked[i].mesh.clientId, Math.random()*50);
        }
    }
}

listeners.onKeyUp = function(event) {

    switch(event.keyCode){
        case 38: //up 
        case 87: //w 
        case 37: //left
        case 65: //a
        case 40: //down 
        case 83: //s
        case 39: //right 
        case 68: //d
           //animation
            keysDown.splice(keysDown.indexOf(event.keyCode), 1);
            if(keysDown.length == 0){
                networking.sendAnimation("idle"); 
            }
            
            break;

    }


}

listeners.onKeyDown = function(event) {
   
    switch(event.keyCode){
        case 38: //up 
        case 87: //w 
        case 37: //left
        case 65: //a
        case 40: //down 
        case 83: //s
        case 39: //right 
        case 68: //d

             //animation
            if(keysDown.indexOf(event.keyCode, 0) == -1){
                keysDown.push(event.keyCode);
                networking.sendAnimation("walk"); 

            }

            break;

    }
}



document.addEventListener( 'mousedown', listeners.onMouseDown, false );
document.addEventListener( 'keydown', listeners.onKeyDown, false );
document.addEventListener( 'keyup', listeners.onKeyUp, false );
window.onresize = listeners.onResize; 
