class SpiderGraph
{
    constructor(axisList, radius, backgroundCanvas)
    {
        this.axisList = axisList;
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

    drawAxisList( degOffset, strokeStyle)
    {
        let canvas = this.bgCanvas;
        let context = canvas.getContext("2d");

        context.strokeStyle = strokeStyle;
        context.lineWidth   = 2;

        var axisCount = this.axisList.length;
        // Draw the line segments
        var segSize = 360 / axisCount;
        for(var cnt = 0; cnt < axisCount; cnt ++)
        {
            var deg = cnt * segSize + degOffset
            var xy = this.getXYAtDegree(deg, this.radius)

            context.moveTo(this.centerX,this.centerY);
            context.lineTo( xy[0], xy[1] );
        }
        context.stroke();

        // Draw 'Notches'
        context.fillStyle = strokeStyle;
        var fullCircRads = 2*Math.PI
        // Draw notch at "center"
        context.beginPath();
        context.arc( this.centerX, this.centerY, 3, 0, fullCircRads);
        context.fill();

        var maxNotchesPerSeg = 5;
        var radiusPerNotchSeg = this.radius / maxNotchesPerSeg;
        for(var notchCnt = 1; notchCnt < maxNotchesPerSeg; notchCnt ++)
        {
            for(var cnt = 0; cnt < axisCount; cnt ++)
            {
                var deg = cnt * segSize + degOffset

                var xy = this.getXYAtDegree(deg, radiusPerNotchSeg * notchCnt);
                context.beginPath();
                context.arc( xy[0], xy[1], 3, 0, fullCircRads);
                context.fill();
            }
        }


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

    // Drag the "web" graphic, essentially a line from axis to axis
    drawWebGraph(graphData, webcanvas, degOffset)
    {
        let context = webcanvas.getContext("2d");
        context.clearRect(0,0, webcanvas.width, webcanvas.height);

        var axisCount = this.axisList.length;
        var segSize = 360 / axisCount;

        context.beginPath();
        let startXY = null;

        for(var cnt = 0; cnt < axisCount; cnt ++)
        {
            var deg = cnt * segSize + degOffset
            var axisName = this.axisList[cnt];
            var axisValue = graphData[axisName]
            var xy = this.getXYAtDegree(deg, this.radius * axisValue)

            if(cnt == 0)
            {
                startXY = xy;
                context.moveTo(xy[0], xy[1]);
            }
            else
            {
                context.lineTo( xy[0], xy[1] );
            }
            
        }
        context.lineTo( startXY[0], startXY[1] );
        context.fill()
        context.stroke();
        context.closePath();

    }
}


export class SpiderGraphElement extends HTMLElement
{
    constructor()
    {
        super()

        var h = this.getAttribute("height");
        var w = this.getAttribute("width");

        this.width = w;
        this.height = h;

        console.log("Building Things " + h + " " + w);
        const template = document.createElement('template');
        template.innerHTML = "<style>"+this.css()+"</style>" + this.template(w,h);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(document.importNode(template.content, true))

        
    }

    attributeChangedCallback(property, oldValue, newValue) 
    {
  
      console.log(`Attr Changed:${property} ${oldValue} ${newValue}`)
      if (oldValue === newValue) return;
  //    this[ property ] = newValue;
  
      
    }
    connectedCallback() 
    {
      console.log("connectedCallback");
      //this.render_data()
    }

    template(w,h)
    {
        return `
        <div class="graphContainer">
          <canvas id="background" width="${w}" height="${h}"></canvas>
          <canvas id="webgraphview" width="${w}" height="${h}"></canvas>
        </div>
        `;
    }
    css()
    {
        return ``;
    }
}

customElements.define("exp-spidergraph-comp", SpiderGraphElement);



