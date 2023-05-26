

class SpiderGraph
{
    constructor(radius, backgroundCanvas)
    {
        this.radius = radius;
        this.bgCanvas = backgroundCanvas
        this.centerX = backgroundCanvas.width / 2;
        this.centerY = backgroundCanvas.height / 2;

    }

    getXYAtDegree(degree, distance)
    {
        var rads = degree * (Math.PI / 180);
        var x = Math.cos(rads) * distance + this.centerX;
        var y = Math.sin(rads) * distance + this.centerY;
        return [x,y];
    }

    dragBackgroundCircle(fillColor, strokeColor, strokeWidth)
    {
        let canvas = this.bgCanvas;
        let context = canvas.getContext("2d");

        context.beginPath();
        context.arc(this.centerX, 
                    this.centerY,
                    this.radius, 
                    0, 
                    2 * Math.PI);

        context.fillStyle = fillColor;
        context.fill();
        context.lineWidth = strokeWidth;
        context.strokeStyle = strokeColor;
        context.stroke();
    }

    getRadialLineEndpoints(lineCount)
    {

    }

}