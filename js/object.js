object = function(modelPath) {
    var self = this;
    self.loadComplete = false;
    self.mesh = new THREE.Mesh();
    self.mesh.modelPath = modelPath;

    /**
     * @function
     * @description Loads object model from file. 
     */
    this.load = function() {
        var callbackLoadModel = function (geometry) {
            console.log("loading model " + self.mesh.modelPath);
            self.mesh.geometry = geometry;
            self.mesh.geometry.computeBoundingSphere();
            if(self.mesh.geometry.morphTargets.length > 0){
                self.mesh.materials[0] =  new THREE.MeshLambertMaterial({morphTargets: true, vertexColors: THREE.FaceColors });
            }
            else{
                self.mesh.materials[0] =  new THREE.MeshFaceMaterial();

            }
            objects[self.mesh.modelPath] = self.mesh;
            self.loadComplete = true;
            self.afterLoad();
        };
        loader.load( { 
            model: self.mesh.modelPath,
            callback: callbackLoadModel } );
    }
    
    this.newInstance = function() {
        var mesh = new THREE.Mesh(self.mesh.geometry, self.mesh.materials[0]);
        scene.addObject(mesh);
        var mc = THREE.CollisionUtils.MeshOBB(mesh);
        THREE.Collisions.colliders.push(mc);
        return mesh;
    }

    this.afterLoad = function() { }

    //self.load();
};
