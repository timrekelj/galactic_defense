import { Transform } from '../engine/core.js';
import { Ship } from './Ship.js';
import { quat, vec3 } from '../lib/gl-matrix-module.js';

export class Turret {
    constructor(scene, parent, turret_place, loader) {
        this.rotation_speed = 10;
        this.range = 30;
        this.shoot_rate = .5;
        this.damage = 10;
        this.time_since_last_shot = 0;
        this.target = null;
        this.turret_place = turret_place;
        this.parent = parent;
        this.scene = scene;
        this.loader = loader;
        this.parent.getComponentOfType(Transform).translation = [...this.turret_place];

        this.laser = this.loader.loadNode("Laser").clone();
        this.laser.getComponentOfType(Transform).translation = [this.turret_place[0], 6, this.turret_place[2]];
        this.scene.addChild(this.laser);
    }

    update(t, dt) {
        // get distance to target
        this.findTarget();

        if (this.target !== null) {
            this.rotate(dt); // get rotation

            this.shoot(dt);
        }
    }

    findTarget() {
        // lose target if it's dead or out of range
        if (
            this.target !== null && !this.target.getComponentOfType(Ship).alive ||
            this.target !== null && vec3.distance(this.target.getComponentOfType(Transform).translation, this.turret_place) > this.range
        ) {
            this.target = null;
            this.laser.getComponentOfType(Transform).scale = [1, 1, 1];
        }
        
        // find new target
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

        this.parent.getComponentOfType(Transform).rotation = rotation; // apply rotation to turret

        // rotate laser
        const laser_rotation = quat.rotateY(quat.create(), quat.create(), Math.atan2(direction[0], direction[2]) + Math.PI);
        quat.slerp(this.laser.getComponentOfType(Transform).rotation, this.laser.getComponentOfType(Transform).rotation, laser_rotation, this.rotation_speed * dt);
        this.laser.getComponentOfType(Transform).rotation = laser_rotation; // apply rotation to laser
    }

    shoot(dt) {
        this.time_since_last_shot += dt;

        if (this.time_since_last_shot > .1) {
            // reset laser length
            this.laser.getComponentOfType(Transform).scale = [1, 1, 1];
        }

        if (this.time_since_last_shot > this.shoot_rate) {
            // set laser length
            const distance = (vec3.distance(this.target.getComponentOfType(Transform).translation, this.turret_place) / 2) - .5;
            // vec3.lerp scale
            this.laser.getComponentOfType(Transform).scale = [1, 1, distance];

            this.time_since_last_shot = 0;
            this.target.getComponentOfType(Ship).takeDamage(this.damage);

            try {
                const explosion = new Audio("./assets/sounds/blaster-edit.wav");
                explosion.volume = 0.1;
                explosion.play();
            } catch (error) {
                throw new Error("Problems with sound: " + error)
            }
            
        }
    }
}
