var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;

var bufferId;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(5, 8)+8, gl.STATIC_DRAW );



    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

        document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        render();
    };


    render();
};


function divideKoch( p1, p5, count )
{
    // check for end of recursion
    if ( count <= 0 ) {
        points.push(p5);
    }
	
    else {
		// create a line from p1 to p5 and divide it into 3 parts
		var line = subtract(p5, p1);
		line = vec2(line[0] / 3.0, line[1] / 3.0);
		
		/** now we must rotate the line 90 degrees to get a line perpindicular to the original line **/
		// first we need to get the value we will divide the perpindicular line so it becomes a unit vector that can be scaled properly
		var denom =  Math.sqrt(Math.pow(line[0], 2) + Math.pow(line[1], 2))
		
		// geting the scalar values of the lines we need to construct a right angle triangle
		var lengthOfHalf = Math.sqrt(Math.pow(line[0] / 2.0, 2) + Math.pow(line[1] / 2.0, 2));
		var length = Math.sqrt(Math.pow(line[0], 2) + Math.pow(line[1], 2));
		
		// to get the length of our perpindicular line we take the length to be the hypotenuese, and lengthOfHalf to be one of the other sides
		var scaleValue = Math.sqrt(Math.pow(length, 2) - Math.pow(lengthOfHalf, 2));
		
		// direction of the perpindicular line is just a simple rotation 90 degrees, it's divided by denom to make it a unit vector, 
		//then multiplied by the scaleValue to make it scaled properly for both x and y
		var perpLine = vec2(- line[1] * scaleValue / denom, line[0] * scaleValue / denom);
	
		/** now to set all the points we will push **/
		var p2 = add(p1, line);
		
		// first add 1/2 of line to p2, so it would be in the center of p1 and p5, then add the perpindicular line
		var p3 = add(add(p2, vec2(line[0]/2, line[1]/2)), perpLine);
		
		var p4 = add(p2, line);
		
		// decrement count
		--count;
		
		//console.log("p1 = ", p1 ,"\np2 = ", p2, "\np3 = ", p3, "\np4 = ", p4, "\np5 = ", p5 )
		
		/** now do all recursive calls **/
		divideKoch(p1, p2, count);
		divideKoch(p2, p3, count);
		divideKoch(p3, p4, count);
		divideKoch(p4, p5, count);
    }
}

window.onload = init;

function render()
{	
    var vertices = [
        vec2( -0.9, -0.9 ),
        vec2(  0.9, -0.9 )
    ];
    points = [];
    points.push(vertices[0])
    divideKoch( vertices[0], vertices[1], numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
    points = [];
    //requestAnimFrame(render);
}
