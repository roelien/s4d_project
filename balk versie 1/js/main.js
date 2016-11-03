
if ( !window.requestAnimationFrame ) { // Deze methode vertelt de browser dat je een animatie wilt uitvoeren
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || //voor Firefox
        window.oRequestAnimationFrame || //voor Opera
        window.msRequestAnimationFrame || //voor internet explorer
        
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        }; 
    } )(); 
}
 
var balk;
var w; //width van het window(grote beeldscherm mobiel)
var h; //height van het window(grote beeldscherm mobiel)
 
function init(){
    balk = document.getElementById("balk");
	 w = window.innerWidth;
     h = window.innerHeight;
	
	balk.style.left = (w/5)-50+"px"; //positie balk
	balk.style.top = (h/2)-50+"px";
	balk.snelheid = {x:0,y:0}
	balk.positie = {x:0,y:0}
    
    if (window.DeviceOrientationEvent) {		
		window.addEventListener("deviceorientation", function(event) {
			balk.snelheid.y = Math.round(event.beta); //beta is je mobiel kantelen via de lengte.
			balk.snelheid.x = Math.round(event.gamma); //gamma is je mobiel kantelen via de breedte.
        } )
    }; 
    update();
}
 
function update(){
        balk.positie.y += balk.snelheid.y;
			
			if(balk.positie.y < 0 && balk.snelheid.y < 0){ //bovenkant
			   balk.positie.y = 0;
			}

			if(balk.positie.y > (h-300) && balk.snelheid.y > 0){ //onderkant
			   balk.positie.y = h-300;
			}

    	balk.style.top = balk.positie.y + "px"
    
    requestAnimationFrame( update );//KEEP ANIMATING
}