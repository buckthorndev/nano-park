import * as THREE from "./lib/three.module.js";
import { FresnelShader } from "./lib/FresnelShader.js";

let scene, camera, renderer;
let container, mouse, raycaster;
const spheres = [];
const blocks = [];

let mouseX = 0,
  mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const init = () => {
  let socket = new WebSocket("wss://node.somenano.com/repeater");
  socket.onopen = () => {
    console.log("WebSocket connected");
    let params = {
      action: "subscribe",
      topic: "confirmation",
    };
    socket.send(JSON.stringify(params));
  };
  
  container = document.createElement("div");
  document.body.appendChild(container);

  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  // Background
  const path = "images/";
  const format = ".jpg";
  const cubeImages = [
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format,
  ];
  const textureCube = new THREE.CubeTextureLoader().load(cubeImages);

  scene = new THREE.Scene();
  scene.background = textureCube;

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 3200;

  const geometry = new THREE.SphereGeometry(100, 32, 16);
  const shader = FresnelShader;

  const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms["tCube"].value = textureCube;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
  });
  

  socket.onmessage = (response) => {
      let data = JSON.parse(response.data)['blocks'];
      blocks.push(...data)
      let length = blocks.length >= 500 ? 500 : blocks.length
      for (let i = 0; i < blocks.length; i++){

      }
    //   blocks.push(...data);
    //   for (let i = 0; i < blocks.length; i++) {
    //     const mesh = new THREE.Mesh(geometry, material);
    
    //     mesh.name = `${i} fuck me`;
    
    //     mesh.position.x = Math.random() * 10000 - 5000;
    //     mesh.position.y = Math.random() * 10000 - 5000;
    //     mesh.position.z = Math.random() * 10000 - 5000;
    
    //     mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
    
    //     mesh.callback = function () {
    //       console.log(mesh.name);
    //     };
    
    //     scene.add(mesh);
    
    //     spheres.push(mesh);
    //   }
  };

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize);
};

const onWindowResize = () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const onDocumentMouseMove = (event) => {
  mouseX = (event.clientX - windowHalfX) * 10;
  mouseY = (event.clientY - windowHalfY) * 10;
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  const timer = 0.0001 * Date.now();

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;

  camera.lookAt(scene.position);

  for (let i = 0, il = spheres.length; i < il; i++) {
    const sphere = spheres[i];

    sphere.position.x = 5000 * Math.cos(timer + i);
    sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
  }

  renderer.render(scene, camera);
};

const onDocumentMouseDown = (event) => {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  try {
    if (intersects.length > 0) {
      intersects[1].object.callback();
    }
  } catch (_) {
    console.log("🏃to far lol");
  }
};

init();
animate();

document.addEventListener("mousemove", onDocumentMouseMove);
window.addEventListener("click", onDocumentMouseDown, false);
