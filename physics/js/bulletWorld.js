bulletWorld = function(n) {
	var self = this;
	this.NUM = n;	//Max number of dynamic Rigid Bodies in the physics engine.

	// Bullet-interfacing code
	this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	this.dispatcher = new Ammo.btCollisionDispatcher(self.collisionConfiguration);
	this.overlappingPairCache = new Ammo.btDbvtBroadphase();
	this.solver = new Ammo.btSequentialImpulseConstraintSolver();
	this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(self.dispatcher, self.overlappingPairCache, 
														self.solver, self.collisionConfiguration);
	self.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
	this.groundShape = new Ammo.btBoxShape(new Ammo.btVector3(1000, 50, 1000));
	this.activeBodies = [];
	this.staticBodies = [];
	this.groundTransform = new Ammo.btTransform();
	self.groundTransform.setIdentity();
	self.groundTransform.setOrigin(new Ammo.btVector3(0, -50, 0));
	
	this.transform = new Ammo.btTransform(); // taking this out of readBulletObject reduces the leaking

	this.quat = new Ammo.btQuaternion(0,0,0);

	bulletWorld.prototype.addStaticBody = function(shape, trans) {
	  var mass = 0;
	  var localInertia = new Ammo.btVector3(0, 0, 0);
	  var myMotionState = new Ammo.btDefaultMotionState(trans);
	  var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, shape, localInertia);
	  var body = new Ammo.btRigidBody(rbInfo);

	  self.dynamicsWorld.addRigidBody(body);
	  self.staticBodies.push(body);
	}

	self.addStaticBody(self.groundShape, self.groundTransform);

	//this.boxShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));
	//this.sphereShape = new Ammo.btSpereShape(1);

	bulletWorld.prototype.addCube = function(dim, mass) {
		if(self.activeBodies.length > self.NUM)
			return;
		var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(dim,dim,dim));
	  	var startTransform = new Ammo.btTransform();
	  	startTransform.setIdentity();
	  	var localInertia = new Ammo.btVector3(0, 0, 0);
	  	boxShape.calculateLocalInertia(mass, localInertia);
	  	var myMotionState = new Ammo.btDefaultMotionState(startTransform);
	  	var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia);
	  	var body = new Ammo.btRigidBody(rbInfo);
	 	self.dynamicsWorld.addRigidBody(body);
	 	self.activeBodies.push(body);
	}
	
	bulletWorld.prototype.addSphere = function(rad, mass) {
		if(self.activeBodies.length > self.NUM)
			return;
		var boxShape = new Ammo.btSphereShape(rad);
	  	var startTransform = new Ammo.btTransform();
	  	startTransform.setIdentity();
	  	var localInertia = new Ammo.btVector3(0, 0, 0);
	    boxShape.calculateLocalInertia(mass, localInertia);
	  	var myMotionState = new Ammo.btDefaultMotionState(startTransform);
	  	var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia);
	  	var body = new Ammo.btRigidBody(rbInfo);
	 	self.dynamicsWorld.addRigidBody(body);
	 	self.activeBodies.push(body);
	}

	bulletWorld.prototype.setLinearVelocity = function(i,x,y,z) {
		if(i < 0 || i >= self.NUM)
			return;
		var body = self.activeBodies[i];
		body.setLinearVelocity(new Ammo.btVector3(x,y,z));
		body.activate();
	}

	bulletWorld.prototype.setAngularVelocity = function(i,x,y,z) {
		if(i < 0 || i >= self.NUM)
			return;
		var body = self.activeBodies[i];
		body.setAngularVelocity(new Ammo.btVector3(x,y,z));
		body.activate();
	}

	bulletWorld.prototype.setPosition = function(i,x,y,z) {
		if(i < 0 || i >= self.NUM)
			return;
		var body = self.activeBodies[i];
		var origin = body.getWorldTransform().getOrigin();
		origin.setX(x);
		origin.setY(y);
		origin.setZ(z);
		body.activate();
	}
	
	bulletWorld.prototype.setRotation = function(i,x,y,z) {
		if(i < 0 || i >= self.NUM)
			return;
		self.quat.setEuler(x,y,z);
		var body = self.activeBodies[i];
		body.getWorldTransform().setRotation(self.quat);
		body.activate();
	}

	bulletWorld.prototype.setDamping = function(i, lin, ang)
	{
		if(i < 0 || i >= self.NUM)
			return;
		var body = self.activeBodies[i];
		body.setDamping(lin,ang);
	}

	bulletWorld.prototype.readBulletObject = function(i, pos, quat) {
		var body = self.activeBodies[i];
		body.getMotionState().getWorldTransform(self.transform);
		var origin = self.transform.getOrigin();
		pos[0] = origin.x();
		pos[1] = origin.y();
		pos[2] = origin.z();
		var rotation = self.transform.getRotation();
		quat.x = rotation.x();
		quat.y = rotation.y();
		quat.z = rotation.z();
		quat.w = rotation.w();
	}

	bulletWorld.prototype.noneActive = function() {
		var num = 0;
		for (var i = 0; i < self.activeBodies.length; i++)
		{
			var body = self.activeBodies[i];
			num += body.isActive();
		}
		return num == 0;
	}

	bulletWorld.prototype.simulate = function(dt) {
		self.dynamicsWorld.stepSimulation(dt,1);
	}
};
