// -----------------------
//         SHADER
// -----------------------

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

async function get_glsl() {
    return fetch("/auth/get-glsl")
    .then(response => response.text())
    .then(fileContent => {
        return fileContent;
    });
}

const material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    fragmentShader: await get_glsl()
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate(t) {
    material.uniforms.u_time.value = t * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});