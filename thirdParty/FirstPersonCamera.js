/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 *
 * parameters = {
 *  fov: <float>,
 *  aspect: <float>,
 *  near: <float>,
 *  far: <float>,
 *  target: <THREE.Object3D>,

 *  movementSpeed: <float>,
 *  lookSpeed: <float>,

 *  noFly: <bool>,
 *  lookVertical: <bool>,
 *  autoForward: <bool>,

 *  constrainVertical: <bool>,
 *  verticalMin: <float>,
 *  verticalMax: <float>,

 *  heightSpeed: <bool>,
 *  heightCoef: <float>,
 *  heightMin: <float>,
 *  heightMax: <float>,

 *  domElement: <HTMLElement>,
 * }
 */

THREE.FirstPersonCamera = function ( parameters ) {

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );

    this.walkVar = 0.01;
	
    this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.noFly = false;
	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = 3.14;

	this.domElement = document;

	this.lastUpdate = new Date().getTime();
	this.tdiff = 0;

	if ( parameters ) {

		if ( parameters.movementSpeed !== undefined ) this.movementSpeed = parameters.movementSpeed;
		if ( parameters.lookSpeed !== undefined ) this.lookSpeed  = parameters.lookSpeed;
		if ( parameters.noFly !== undefined ) this.noFly = parameters.noFly;
		if ( parameters.lookVertical !== undefined ) this.lookVertical = parameters.lookVertical;

		if ( parameters.autoForward !== undefined ) this.autoForward = parameters.autoForward;

		if ( parameters.activeLook !== undefined ) this.activeLook = parameters.activeLook;

		if ( parameters.heightSpeed !== undefined ) this.heightSpeed = parameters.heightSpeed;
		if ( parameters.heightCoef !== undefined ) this.heightCoef = parameters.heightCoef;
		if ( parameters.heightMin !== undefined ) this.heightMin = parameters.heightMin;
		if ( parameters.heightMax !== undefined ) this.heightMax = parameters.heightMax;

		if ( parameters.constrainVertical !== undefined ) this.constrainVertical = parameters.constrainVertical;
		if ( parameters.verticalMin !== undefined ) this.verticalMin = parameters.verticalMin;
		if ( parameters.verticalMax !== undefined ) this.verticalMax = parameters.verticalMax;

		if ( parameters.domElement !== undefined ) this.domElement = parameters.domElement;

	}

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.windowHalfX = window.innerWidth / 2;
	this.windowHalfY = window.innerHeight / 2;

	this.onMouseDown = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;

			}

		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		this.mouseX = event.clientX - this.windowHalfX;
		this.mouseY = event.clientY - this.windowHalfY;

	};

	this.onKeyDown = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

    
			//case 81: this.freeze = !this.freeze; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
    
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

		}

	};

	this.checkCollision = function (direction) {
		var c = false;
        c = THREE.Collisions.rayCastNearest(new THREE.Ray(this.position, direction));
		if (c)
			//console.log(c.distance);
		if (!c || c.distance > 3) {
			//no collision, allow movement
			return false;
    
		}
		else {
			//collision, check class
			return true;
		}
	}
	
	this.checkClass = function (mesh) {
		switch(mesh.type) {
			case 0:
				//allow movement
				return false;
				break;
			case 1:/*WALL*/
				//do not allow movement
				return true;
				break;
			case 3:/*cube*/
				//do cube action
				scene.fog = new THREE.FogExp2( 0x000000, 0.05 );
				scene.removeObject(mesh);
				return false;
				break;
			default:
				break;
		}

	}
	
	this.update = function() {

		var now = new Date().getTime();
		this.tdiff = ( now - this.lastUpdate ) / 1000;
		this.lastUpdate = now;
		
		if ( !this.freeze ) {


			if ( this.heightSpeed ) {

				var y = clamp( this.position.y, this.heightMin, this.heightMax ),
					delta = y - this.heightMin;

				this.autoSpeedFactor = this.tdiff * ( delta * this.heightCoef );

			} else {

				this.autoSpeedFactor = 0.0;

			}

			var actualMoveSpeed = this.tdiff * this.movementSpeed;
			var actualLookSpeed = this.tdiff * this.lookSpeed;

			if ( this.moveForward || this.autoForward ) { 
				//TODO: move this code out of the camera.
                if (!this.checkCollision(new THREE.Vector3(Math.sin(this.dir), 0, Math.cos(this.dir)))) {
					this.walkVar += 0.15;
                //END
                    this.translateZ( - ( this.movementSpeed + this.autoSpeedFactor ) );
                    networking.sendUpdate();
                }
			}
			
			else if ( this.moveBackward ) {
				if (!this.checkCollision(new THREE.Vector3(Math.sin(this.dir), 0, Math.cos(this.dir)).negate()))	
					this.walkVar -= 0.15;
					this.translateZ( this.movementSpeed );
                    networking.sendUpdate();
			}	
			
			if ( this.dragToLook && !this.mouseDragOn && !(this.moveLeft || this.moveRight)) {
				actualLookSpeed = 0;
			}
			else if(this.moveRight || this.moveLeft){ 
			//512
			//MY EDITION - ERIC

			if( this.moveLeft ){
				this.lon -= 100 * this.lookSpeed;
                networking.sendUpdate();
			}
			if( this.moveRight ){
				this.lon += 100 * this.lookSpeed;
                networking.sendUpdate();
			}

			actualLookSpeed = 0;
			//END
		}	

			this.lon += this.mouseX * actualLookSpeed;
			if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed;

			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			this.phi = ( 90 - this.lat ) * Math.PI / 180;
			this.theta = this.lon * Math.PI / 180;

            var targetPosition = this.target.position,
				position = this.position;

			targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
			targetPosition.y = position.y + 100 * Math.cos( this.phi );
			targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

			this.dir = Math.PI / 2 - (this.lon * (Math.PI / 180));
		    
            //TODO: move this code out of the camera
            skybox.camera.target.position.x = this.target.position.x + Math.sin(this.dir) * 2000;
            skybox.camera.target.position.z = this.target.position.z + Math.cos(this.dir) * 2000;
            skybox.camera.target.position.y = 200 - (this.lat*50);
            //END
        }

		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;

		if ( this.constrainVertical ) {

			this.phi = map_linear( this.phi, 0, 3.14, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target.position,
			position = this.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

        this.position.y 
        
        this.supr.update.call( this );

	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	//this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	//this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	//this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind ( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	function map_linear( x, sa, sb, ea, eb ) {

		return ( x  - sa ) * ( eb - ea ) / ( sb - sa ) + ea;

	};

	function clamp_bottom( x, a ) {

		return x < a ? a : x;

	};

	function clamp( x, a, b ) {

		return x < a ? a : ( x > b ? b : x );

	};
	

	
};


THREE.FirstPersonCamera.prototype = new THREE.Camera();
THREE.FirstPersonCamera.prototype.constructor = THREE.FirstPersonCamera;
THREE.FirstPersonCamera.prototype.supr = THREE.Camera.prototype;


THREE.FirstPersonCamera.prototype.translate = function ( distance, axis ) {

	this.matrix.rotateAxis( axis );

	if ( this.noFly ) {

		axis.y = 0;

	}

	this.position.addSelf( axis.multiplyScalar( distance ) );
	this.target.position.addSelf( axis.multiplyScalar( distance ) );

};
