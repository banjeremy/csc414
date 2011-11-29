// Ammo and the bulletWorld wrapper in an easy worker
// @author Eric Mixon

importScripts("ammo.js");
importScripts("bulletWorld.js");
importScripts("pmrpc.js");

var bw;
var lastUpdate;
var now;

pmrpc.register( {
	publicProcedureName : "initWorker",
	procedure : function(NUM) {
		bw = new bulletWorld(NUM);
		lastUpdate = new Date().getTime();
	}
});

pmrpc.register( {
	publicProcedureName : "startSim",
	procedure : function(interval) {
		setInterval(function() {
			now = new Date().getTime();
			bw.simulate(now - lastUpdate);
			lastUpdate = now;
			
			for(var i = 0; i < bw.activeBodies.length; i++)
			{
				var quaternion = {};
				var position = [0,0,0];
				bw.readBulletObject(i,position,quaternion);
				pmrpc.call({
					publicProcedureName : "update",
					params : [i,position,quaternion]
				});
			}
		}, interval);
	}
});

pmrpc.register( {
	publicProcedureName : "addSphere",
	procedure : function(rad, mass) {
		bw.addSphere(rad,mass);
	}
});

pmrpc.register( {
	publicProcedureName : "addCube",
	procedure : function(dim, mass) {
		bw.addCube(dim,mass);
	}
});

pmrpc.register( {
	publicProcedureName : "setLinearVelocity",
	procedure : function(i,x,y,z) {
		bw.setLinearVelocity(i,x,y,z);
	}
});

pmrpc.register( {
	publicProcedureName : "setAngularVelocity",
	procedure : function(i,x,y,z) {
		bw.setAngularVelocity(i,x,y,z);
	}
});

pmrpc.register( {
	publicProcedureName : "setPosition",
	procedure : function(i,x,y,z) {
		bw.setPosition(i,x,y,z);
	}
});

pmrpc.register( {
	publicProcedureName : "setRotation",
	procedure : function(i,x,y,z) {
		bw.setRotation(i,x,y,z);
	}
});

pmrpc.register( {
	publicProcedureName : "setDamping",
	procedure : function(i, lin, ang) {
		bw.setDamping(i, lin, ang);
	}
});

pmrpc.register( {
	publicProcedureName : "noneActive",
	procedure : function() {
		pmrpc.call({
			publicProcedureName: "setStatus",
			params : [bw.noneActive()]
		});
	}
});
