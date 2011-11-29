physicsClient = function(n)
{
	var self = this;
	this.NUM = n;
	this.sceneBodies = [];
	this.inActive = false;
	this.pw = new Worker("./physics/js/physicsWorker.js");

	pmrpc.register( {
		publicProcedureName : "setStatus",
		procedure : function(stat) {
			self.inActive = stat;
		}
	});

	pmrpc.register( {
		publicProcedureName : "update",
		procedure : function(i, position, quaternion) {
			self.sceneBodies[i].position.x = position[0];
			self.sceneBodies[i].position.y = position[1];
			self.sceneBodies[i].position.z = position[2];
			self.sceneBodies[i].quaternion = quaternion;
			self.sceneBodies[i].useQuaternion = true;
		}
	});

	pmrpc.call( {
		destination : self.pw,
		publicProcedureName : "initWorker",
		params : [self.NUM]
	} );

	physicsClient.prototype.startSim = function(i) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "startSim",
			params : [i]
		} );
	};

	physicsClient.prototype.addCube = function(dim,mass) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "addCube",
			params : [dim,mass]
		} );
	};

	physicsClient.prototype.addSphere = function(rad,mass) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "addSphere",
			params : [rad,mass]
		} );
	};	
	physicsClient.prototype.setLinearVelocity = function(i,x,y,z) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "setLinearVelocity",
			params : [i,x,y,z]
		} );
	};
	
	physicsClient.prototype.setAngularVelocity = function(i,x,y,z) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "setAngularVelocity",
			params : [i,x,y,z]
		} );
	};
	
	physicsClient.prototype.setPosition = function(i,x,y,z) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "setPosition",
			params : [i,x,y,z]
		} );
	};

	physicsClient.prototype.setRotation = function(i,x,y,z) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "setRotation",
			params : [i,x,y,z]
		} );
	};
	
	physicsClient.prototype.setDamping = function(i,lin,ang) {
		pmrpc.call( {
			destination : self.pw,
			publicProcedureName : "setDamping",
			params : [i,lin,ang]
		} );
	};
	
	physicsClient.prototype.noneActive = function() {
		pmrpc.call({
			destination : self.pw,
			publicProcedureName: "noneActive"
		} );
	};
};
