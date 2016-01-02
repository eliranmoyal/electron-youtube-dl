var spawn = require('child_process').spawn;

var dataOfDownload = {};
function splitAndDisplayLog (chunk) {
	chunkString = chunk.toString();
	console.log(chunkString);
	splittedChunk = chunkString.split("[");
		for(i=1;i<splittedChunk.length;i++){
			log = splittedChunk[i];
			if(log.indexOf("youtube:playlist]")==0){
				parseYouTubePlayList(log.substr(18));
			}
			else if (log.indexOf("download]") == 0 ){
				parseDownload(log.substr(10));
			}
			else if (log.indexOf("ffmpeg]") == 0 ){
				parseffmpeg(log.substr(8));
			}
		}
}
 function parseffmpeg (log) {
 	if(log.indexOf("Destination") == 0){
 		$("#converting").html("Finished converting! saving the file..");
 	}
 	else {
 		$("#converting").html("Converting to mp3...");
 	}
 }

function parseDownload (log) {
	if(log.indexOf("Downloading playlist:")==0){
		playListName = log.substring("Downloading playlist:".length+1,log.length-1);
		dataOfDownload["playlist"]["name"] = playListName;
		$('#listStatus').html("Start download playlist " + playListName);
		return;
	}
	if(log.indexOf("Downloading video ") == 0){
		//[download] Downloading video 1 of 26 
		videoNumber = log.substr("Downloading video ".length);
		videoNumber = videoNumber.substring(0,videoNumber.indexOf(" "));
		dataOfDownload["current"] = {};
		dataOfDownload["current"]["number"] =  videoNumber;
		$("#downloadStatus").html("video number: " + videoNumber);
		return;
	}
	if(log.indexOf("Destination: ") == 0){
		//[download] Destination: Arctic Monkeys - Arabella (Official Audio)-Jn6-TItCazo.m4a 
		videoName = log.substr("Destination: ".length);
		videoName = videoName.substring(0,videoName.indexOf(".m4a"));
		dataOfDownload["current"]["name"] =  videoName;
		$("#downloadStatus").append("<br> video name:" + videoName);
	}
	if(log.indexOf("% of")!=-1 && log.indexOf("ETA")!=-1){
		//[download] X% of YMiB at ZKiB/s ETA TIME .
		//[download] 100% of 6.31MiB in 00:01 "	
		$("#downloadProgress").show();
		$("#downloadProgress").css("display","block");
		percentage = log.substring(0,log.indexOf("%"));
		dataOfDownload["current"]["percentage"] = percentage;
		timeLeft = log.substr(log.indexOf("ETA ") + "ETA ".length);
		dataOfDownload["current"]["eta"] = timeLeft;
		$("#percentage").html(percentage);
		$("#ETA").html(timeLeft);
		return;
	}
	
	
}
function parseYouTubePlayList(log){
	//start message
	if(log.indexOf("add --no-playlist to") != -1){
		//take name from message
		//Downloading playlist RDJn6-TItCazo - add --no-playlist to just download video 
		 afterPlayList = log.substr(log.indexOf("playlist") + "playlist".length+1);
		 space = afterPlayList.indexOf(" ");
		 playListCode = afterPlayList.substring(0,space);
		 dataOfDownload["playlist"] = {"code": playListCode};
		 $('#listStatus').append("Analyzing playlist " + playListCode);
		 return;
	}
	//second message
	if(log.indexOf(dataOfDownload["playlist"]["code"]) == 0){
		playListType = log.substr(log.indexOf("Downloading") + "Downloading ".length);
		dataOfDownload["playlist"]["type"] = playListType;
		$('#listStatus').html("playlist:" + dataOfDownload["playlist"]["code"] + " is " +playListType);
		return;
	}
	if (log.indexOf("playlist " + dataOfDownload["playlist"]["name"]) == 0){
		//[youtube:playlist] playlist Mix - Arctic Monkeys - Arabella (Official Audio): Collected 26 video ids (downloading 26 of them) 
		numOfSongs = log.substr("playlist ".length + dataOfDownload["playlist"]["name"].length + ": Collected ".length);
		numOfSongs = numOfSongs.substring(0,numOfSongs.indexOf(" video"));
		dataOfDownload["playlist"]["numOfSongs"] = numOfSongs;
		$('#listStatus').append(" (" + numOfSongs +" videos)");
	}
	


}

$('#button').on('click', function () {
	var link = document.querySelectorAll('#textArea')[0].value;
	var options =
	['-x','--no-check-certificate',
	'--audio-format','mp3'
	,link];

	var child = spawn('youtube-dl',options);

	child.stdout.on('data', function(chunk) {
		//todo: process the logs and do stuff according to regex..
		//$('#progress').append(chunk+"</br><br>");
		splitAndDisplayLog(chunk);
		
	});

	child.stderr.on('data', function (data) {
		console.log('ERROR: ' + data);
	});

});
