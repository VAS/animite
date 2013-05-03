Animite v0.1
=======


###Mission
Animite comes from the union of two words: _**anim**ated_ and _spr<b>ite</b>_. Animite's goal is to provide a __flexible__, __codec-less__ way to deal with video on the web, with __no HTML5__ or __Flash__, without sacrificing _efficiency_, _flexibility_ and _versatility_.

It boasts fast, high precision seeking, natively variable (even on the fly) playback direction, speed and framerate. Please check out the demo for more information (coming soon). 

Typical CPU usage is about 60% lower when using Animite compared to a Flash video, and has the advantage of not depending on GPU acceleration. It is especially targeted for, and tested on low-end machines.

**IMPORTANT**: _Audio is **currently** not supported_. However, please know it's our #1 priority and are currently working on it. If you have an idea, or would like to contribute, please __FORK__ :)

##Features

###Benefits over traditional video
- Pure Javascript, CSS & HTML
- Codec-free
- Framework independent
- Keyframes, keyframes, keyframes!
- _Fast_ and accurate playback/seeking control
- Flexible playback direction (can play _backwards_ as easily as it plays _forward_)
- Flexible framerate (can be changed as the video plays) ```film.fps = 30; // BAM!```
- Completely stylable with CSS (border-radius, inset box-shadow, opacity, etc)
- Smaller in size than an equivalent AVI or Animated GIF
- Transparency (alpha/opacity) support!
- Browser zoom in/out support

###Playback controls
- Play forwards/backwards
- Pause
- Stop
- Change framerate on-the-go (fps)
- Change frame increment on-the-go (skipping)
- Seeking (precise to frame)

###How it works
Animite works by rapidly moving a single image containing several frames using the CSS ```background-position``` property of any containing element. This image is traditionally called a sprite sheet. We, avid film fanatics, call it a __reel__. 

For short clips, typically in-game sprite animations, one reel is more than enough to contain all the necessary frames, and standard animated sprite frameworks stop here on this assumption. But we want more.

For longer clips, fitting all frames in one image would require too much memory.
We therefore distribute frames across several __reels__, supporting preloading and at the same time optimizing browser memory consumption.  Several reels also offer flexible video buffering and efficient jpeg/png compression across several frames.

###When should I use it?
Animite is perfect if you want to include videos/clips/sprites on a page, you don't need audio, and you don't feel the HTML+FLASH overhead is justified, and you would like complete control.

##Usage

###Initialization
```javascript
var film = new Animite(div, data);
```
- ```div``` is the HTML element that Animite will use to display ```film```. The only requirement is that the element must be able to contain a background.
- ```data``` is a JSON containing general information. Please read the __How to convert a video for Animite__ section to understand what is required.

###Playback
```javascript
film.play();   // can receive a callback as parameter
film.stop();   // can receive a callback as parameter
film.pause();  // can receive a callback as parameter

film.now;      // returns the current seek position
film.now = 20; // will seek the video to 20% of the total play-time
```

###Seek
The __seek__ function is the underlying core of Animite. ```film.play```, ```film.pause```, ```film.stop``` and ```film.now``` are all built on top of ```film.seek```.

It takes 2 parameters: ```film.seek(frame, step)```.
- ```frame``` = which frame to show
- ```step```  = next increment

```javascript 
film.seek(0, 1);
// The above will start the animation from
// frame 0, and progress by 1 frame
// at the specified framerate (fps).

film.seek(20, -1);
// The above will start the animation from
// frame 20, and go in reverse by 1 frame
// at the specified framerate (fps).

film.seek(36, 0);
// The above will seek to frame 36 and pause
```

We encourage developers to implement their own player & controls using Animite's very simple API and core functions.
You can however find an example HTML page where a player, some controls, and subtitle display have been implemented.


###Keyframes
One of Animite's great advantages is keyframe support. With keyframes you can do anything, from adding subtitle cues, to affecting a page or the video itself in any way!

It includes:
- Multiple keyframe __channels__ support
- Makes it simple to link to any external script
- __Subtitle support__
  * included .SRT (SubRip) parser/converter (check utils), but you can use your own!

####Adding KeyFrames
Keyframes can easily be added using: ```film.addKeyFrame(frame, track, comment, callback)```

```addKeyFrame``` takes 4 parameters:
- ```frame``` : frame number (int)
- ```track``` : keyframe channel (organize your keyframes in categories)
- ```comment``` : general text or comment to store relative to this keyframe
- ```callback``` : add a function to be called __when keyframe is played__.

Example:

```Javascript
// adds a keyframe at frame 85, and saves the comment.
film.addKeyFrame(85, 'todo', 'Remember to edit this out'); 


// you can also add a callback
film.addKeyFrame(124, 'todo', 'Needs a transition', function(){
	// affect my view, send triggers, etc here
});
```

