#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

float cos2(float x) {
    return cos(x) * cos(x);
}

vec3 palette(float t) {
    vec3 a = vec3(0.0314, 0.0314, 0.3059); // azul profundo
    vec3 b = vec3(0.33, 0.02, 0.40);       // púrpura abisal
    vec3 c = vec3(0.2588, 0.7725, 0.902);  // cian bioluminiscente
    vec3 color = a + b * cos(t) * cos(PI*t) + 2.* c * sin(t) * sin(t);
    color.g *= 0.5;
    return color;
}

// Fractal "horizontal", basado en desplazamiento de ruido 1D
float field(in vec3 p) {
    float strength = 5.5 + 0.03 * sin(p.x * 3.0 + sin(p.y * 2.0));
    float accum = 0.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 10; ++i) {
        p = abs(p) / dot(p, p) - 0.6;
        float mag = dot(p, p);
        float w = exp(-float(i) / 4.5);
        accum += w * exp(-strength * abs(mag - prev));
        tw += w;
        prev = mag;
    }
    return max(0., 4.0 * accum / tw - 0.6);
}

void main() {
    float time = u_time * 0.1;
    vec2 uv = 1.5 * (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    // Transformación horizontal en lugar de radial
    uv = vec2(uv.y, uv.x);
    uv.y = -uv.y*uv.y;
    uv.y = exp(uv.y);
    uv.x += tan(uv.y * 2.0 + time) * 0.3; // oscilación horizontal suave


    vec3 dir = normalize(vec3(uv.x * 1.5, uv.y, -1.));

    vec3 col = vec3(0.0);
    float glow = 0.2;
    vec3 from = vec3(0.0, 0.0, 1.8 * cos2(time * 0.5) * 0.5);

    for (int i = 0; i < 10; ++i) {
        vec3 p = from + dir * float(i) * 0.15;
        float f = field(p);
        float brightness = smoothstep(0.4, 1.1, f);
        vec3 color = palette(f + 0.8 * sin(time + float(i) * 0.3));
        col += brightness * color;
        glow += brightness;
    }

    col /= glow + 0.6;
    col = pow(col, vec3(0.9));
    
    float t = clamp(time, 0., 1.);
    gl_FragColor = vec4(mix(vec3(0.), col, t), 1.);
}
