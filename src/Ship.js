import { Transform } from '../engine/core.js';
import { quat, vec3 } from '../lib/gl-matrix-module.js';

export class Ship {
    constructor(health, speed, money_reward, score_reward, path, parent, game) {
        this.health = health;
        this.money_reward = money_reward;
        this.score_reward = score_reward;
        this.rotation_speed = 10;
        this.speed = speed;
        this.path = path;
        this.targetPathIndex = 1;
        this.parent = parent;
        this.game = game;
        this.alive = true;

        this.sin_counter = Math.random() * 100;
        
        this.parent.getComponentOfType(Transform).translation = [...this.path[0]];
    }

    update(t, dt) {
        this.move(t, dt);
    }

    takeDamage(damage) {
        if (!this.alive) { return; }

        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
            this.parent.destroy();
            this.game.score += this.score_reward
            this.game.money += this.money_reward;

            try {
                const explosion = new Audio("./assets/sounds/explosion-short.wav");
                explosion.volume = 0.5;
                explosion.play();
            } catch (error) {
                throw new Error("Problems with sound: " + error)
            }
        }
    }

    move(t, dt) {
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

        // move towards direction and use sin and cos to move up and down
        this.sin_counter += dt;
        vec3.normalize(direction, direction);
        direction[1] = Math.sin(this.sin_counter * 6) / 6;
        vec3.scale(direction, direction, this.speed * dt);
        vec3.add(this.parent.getComponentOfType(Transform).translation, this.parent.getComponentOfType(Transform).translation, direction);
    }
}
