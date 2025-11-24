#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

float cos2(float x) {
    return cos(x)*cos(x);
}

// Paleta coherente con los otros shaders
vec3 palette(float t) {
    vec3 a = vec3(0.0314, 0.0314, 0.3059);
    vec3 b = vec3(0.33, 0.02, 0.40);
    vec3 c = vec3(0.2588, 0.7725, 0.902);
    vec3 color = a + b * cos(t) * cos(2.0*PI*t) + 2. * c * sin(t) * sin(2.0*PI*t);
    color.g *= 0.5;
    return color;
}

// Fractal con torbellino
float field(in vec3 p, float time) {
    float strength = 6.5 + 0.05 * sin(p.z * 3.0 + time * 0.5);
    float accum = 0.0;
    float prev = 0.0;
    float tw = 0.0;

    for (int i = 0; i < 11; ++i) {
        // Rotación espiral
        float ang = 0.5 * time + float(i) * 0.3;
        p.xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xy;

        p = normalize(abs(p))*(sin(time*.6)*sin(time*.6) + 1.4)/5. / dot(p, p) - 0.5;
        float mag = dot(p, p);
        float w = exp(-float(i) / 5.0);
        accum += w * exp(-strength * abs(mag - prev));
        tw += w;
        prev = mag;
    }
    return max(0., 4.2 * accum / tw - 0.6);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float time = u_time * 0.08;

    // Movimiento en espiral
    float r = length(uv);
    float a = atan(uv.y, uv.x) + 0.5 * sin(time * 0.5);
    vec2 swirl = r * vec2(cos(a + 0.4 * sin(time)), sin(a + 0.4 * cos(time)));

    vec3 dir = normalize(vec3(swirl * 1.3, -1.0));
    vec3 from = vec3(0.0, 0.0, 1.8 * cos2(time * 0.4) * 0.5);

    vec3 col = vec3(0.0);
    float glow = 0.0;

    for (int i = 0; i < 8; ++i) {
        vec3 p = from + dir * float(i) * 0.15;
        float f = field(p, time);
        float brightness = smoothstep(0.4, 1.2, f);
        vec3 color = palette(f + 0.8 * sin(time + float(i) * 0.25));
        col += brightness * color;
        glow += brightness;
    }

    col /= glow + 0.5;
    col = pow(col, vec3(0.85));

    gl_FragColor = vec4(col, 1.0);
}
