let start_time = Date.now() / 1000.;

// ----------------------
//         HOVERS
// ----------------------

document.querySelectorAll("div.side-bar div.link").forEach(div => {
    div.addEventListener("mouseenter", () => {
        div.querySelector("span").classList.add("golden-text");
        // div.querySelector("svg use").classList.add("golden-svg");
    });
    div.addEventListener("mouseleave", () => {
        div.querySelector("span").classList.remove("golden-text");
        // div.querySelector("svg use").classList.remove("golden-svg");
    });
});

// -----------------------
//         SHADER
// -----------------------

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas_w = .8;

const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * canvas_w, window.innerHeight);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

async function get_glsl() {
    return fetch("/home/get-glsl")
    .then(response => response.text())
    .then(fileContent => {
        return fileContent;
    });
}

const material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * canvas_w, window.innerHeight) },
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

// -------------------------
//          DIALOG
// -------------------------

const dialog = document.querySelector("dialog.log-out");
const close_modal_button = document.querySelector("dialog.log-out button#close-modal");
close_modal_button.addEventListener("click", () => {
    // material.uniforms.u_xtime.value = 1.;
    // material.uniforms.u_time.value = Date.now() / 1000. - start_time;

    dialog.close();
});

const open_modal_button = document.querySelector("div.side-bar div#log-out");
open_modal_button.addEventListener("click", () => {
    // material.uniforms.u_xtime.value = .3;
    // material.uniforms.u_time.value = Date.now() / 1000. - start_time;

    dialog.showModal();
});

// -------------------------
//           NEWS
// -------------------------

const news_div = document.querySelector("div.side-bar div#news");
news_div.addEventListener("click", () => {
    window.location.href = "/home/news";
});

// -------------------------
//           PLAY
// -------------------------

const play_div = document.querySelector("div.side-bar div#play");
play_div.addEventListener("click", () => {
    window.location.href = "/home/games";
});

// -------------------------
//          FRIENDS
// -------------------------

const firends_div = document.querySelector("div.side-bar div#friends");
firends_div.addEventListener("click", () => {
    window.location.href = "/home/friends";
});

// -------------------------
//          GITHUB
// -------------------------

const github_div = document.querySelector("div.side-bar div#github");
github_div.addEventListener("click", () => {
    window.open("https://github.com/FelipeButhay/Niche-Games");
});

// -------------------------
//        MY ACCOUNT
// -------------------------

const myaccount_div = document.querySelector("div.side-bar div#my-account");
myaccount_div.addEventListener("click", () => {
    window.location.href = "/home/my-account";
});

// -----------------------
//         SOCKETS
// -----------------------

const online_status_socket = io("/online-status")

online_status_socket.on("connect", () => {
    console.log("conecta3");
});