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

vec3 clamp3(vec3 v, float min, float max) {
    return vec3(
        clamp(v.x, min, max), 
        clamp(v.y, min, max), 
        clamp(v.z, min, max)
    );
}

vec3 palette(float t) {
    vec3 a = vec3(0.03, 0.03, 0.30); // azul abismo
    vec3 b = vec3(0.33, 0.02, 0.40); // púrpura profundo
    vec3 c = vec3(0.25, 0.78, 0.90); // cian bioluminiscente
    vec3 color = a + b * cos2(2.0*PI*t) + 1.5 * c * cos2(PI*t + 1.);
    color.g *= 0.6;
    return color;
}

// Campo pseudo-fractal suave
float field(vec3 p) {
    float strength = 5. + 0.02 * sin(p.x * 2.0 + p.y * 1.5);
    float accum = 0.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 10; ++i) {
        p = abs(p) / dot(p, p) - 0.6;
        float mag = dot(p, p);
        float w = exp(-float(i) / 5.0);
        accum += w * exp(-strength * abs(mag - prev));
        tw += w;
        prev = mag;
    }
    return max(0., 4.0 * accum / tw - 0.6);
}

void fractal(float time, vec2 uv) {
    vec3 dir = normalize(vec3(uv.x * 1.2, uv.y, -1.0));
    vec3 from = vec3(0.0, 0.0, 1.2 * cos2(time * 0.5));
    vec3 col = vec3(0.0);
    float glow = 0.4;

    for (int i = 0; i < 10; ++i) {
        vec3 p = from + dir * float(i) * 0.15;
        float f = field(p);
        float brightness = smoothstep(0.4, 1.1, f);
        vec3 color = palette(f + 0.7 * sin(time + float(i) * 0.25));
        col += brightness * color;
        glow += brightness;
    }

    col /= glow + 0.5;
    col = pow(col, vec3(0.9));

    gl_FragColor += vec4(col, 1.0);
}

void main() {
    float time = u_time * 0.1;
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    float mov = 1.;
    int rot = 2;

    for (int i = 0; i < rot; i++) {
        float alpha = float(i) * 2. * PI / float(rot);
        fractal(time, uv + mov * vec2(cos(alpha), sin(alpha)));
    }
}