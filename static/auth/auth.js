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

// tu shader GLSL va acá
const material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    fragmentShader: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 u_resolution;
        uniform float u_time;

        #define PI 3.14159265359

        float cos2(float x) {
            return cos(x)*cos(x);
        }

        float pythagoras2(vec2 p) {
            return sqrt(p.x*p.x + p.y*p.y);
        }

        // Paleta inspirada en Mastodon + abismo cósmico
        vec3 palette(float t) {
            vec3 a = vec3(0.0314, 0.0314, 0.3059); // azul profundo
            vec3 b = vec3(0.33, 0.02, 0.40); // púrpura abisal
            vec3 c = vec3(0.2588, 0.7725, 0.902); // cian bioluminiscente
            vec3 color = a + b * cos(t) * cos(2.0*PI*t) + c * sin(t) * sin(2.0*PI*t);
            color.g = color.g * 0.5;
            return color;
        }

        vec3 clamp3(vec3 v, float min, float max) {
            return vec3(
                clamp(v.x, min, max), 
                clamp(v.y, min, max), 
                clamp(v.z, min, max)
            );
        }

        // Fractal orgánico basado en ruido polar
        float field(in vec3 p) {
            float strength = 7. + 0.03 * log(1.e-6 + fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453));
            float accum = 0.;
            float prev = 0.;
            float tw = 0.;
            for (int i = 0; i < 12; ++i) {
                float mag = dot(p, p);
                p = abs(p) / mag - 0.5;
                float w = exp(-float(i) / 5.);
                accum += w * exp(-strength * abs(mag - prev));
                tw += w;
                prev = mag;
            }
            return max(0., 4.5 * accum / tw - 0.7);
        }

        void main() {
            float time = u_time * 0.1;

            vec2 center = gl_FragCoord.xy - 0.5 * u_resolution.xy;
            vec2 uv = center / u_resolution.y;

            float theta = atan(uv.y, uv.x);// - 1.*PI*cos(time*0.25)*cos(time*0.8);
            float radius = pythagoras2(uv);

            for (int j = 0; j < 3; j++) {
                float r = float(j)*PI/6.;
                uv = radius*vec2(cos(theta + r), sin(theta + r));

                vec3 dir = normalize(vec3(uv * 1., -1.0));

                float glow = 0.0;
                vec3 col = vec3(0.0);
                vec3 from = vec3(0.0, 0.0, 1.8*cos2(time*0.5) * 0.5);

                // Marcha de rayos fractal simple
                for (int i = 0; i < 8; ++i) {
                    vec3 p = from + dir * float(i) * 0.1;
                    float f = field(p);
                    float brightness = smoothstep(0.4, 1.2, f);
                    vec3 color = palette(f + 1. * sin(time + float(i) * 0.2));
                    col += brightness * color;
                    glow += brightness;
                }

                col /= glow + 0.5;
                col = pow(col, vec3(0.85)); // corrección gamma
                //col = clamp3(col, 0., 1.);
                gl_FragColor += vec4(col, 1.0);
            }
        }
  	`
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