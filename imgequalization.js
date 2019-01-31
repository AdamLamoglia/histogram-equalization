var scene = null;
var renderer = null;

var camera = null;
var cameraImg = null;

var texture;
var textureEq;

var imagedata;
var imagedataEq;

var imagemEhColorida = false;

var contadorDePixelsR = [];
var contadorDePixelsG = [];
var contadorDePixelsB = [];
contadorDePixelsR.length = 256;
contadorDePixelsG.length = 256;
contadorDePixelsB.length = 256;

var novaCorR = [];
var novaCorG = [];
var novaCorB = [];
novaCorR.length = 256;
novaCorG.length = 256;
novaCorB.length = 256;

var contadorNormalizadoR = [];
var contadorNormalizadoG = [];
var contadorNormalizadoB = [];
contadorNormalizadoR.length = 256;
contadorNormalizadoB.length = 256;
contadorNormalizadoG.length = 256;


var geoR;
var geoG;
var geoB;

var matR;
var matG;
var matB;

var meshR;
var meshB;
var meshG;

var sceneR;
var sceneG;
var sceneB;

var sceneRE;
var sceneGE;
var sceneBE;

var rendererR;
var rendererG;
var rendererB;

var planeGeometry;
var planeMat;
var plane;

var sceneEq;
var rendererEq;


function init() {

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();

	document.getElementById("WebGL-output").appendChild(renderer.domElement);

	var textureLoader = new THREE.TextureLoader();
	texture = textureLoader.load(document.getElementById("selection").value);

	camera = new THREE.OrthographicCamera(0, 256, 1, 0, -1, 1);
	cameraImg = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1.0, 1.0);

	planeGeometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 20, 20);

	planeMat = new THREE.MeshBasicMaterial({ map: texture, wireframe: false, side: THREE.DoubleSide });
	plane = new THREE.Mesh(planeGeometry, planeMat);
	plane.position.set(0.0, 0.0, -0.5);

	scene.add(plane);
	scene.add(cameraImg);
	requestAnimationFrame(render);
};

function render() {

	if (!texture.image) {
		requestAnimationFrame(render);
	}
	else {

		renderer.setSize(texture.image.width, texture.image.height);
		renderer.render(scene, cameraImg);

		console.log("****" + texture.image.width);
		console.log("****" + texture.image.height);


		var canvas = document.createElement('canvas');
		canvas.width = texture.image.width;
		canvas.height = texture.image.height;

		var context = canvas.getContext('2d');
		context.drawImage(texture.image, 0, 0);

		imagedata = context.getImageData(0, 0, texture.image.width, texture.image.height);
		imagedataEq = new Uint8Array(imagedata.data.length);


		for (i = 0; i < imagedata.data.length; i += 4) {
			if (imagedata.data[i] == imagedata.data[i + 1] && imagedata.data[i] == imagedata.data[i + 2] && imagedata.data[i + 1] == imagedata.data[i + 2])
				continue;
			else
				imagemEhColorida = true;
		}

		if (!imagemEhColorida) {
			outputPretoBranco();
		}
		else {
			outputCores();
		}



		for (var i = 0; i < 256; i++) {
			contadorDePixelsR[i] = 0;
			contadorDePixelsG[i] = 0;
			contadorDePixelsB[i] = 0;
		}

		for (i = 0; i < imagedata.data.length; i += 4) {

			contadorDePixelsR[imagedata.data[i]]++;
			contadorDePixelsG[imagedata.data[i + 1]]++;
			contadorDePixelsB[imagedata.data[i + 2]]++;
		}

		var minR = 256;
		var minG = 256;
		var minB = 256;

		for (var i = 1; i < 256; i++) {

			contadorDePixelsR[i] += contadorDePixelsR[i - 1];
			contadorDePixelsG[i] += contadorDePixelsG[i - 1];
			contadorDePixelsB[i] += contadorDePixelsB[i - 1];

			if (contadorDePixelsR[i] != 0 && contadorDePixelsR[i] < minR)
				minR = contadorDePixelsR[i];

			if (contadorDePixelsG[i] != 0 && contadorDePixelsG[i] < minG)
				minG = contadorDePixelsG[i];


			if (contadorDePixelsB[i] != 0 && contadorDePixelsB[i] < minB)
				minB = contadorDePixelsB[i];

		}




		for (var i = 0; i < 256; i++) {
			novaCorR[i] = ((contadorDePixelsR[i] - minR) / ((texture.image.width * texture.image.height) - minR));
			novaCorG[i] = ((contadorDePixelsG[i] - minG) / ((texture.image.width * texture.image.height) - minG));
			novaCorB[i] = ((contadorDePixelsB[i] - minB) / ((texture.image.width * texture.image.height) - minB));

			novaCorR[i] *= 255;
			novaCorG[i] *= 255;
			novaCorB[i] *= 255;
		}


		for (var a = 0; a < imagedata.data.length; a += 4) {

			imagedata.data[a] = novaCorR[imagedata.data[a]];
			imagedata.data[a + 1] = novaCorG[imagedata.data[a + 1]];
			imagedata.data[a + 2] = novaCorB[imagedata.data[a + 2]];

		}

		for (i = 0; i < imagedata.data.length; i += 4) {
			imagedataEq[i] = imagedata.data[i];
			imagedataEq[i + 1] = imagedata.data[i + 1];
			imagedataEq[i + 2] = imagedata.data[i + 2];
			imagedataEq[i + 3] = imagedata.data[i + 3];
		}

		outputImagemEqualizada();



		if (!imagemEhColorida) {
			outputPretoBranco();
		}
		else {
			outputCores();
		}


	}

	return;

}

