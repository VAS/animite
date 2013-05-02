<?php
	/** 
	**	ANY2REELS v0.1 
	**	Copyright VAS 2012
	**
	**	Created By Davide Ganito
	**
	**	Convert any ffmpeg readable video format into a sequence of Reels (a filmstrip like format).
	**	A JSON file will also be generated compatible with Animite player. (github.com/vas/animite)
	**	
	**	OPTIONS:
	**		-i   path to the video to convert
	**		-o   path to the dir which will contains the reels (default: input.reels)
	**		-f   output format (not implemented yet!). Would be 'jpeg' or 'png'
	**		-q   jpeg quality of reels (1-100) (default: 85)
	**
	**		-t 	 path to the temp dir which will contains all the input video frames. 
	**            It is automatically removed once the convertion is over. (default: hidden and unique)
	**
	**		-l   reelsLenght: define the number of frames per reel.
	**
	**		-d   print debug info on the standard out.
	**
	**/


	echo "\n\nANY2REELS v0.1\n\n";

	checkDependencies();

	$OPTIONS = loadOptions();


	// ENCODER begin
	if ( !file_exists( $OPTIONS['temp'] ) ) {
		mkdir( $OPTIONS['temp'] );
	}

	exec( "ffmpeg -i "
			. $OPTIONS['input'] 
			. " -an -f image2 -qscale 1 '" 
			. $OPTIONS['temp'] 
			. "/%05d.jpg'" );

	$OPTIONS['video']['frames'] = exec("ls '" . $OPTIONS['temp'] . "' | wc -l");

	$reelLength = $OPTIONS['reelLength'];
	// number of reels to produce
	$reelCount = floor( $OPTIONS['video']['frames'] / $reelLength );

	// number of reels columns
	$columns = ceil( sqrt( $reelLength ) );

	$reels = array();

	if ( !file_exists( $OPTIONS['output'] ) ) {
		mkdir( $OPTIONS['output'] );
	} else {	
		exec( "rm " . $OPTIONS['output'] . "/*" );
	}
	
	for( $i = 0; $i < $reelCount; $i++ ) {
		$reels[$i] = array(
			"frames" 	=> ceil( $reelLength ),
			"width"		=> $OPTIONS['video']['width'] * $columns,
			"path"		=> sprintf( "%s/%s.%d.jpg", $OPTIONS['output'], $OPTIONS['input'], $i )
		);

		$input = "";

		for( $j = $i*$reelLength+1, $to = ($i+1)*$reelLength+1; $j < $to; $j++ ) {
			$input .= sprintf( "%s/%05d.jpg ", $OPTIONS['temp'], $j );
		}


		exec( "montage -mode concatenate -tile "
				. $columns 
				. "x -quality " 
				. $OPTIONS['quality'] 
				. " " 
				. $input
				. " " . $OPTIONS['output'] . "/"
				. $OPTIONS['input'] . ".$i.jpg" );

	}

	$json = array(
		"width"		=> $OPTIONS['video']['width'],
		"height"	=> $OPTIONS['video']['height'],
		"fps"		=> 25,
		"reels" 	=> $reels
	);

	file_put_contents( "./" . $OPTIONS['output'] . ".json", json_encode($json) );
	

	// remove the temporary directory
	exec( "rm -R '" . $OPTIONS['temp'] . "'" );
	// ENCODER end

	if ( isset($OPTIONS['debug']) && $OPTIONS['debug'] ) {
		print_r( $OPTIONS );
	}

	/** FUNCTIONS **/

	function getOptionName( $code ) {
		switch( $code ) {
			case '-i': return 'input';
			case '-o': return 'output';
			case '-t': return 'temp';
			case '-l': return 'reelLength';
			case '-f': return 'format';
			case '-q': return 'quality';
			case '-d': return 'debug';
		}
	}

	// init all options
	function loadOptions() {
		global $argc, $argv;

		for( $i = 1; $i < $argc; $i+=2 ) {
			$OPTIONS[getOptionName($argv[$i])] = $argv[$i+1];
		}

		if ( !isset($OPTIONS['input']) ) {
			die( "Where is the video?" );
		} else if ( !file_exists($OPTIONS['input']) ) {
			die( "The video '" .$OPTIONS['input'] . "'! I can't find it!!!\n\n" );
		}

		$OPTIONS['quality'] = isset($OPTIONS['quality']) ? $OPTIONS['quality'] : 85;
		
		$OPTIONS['output'] = isset($OPTIONS['output']) ? $OPTIONS['output'] : $OPTIONS['input'] . ".reels";

		// temporary folder to store frames
		$OPTIONS['temp'] = isset($OPTIONS['temp']) ? $OPTIONS['temp'] : "./." . uniqid();

		// number of frames per reel (getOptimalLength()??)
		$OPTIONS['reelLength'] = isset($OPTIONS['reelLength']) ? $OPTIONS['reelLength'] : 1;


		$OPTIONS['video'] = getVideoOptions( $OPTIONS['input'] );


		return $OPTIONS;
	}


	// get video options
	function getVideoOptions( $video ) {
		$raw_info = shell_exec( "ffmpeg -i $video 2>&1" );
		preg_match('/(?<width>\d+)[x](?<height>\d+)/', $raw_info, $ma);
	
		return array(
			"width"		=> $ma['width'],
			"height"	=> $ma['height']
		);
	}


	// check if all dependencies are installed
	function checkDependencies() {

		$DEPS = array(
			"ffmpeg",
			"montage"
		);

		for( $i = 0, $len = count($DEPS); $i < $len; $i++ ) {
			if ( strlen( exec( "command -v " . $DEPS[$i] ) ) == 0 ) {
				die( "I can't use the '" . $DEPS[$i] . "' command! Install it! (Please...)\n\n" );
			}
		}

		return true;
	}
?>