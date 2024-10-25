import * as THREE from 'three';

class SpaceshipEngine {
    constructor(scene, ship) {
        this.scene = scene;
        this.ship = ship;
        this.engines = [];
        this.tpf = 0;
        this.frame = 16;
        this.updateInterval = 50; // 50ms for updates
        this.isPlaying = false;
        this.smokeEnabled = true;
        this.maxFrames = 360;

        this.degToRad = Math.PI / 180;
        this.radToDeg = 180 / Math.PI;
    }

    initializeEnginePositions(enginePositions) {
        // Clear existing engines
        this.engines.forEach(engine => this.scene.remove(engine));
        this.engines = [];

        // Create new engine meshes
        enginePositions.forEach(position => {
            const geometry = new THREE.CircleGeometry(5, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xffa500, opacity: 0.7, transparent: true });
            const engineMesh = new THREE.Mesh(geometry, material);
            engineMesh.position.set(position.x, position.y, position.z);
            this.scene.add(engineMesh);
            this.engines.push(engineMesh);
        });
    }

    updateEngines(deltaTime) {
        this.tpf += deltaTime;
        if (this.tpf > this.updateInterval) {
            this.tpf = 0;
            if (this.ship.isMoving) {
                this.frame++;
                if (this.frame >= this.maxFrames) this.frame = 0;
            } else {
                this.frame--;
                if (this.frame < 0) this.frame = 0;
            }
            this.engines.forEach(engine => {
                engine.rotation.z = this.degToRad * this.frame;
                engine.visible = this.smokeEnabled && this.frame < 180;
            });
        }
    }

    toggleSmoke(enable) {
        this.smokeEnabled = enable;
        this.engines.forEach(engine => {
            engine.visible = this.smokeEnabled;
        });
    }

    dispose() {
        this.engines.forEach(engine => this.scene.remove(engine));
        this.engines = [];
    }
}

export default SpaceshipEngine;
