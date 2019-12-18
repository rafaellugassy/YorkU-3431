// George Gerges 213016233 Neenee and Rafael Lugassy 214421473 Rafaell

var cameraLookFrom = vec3(5, 3, 8); // 5, 3, 8
var cameraLookAt = vec3(0, 0, 0);
var cameraLookUp = vec3(0, 1, 0);
var fovY = 50;
var near = .1;
var far = 100;
var squareSize = middleY / 20;
var quad = 0;
var origin = [];
var outerPoints = [[]];
var cameraVerticies;
var cameraBufferID;
var pressed = false;
var lastY;
var type = -1;

function mouseButtonDown(x, y)
{
	// you have pressed the mouse button
	pressed = true;
	
	// set the quadrant you clicked the mouse in (0 being none of the above)
	if (x < middleX && y < middleY)
		quad = 2;
	else if (x < middleX && y > middleY)
		quad = 3;
	else if (x > middleX && y > middleY)
		quad = 4;
	else if (x > middleX && y < middleY)
		quad = 1;
	else
		quad = 0;
	
	// if the quadrand is 1 (the top right) set the variable lastY to be the current mouse y positon
	if (quad == 1){
		lastY = y;
	}
	
	// if the quadrant is 2, 3, or 4 (top left, bot left, bot right)
	if (quad > 1){
		// appropriately set the mouse x and y, to be scaled into the program's x and y positions
		var scaleX = x / squareSize;
		var scaleY = y / squareSize;
		
		// create a vector 2 that stores the point on the graph that is pressed
		var point = vec2((quad == 4 ? -1 : 1) * (scaleX - origin[quad][0]), (quad == 2 || quad == 4 ? -1 : 1) * (scaleY - origin[quad][1]));
		
		// plane is a vector 2 that determines which plane the first and second values of points are determined by which quadrant the user is in
		var plane = vec2(quad == 2 ? 0 : quad == 3 ? 0 : 2, quad == 2 ? 1 : quad == 3 ? 2 : 1);
		
		// for every point (lookAt, lookFrom, lookUp) check whether it's near the point pressed
		for (var i = 0; i < 3; i++){
			
			// if the point is within half of a unit, then select it
			if (point[0] > outerPoints[quad][i][plane[0]] - 0.5 && point[0] < outerPoints[quad][i][plane[0]] + 0.5
				&& point[1] > outerPoints[quad][i][plane[1]] - 0.5 && point[1] < outerPoints[quad][i][plane[1]] + 0.5){
					
				// if the point is near the lookAt
				if (i == 0){
					// set the lookAt to be the point pressed
					cameraLookAt = vec3(quad == 2 ? point[0] : quad == 3 ? point[0] : cameraLookAt[0],
						quad == 2 ? point[1] : quad == 3 ? cameraLookAt[1] : point[1], 
						quad == 2 ? cameraLookAt[2] : quad == 3 ? point[1] : point[0]);
						
					// select the lookAt to be able to be dragged around in the mouseMove method
					type = 0;
					return;
				}
				
				// if the point is near the lookFrom
				else if (i == 1){
					// set the lookFrom to be the point pressed
					cameraLookFrom = vec3(quad == 2 ? point[0] : quad == 3 ? point[0] : cameraLookFrom[0],
						quad == 2 ? point[1] : quad == 3 ? cameraLookFrom[1] : point[1], 
						quad == 2 ? cameraLookFrom[2] : quad == 3 ? point[1] : point[0]);
						
					// select the lookFrom to be able to be dragged around in the mouseMove method
					type = 1;
					return;
				}
				
				// if the point is near the lookUp
				else{
					// set the lookUp to be the point pressed
					cameraLookUp = vec3(quad == 2 ? point[0] - outerPoints[quad][1][0] : quad == 3 ? point[0] - outerPoints[quad][1][0] : cameraLookUp[0],
						quad == 2 ? point[1] - outerPoints[quad][1][1] : quad == 3 ? cameraLookUp[1] : point[1] - outerPoints[quad][1][1], 
						quad == 2 ? cameraLookUp[2] : quad == 3 ? point[1] - outerPoints[quad][1][2] : point[0] - outerPoints[quad][1][2]);
						
					// select the lookUp to be able to be dragged around in the mouseMove method
					type = 2;
					return;
				}
			}
		}
	}
	
	// if the value hasn't returned thus far, set type to be -1 as it will not be moving any of the points
	type = -1;
}

function mouseButtonUp(x,y)
{
	// you are not pressing the button anymore
	pressed = false;
	
	// reset your values
	quad = 0;
	type = -1;
}

