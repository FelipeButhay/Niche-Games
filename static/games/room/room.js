// -----------------------
//         BUTTONS
// -----------------------

const copy_button = document.querySelector("div.room-info button.copy");
copy_button.addEventListener("click", () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/join/${window.roomStrID}`);
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

// config button
if (window.admin) document.querySelector("div.room-info button.config")
    .addEventListener("click", () => {
        document.querySelector("div.main").classList.toggle("hidden");
        document.querySelector("div.configuration").classList.toggle("hidden");
    });

// start button
if (window.admin) document.querySelector("div.room-info button.start")
    .addEventListener("click", () => {
        room_socket.emit("start-game", {"room_id": window.roomID});
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
    
    let li_html = `
    <li id="id${data.user_id}">
        <span>${data.username}</span>
    </li>`;

    document.querySelector("ul").innerHTML += li_html;
});

room_socket.on("remove-user", (data) => {
    console.log("remove");

    document.querySelector(`ul li#id${data.user_id}`).remove();
});

room_socket.on("game-redirect", (response) => {
    console.log("aloha")
    window.location.href = response.redirect;
});

// --------------------------
//         COMPONENTS
// --------------------------

function runScripts(element) {
    element.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");
        newScript.text = oldScript.textContent;
        document.body.appendChild(newScript);
        oldScript.remove();
    });
}

fetch(`/room/get-config/${add0s(window.roomID, 4)}`)
    .then(response => response.json())
    .then(resp => {
        const container = document.querySelector("div.configuration div.config-comps");
        container.innerHTML += resp.html;
        runScripts(container);
    });

/* function goBackConfig() {
    console.log("a")
    if (window.admin) {
        document.querySelector("div.main").classList.toggle("hidden");
        // document.querySelector("div.configuration").classList.toggle("hidden");
    } else {
        console.log("sorry, you're not sigma")
    }
}

document.querySelector("div.configuration svg.close-config")
    .addEventListener("click", () => {
        if (window.admin) {
            document.querySelector("div.main").classList.toggle("hidden");
            document.querySelector("div.configuration").classList.toggle("hidden");
        } else {
            console.log("sorry, you're not sigma")
        }
    });
*/