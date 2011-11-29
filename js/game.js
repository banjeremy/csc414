if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var uniforms;
var weapons, camera, scene, renderer, skybox, bulletWorld;
var worldSound, stats;

var mesh, terrainMesh, data, ray, levels = [], objects = new Array();
var worldWidth = 16, worldDepth = 16,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var clients = [];
var avatars = [];
var loader = new THREE.JSONLoader();
var smurf;
var projectileSound;

init();
animate();

function init() {
    //var gui = new GUI();
    camera = new THREE.FirstPersonCamera({
        fov: 50,
        aspect: window.innerWidth / window.innerHeight,
        near: .1,
        far: 2000
    });
    camera.position.set(0,500,0);
    camera.lookSpeed = 0.03;
    camera.movementSpeed = 0.3;
    //camera.movementSpeed = 6;
    camera.constrainVertical = true;
    camera.lookVertical = false;
    camera.heightMin = 1.0;
    scene = new THREE.Scene();
    projectileSound = new Sound( 'sounds/source_engine/weapons/smg1/smg1_fireburst1.wav', 500, 1);

    skybox = new Skybox("images/skyboxes/clear/"); 

    //lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(2,500,2);
    scene.addLight(ambientLight);
    scene.addLight(pointLight);
    //ground plane
    addTerrain(1024, 1024, 32, 32, "images/dirt2.jpg");
    addWater(2048, 2048, 32, 32, "images/water1.jpg");

    smurf = new object("models/smurf.js");
    smurf.afterLoad = function() {
        for (var id in clients) {
            console.log("adding avatar for " + clients[id]);
            avatars[clients[id]] = new animation(smurf.newInstance(), 40000, 2, 0); //init with idle
            avatars[clients[id]].addMode("walk", 3000, 10, 2, true);
            avatars[clients[id]].mesh.scale.set(0.05, 0.05, 0.05);
            avatars[clients[id]].mesh.clientId = clients[id];
            avatars[clients[id]].update = avatars[clients[id]].animate;
        }
    }
    smurf.load();

    var palm = new object("models/jeremytree.js");
    palm.afterLoad = function() {
        for (var i = 0; i < 400; i++) {
            var randomnum= Math.floor(Math.random()*256);
            var vx= terrainMesh.geometry.vertices[randomnum].position.x;
            var vz= terrainMesh.geometry.vertices[randomnum].position.y;
            var vy= terrainMesh.geometry.vertices[randomnum].position.z;

            var palmInstance = palm.newInstance(); 
            palmInstance.position.set(vx, Terrain.getHeight(vx, vz), vz);
            palmInstance.scale.set(.5, .7, .5);
        }
    }
    palm.load();
    worldSound = new Sound('sounds/putj.mp3', 375, 1);
    worldSound.autoLoop(true);

    worldSound.position.copy( camera.position );
    //worldSound.play();

    stats = new stats();

    ray = new THREE.Ray();
    ray.origin.y = 10000;
    ray.direction = new THREE.Vector3(0, -1, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.autoClear = false;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}

function addPhysics() {
    bulletWorld = new physicsClient(25);
    bulletWorld.startSim(5);

    var cubeGeometry = new THREE.CubeGeometry(2, 2, 2, 2, 2, 2);
    //add cubes
    for (var i = 0; i < 20; i++) {
        bulletWorld.addCube(2, 5);
        var material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
        var cubeMesh = new THREE.Mesh(cubeGeometry, material );
        scene.addObject(cubeMesh);
        THREE.Collisions.colliders.push(THREE.CollisionUtils.MeshColliderWBox(cubeMesh));
        var i = bulletWorld.sceneBodies.push(cubeMesh) - 1;
        bulletWorld.setPosition(i, Math.random()*50, Math.random()*100, Math.random()*50);
        bulletWorld.setDamping(i, .6, 0);
    }
}

function addTerrain(maxRow, maxColumn, segmentColumn, segmentRow, texture) { 
    data = Terrain.d; //Terrain.generateHeight( worldWidth, worldDepth );

    camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] + 5;
    camera.target.position.y = camera.position.y;

    var geometry = new THREE.PlaneGeometry( 1024, 1024, worldWidth - 1, worldDepth - 1 );


    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
        geometry.vertices[ i ].position.z = data[ i ] * 5;
    }

    var xm = new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( texture, THREE.UVMapping() )}); 
    xm.map.wrapS = THREE.RepeatWrapping;
    xm.map.wrapT = THREE.RepeatWrapping;
    xm.map.needsUpdate = true;
    xm.map.repeat.set(64,64);
    terrainMesh = new THREE.Mesh( geometry, xm );
    terrainMesh.rotation.x = - 90 * Math.PI / 180;
    scene.addObject( terrainMesh );
    THREE.Collisions.colliders.push(THREE.CollisionUtils.MeshColliderWBox(terrainMesh));
}

function addWater(maxRow, maxColumn, segmentColumn, segmentRow, texture) { 
    uniforms = { fogDensity: { type: "f", value: 0.03 },
    time:       { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() },
    texture2:   { type: "t", value: 1, texture: THREE.ImageUtils.loadTexture("images/water1.jpg") }
    };
    uniforms.texture2.texture.wrapS = uniforms.texture2.texture.wrapT = THREE.Repeat;

    var xm = new THREE.MeshShaderMaterial({ uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent, 
        fragmentShader: document.getElementById('fragmentShader').textContent 
    }); 
    var geometry = new THREE.PlaneGeometry( maxRow, maxColumn, segmentColumn, segmentRow );
    var mesh = new THREE.Mesh( geometry, xm );
    mesh.position.set(0,data.min*5 + 20,0);
    mesh.rotation.x = 1.570796;
    mesh.scale.set(1,1,1);
    mesh.doubleSided = true;
    mesh.updateMatrix();
    scene.addObject(mesh);
}

function animate() {
    requestAnimationFrame( animate );
    camera.position.y = Terrain.getHeight(camera.position.x, camera.position.z) + (3 + Math.sin(camera.walkVar)/3);

    render();
}

function render() {
    uniforms.time.value += .02; 
    renderer.render( skybox.scene, skybox.camera );
    renderer.render( scene, camera );
    worldSound.update (camera);
    //updates avatar animations
    //TO:DO Find a better place maybe:?
    for(var i in avatars){
        if(avatars[i] != 1)
            avatars[i].update();
    }
}   

function sleep(milliseconds){
    var start = new Date().getTime();

    for(var i = 0; i < 1 <1e7; i++){
        if((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

