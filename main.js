var gl;
var RunDemo = function(vertexShaderText, fragmentShaderText, model, texture) {
  const canvas = document.getElementById("canvasGL");
  gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL not supported');
  }
  
  gl.clearColor(0.8, 0.9, 0.6, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK); 
  gl.frontFace(gl.CCW);
  
  /* create shaders */
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  
  const compileShader = (shader, shaderText) => {
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);
    
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
          'Error compiling shader!', gl.getShaderInfoLog(shader));
        return false;
    }
    return true;
  }
  
  compileShader(vertexShader, vertexShaderText);
  compileShader(fragmentShader, fragmentShaderText);
  
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking ', gl.getProgramInfoLog(program));
    return;
  }
  
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('Error validationg program ', gl.getProgramInfoLog(program));
    return;
  }
  
  /* create buffer */
  const boxVerticles = model.meshes[0].vertices;
  const boxIndices = [].concat.apply([], model.meshes[0].faces);
  const texCoords = model.meshes[0].texturecoords[0];
  
  const boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVerticles), gl.STATIC_DRAW);
  
  const texCoordVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  const boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT, // Size of invidual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordVertexBufferObject);
  const texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
  gl.vertexAttribPointer(
    texCoordAttribLocation, // Attribute location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT, // Size of invidual vertex
    0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );
  
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(texCoordAttribLocation);
  
  /** Create texture */
  const boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
    texture
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
 
  // use this program OpenGL
  gl.useProgram(program);
  
  const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  const matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  const matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
  
  const worldMatrix = new Float32Array(16);
  const projMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array(16);
  
  mat4.identity(worldMatrix);
  //mat4.identity(viewMatrix);
  mat4.lookAt(viewMatrix, [0,0,-8], [0,0,0], [0,1,0]);
  //mat4.identity(projMatrix);
  mat4.perspective(
    projMatrix, 
    glMatrix.toRadian(45), 
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  );
  
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  
  const xRotationMatrix = new Float32Array(16);
	const yRotationMatrix = new Float32Array(16);
  
  /* Main loop */
  const identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  let angle = 0;
  const loop = function() {
      
      angle = performance.now() / 1000 / 6 * 2 * Math.PI;
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    
      gl.clearColor(0.8, 0.9, 0.6, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
      gl.bindTexture(gl.TEXTURE_2D, boxTexture);
      gl.activeTexture(gl.TEXTURE0);
      gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    
      requestAnimationFrame(loop)
  };
  requestAnimationFrame(loop);
  
  
}
document.body.onload = async () => {
  const vertexShaderText = await loadResource('./res/shader.vs.glsl'); 
  const fragmentShaderText = await loadResource('./res/shader.fs.glsl');
  const model = await loadResource('./res/Susan.json', 'JSON');
  const texture = await loadResource('./res/SusanTexture.png', 'IMAGE');
  RunDemo(vertexShaderText, fragmentShaderText, model, texture);
}