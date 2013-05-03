/**  
 *  Copyright Andrea Muttoni
 *            Davide Ganito
 *            www.vas.it
 *  
 *  MIT Licensed
 *
 *  Inspired by the jsfiddle of Camilo Martin
 *  stackoverflow.com/a/10139720/2082700
 *
 *  contact: andrea@vas.it
 *
 *  usage: 
 *
 *  var sprite = new Animite( element, data );
 *  
 *  sprite.play(); // the sprite will animate
 *  sprite.pause(); // the sprite will stop animating and retain position
 *  sprite.stop() ; // the sprite will stop animating and seek to 0:00
 *  
 *  sprite.fps = 25; // the animation's fps will change real-time
 *  sprite.now; // will give you the current position of the film (updated every frame)
 *  sprite.now = 20; // will seek the video to 20% of the total play-time
 */

var Animite = function(element, film) {
    
    var self = this;

    var timeout = null;
    var currentReel = null;
    var currentReelPos = 0;
    var lastStep = 0;

    // reels assumed to have ~equal dimensions
    var framesPerReel = film.reels[0].frames;

    // assign observable variables
    self.height = film.height;
    self.width = film.width;
    self.currentFrame = 0;
    self.fps = film.fps || 25;
    self.onEnterFrame = null;
    self.currentStep = 0;
    self.keyFrames = {};
    self.enabledTracks = [];
    self.preloaded = { 
        "reels" : [], 
        "frames" : 0, 
        "percent" : 0 
    };

    // get total frameCount (for global play position)
    self.totalFrames = (function() {
        var tot = 0;
        for (var i = 0; i < film.reels.length; i++) {
            tot += film.reels[i].frames;
        } return tot;
    })();

    // prepare element
    element.style.height = film.height + 'px';
    element.style.width = film.width + 'px';
    element.style.backgroundRepeat = 'no-repeat';

    // preload reels
    for (var i = 0; i < film.reels.length; i++) {
        var reel = film.reels[i];
        reel.cache = new Image();
        reel.cache.src = reel.path;
        reel.cache.onload = function() {
            self.preloaded.reels.push(reel.path);
            self.preloaded.frames += reel.frames;
            self.preloaded.percent += reel.frames / self.totalFrames * 100;
        }
    }

    // setter and getter for "now" (the observable playback indicator) 
    Object.defineProperty( self, 'now', {
        get : function() { return self.currentFrame / self.totalFrames * 100 },
        set : function( value ) {
            self.seek( ((value*self.totalFrames+0.5) / 100) | 0, self.currentStep || 0 );
        }
    });


    self.seek = function(frame, step ) {

        /**
         *  Core animating function
         *
         *  Inputs:
         *
         *    frame = which frame to show
         *    step  = next increment
         *
         *  Example:
         *  
         *    sprite.seek(0, 1);
         *
         *    The above will start the animation from
         *    frame 0, and go forwards in time by 1 frame
         *    at the specified framerate (fps).
         *
         *
         *    sprite.seek(20, -1);
         *
         *    The above will start the animation from
         *    frame 20, and go backwards in time by 1 frame
         *    at the specified framerate (fps).
         */

        clearTimeout(timeout);

        self.currentStep = step;
        frame = frame || 0;

        // update current seeking position
        self.currentFrame = frame >= 0 
                            ? frame % self.totalFrames 
                            : (self.totalFrames - 1) + frame % self.totalFrames;
        
        changedReel = currentReel !== (self.currentFrame/framesPerReel | 0);
        currentReel = self.currentFrame/framesPerReel | 0;
        currentReelPos = self.currentFrame % framesPerReel;

        var reel = film.reels[currentReel];
        var x = (currentReelPos * film.width) % reel.width;
        var y = film.height * ((currentReelPos * film.width / reel.width) | 0);

        if ( changedReel ) {
            if ( reel.cache ) {
                element.style.backgroundImage = "url('"+reel.cache.src+"')";
            } else {
                element.style.backgroundImage = "url('"+reel.path+"')";
            }
        }

        element.style.backgroundPosition = '-'+x+'px -'+y+'px';

        // debug
        //element.innerText = self.currentFrame;

        // if there is a callback associated with onEnterFrame, execute it.
        if ( self.onEnterFrame && typeof self.onEnterFrame === 'function' ) {
            self.onEnterFrame.call( self );
        }

        var tracks = self.keyFrames[self.currentFrame];
        var keyframe;
        for( trackName in tracks ) {
            keyframe = tracks[trackName];
            if ( self.enabledTracks.indexOf(trackName) >= 0 && keyframe && keyframe.callbacks && keyframe.callbacks instanceof Array ) {
                for( var i = 0, len = keyframe.callbacks.length; i < len; i++ ) {
                    keyframe.callbacks[i].call( this, keyframe );
                }
            }       

        }

        // if a next step is specified, seek() with that step
        if ( step ) {
            timeout = setTimeout(function() { self.seek(frame+step, step); }, (1000/self.fps)|0);
        }
    }; 

    // go to first frame upon instantiation
    self.seek(0);

    /**
     *  PLAYBACK CONTROLS
     */

    self.play = function(callback) {
        

        self.seek( self.currentFrame, lastStep ? lastStep : 1 );
        
        // execute callback
        if ( callback ) callback();
    };

    self.pause = function(callback) {
        
        lastStep = self.currentStep;
        self.seek( self.currentFrame );
    
        // execute callback
        if ( callback ) callback();
    };

    self.stop = function(callback) {

        self.seek(0);

        // execute callback
        if ( callback ) callback();
    };
};

Animite.prototype = Object.create( Object.prototype );


Animite.prototype.addKeyFrame = function( frame, track, comment, callback ) {
    // Adds a keyframe, using the KeyFrame object
    if ( !this.keyFrames[frame] ) { this.keyFrames[frame] = {}; }
    this.keyFrames[frame][track] = new KeyFrame( comment, [callback] )
};

Animite.prototype.frameToPos = function( frame ) {
    // converts frame to playback position (%)
    return frame/this.totalFrames*100;
};

Animite.prototype.posToFrame = function( position ) {
    // converts playback position (%) to closest frame
    return (position/100*this.totalFrames+0.5)|0;
};

Animite.prototype.frameToTime = function( frame ) {
    // converts frame to seconds elapsed
    return frame/this.fps;
};

Animite.prototype.timeToFrame = function( seconds ) {
    // converts seconds to closest frame
    return (seconds*this.fps+0.5)|0;
};

function KeyFrame( comment, callbacks ) {
    this.comment = comment || "";
    this.callbacks = callbacks || [];
}

KeyFrame.prototype = Object.create( Object.prototype );
