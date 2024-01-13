import { mat4, vec3, vec4 } from '../../lib/gl-matrix-module.js';
import {
    getLocalViewMatrix,
    getProjectionMatrix
} from '../core/SceneUtils.js';

export class Raycast {
    // INFO: there is a possibility that this works but I'm not sure as I cannot test it

    constructor() {
        this.ray = vec3.create();
    }

    sendRayFromCamera(event, camera) {
        // normalized device coordinates
        const ray_nds = vec3.fromValues(
            (2 * event.clientX) / window.innerWidth - 1,
            1 - (2 * event.clientY) / window.innerHeight,
            1.0
        );
        // homogeneous clip coordinates
        const ray_clip = vec4.fromValues(ray_nds[0], ray_nds[1], -1.0, 1.0);

        // eye (camera) coordinates
        const ray_eye = vec4.multiply(
            vec4.create(),
            mat4.invert(mat4.create(), getProjectionMatrix(camera)),
            ray_clip
        );

        // unproject the x,y coordinates
        ray_eye[2] = -1.0; 
        ray_eye[3] = 0.0;

        // world coordinates
        const ray_world = vec4.multiply(
            vec4.create(),
            getLocalViewMatrix(camera),
            ray_eye
        );

        this.ray = vec3.normalize(
            vec3.create(),
            vec3.fromValues(ray_world[0], ray_world[1], ray_world[2])
        );
    }
}
