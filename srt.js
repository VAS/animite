var fs = require('fs');
var srt = fs.readFileSync('srt.srt', 'utf8');

if( /\r/.test(srt) ) {
	srt = srt.replace(/\r/g, "");
}

function parseSrt( file ) {

	var srt = file.split("\n\n");

	for (var i = 0, len = srt.length; i < len; i++) {

		var fragments = srt[i].split("\n");

		srt[i] = { 
			"id" : fragments[0],
			"time" : parseTime(fragments[1]),
			"content" : fragments.splice(2)
		}
	}

	return srt;
}

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

