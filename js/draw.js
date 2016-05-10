var outScale = 8;
var spacePressed = false;
var thresholdDifference = 90;
var minTargetWidth = 3;
var minIntensity = 9000;
var vidTop = 100/2;
var videoContext = undefined;
var paperContext = undefined;
var pointerVisible = false;

var boxCount = 0;

var drawSegments = [-1, -1];

window.minTargetWidth = 3;
window.maxTargetWidth = 30;
window.colourDifference = 20;
window.colourMinIntensity = 45;

function addLineBit(x0, y0, x1, y1) {
    if (x0 == undefined)
        x0 = x1;
    if (y0 == undefined)
        y0 = y1;

    var dx = x1-x0;
    var dy = y1-y0;
    var mag = (Math.pow(dx,2) + Math.pow(dy, 2));
    if (mag < 1000)
    {
        /*var newPosX = x0+dx/4;
        var newPosY = y0+dy/4;*/
        var newPosX = x0+dx;
        var newPosY = y0+dy;
        videoContext.lineTo(newPosX, newPosY);
        paperContext.lineTo(newPosX/outScale, newPosY/outScale);
    }
}


function draw(rect) {
    drawSegments.push(rect.x, rect.y-vidTop);
}

function setKeyboardHandlers() {
    document.onkeydown = function(e) {
        e = e || window.event;
        if (e.keyCode == '32')
        {
            spacePressed = true;
        }
        else if (e.keyCode == '65')
        {
            drawSegments = []
        }
        else if (e.keyCode == '37')
        {
            shiftRight();
        }
        else if (e.keyCode == '39')
        {
            shiftLeft();
        }
    };
    document.onkeyup = function(e) {
        e = e || window.event;
        if (e.keyCode == '32')
        {
            spacePressed = false;
            shiftLeft();
            drawSegments.push(-1, -1);
        }
    };
}

function setColourTargets() {
  tracking.ColorTracker.registerColor('yellow', function(r, g, b) {
      dx = r - 255,
      dy = g - 255,
      dz = b - 0;

    if ((r - b) >= thresholdDifference && (g - b) >= thresholdDifference) {
      return true;
    }
    return dx * dx + dy * dy + dz * dz < minIntensity;
  });

}

function setGuiParameters(tracker) {

    var setTargetWidthMin = function(v) {
        if (window.maxTargetWidth <= v)
        {
            window.maxTargetWidth = v + 1;
        }
        minTargetWidth = v;
        tracker.setMinDimension(v);
    };

    var setTargetWidthMax = function(v) {
        if (window.minTargetWidth >= v)
        {
            window.maxTargetWidth = v;
            v = window.minTargetWidth + 1;
        }
        tracker.setMaxDimension(v);
    };

    var setColourT = function(v) {
        thresholdDifference = v;
    };

    var setColourI = function(v) {
        minIntensity = v;
    };

    setTargetWidthMin(window.minTargetWidth);
    setTargetWidthMax(window.maxTargetWidth);

    var gui = new dat.GUI();
    gui.add(window, 'minTargetWidth', 1, 80).onChange(setTargetWidthMin);
    gui.add(window, 'maxTargetWidth', 10, 200).onChange(setTargetWidthMax);
    gui.add(window, 'thresholdDifference', 10, 200).onChange(setColourT);
    gui.add(window, 'minIntensity', 1000, 20000).onChange(setColourI);
}




function showBox(event) {
    if (videoContext != undefined)
    {
        videoContext.clearRect(0, 0, canvas.width, canvas.height);
        paperContext.clearRect(0, 0, canvas.width, canvas.height);
        boxCount = event.data.length;

        var i = 0;
        event.data.forEach(function(rect) {
            i++;
            videoContext.strokeStyle = '#007f00';
            videoContext.lineWidth = 5;
            var w2 = rect.width;
            var h2 = rect.height;
            videoContext.strokeRect(rect.x, rect.y-vidTop, rect.width, rect.height);
            videoContext.lineWidth = 15;
            videoContext.font = '11px Helvetica';
            videoContext.fillStyle = "#f00";
            videoContext.fillText('i: ' + i, rect.x + rect.width + 5, rect.y);
            videoContext.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
            videoContext.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
            videoContext.fillText('w: ' + rect.width + 'px', rect.x + rect.width + 5, rect.y + 33);
            videoContext.fillText('h: ' + rect.height + 'px', rect.x + rect.width + 5, rect.y + 44);
        });
    }
}

