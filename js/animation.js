/**
* @class Defines methods and properties for morph animation.
*
* @constructor
*
* @param {THREE.Mesh} mesh The mesh containing the morphTargets.
* @param {Int} duration The duration of each frame of the idle animation.
* @param {Int} keyframes The number of frames in the idle animation.
* @param {Int} startFrame 
*
* @author jjones 
* @author astricklin
*/
animation = function (mesh, duration, keyframes, startFrame) {
    var self = this;

    self.mesh = mesh;
    self.modes = {
        "idle": {
            "duration":duration,
            "keyframes":keyframes,
            "startFrame":startFrame,
            "repeat":true
        }
    };
    self.duration = self.modes.idle.duration;
    self.keyframes = self.modes.idle.keyframes;
    self.startFrame = self.modes.idle.startFrame;
    self.repeat = true;
    self.interpolation = self.modes.idle.duration / self.modes.idle.keyframes;
    self.lastKeyframe = 0;
    self.currentKeyframe = 0;
    self.animateTimer = 0;

    /**
     * @function
     * @description Animates the avatar. Changes depending on the current mode.
     */
    self.animate = function() {


        self.animateTimer += 120;

        //time for next frame?
        if ( (Math.floor((self.animateTimer%self.duration) / self.interpolation) + self.startFrame) != self.currentKeyframe) { 

            self.mesh.morphTargetInfluences[ self.lastKeyframe ] = 0;
            self.mesh.morphTargetInfluences[ self.currentKeyframe ] = 1;
            self.mesh.morphTargetInfluences[ Math.floor((self.animateTimer %self.duration) / self.interpolation) + self.startFrame ] = 0;

            self.lastKeyframe  = self.currentKeyframe;
            self.currentKeyframe = Math.floor((self.animateTimer %self.duration) / self.interpolation) + self.startFrame;
        }

        self.mesh.morphTargetInfluences[Math.floor( (self.animateTimer %self.duration ) / self.interpolation  ) + self.startFrame ] = ( (self.animateTimer %self.duration ) % self.interpolation  ) / self.interpolation ;
        self.mesh.morphTargetInfluences[ self.lastKeyframe  ] = 1 - self.mesh.morphTargetInfluences[ Math.floor( (self.animateTimer %self.duration ) / self.interpolation  ) + self.startFrame ];

        //has the mode finished?
        if (self.currentKeyframe == (self.startFrame + self.keyframes -1) && !self.repeat) {
            self.setMode("idle");
        }
    };

    /*
     * @function
     * @description Changes the current mode of the animation.
     *
     * @param {String} mode The name of the new mode.
     */
    self.setMode = function(mode) {
        var a = self.modes[mode];
        self.keyframes = a.keyframes;
        self.duration = a.duration;
        self.startFrame = a.startFrame;
        self.interpolation = a.duration / a.keyframes;
        self.repeat = a.repeat;
    };   

    /*
    * @function
    * @description Changes the current mode of the animation.

    * @param {String} name The name of the mode.
    * @param {Int} duration The duration of each frame of the new mode.
    * @param {Int} keyframes The number of frames in the mode.
    * @param {Int} startFrame The beginning frame of the mode.
    * @param {Boolean} repeat If false, mode will return to idle after cycle.
    */
    self.addMode = function(name, duration, keyframes, startFrame, repeat) {
        self.modes[name] = { 
            "duration":duration,
            "keyframes":keyframes,
            "startFrame":startFrame,
            "repeat":repeat
        };
    };
    self.update = function() { }
};
