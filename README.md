# airpencil
This is a simple experimental application to capture drawing in the air with a finger (or pointer), using a webcam to the screen.

It is a very simple and rough prototype.

Uses tracking.js see - https://trackingjs.com/ and is based off one of their example applications.

To install, clone the repository and run ```bower init```

The application is in app/draw.html

Currently it tracks a green LED held in the hand, change the:

```tracking.ColorTracker.registerColor('drawC', function(r, g, b) {
 ...
 });```
 
 code as required to use alternative pointers/colours.
