function add0s(n, digits) {
    const n_dig = n.toString().length;
    const str_0s = "0".repeat(digits - n_dig);
    return `${str_0s}${n}`;
}

// -----------------------
//         BUTTONS
// -----------------------

const copy_button = document.querySelector("div.room-info button.copy");
copy_button.addEventListener("click", () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/join/${add0s(window.roomID, 4)}`);
    const span = copy_button.querySelector("span");
    const original_text = span.textContent;

    copy_button.disabled = true;
    span.textContent = "Invitation Copied!";

    copy_button.classList.remove("unpressed");
    copy_button.classList.add("pressed");
    
    setTimeout(() => {
        copy_button.disabled = false;
        copy_button.classList.remove("pressed");
        copy_button.classList.add("unpressed");
        span.textContent = original_text;
    }, 3000);
});

document.querySelector("div.room-info button.leave")
    .addEventListener("click", () => {
        window.location.href = "/home/games";
});

document.querySelector("div.room-info button.start")
    .addEventListener("click", () => {
        console.log("todavia no anda, maestro")
});

// -----------------------
//         SHADER
// -----------------------

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

async function get_glsl() {
    return fetch("/room/get-glsl")
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

// -----------------------
//         SOCKETS
// -----------------------

const online_status_socket = io("/online-status");
online_status_socket.emit("status", {"status": `Waiting for ${window.gameName}`});

const room_socket = io("/room-config");

room_socket.on("add-user", (data) => {
    console.log("add");
    
    li_html = `
    <li id="${data.user_id}">
        <span>${data.username}</span>
    </li>`;

    document.querySelector("ul").innerHTML += li_html;
});

room_socket.on("remove-user", (data) => {
    document.querySelector(`ul li.${data.user_id}`).remove();
});