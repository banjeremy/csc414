/**
 * @class Defines methods and properties for general weapons.
 * @author jjones 
 * @constructor
 * @param stats Url of weapon statistics file.
 */
Weapon = function() {
    var self = this;
    self.sphereMaterial;
    self.sphereGeometry;
    self.sphereMeshes = new Array();
    self.sphereBodies = new Array();
    self.projectileSpeed = 100;
    self.spray = 1;
    
    // BULLETS
    self.projectileSound = new Sound( 'sounds/source_engine/weapons/smg1/smg1_fireburst1.wav', 500, 1);
    // self.projectileSound = new Sound( 'http://banjeremy.com/~bwolfe/sounds/source_engine/weapons/rpg/rocketfire1.wav', 500, 10);
    
    self.init = function() {
        //add sphere 
        bulletWorld.addSphere(.1, 1);
        self.sphereMaterial = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
        self.sphereGeometry = new THREE.SphereGeometry(.2, 0, 0);
        self.sphereMesh = new THREE.Mesh( self.sphereGeometry, self.sphereMaterial );
        self.sphereBody = bulletWorld.sceneBodies.push(self.sphereMesh) - 1;

        scene.addObject(self.sphereMesh);
    }
    /**
     * @function Loads weapon statistic data from stat file
     *
     * @param {string} url The URL of the file to load.
     */
    self.loadStatsFromFile = new function(url) {

    }
    
    self.fire = function(dir) {
        //remove oldest sphere from ammo
        //how do we get the ammo index of oldest sphere? 
        //add new sphere to ammo

        dir.multiplyScalar(self.projectileSpeed);
        
        bulletWorld.setPosition(self.sphereBody, 
                                camera.position.x,
                                camera.position.y,
                                camera.position.z);
        bulletWorld.setLinearVelocity(self.sphereBody,
                                      dir.x,
                                      dir.y,
                                      dir.z);
        bulletWorld.setDamping(self.sphereBody, .3, 0);
	// PLAY BULLETS
	self.projectileSound.play();
    }
    self.init();
};
