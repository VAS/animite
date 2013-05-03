/**  
 *  Copyright Andrea Muttoni
 *            www.vas.it
 *  
 *  MIT Licensed
 *
 *
 *  contact: andrea@vas.it
 */

var SRT = function( file ){
	var self = this;
	if(file) {
		return self.parse(file);
	}
};

SRT.prototype.parse = function( file ) {

	if( /\r/.test(file) ) {
		file = file.replace(/\r/g, "");
	}

 	var srt = file.split("\n\n");

	for (var i = 0, len = srt.length; i < len; i++) {

		var fragments = srt[i].split("\n");

		srt[i] = { 
			"id" : parseInt(fragments[0]),
			"time" : parseTime(fragments[1]),
			"content" : fragments.splice(2)
		};
	}

	return srt;

	function parseTime( timeString ) {

		// regexp
		var regexp = /([0-9]*):([0-9]*):([0-9]*),([0-9]*) --> ([0-9]*):([0-9]*):([0-9]*),([0-9]*)/;
		var time = new RegExp( regexp ).exec(timeString);


		// start time
		var startHours = parseInt(time[1]) * 3600;
		var startMinutes = parseInt(time[2]) * 60;
		var startSeconds = parseInt(time[3]);
		var startMillisecs = Math.round(parseInt(time[4]))/1000;
		//--------------------------------------------------------
		var startTime = startHours + startMinutes + startSeconds + startMillisecs;


		// end time
		var endHours = parseInt(time[5]) * 3600;
		var endMinutes = parseInt(time[6]) * 60;
		var endSeconds = parseInt(time[7]);
		var endMillisecs = Math.round(parseInt(time[8]))/1000;
		//--------------------------------------------------------
		var endTime = endHours + endMinutes + endSeconds + endMillisecs;

		
		// duration
		var duration = Math.round( (endTime - startTime) * 1000)/1000;
		

		// result
		var timeObj = { "start" : startTime, "end" : endTime, "duration" : duration };
		
		return timeObj;
	}
};

SRT.prototype.stringify = function( srt ) {

	if( !srt ) srt = this;
	
	var string = '';
 	
 	for(var i = 0, len = srt.length; i < len; i++) {
 		string += srt[i].id+'\n'+
 				  stringifyTime(srt[i].time)+'\n'+
 				  srt[i].content.join("\n")+
 				  '\n\n';
 	}

 	return string;

 	function stringifyTime( timeObj ) {
 		var start = timeObj.start;
 		var end = timeObj.end;

	 	startHours = parseInt( start / 3600 ) % 24;
	 	startMinutes = parseInt( start / 60 ) % 60;
	 	startSeconds = parseInt( start ) % 60;
	 	startMillisecs = parseInt(( start - (start|0))*1000+0.5 );
	 	startTime = (startHours < 10 ? "0"+startHours : startHours) + ":" + 
	 				(startMinutes < 10 ? "0"+startMinutes : startMinutes) + ":" + 
	 				(startSeconds < 10 ? "0"+startSeconds : startSeconds) + "," +
	 				(startMillisecs < 10 ? "00"+startMillisecs : (startMillisecs < 100 ? "0"+startMillisecs : startMillisecs ) );

	 	endHours = parseInt( end / 3600 ) % 24;
	 	endMinutes = parseInt( end / 60 ) % 60;
	 	endSeconds = parseInt( end ) % 60;
	 	endMillisecs = parseInt(( end - (end|0))*1000+0.5);
	 	endTime = (endHours < 10 ? "0"+endHours : endHours) + ":" + 
	 				(endMinutes < 10 ? "0"+endMinutes : endMinutes) + ":" + 
	 				(endSeconds < 10 ? "0"+endSeconds : endSeconds) + "," +
	 				(endMillisecs < 10 ? "00"+endMillisecs : (endMillisecs < 100 ? "0"+endMillisecs : endMillisecs ) );

	 	return startTime+' --> '+endTime;	
 	}
};

/* Node Tests

var fs = require('fs');
var srt = fs.readFileSync('srt.srt', 'utf8');

srtx = new SRT();

obj = srtx.parse(srt);
str = srtx.stringify(obj);

console.log( str );

*/
