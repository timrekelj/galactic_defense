import { Transform } from '../engine/core.js';
import { vec3 } from '../lib/gl-matrix-module.js';

export class Ship {
    constructor(path, parent) {
        this.health = 100;
        this.speed = 10;
        this.path = path;
        this.targetPathIndex = 1;
        this.parent = parent;
        this.parent.getComponentOfType(Transform).translation = [...this.path[0]];
    }

    update(t, dt) {
        this.move(dt);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    move(dt) {
        const distance = vec3.distance(this.parent.getComponentOfType(Transform).translation, this.path[this.targetPathIndex]);
        if (distance < 1) {
            this.targetPathIndex++;
        }
        if (this.targetPathIndex >= this.path.length) {
            this.parent.destroy();
            return;
        }
        const direction = vec3.subtract(vec3.create(), this.path[this.targetPathIndex], this.parent.getComponentOfType(Transform).translation);

        vec3.normalize(direction, direction);
        vec3.scale(direction, direction, this.speed * dt);
        vec3.add(this.parent.getComponentOfType(Transform).translation, this.parent.getComponentOfType(Transform).translation, direction);
    }
}
