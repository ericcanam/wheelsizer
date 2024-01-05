// creates reference to new image in memory so that the browser loads it
function preload(){
	for(let url of arguments){
		new Image().src = url;
	}
}

export { preload };