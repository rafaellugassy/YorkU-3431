// George Gerges 213016233 Neenee and Rafael Lugassy 214421473 Rafaell

var gridVerticies;
var gridBufferID;

var black = vec4(0, 0, 0, 1);
var white = vec4(1, 1, 1, 1);
var grey = vec4(0.4, 0.4, 0.4, 1);
var points = [];

function initGrid(gridSize)
{
        gridBufferID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBufferID);
        gl.bufferData(gl.ARRAY_BUFFER, 16*2*gridSize*8+64, gl.STATIC_DRAW);

}

function drawQuadrantBoundaries()
{
		// make the boundries infront of anything else
		gl.depthRange(0, 0.001)
	
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBufferID);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        points = [];
        gl.uniform4fv(objectColor, white);
        points.push(vec4(-1, 0, 0, 1));
        points.push(vec4(1, 0, 0, 1));
        points.push(vec4(0, -1, 0, 1));
        points.push(vec4(0, 1, 0, 1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
        gl.lineWidth(2);
        gl.drawArrays(gl.LINES, 0, points.length);
        gl.lineWidth(1);
}

function drawGrid(plane, range)
{
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBufferID);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        gl.uniform4fv(objectColor, grey);
        points = [];
		// set the depth range so the grey lines will be behind the black lines
		gl.depthRange(0.009, 0.01);
        switch(plane) {
        case 'XY':
                for(i= -range; i <= range; i++) {
                        points.push(vec4(i, -range, 0));
                        points.push(vec4(i, range, 0));
                }
                for(i= -range; i <= range; i++) {
                        points.push(vec4(-range, i, 0));
                        points.push(vec4(range, i, 0));
                }
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
                gl.drawArrays(gl.LINES, 0, points.length);
                points = [];
				// set the depth range so the black lines will be infront of the grey lines
				gl.depthRange(0.001, 0.009);
                gl.uniform4fv(objectColor, black);
                points.push(vec4(0, range, 0));
                points.push(vec4(0, -range, 0));
                points.push(vec4(range, 0, 0));
                points.push(vec4(-range, 0, 0));
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
                gl.drawArrays(gl.LINES, 0, points.length);
                break;
        case 'XZ':
                for(i= -range; i <= range; i++) {
                        points.push(vec4(i, 0, -range));
                        points.push(vec4(i, 0, range));
                }
                for(i= -range; i <= range; i++) {
                        points.push(vec4(-range, 0, i));
                        points.push(vec4(range, 0, i));
                }
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
                gl.drawArrays(gl.LINES, 0, points.length);
                points = [];
				gl.depthRange(0.001, 0.009);
                gl.uniform4fv(objectColor, black);
                points.push(vec4(0, 0, range));
                points.push(vec4(0, 0, -range));
                points.push(vec4(range, 0, 0));
                points.push(vec4(-range, 0, 0));
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
                gl.drawArrays(gl.LINES, 0, points.length);
                break;
        case 'YZ':
                for(i= -range; i <= range; i++) {
                        points.push(vec4(0, i, -range));
                        points.push(vec4(0, i, range));
                }
                for(i= -range; i <= range; i++) {
                        points.push(vec4(0, -range, i));
                        points.push(vec4(0, range, i));
                }
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
                gl.drawArrays(gl.LINES, 0, points.length);
                points = [];
				gl.depthRange(0.001, 0.009);
                gl.uniform4fv(objectColor, black);
                points.push(vec4(0, 0, range));
                points.push(vec4(0, 0, -range));
                points.push(vec4(0, range, 0));
                points.push(vec4(0, -range, 0));
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
                gl.drawArrays(gl.LINES, 0, points.length);
                break;
        }
		// set the depth range back 
		gl.depthRange(0, 0.01);
}