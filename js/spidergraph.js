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
    getIntAttribute(attrname, defaultval)
    {
        return parseInt(this.getAttribute(attrname)) || defaultval;
    }
    getAxisNames()
    {
        var anames = this.getAttribute("axisNames") || "";
        var splits = anames.split(",");
        var axisNames = []
        for(var ndx in splits)
        {
            var axisName = splits[ndx].trim();
            if(axisName.length > 0)
                axisNames.push(axisName)
        }
        return axisNames;
    }

    constructor()
    {
        super()
        this.width      = this.getIntAttribute("width", 512);
        this.height     = this.getIntAttribute("height", 512);
        this.centerX    = this.width / 2;
        this.centerY    = this.height / 2;

        this.radius     = this.getIntAttribute("radius",
                                             Math.min(this.width, this.height));

       
        // Graph background border and fill attributes
        this.borderThickness = this.getIntAttribute("borderThickness", 5);
        this.borderColor     = this.getAttribute("borderColor") || "#CCC";
        this.fillColor       = this.getAttribute("fillColor")   || "#888";

        // Axis attributes
        this.axisNames      = this.getAxisNames();        
        this.axisOffset     = this.getIntAttribute("axisOffset", 0);
        this.axisColor      = this.getAttribute("axisColor") || "#CCC";
        this.axisThickness  = this.getIntAttribute("axisThickness", 2);
        this.axisSegments   = this.getIntAttribute("axisSegments", 5);


        // Build out the template
        var w = this.width;
        var h = this.height;
        const template = document.createElement('template');
        template.innerHTML = "<style>" 
                           + this.css(w,h)
                           + "</style>" 
                           + this.template(w,h);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(document.importNode(template.content, true))
        
    }

    /*
    attributeChangedCallback(property, oldValue, newValue) 
    {
  
      console.log(`Attr Changed:${property} ${oldValue} ${newValue}`)
      if (oldValue === newValue) return;
      this[ property ] = newValue;
        
    }
    */
   
    connectedCallback() 
    {
        this.renderBackground();
        /*
      var shadow = this.shadowRoot;
      var bgCanvas = shadow.querySelector("#background");
      var webCanvase = shadow.querySelector("#webgraphview");

      console.log("connectedCallback" + bgCanvas + webCanvase);

      var axisList = ["Fire", "Water", "Earth", "Air", "Metal"]
      var fillColor = "#888";
      var strokeColor = "#CCC"
      var strokeWidth = 5;
  
    
        var spidergraph = new SpiderGraph(axisList, this.radius, bgCanvas );
        spidergraph.dragBackgroundCircle( fillColor, strokeColor, strokeWidth );
        spidergraph.drawAxisList(-90, strokeColor  );
*/

      
    }

    getXYAtDegree(degree, distance)
    {
        var rads = degree * (Math.PI / 180);
        var x = Math.cos(rads) * distance + this.centerX;
        var y = Math.sin(rads) * distance + this.centerY;
        return [x,y];
    }



    renderBackground()
    {
        var shadow = this.shadowRoot;
        var bgCanvas = shadow.querySelector("#background");
        var context = bgCanvas.getContext("2d");
        
        var centerX = this.centerX;
        var centerY = this.centerY;
        // Draw the basic shape, width a stroked border
        context.beginPath();
        context.arc(centerX, centerY, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.fillColor;
        context.fill();
        context.lineWidth = this.borderThickness;
        context.strokeStyle = this.borderColor;
        context.stroke();        

        // Draw Axis Lines
        context.strokeStyle = this.axisColor;
        context.lineWidth   = this.axisThickness;
        var axisCount = this.axisNames.length;
        if(axisCount > 0)
        {
            var arcDegrees = 360 / axisCount;
            for(var cnt = 0; cnt < axisCount; cnt ++)
            {
                var deg = cnt * arcDegrees + this.axisOffset;
                var xy = this.getXYAtDegree(deg, this.radius);
                context.moveTo(centerX,centerY);
                context.lineTo( xy[0], xy[1] );
            }
            context.stroke();        
        
            // Draw Axis Segment Notches
            context.fillStyle = this.axisColor;
            var fullCircRads = 2*Math.PI
            // Draw notch at "center"
            var drawCirc = (x,y, size) => {
                context.beginPath();
                context.arc( x, y, size, 0, fullCircRads);
                context.fill();
            }
            drawCirc(centerX, centerY, 3);

            var maxNotchesPerSeg = this.axisSegments;
            var radiusPerNotchSeg = this.radius / maxNotchesPerSeg;
            for(var notchCnt = 1; notchCnt < maxNotchesPerSeg; notchCnt ++)
            {
                for(var cnt = 0; cnt < axisCount; cnt ++)
                {
                    var deg = cnt * arcDegrees + this.axisOffset
                    var xy = this.getXYAtDegree(deg, radiusPerNotchSeg * notchCnt);
                    drawCirc(xy[0], xy[1], 3);
                }
            }

        }
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
    css(w,h)
    {
        return `
        .graphContainer
        {
            position: relative;
            width: ${w}px;
            height: ${h}px;
        }
        .graphContainer canvas
        {
            position: absolute;
            top:0px;
            left:0px;
            
        }

        
        `;
    }
}

customElements.define("exp-spidergraph-comp", SpiderGraphElement);