function outputImagemEqualizada() {

	sceneEq = new THREE.Scene();

	rendererEq = new THREE.WebGLRenderer();

	document.getElementById("WebGL-output").appendChild(rendererEq.domElement);

	textureEq = new THREE.DataTexture(imagedataEq, texture.image.width, texture.image.height, THREE.RGBAFormat);
	textureEq.needsUpdate = true;

	planeGeometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 20, 20);

	planeMat = new THREE.MeshBasicMaterial({ map: textureEq, wireframe: false, side: THREE.DoubleSide });
	plane = new THREE.Mesh(planeGeometry, planeMat);
	plane.position.set(0.0, 0.0, -0.5);

	plane.rotation.x = Math.PI;
	sceneEq.add(plane);
	sceneEq.add(cameraImg);

	rendererEq.setSize(texture.image.width, texture.image.height);


	rendererEq.render(sceneEq, cameraImg);

}

function outputCores() {

	geoR = new THREE.Geometry();
	geoG = new THREE.Geometry();
	geoB = new THREE.Geometry();

	for (var i = 0; i < 256; i++) {
		contadorDePixelsR[i] = 0;
		contadorDePixelsG[i] = 0;
		contadorDePixelsB[i] = 0;
	}

	for (i = 0; i < imagedata.data.length; i += 4) {

		contadorDePixelsR[imagedata.data[i]]++;
		contadorDePixelsG[imagedata.data[i + 1]]++;
		contadorDePixelsB[imagedata.data[i + 2]]++;
	}

	var maxR = 0,
		maxG = 0,
		maxB = 0,
		miniR = 1000000,
		miniG = 1000000,
		miniB = 1000000;

	for (var x = 0; x < 256; x++) {

		if (maxR < contadorDePixelsR[x])
			maxR = contadorDePixelsR[x];
		if (maxG < contadorDePixelsG[x])
			maxG = contadorDePixelsG[x];
		if (maxB < contadorDePixelsB[x])
			maxB = contadorDePixelsB[x];

		if (miniR > contadorDePixelsR[x])
			miniR = contadorDePixelsR[x];
		if (miniG > contadorDePixelsG[x])
			miniG = contadorDePixelsG[x];
		if (miniB > contadorDePixelsB[x])
			miniB = contadorDePixelsB[x];

	}


	for (i = 0; i < 256; i++) {
		contadorNormalizadoR[i] = (contadorDePixelsR[i] - miniR) / (maxR - miniR);
		contadorNormalizadoG[i] = (contadorDePixelsG[i] - miniG) / (maxG - miniG);
		contadorNormalizadoB[i] = (contadorDePixelsB[i] - miniB) / (maxB - miniB);
	}



	for (i = 0; i < 256; i++) {
		if (contadorNormalizadoR[i]) {

			geoR.vertices.push(new THREE.Vector3(i, 0, 0));
			geoR.vertices.push(new THREE.Vector3(i, contadorNormalizadoR[i], 0));
			geoR.vertices.push(new THREE.Vector3(i, 0, 0));
		}


		if (contadorNormalizadoG[i]) {

			geoG.vertices.push(new THREE.Vector3(i, 0, 0));
			geoG.vertices.push(new THREE.Vector3(i, contadorNormalizadoG[i], 0));
			geoG.vertices.push(new THREE.Vector3(i, 0, 0));
		}

		if (contadorNormalizadoB[i]) {

			geoB.vertices.push(new THREE.Vector3(i, 0, 0));
			geoB.vertices.push(new THREE.Vector3(i, contadorNormalizadoB[i], 0));
			geoB.vertices.push(new THREE.Vector3(i, 0, 0));
		}
	}

	for (i = 0; i < geoR.vertices.length - 2; i += 3) {
		geoR.faces.push(new THREE.Face3(i, i + 1, i + 2));
	}

	for (i = 0; i < geoG.vertices.length - 2; i += 3) {
		geoG.faces.push(new THREE.Face3(i, i + 1, i + 2));
	}

	for (i = 0; i < geoB.vertices.length - 2; i += 3) {
		geoB.faces.push(new THREE.Face3(i, i + 1, i + 2));
	}

	matR = new THREE.MeshBasicMaterial({ color: "red", wireframe: true, side: THREE.DoubleSide });
	matG = new THREE.MeshBasicMaterial({ color: "green", wireframe: true, side: THREE.DoubleSide });
	matB = new THREE.MeshBasicMaterial({ color: "blue", wireframe: true, side: THREE.DoubleSide });

	meshR = new THREE.Mesh(geoR, matR);
	meshG = new THREE.Mesh(geoG, matG);
	meshB = new THREE.Mesh(geoB, matB);

	sceneR = new THREE.Scene();
	sceneG = new THREE.Scene();
	sceneB = new THREE.Scene();

	sceneR.add(camera);
	sceneG.add(camera);
	sceneB.add(camera);

	rendererR = new THREE.WebGLRenderer();
	rendererG = new THREE.WebGLRenderer();
	rendererB = new THREE.WebGLRenderer();


	rendererR.setClearColor(new THREE.Color(1.0, 1.0, 1.0));
	rendererG.setClearColor(new THREE.Color(1.0, 1.0, 1.0));
	rendererB.setClearColor(new THREE.Color(1.0, 1.0, 1.0));



	document.getElementById("WebGL-output").appendChild(rendererR.domElement);
	document.getElementById("WebGL-output").appendChild(rendererG.domElement);
	document.getElementById("WebGL-output").appendChild(rendererB.domElement);

	sceneR.add(meshR);
	sceneG.add(meshG);
	sceneB.add(meshB);


	rendererR.render(sceneR, camera);
	rendererG.render(sceneG, camera);
	rendererB.render(sceneB, camera);

}

