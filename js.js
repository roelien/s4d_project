
if (!window.DeviceOrientationEvent) { //Als device orientation niet wordt gesupport laat tekst zien
      document.getElementById('deviceorientation-unsupported').classList.remove('hidden');
  } else { //Als het device het support laat de vierkant mee draaien
      window.addEventListener('deviceorientation', function(event) {
        document.getElementById('vierkant').style.webkitTransform =
        // document.getElementById('vierkant').style.transform =
          'rotateX(' + event.beta + 'deg) ' +
           'rotateY(' + event.gamma + 'deg) ' +
           'rotateZ(' + event.alpha + 'deg) ';
 
            document.getElementById('beta').innerHTML = Math.round(event.beta);
               document.getElementById('gamma').innerHTML = Math.round(event.gamma);
               document.getElementById('alpha').innerHTML = Math.round(event.alpha);
               document.getElementById('is-absolute').innerHTML = event.absolute ? "true" : "false";
      });
   }
 