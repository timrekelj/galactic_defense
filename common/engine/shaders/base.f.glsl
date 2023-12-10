#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseTexture;
uniform vec4 uBaseFactor;
uniform vec3 uLightPositions[3];

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vPosition;

out vec4 oColor;

vec4 CalcLight(vec3 lightPos) {
    vec3 L = normalize(lightPos - vPosition);
    vec3 N = normalize(vNormal);
    float lambert = max(dot(N, L), 0.0);
    float ambient = 0.4;

    vec4 baseColor = texture(uBaseTexture, vTexCoord);
    return uBaseFactor * baseColor * vec4(vec3(lambert) + ambient, 1);
}

void main() {
    for (int i = 0; i < 3; i++) {
        oColor += CalcLight(uLightPositions[i]);
    }
}

