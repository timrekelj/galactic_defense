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
        this.scene.traverse(node => {
            if (
                node.getComponentOfType(Ship) !== undefined &&
                vec3.distance(node.getComponentOfType(Transform).translation, this.turret_place) < this.range
            ) {
                if (this.target === null) {
                    console.log('found target');
                    this.target = node;
                } else if (vec3.distance(this.target.getComponentOfType(Transform).translation, this.turret_place) > vec3.distance(node.getComponentOfType(Transform).translation, this.turret_place)) {
                    this.target = node;
                    console.log('found target');
                }
            }
        });
    }

    rotate(dt) {
        // TODO: implement rotation
        if (this.target === null) { return; }


    }

    shoot(dt) {
        this.time_since_last_shot += dt;

        // If the turret is rotating, it can't shoot
        if (this.is_rotating) { return; }

        if (this.time_since_last_shot > this.shoot_rate) {
            this.time_since_last_shot = 0;
            this.target.getComponentOfType(Ship).takeDamage(this.damage);
            // TODO: spawn bullet or do something to visualize the shot
        }
    }
}