function mouseMove(x,y)
{
	// if you are pressing the mouse down
	if (pressed){
		
		// check if the quadrant is equal to the one you pressed it in (if not, you're done here)
		if (x < middleX && y < middleY && quad == 2)
			quad = 2;
		else if (x < middleX && y > middleY && quad == 3)
			quad = 3;
		else if (x > middleX && y > middleY && quad == 4)
			quad = 4;
		else if (x > middleX && y < middleY && quad == 1)
			quad = 1;
		else {
			// reset some values.
			quad = 0;
			// you are counted as not pressing down anymore
			pressed = false;
			type = -1;
		}
	
		// if the quadrant is 2, 3, or 4, (top left, bot left, bot right)
		if (quad > 1){
			
			// scale the x and the y to be the units used in the program
			var scaleX = x / squareSize;
			var scaleY = y / squareSize;
			
			// create a vector 2 that stores the point on the graph that is pressed
			var point = vec2((quad == 4 ? -1 : 1) * (scaleX - origin[quad][0]),(quad == 2 || quad == 4 ? -1 : 1) * (scaleY - origin[quad][1]));
			
			// plane is a vector 2 that determines which plane the first and second values of points are determined by which quadrant the user is in
			var plane = vec2(quad == 2 ? 0 : quad == 3 ? 0 : 2, quad == 2 ? 1 : quad == 3 ? 2 : 1);
					
					// if you are holding the lookAt
					if (type == 0)
						// set the lookAt to be set to the current mouse positon
						cameraLookAt = vec3(quad == 2 ? point[0] : quad == 3 ? point[0] : cameraLookAt[0],
							(quad == 2 ? point[1] : quad == 3 ? cameraLookAt[1] : point[1]), 
							quad == 2 ? cameraLookAt[2] : quad == 3 ? point[1] : point[0]);
							
					// if you are holding the lookFrom
					else if (type == 1)
						// set the lookFrom to be set to the current mouse positon
						cameraLookFrom = vec3(quad == 2 ? point[0] : quad == 3 ? point[0] : cameraLookFrom[0],
							quad == 2 ? point[1] : quad == 3 ? cameraLookFrom[1] : point[1], 
							quad == 2 ? cameraLookFrom[2] : quad == 3 ? point[1] : point[0]);
							
					// if you are holding the lookUp
					else if (type == 2)
						// set the lookUp to be set to the current mouse positon
						cameraLookUp = vec3(quad == 2 ? point[0] - outerPoints[quad][1][0] : quad == 3 ? point[0] - outerPoints[quad][1][0] : cameraLookUp[0],
							quad == 2 ? point[1] - outerPoints[quad][1][1] : quad == 3 ? cameraLookUp[1] : point[1] - outerPoints[quad][1][1], 
							quad == 2 ? cameraLookUp[2] : quad == 3 ? point[1] - outerPoints[quad][1][2] : point[0] - outerPoints[quad][1][2]);
					return;
					/*
				}
			}*/
		}
		
		// if you are in quadrant 1 (top left)
		else if (quad == 1){
			// set type to be -1
			type = -1;
			
			// add the difference between the current y and the lastY to fovY 
			fovY += y - lastY;
			
			// if fovY is too large, set it back to the maximum distance (chosen to be 175)
			if (fovY > far)
				fovY = far;
			
			// if the fovY is too small, set it back to the minimum distance (chosed to be 0)
			else if (fovY < near)
				fovY = near;
			
			// set the lastY value to be the current y
			lastY = y;
		}
		
		else{
			// reset values
			pressed = false;
			type = -1;
		}
	
	}
	document.getElementById("ScreenInfo").innerHTML = "(" + x + ", " +y + ")";
}

function initCamera()
{	
	// set the origins for each quadrant
	origin = [];
	origin.push(vec2(0,0));
	origin.push(vec2(0,0));
	origin.push(vec2(middleX / (2 * squareSize), middleY / (2 * squareSize)));
	origin.push(vec2(middleX / (2 * squareSize), middleY * 3 / (2 * squareSize)));
	origin.push(vec2(middleX * 3 / (2 * squareSize), middleY * 3 / (2 * squareSize)));
}

function computeCameraOrientation()
{
	// incase the user puts the lookup at (0,0,0) it will not crash
	if (cameraLookUp[0] == 0 && cameraLookUp[1] == 0 && cameraLookUp[2] == 0)
		cameraLookUp[1] = 0.001;
	// computer the size of each square on the grid
	squareSize = middleY / 20;
	// set the origins for each quadrant
	origin = [];
	origin.push(vec2(0,0));
	origin.push(vec2(0,0));
	origin.push(vec2(middleX / (2 * squareSize), middleY / (2 * squareSize)));
	origin.push(vec2(middleX / (2 * squareSize), middleY * 3 / (2 * squareSize) ));
	origin.push(vec2(middleX * 3 / (2 * squareSize), middleY * 3 / (2 * squareSize)));
	
	// reset the value of outerPoints (variable will hold positions of lookAt, lookFrom, and lookUp
	outerPoints = [];
	// quadrant 0 and 1 have no lookAt, lookFrom, and lookUp positions
	outerPoints.push([]);
	outerPoints.push([]);
}

function drawCameraControls()
{
	// set the depth range so the camera controls will be over anything else.
	gl.depthRange(0, 0.001);
	
	// points is a array of points to be drawn from the lookAt to the lookFrom, and after from the lookFrom to the lookUp
	var points = [];
	
	// just a variable to locally save the points in points
	var ptCopy = [];
	
	// set the color to white
	gl.uniform4fv(objectColor, white);
	
	// push the points of lookAt, lookFrom, and lookUp
	points.push(vec4(cameraLookAt[0], cameraLookAt[1], cameraLookAt[2]));
	points.push(vec4(cameraLookFrom[0], cameraLookFrom[1], cameraLookFrom[2]));
	points.push(vec4(cameraLookUp[0] + cameraLookFrom[0], cameraLookUp[1] + cameraLookFrom[1], cameraLookUp[2] + cameraLookFrom[2]));
	
	// store the copy
	ptCopy = points;
	
	// draw the lines from lookAt to lookFrom
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.drawArrays(gl.LINES, 0, points.length);
	
	// reset points
	points = [];
	
	// push lookFrom, and lookUp
	points.push(ptCopy[1]);
	points.push(ptCopy[2]);
	
	// draw a line from lookFrom to lookUp
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.drawArrays(gl.LINES, 0, points.length);
	
	// store the values of lookAt, lookFrom, and lookUp
	outerPoints.push(ptCopy);
	
	 // set the depth range so the 3d objects will be behind all the foreground
	gl.depthRange(0.01, 1);
}