function outputPretoBranco() {

	geoR = new THREE.Geometry();

	for (var i = 0; i < 256; i++) {
		contadorDePixelsR[i] = 0;
	}

	for (i = 0; i < imagedata.data.length; i += 4) {

		contadorDePixelsR[imagedata.data[i]]++;
		contadorDePixelsR[imagedata.data[i + 1]]++;
		contadorDePixelsR[imagedata.data[i + 2]]++;
	}

	var maxR = 0,
		miniR = 1000000;

	for (var x = 0; x < 256; x++) {

		if (maxR < contadorDePixelsR[x])
			maxR = contadorDePixelsR[x];

		if (miniR > contadorDePixelsR[x])
			miniR = contadorDePixelsR[x];

	}


	for (var x = 0; x < 256; x++) {
		contadorNormalizadoR[x] = (contadorDePixelsR[x] - miniR) / (maxR - miniR);
	}



	for (i = 0; i < 256; i++) {
		if (contadorNormalizadoR[i]) {

			geoR.vertices.push(new THREE.Vector3(i, 0, 0));
			geoR.vertices.push(new THREE.Vector3(i, contadorNormalizadoR[i], 0));
			geoR.vertices.push(new THREE.Vector3(i, 0, 0));
		}

	}

	for (i = 0; i < geoR.vertices.length - 2; i += 3) {
		geoR.faces.push(new THREE.Face3(i, i + 1, i + 2));
	}


	matR = new THREE.MeshBasicMaterial({ color: "black", wireframe: true, side: THREE.DoubleSide });

	meshR = new THREE.Mesh(geoR, matR);

	sceneR = new THREE.Scene();

	sceneR.add(camera);

	rendererR = new THREE.WebGLRenderer();


	rendererR.setClearColor(new THREE.Color(1.0, 1.0, 1.0));


	document.getElementById("WebGL-output").appendChild(rendererR.domElement);

	sceneR.add(meshR);

	rendererR.render(sceneR, camera);

	return;
}