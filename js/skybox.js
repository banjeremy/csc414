Skybox = function(url) {
    var self = this;
    self.scene; 
    self.camera;
    self.cubeTexture;
    self.shader;
    self.material;
    self.mesh;

    self.loadSkyTextureFromPath = function(url) {
        //var path = "images/skyboxes/clear/";
        var path = url;
        var format = '.jpg';
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];
        
        return urls;
    };
    
    this.init = function(url) {
        self.scene = new THREE.Scene();
        self.camera = new THREE.Camera(50, window.innerWidth / window.innerHeight, 1, 100000);
        self.cubeTexture = THREE.ImageUtils.loadTextureCube( self.loadSkyTextureFromPath(url), new THREE.CubeRefractionMapping() );
        self.shader = THREE.ShaderUtils.lib["cube"];
        self.shader.uniforms["tCube"].texture = self.cubeTexture;
       
        self.material = new THREE.MeshShaderMaterial( {
            fragmentShader: self.shader.fragmentShader,
            vertexShader: self.shader.vertexShader,
            uniforms: self.shader.uniforms
        } );
     
        self.mesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), self.material );
        self.scene.addObject( self.mesh );
    }
    
    self.init(url);
}
