import * as THREE from 'three'
var camera, scene, renderer;
var mesh;

init();

function init () {

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 4;

  scene = new THREE.Scene();

  var texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/uv_grid_opengl.jpg');

  var geometry = new THREE.BufferGeometry()
  const frontTriangles = [
    -1, -1, 1, 1, -1, 1, -1, 1, 1, // bottom left
    -1, 1, 1, 1, -1, 1, 1, 1, 1, // top right
  ]
  const backTriangles = [
    1, -1, -1, -1, -1, -1, 1, 1, -1, // bottom left
    1, 1, -1, -1, -1, -1, -1, 1, -1, // top right
  ]
  const leftTriangles = [
    -1, -1, -1, -1, -1, 1, -1, 1, -1,
    -1, 1, -1, -1, -1, 1, -1, 1, 1,
  ]
  const rightTriangles = [
    1, -1, 1, 1, -1, -1, 1, 1, 1,
    1, 1, 1, 1, -1, -1, 1, 1, -1,
  ]
  const topTriangles = [
    1, 1, -1, -1, 1, -1, 1, 1, 1,
    1, 1, 1, -1, 1, -1, -1, 1, 1,
  ]
  const bottomTriangles = [
    1, -1, 1, -1, -1, 1, 1, -1, -1,
    1, -1, -1, -1, -1, 1, -1, -1, -1,
  ]
  const vertices = [
    ...frontTriangles,
    ...backTriangles,
    ...leftTriangles,
    ...rightTriangles,
    ...topTriangles,
    ...bottomTriangles,
  ]

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  var material = new THREE.MeshBasicMaterial({ map: texture });

  mesh = new THREE.Mesh(geometry, material);
  const obj = new THREE.Object3D()
  obj.add(mesh)
  scene.add(obj)

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate)
  document.body.appendChild(renderer.domElement);

}

function animate () {

  renderer.render(scene, camera);

}
