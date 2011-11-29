/**
 * @class stats
 * Holds deaths and health, will be linked to networking
 * @author bwolfe
 */
stats = function() {
	var self = this;
	self.health = 480;
	self.deaths = 0;
	self.healthBox = 502;
	//Added by Lsears
	self.numKills = 0;
	var d = document.getElementById('kdBox');
	d.lastChild.textContent = self.numKills + " kills / " + self.deaths + " deaths";
	self.hit = function( who,amount ) {
	    self.health -= amount;
		var d = document.getElementById('healthBar')
		d.style.width = self.health + "px";
	    if (self.health <= 0) {
		self.die();
		networking.sendKill(who);
	    }
	}
	
	self.die = function() {
		self.deaths += 1;
		var d = document.getElementById('kdBox');
		d.lastChild.textContent = self.numKills + " kills / " + self.deaths + " deaths";
		console.log("Player has died.");
	    self.respawn();
	}
	
	self.respawn = function() {
	    self.health = 480;
		var d = document.getElementById('healthBar')
		d.style.width = self.health + "px";
	}
	/*added by Lsears*/
	self.killcount = function() {
	    self.numKills += 1;
	    console.log("You have " + self.numKills + " kills so far");
		var c = document.getElementById('kdBar');
		c.style.width = (19 * self.numKills) + "px";
		var d = document.getElementById('kdBox');
		d.lastChild.textContent = self.numKills + " kills / " + self.deaths + " deaths";
	    if(self.numKills == 25){
			console.log("You win!!");
			alert("You win!!!");
			c.style.width = 0 + "px";
		}
	}
};
