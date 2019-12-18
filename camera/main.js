// John Amanatides, Sept 2017
// interactive webGL program that plays with the camera position
// George Gerges 213016233 Neenee and Rafael Lugassy 214421473 Rafaell

var canvas;
var gl;
var program;
window.onload = init;

var modelViewMatrix, eyeMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;



var screenWidth, screenHeight, aspectRatio;
var middleX, middleY;

var gridSize = 10;

var vPosition;
var objectColor;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    //  Configure WebGL
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.6, 0.6, 0.6, 1.6 );

    screenWidth = canvas.width;
    screenHeight = canvas.height;
    middleX = screenWidth / 2;
    middleY = screenHeight / 2;
    aspectRatio = screenWidth/screenHeight;

    //  Load shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    vPosition = gl.getAttribLocation(program, "vPosition");
    objectColor = gl.getUniformLocation(program, "objectColor");

     // configure matrices
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

	
    // initialize model
    initGrid(gridSize);
    initScene();
    initCamera();

        // start listening to mouse
        canvas.addEventListener('mousedown', function(evt) {
                var rect = canvas.getBoundingClientRect()
                var x = evt.clientX-rect.left;
                var y = evt.clientY-rect.top;
                mouseButtonDown(x,y);
                console.log('mousedown: '+x+", "+y);
        })
        canvas.addEventListener('mouseup', function(evt) {
                var rect = canvas.getBoundingClientRect()
                var x = evt.clientX-rect.left;
                var y = evt.clientY-rect.top;
                mouseButtonUp(x,y);
                console.log('mouseup: '+x+", "+y);
        })
        canvas.addEventListener('mousemove', function(evt) {
                var rect = canvas.getBoundingClientRect()
                var x = evt.clientX-rect.left;
                var y = evt.clientY-rect.top;
                mouseMove(x,y);
                console.log('mousemove: '+x+", "+y);
        })
    render();
};

function render()
{
     gl.clear(gl.COLOR_BUFFER_BIT);
	
	// set the height and width of the canvas to be that of either the window's height or width.
	if (window.innerWidth / aspectRatio > window.innerHeight){
		canvas.height = window.innerHeight;
		canvas.width = window.innerHeight * aspectRatio;
	}
	else{
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth / aspectRatio;
	}
	
	// reset some values that depend on the height / width
	screenWidth = canvas.width;
    screenHeight = canvas.height;
    middleX = screenWidth / 2;
    middleY = screenHeight / 2;
	
    // size orthographic views
	var range= gridSize*aspectRatio + 1;
		 
	 computeCameraOrientation();	 
		 
     projectionMatrix = ortho(-gridSize*aspectRatio, gridSize*aspectRatio,
                                        -gridSize, gridSize, -gridSize*aspectRatio, gridSize*aspectRatio);

	// enable depth in the program so objects block eachother based on their closeness
	// to the camera over other objects										
	gl.enable(gl.DEPTH_TEST);
	
    /** draw XY ortho in top-left quadrant**/
    gl.viewport(0, middleY, middleX, middleY);
    eyeMatrix = lookAt(vec3(0,0,0), vec3(0,0,-1), vec3(0, 1, 0));
    setMatricies();
    drawGrid('XY', range);
    drawCameraControls();
    drawScene();
	/** end of draw XY ortho in top-left quadrant**/

    /** draw xz ortho in bottom left quadrant **/
    gl.viewport(0, 0, middleX, middleY);
    eyeMatrix = lookAt(vec3(0, 0, 0), vec3(0, -1, 0), vec3(0, 0, -1));
    setMatricies();
    drawGrid('XZ', range);
    drawCameraControls();
    drawScene();
	/** end of draw xz ortho in bottom left quadrant **/

    /** draw yz ortho in bottom right quadrant **/
    gl.viewport(middleX, 0, middleX, middleY);
    eyeMatrix = lookAt(vec3(0,0,0), vec3(-1,0,0), vec3(0, 1, 0));
    setMatricies();
    drawGrid('YZ', range);
    drawCameraControls();
    drawScene();
	/** end of draw yz ortho in bottom right quadrant **/
	 
    // draw perspective view in top right quadrant
    gl.viewport(middleX, middleY, middleX, middleY);
    projectionMatrix = perspective(fovY, aspectRatio, near, far);
    eyeMatrix = lookAt(cameraLookFrom, cameraLookAt, cameraLookUp);
    setMatricies();
    drawScene();

    // draw quadrant boundaries
    gl.viewport(0, 0, screenWidth, screenHeight);
    projectionMatrix = ortho(-1, 1, -1, 1, -1, 1);
    eyeMatrix = lookAt(vec3(0,0,0.5), vec3(0,0,0), vec3(0, 1, 0));
    setMatricies();
    drawQuadrantBoundaries();

    //document.getElementById("ScreenInfo").innerHTML = "you can print debugging info here";

    window.requestAnimationFrame(render);
}

function setMatricies() {
        modelViewMatrix = eyeMatrix;
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
}