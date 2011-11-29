/**
 * @class Sound triggers, work in progress
 * @author bwolfe 
 */

Sound = function (sources, radius, volume) {
	var self = this;
	var audio = document.createElement( 'audio' );
	// audio.autoplay;
	var source = document.createElement( 'source' );
	
	source.src = sources;
	audio.appendChild( source );
	
	
	self.position = new THREE.Vector3();
	
	self.play = function () {
		audio.play();
	}

	self.update = function ( camera ) {
	    
		var distance = self.position.distanceTo( camera.position );
		
		if ( distance <= radius ) {
			audio.volume = volume * ( 1 - distance / radius );

		} 
		
		else {
			audio.volume = 0;
		}
		
	}
	
	self.autoLoop = function ( repeat ) {
	    
	    audio.loop = repeat
	}
};
