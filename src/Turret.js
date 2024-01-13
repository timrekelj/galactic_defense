import { Transform } from '../engine/core.js';
import { Ship } from './Ship.js';
import { quat, vec3 } from '../lib/gl-matrix-module.js';

export class Turret {
    constructor(scene, parent, turret_place) {
        this.rotation_speed = 10;
        this.range = 30;
        this.shoot_rate = .1;
        this.damage = 10;
        this.time_since_last_shot = 0;
        this.target = null;
        this.turret_place = turret_place;
        this.parent = parent;
        this.scene = scene;
        this.is_rotating = false;
        this.parent.getComponentOfType(Transform).translation = [...this.turret_place];
    }

    update(t, dt) {
        this.findTarget();

        if (this.target !== null) {
            this.rotate(dt);
            this.shoot(dt);
        }
    }

    findTarget() {
        if (this.target !== null && !this.target.getComponentOfType(Ship).alive) {
            this.target = null;
        }
        this.scene.traverse(node => {
            if (
                node.getComponentOfType(Ship) !== undefined &&
                vec3.distance(node.getComponentOfType(Transform).translation, this.turret_place) < this.range
            ) {
                if (this.target === null) { this.target = node; }
            }
        });
    }

    rotate(dt) {
        if (this.target === null) { return; }

        // roatate towards target
        const target_position = this.target.getComponentOfType(Transform).translation;
        const turret_position = this.parent.getComponentOfType(Transform).translation;
        const direction = vec3.subtract(vec3.create(), target_position, turret_position);
        const rotation = quat.rotateY(quat.create(), quat.create(), Math.atan2(direction[0], direction[2]) + Math.PI);
        quat.slerp(this.parent.getComponentOfType(Transform).rotation, this.parent.getComponentOfType(Transform).rotation, rotation, this.rotation_speed * dt);
        this.parent.getComponentOfType(Transform).rotation = rotation;
    }

    shoot(dt) {
        this.time_since_last_shot += dt;

        // If the turret is rotating, it can't shoot
        if (this.is_rotating) { return; }

        if (this.time_since_last_shot > this.shoot_rate) {
            this.time_since_last_shot = 0;
            this.target.getComponentOfType(Ship).takeDamage(this.damage);
            // TODO: spawn bullet or do something to visualize the shot
            // maybe just 3D line from turret to target
            // TODO: add sound?
        }
    }
}
