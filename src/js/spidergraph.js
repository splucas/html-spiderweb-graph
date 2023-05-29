
export class SpiderGraphElement extends HTMLElement
{
    getIntAttribute(attrname, defaultval)
    {
        return parseInt(this.getAttribute(attrname)) || defaultval;
    }
    getAxisNames()
    {
        let anames = this.getAttribute("axisNames") || "";
        let splits = anames.split(",");
        let axisNames = []
        for(let ndx in splits)
        {
            let axisName = splits[ndx].trim();
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

        this.bgBorderThickness = this.getIntAttribute("bgBorderThickness", 5);
        this.bgBorderColor     = this.getAttribute("bgBorderColor") || "#CCC";
        this.bgFillColor       = this.getAttribute("bgFillColor")   || "#888";
                                     
       
        // Graph background border and fill attributes
        this.borderThickness = this.getIntAttribute("borderThickness", 2);
        this.borderColor     = this.getAttribute("borderColor") || "#CCC";
        this.fillColor       = this.getAttribute("fillColor")   || "#DDD";

        // Axis attributes
        this.axisNames      = this.getAxisNames();        
        this.axisOffset     = this.getIntAttribute("axisOffset", 0);
        this.axisColor      = this.getAttribute("axisColor") || "#CCC";
        this.axisThickness  = this.getIntAttribute("axisThickness", 2);
        this.axisSegments   = this.getIntAttribute("axisSegments", 5);

        


        // Build out the template
        let w = this.width;
        let h = this.height;
        let template = document.createElement('template');
        template.innerHTML = "<style>" 
                           + this.css(w,h)
                           + "</style>" 
                           + this.template(w,h);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(document.importNode(template.content, true))
        
    }
   
    connectedCallback() 
    {
        this.renderBackground();
    }

    getXYAtDegree(degree, distance)
    {
        let rads = degree * (Math.PI / 180);
        return [Math.cos(rads) * distance + this.centerX,
                Math.sin(rads) * distance + this.centerY];
    }



    renderBackground()
    {
        let shadow = this.shadowRoot;
        let bgCanvas = shadow.querySelector("#background");
        let context = bgCanvas.getContext("2d");
        
        let centerX = this.centerX;
        let centerY = this.centerY;
        // Draw the basic shape, width a stroked border
        context.beginPath();
        context.arc(centerX, centerY, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.bgFillColor;
        context.fill();
        context.lineWidth = this.bgBorderThickness;
        context.strokeStyle = this.bgBorderColor;
        context.stroke();        

        // Draw Axis Lines
        context.strokeStyle = this.axisColor;
        context.lineWidth   = this.axisThickness;
        var axisCount = this.axisNames.length;
        let xy = null;
        let deg = null;
        if(axisCount > 0)
        {
            let arcDegrees = 360 / axisCount;
            for(var cnt = 0; cnt < axisCount; cnt ++)
            {
                deg = cnt * arcDegrees + this.axisOffset;
                xy = this.getXYAtDegree(deg, this.radius);
                context.moveTo(centerX,centerY);
                context.lineTo( xy[0], xy[1] );
            }
            context.stroke();        
        
            // Draw Axis Segment Notches
            context.fillStyle = this.axisColor;
            let fullCircRads = 2*Math.PI
            // Draw notch at "center"
            var drawCirc = (x,y, size) => {
                context.beginPath();
                context.arc( x, y, size, 0, fullCircRads);
                context.fill();
            }
            drawCirc(centerX, centerY, 3);

            let maxNotchesPerSeg = this.axisSegments;
            let radiusPerNotchSeg = this.radius / maxNotchesPerSeg;
            for(let notchCnt = 1; notchCnt < maxNotchesPerSeg; notchCnt ++)
            {
                for(let cnt = 0; cnt < axisCount; cnt ++)
                {
                    deg = cnt * arcDegrees + this.axisOffset
                    xy = this.getXYAtDegree(deg, radiusPerNotchSeg * notchCnt);
                    drawCirc(xy[0], xy[1], 3);
                }
            }

        }
    }
    getAxisEndpoints()
    {
        let axisEndpoints = {}
        let axisCount = this.axisNames.length;
        if(axisCount > 0)
        {
            let arcDegrees = 360 / axisCount;
            for(let cnt = 0; cnt < axisCount; cnt ++)
            {
                let deg = cnt * arcDegrees + this.axisOffset;
                let xy = this.getXYAtDegree(deg, this.radius);
                axisEndpoints[ this.axisNames[cnt]] = xy;
            }
        }
        return axisEndpoints;
    }

    // Drag the "web" graphic, essentially a line from axis to axis
    setGraphData( data )
    {
        let shadow = this.shadowRoot;
        let canvas = shadow.querySelector("#webgraphview");
        let context = canvas.getContext("2d");
        context.clearRect(0,0, canvas.width, canvas.height);


        let axisCount = this.axisNames.length;
        let arcDegrees = 360 / axisCount;


        context.strokeStyle = this.borderColor;
        context.lineWidth   = this.borderThickness;
        

        context.beginPath();
        let startXY = null;

        for(var cnt = 0; cnt < axisCount; cnt ++)
        {
            let deg = cnt * arcDegrees + this.axisOffset
            let axisName = this.axisNames[cnt];
            let axisValue = data[axisName]

            let xy = this.getXYAtDegree(deg, this.radius * axisValue)

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
        context.fillStyle   = this.fillColor;
        context.fill()
        context.stroke();
        context.closePath();

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



