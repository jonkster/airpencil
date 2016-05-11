# airpencil

This is a simple experimental application to capture drawing in the air with a
finger (or pointer), using a webcam and then displaying the captured drawing on
screen.

The aim is to develop an application that will allow someone with fine motor
skill problems to be able to draw, make written notes or record arithmetic
workings etc on their laptop, by drawing with hand or finger gestures in front
of the laptop's camera.

It currently is a very simple and rough prototype to be used to see if it can
be productively used by someone with fine motor problems.

The current prototype pointer is a small LED and battery, it has a switch that
turns the LED on when the pointer is squeezed.

When the LED is switched off (or is not detected by the camera) the recorded
movements are moved to the left and a new drawing point will start the next time the
light is detected.  

Code is heavily based on the tracking.js library - see: https://trackingjs.com/
and is based off one of their example applications.

To install, clone the repository and run ```bower init```

The application is in app/draw.html

Currently it tracks a yellow LED, change the:

``` tracking.FingerTracker.prototype.colorFnRating = function(r, g, b, a, w, i,
j) { ...  });```
 
code in js/FingerTracker.js as required to use alternative pointers/colours.



Video of prototype:
 <a href="http://www.youtube.com/watch?feature=player_embedded&v=qf54XqX2b58" target="_blank"><img src="http://img.youtube.com/vi/qf54XqX2b58/0.jpg" alt="Example Video" width="240" height="180" border="10" /></a>
