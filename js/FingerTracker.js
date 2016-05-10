(function() {


    tracking.FingerTracker = function(opt_colors) {
        tracking.FingerTracker.base(this, 'constructor', opt_colors);
    };

    tracking.inherits(tracking.FingerTracker, tracking.ColorTracker);

    tracking.FingerTracker.prototype.difference = 30;
    tracking.FingerTracker.prototype.minIntensity = 128;

    tracking.FingerTracker.prototype.colorFnRating = function(r, g, b, a, w, i, j) {
        if ((r - b) >= this.difference && (g - b) >= this.difference) {
            if ((r+b) > this.minIntensity)
            {
                return r+b;
            }
        }
        return 0;
    };


    tracking.FingerTracker.prototype.trackFinger = function(pixels, width, height, color) {
        var currGroup = new Int32Array(pixels.length >> 2);
        var currGroupSize;
        var currI;
        var currJ;
        var currW;
        var marked = new Int8Array(pixels.length);
        var minGroupSize = this.getMinGroupSize();
        var neighboursW = this.getNeighboursForWidth_(width);
        var queue = new Int32Array(pixels.length);
        var queuePosition;
        var results = [];
        var w = -4;

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                w += 4;

                if (marked[w]) {
                    continue;
                }

                currGroupSize = 0;

                queuePosition = -1;
                queue[++queuePosition] = w;
                queue[++queuePosition] = i;
                queue[++queuePosition] = j;

                marked[w] = 1;

                var maxRating = 0;
                while (queuePosition >= 0)
                {
                    currJ = queue[queuePosition--];
                    currI = queue[queuePosition--];
                    currW = queue[queuePosition--];

                    var rating = this.colorFnRating(pixels[currW], pixels[currW + 1], pixels[currW + 2], pixels[currW + 3], currW, currI, currJ);
                    if (rating > 0) 
                    {
                        if (rating > maxRating)
                            maxRating = rating;
                        currGroup[currGroupSize++] = currJ;
                        currGroup[currGroupSize++] = currI;

                        for (var k = 0; k < neighboursW.length; k++) {
                            var otherW = currW + neighboursW[k];
                            var otherI = currI + neighboursI[k];
                            var otherJ = currJ + neighboursJ[k];
                            if (!marked[otherW] && otherI >= 0 && otherI < height && otherJ >= 0 && otherJ < width) {
                                queue[++queuePosition] = otherW;
                                queue[++queuePosition] = otherI;
                                queue[++queuePosition] = otherJ;

                                marked[otherW] = 1;
                            }
                        }
                    }
                }

                if (currGroupSize >= minGroupSize) {
                    var data = this.calculateDimensions_(currGroup, currGroupSize);
                    if (data) {
                        data.color = color;
                        data.rating = maxRating;
                        results.push(data);
                    }
                }
            }
        }
        return this.mergeRectangles_(results);
    };

    tracking.FingerTracker.prototype.track = function(pixels, width, height) {
        var self = this;
        var colors = this.getColors();

        if (!colors) {
            throw new Error('Colors not specified, try `new tracking.ColorTracker("magenta")`.');
        }

        var results = [];
        blurred = pixels;

        colors.forEach(function(color) {
            results = results.concat(self.trackFinger(blurred, width, height, color));
        });

        this.emit('track', {
            data: results
        });
    };

    var neighboursI = new Int32Array([-1, -1, 0, 1, 1, 1, 0, -1]);
    var neighboursJ = new Int32Array([0, 1, 1, 1, 0, -1, -1, -1]);

}());