function shiftLeft() {
    for (var j = 0; j < drawSegments.length; j += 2)
    {
        if (drawSegments[j] != -1 && drawSegments[j+1] != -1)
            drawSegments[j] += 100;
    }
}

function shiftRight() {
    for (var j = 0; j < drawSegments.length; j += 2)
    {
        if (drawSegments[j] != -1 && drawSegments[j+1] != -1)
            drawSegments[j] -= 100;
    }
}

function makeFingerTracker() {

    var FingerTracker = function(opt_colors) {
        FingerTracker.base(this, 'constructor', opt_colors);
    };
    tracking.inherits(FingerTracker, tracking.ColorTracker);

    FingerTracker.prototype.track = function(pixels, width, height) {
        var self = this;
        var colors = this.getColors();

        if (!colors) {
            throw new Error('Colors not specified, try `new tracking.ColorTracker("magenta")`.');
        }

        var results = [];
        blurred = pixels;

        colors.forEach(function(color) {
            results = results.concat(self.trackColor_(blurred, width, height, color));
        });

        this.emit('track', {
            data: results
        });
    };

    return FingerTracker;
}

window.onload = function() {

    setKeyboardHandlers();
    setColourTargets();
    var drawColour = 'yellow';

    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var canvas2 = document.getElementById('canvas2');
    videoContext = canvas.getContext('2d');
    paperContext = canvas2.getContext('2d');

    drawSegments = [];

    var FingerTracker = makeFingerTracker();
    var tracker = new FingerTracker([drawColour]);
    //var tracker = new tracking.ColorTracker([drawColour]);

    tracker.setMinDimension(minTargetWidth);
    setGuiParameters(tracker);

    tracking.track('#video', tracker, { camera: true });

    var drawingTimeout = undefined;
    tracker.on('track', function(event) {
        showBox(event);  

        event.data.forEach(function(rect) {
            if (rect.color === drawColour)
            {
                if (event.data.length == 1)
                {
                    clearTimeout(drawingTimeout);
                    pointerVisible = true;
                    draw(rect);
                    drawingTimeout = setTimeout(function() {
                        pointerVisible = false;
                        shiftLeft();
                        drawSegments.push(-1, -1);
                    }, 200);
                }
            }
        });
    });

    (function loop() {
        videoContext.beginPath();
        if (pointerVisible)
        {
            videoContext.fillStyle="#FF0000";
        }
        else
        {
            videoContext.fillStyle="#00FF00";
        }
        videoContext.clearRect(0, 0, 20, 20);
        videoContext.rect(0, 0, 20, 20);
        videoContext.fill();

        var points = drawSegments;
        var idx = 0;
        videoContext.strokeStyle="#FF0000";
        videoContext.beginPath();
        paperContext.strokeStyle="#000000";
        paperContext.beginPath();

        videoContext.moveTo(points[idx], points[idx+1]);
        paperContext.moveTo(points[idx]/outScale, points[idx+1]/outScale);
        for (var idx = 0; idx < points.length; idx += 2)
        {
            if (points[idx] == -1 && points[idx+1] == -1)
            {
                videoContext.stroke();
                videoContext.beginPath();
                paperContext.stroke();
                paperContext.beginPath();
            }
            else
            {
                addLineBit(points[idx-2], points[idx-1], points[idx], points[idx+1]);
            }
        }
        videoContext.stroke();
        videoContext.beginPath();
        paperContext.stroke();
        paperContext.beginPath();
        requestAnimationFrame(loop);
    }());
};

