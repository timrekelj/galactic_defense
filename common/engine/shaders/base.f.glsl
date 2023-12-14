#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseTexture;
uniform vec4 uBaseFactor;
uniform vec3 uLightPositions[16];

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vPosition;

out vec4 oColor;

vec3 CalcLight(vec3 lightPos) {
    vec3 L = normalize(lightPos - vPosition);
    vec3 N = normalize(vNormal);
    float lambert = max(dot(N, L), 0.0);
    return vec3(lambert);
}

void main() {
    float ambient = 0.4;
    vec4 baseColor = texture(uBaseTexture, vTexCoord);
    vec3 color;
    for (int i = 0; i < 16; i++) {
        color += CalcLight(uLightPositions[i]);
    }
    oColor += uBaseFactor * baseColor * vec4(color + ambient, 1);
}