We could also define a custom ```addKeyFrame``` function on our page:
```javascript
function addKeyFrame(frame, track, content, callback) {
    film.addKeyFrame(frame, track, content, callback);
    // affect the view here
}
```
If we had a seek bar for example, we could visually add an element to show where the added keyframes are located! You can see this in action in the demo.

###Preloading
Animite offers accurate preloading states
```javascript 
film.preloaded.reels; // returns an array of _currently_ preloaded reels
film.preloaded.frames; // returns the number of loaded frames (number)
film.preloaded.percent; // returns current preloaded percent from 0 to 100
```

Example:
```javascript
// Please don't use this...but you get the idea
while(film.preloaded.percent < 100) {
	// manage your preloading view states here
}
```

###Conversion functions

####Time < > Frame
```javascript
film.timeToFrame(100); // e.g. 2400 at 24 fps
// returns the frame # where the 100th second of playback occurs

film.frameToTime(2400);  // e.g. 100 (seconds) at 24 fps
// returns amount of elapsed seconds from frame 0 and 2400th frame (at current frame-rate)
```

####Frame < > Position
```javascript
film.frameToPos(100); // e.g. 50 (%) [if total frame count is 200]
// returns the current position

film.posToFrame(50);  // e.g. 100 (seconds) [if total frame count is 200]
// returns the frame closest to exactly 50% of playback
```


##How to convert a video for Animite

Animite needs **reels** to work. A reel is nothing more than one large image containing all of the single frames of a video clip. You can split long clips into several reels. It is up to you to find the optimal reel/frame ratio based on your bandwidth requirements / memory consumption.

A part from the fancy name, reels are nothing more than a JPEG or PNG image. For best compression, remember to use
 - ```JPEG``` for *photo*-like images
 - ```PNG``` for *vector*-like images, or if _transparency is **required**_.
 - Animite supports frames on multiple lines within a reel, so try to make the image as square as possible (avoid excessively wide or tall reels.) This will reduce overall memory consumption.

###Any-2-Reel, the Reel generator.
We have implemented our own Reel generator (a simple PHP script), and it should work on any system with a command-line, PHP, [FFMPEG](http://www.ffmpeg.org) and ImageMagick [Montage](http://www.imagemagick.org/script/montage.php).

Please note that **Animite also requires a JSON file** to understand your reel structure. While our ```any2reel``` script automatically generates one, should you implement your own reel generator, you will need to either write the JSON manually or automatically.

The generalized JSON format for Animite is the following: 

```javascript

{
	width : VIDEO_WIDTH,   // number (int)
	height: VIDEO_HEIGHT,  // number (int)
	fps : VIDEO_FRAMERATE, // number (float) frames-per-second
	reels : [              // array of reel objects
		{
			frames : NUMBER_OF_FRAMES_IN_REEL, // number (int)
			width : PIXEL_WIDTH_OF_REEL,       // number (int)
			path : PATH_TO_REEL                // string
		}
	]
}

```

You will notice that each reel requires ```frames```, ```width```, and ```path```.
- ```frames``` is the number of frames contained in that particular reel.
- ```width``` is width of the reel (in pixels), so that Animite knows when to go to the next line of frames
- ```path``` is a simple path to the image. If you have ```reel.jpg``` in a ```reels/``` directory, all you need to do is write: ```"reels/reel.jpg"``` for example. Think of it as a ```src``` tag (we might consider renaming it).

A typical JSON: 

```javascript
var data = {
	width: 640,   // px
	height: 360,  // px
	fps : 23.976, // 23.976 is the standard for US film
	reels : [     // array of reel objects
		{ 
			frames: 30, 	    // number of frames in this reel
			width:2560, 	    // pixel width of this reel
			path:"reel.1.jpg"   // path to reel
		},
		{ 
			frames: 30, 	    // number of frames in this reel
			width: 2560, 	    // pixel width of this reel
			path:"reel.2.jpg"   // path to reel
		},
		{ 
			frames: 30, 	    // number of frames in this reel
			width:2560, 	    // pixel width of this reel
			path:"reel.3.jpg"   // path to reel
		}	
    ]
};
```

Once you have the JSON, all you need to do is:
```javascript
// select film container
var div = document.getElementById('film-container');

// initialize film
var film = new Animite(div, data);

film.play(); // easy as that.
```

##Docs

###Playback
 ``` film.play(callback) ``` 

 ``` film.pause(callback) ``` 

 ``` film.stop(callback) ``` 

 ``` film.seek(frame, step) ``` 

 ``` film.now ``` 


###Framerate
 ``` film.fps ``` 


###Preloading
 ``` film.preloaded ``` 

 ``` film.preloaded.reels ``` 

 ``` film.preloaded.frames ``` 

 ``` film.preloaded.percent ``` 


###Keyframes
 ``` film.addKeyFrame(frame, track, comment, callback) ``` 


###Utility functions
 ``` film.timeToFrame(seconds) ``` 

 ``` film.frameToTime(frame) ``` 

 ``` film.frameToPos(frame) ``` 

 ``` film.posToFrame(position) ``` 
