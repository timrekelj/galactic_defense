import { Transform } from '../engine/core.js';
import { quat, vec3 } from '../lib/gl-matrix-module.js';

export class LightShip {
    constructor(path, parent, game) {
        this.health = 100;
        this.rotation_speed = 10;
        this.speed = 10;
        this.path = path;
        this.targetPathIndex = 1;
        this.parent = parent;
        this.game = game;
        this.alive = true;

        this.parent.getComponentOfType(Transform).translation = [...this.path[0]];
    }

    update(t, dt) {
        this.move(dt);
    }

    takeDamage(damage) {
        if (!this.alive) { return; }

        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
            this.parent.destroy();
            this.game.score += 10;
            this.game.money += 50;
        }
    }

    move(dt) {
        const distance = vec3.distance(this.parent.getComponentOfType(Transform).translation, this.path[this.targetPathIndex]);
        if (distance < 1) {
            this.targetPathIndex++;
        }
        if (this.targetPathIndex >= this.path.length) {
            this.game.lives--;
            this.parent.destroy();
            return;
        }
        const direction = vec3.subtract(vec3.create(), this.path[this.targetPathIndex], this.parent.getComponentOfType(Transform).translation);

        // rotate towards direction
        const rotation = quat.rotateY(quat.create(), quat.create(), Math.atan2(direction[0], direction[2]) + Math.PI / 2);
        quat.slerp(rotation, this.parent.getComponentOfType(Transform).rotation, rotation, this.rotation_speed * dt);

        this.parent.getComponentOfType(Transform).rotation = rotation;

        vec3.normalize(direction, direction);
        vec3.scale(direction, direction, this.speed * dt);
        vec3.add(this.parent.getComponentOfType(Transform).translation, this.parent.getComponentOfType(Transform).translation, direction);
    }
}
