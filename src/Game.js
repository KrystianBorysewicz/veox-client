import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const clock = new THREE.Clock();

    const stats = Stats();
    mountRef.current.appendChild(stats.dom);


// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 100, 100).normalize();
scene.add(directionalLight);

// Load spaceship model
let spaceship;
let otherShips = [];
const loader = new GLTFLoader();

// Set up DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Adjust the path as needed
loader.setDRACOLoader(dracoLoader);

loader.load(`./spaceship.gltf`, (gltf) => {
    spaceship = new THREE.Group(); // Parent group for the spaceship
    const model = gltf.scene;
    model.rotation.y = Math.PI; // Apply 180-degree rotation to the model
    spaceship.add(model);
    scene.add(spaceship);
    spaceship.position.set(0, 0, 0);

    // Create the username div for the main spaceship
    const clanTag = '[DEV]';
    const username = 'Omni';
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'username own-username';
    usernameDiv.innerHTML = `<span>${clanTag}</span> ${username}`; // Add the clan tag and username
    document.body.appendChild(usernameDiv);

    // Store the usernameDiv in the spaceship's userData for easy access
    spaceship.userData.usernameDiv = usernameDiv;

    addRandomShips(12); // Add 5 random ships to the scene
});

// Camera settings
camera.position.set(0, 100, 0);
camera.lookAt(0, 0, 0);

// Function to add stars to the scene
function createStarField(numStars = 1000) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });

    const starVertices = [];
    for (let i = 0; i < numStars; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Call the function to create stars
createStarField(1000);

// Ammo types configuration
const ammoTypes = [
    { color: 0xff0000 },
    { color: 0x017eff },
    { color: 0xefb00 },
    { color: 0xece2ca },
    { color: 0x3fe3c8 },
    { color: 0xeb9915 }
];

// Track the current ammo type (default to the first one)
let currentAmmoType = 0;

// Movement variables
let targetPosition = new THREE.Vector3();
let moveSpeed = 1;

let isAltPressed = false;
let isDragging = false;
let isMouseDown = false; // Track if the left mouse button is held down
let previousMousePosition = { x: 0, y: 0 };

let mouseX = 0, mouseY = 0; // Store the last known mouse position

// Spherical coordinates for camera movement
let spherical = new THREE.Spherical();
spherical.radius = 100;
spherical.theta = 0;
spherical.phi = Math.PI / 4;

// Attacking
let isAttacking = false;
let projectiles = [];
let attackInterval = null;
const maxAttackRange = 160; // Maximum distance for the attack
const projectileSpeed = 2; // Speed of the projectiles
const projectileLength = 3;

// Track selected ship
let selectedShip = null;
let selectionIndicator = null;
let lockedOn = false;

// Event listeners
window.addEventListener('keydown', (event) => {
    if (isEventOnUI(event)) {
        return; // Ignore events on UI elements
      }

    if (event.key === 'Alt') {
        isAltPressed = true;
    }
    if (event.key >= '1' && event.key <= '6') {
        // Change current ammo type based on the pressed number key
        currentAmmoType = parseInt(event.key) - 1;
        console.log(`Switched to ammo type ${currentAmmoType + 1}`);
    }
});

window.addEventListener('keyup', (event) => {
    if (isEventOnUI(event)) {
        return; // Ignore events on UI elements
      }

    if (event.key === 'Alt') {
        isAltPressed = false;
        isDragging = false;
    }
    if (event.key === 'Control' && selectedShip) {
        lockedOn = !lockedOn;
        toggleAttack();
    }
});

window.addEventListener('mousedown', (event) => {
    if (isEventOnUI(event)) {
        return; // Ignore events on UI elements
      }

    if (event.button === 0) { // Left mouse button
        if (isAltPressed) {
            isDragging = true;
            previousMousePosition.x = event.clientX;
            previousMousePosition.y = event.clientY;
            return;
        }
        if (!checkShipSelection(event)) {
            // If no ship is selected, set the target position for movement
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
            setTargetPositionFromCoordinates(mouseX, mouseY);
        }
        

        // Check for ship selection on click
        
    }
    
});

window.addEventListener('mouseup', (event) => {
    if (isEventOnUI(event)) {
        return; // Ignore events on UI elements
      }

    if (event.button === 0) { // Left mouse button
        isMouseDown = false;
    }
    isDragging = false;
});

window.addEventListener('mousemove', (event) => {
    if (isEventOnUI(event)) {
        return; // Ignore events on UI elements
      }

    mouseX = event.clientX;
    mouseY = event.clientY;

    if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        spherical.theta -= deltaX * 0.01;
        spherical.phi -= deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }

    // Removed the previous code that updated targetPosition here
});

// Add scroll wheel zoom functionality
window.addEventListener('wheel', (event) => {
    if (event.defaultPrevented) {
        return;
      }

    const zoomSpeed = 5;
    spherical.radius += event.deltaY * 0.01 * zoomSpeed;
    spherical.radius = Math.max(20, Math.min(300, spherical.radius)); // Clamp zoom range
});

function isEventOnUI(event) {
    // Check if the event target is inside an element with class 'ui'
    return event.target.closest('.ui');
  }

// Function to toggle attack mode
function toggleAttack() {
    isAttacking = !isAttacking;

    if (!isAttacking) {
        // Stop firing projectiles
        clearInterval(attackInterval);
        attackInterval = null;
    }
}

// Function to fire projectiles at the selected ship
function fireProjectile() {
    if (!selectedShip) return;

    const targetWorldPosition = new THREE.Vector3();
    selectedShip.getWorldPosition(targetWorldPosition);

    const distanceToTarget = spaceship.position.distanceTo(targetWorldPosition);
    if (distanceToTarget > maxAttackRange) {
        toggleAttack();
        return;
    }

    if (currentAmmoType === 4) {
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: ammoTypes[currentAmmoType].color,
            wireframe: false
        });

        const innerRadius = 2;
        const outerRadius = 3;
        const tubeThickness = 0.2;

        const innerCircleGeometry = new THREE.TorusGeometry(innerRadius, tubeThickness, 16, 100);
        const innerCircle = new THREE.Mesh(innerCircleGeometry, circleMaterial);
        innerCircle.position.copy(targetWorldPosition);
        scene.add(innerCircle);

        const outerCircleGeometry = new THREE.TorusGeometry(outerRadius, tubeThickness, 16, 100);
        const outerCircle = new THREE.Mesh(outerCircleGeometry, circleMaterial);
        outerCircle.position.copy(targetWorldPosition);

        const offsetDirection = new THREE.Vector3().subVectors(spaceship.position, targetWorldPosition).normalize();
        const offsetDistance = 2;
        outerCircle.position.add(offsetDirection.clone().multiplyScalar(offsetDistance));

        scene.add(outerCircle);

        innerCircle.lookAt(spaceship.position);
        outerCircle.lookAt(spaceship.position);

        const creationTime = performance.now();

        projectiles.push({ mesh: innerCircle, direction: offsetDirection, target: spaceship, creationTime });
        projectiles.push({ mesh: outerCircle, direction: offsetDirection, target: spaceship, creationTime });

    } else {
        const offsetDistance = 5;
        const rightOffset = new THREE.Vector3().crossVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3().subVectors(targetWorldPosition, spaceship.position)
        ).normalize().multiplyScalar(offsetDistance);
        const leftOffset = rightOffset.clone().negate();

        const offsets = [rightOffset, leftOffset];

        offsets.forEach((offset) => {
            const start = spaceship.position.clone().add(offset);
            const direction = new THREE.Vector3().subVectors(targetWorldPosition, start).normalize();
            const end = start.clone().add(direction.clone().multiplyScalar(projectileLength));

            const material = new THREE.LineBasicMaterial({ color: ammoTypes[currentAmmoType].color });
            const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
            const line = new THREE.Line(geometry, material);

            scene.add(line);

            const creationTime = performance.now();

            projectiles.push({ line, direction, target: selectedShip, creationTime });
        });
    }
}

// Define maximum lifetime for projectiles in milliseconds
const maxProjectileLifetime = 5000; // 5 seconds
const hitboxRadius = 5;

function updateProjectiles() {
    const currentTime = performance.now();

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const { mesh, line, target, creationTime } = projectile;

        if (line) {
            const startPoint = new THREE.Vector3(
                line.geometry.attributes.position.array[0],
                line.geometry.attributes.position.array[1],
                line.geometry.attributes.position.array[2]
            );

            const targetWorldPosition = new THREE.Vector3();
            target.getWorldPosition(targetWorldPosition);
            const newDirection = new THREE.Vector3().subVectors(targetWorldPosition, startPoint).normalize();

            const newStartPoint = startPoint.add(newDirection.multiplyScalar(projectileSpeed));
            const newEndPoint = newStartPoint.clone().add(newDirection.clone().multiplyScalar(projectileLength));

            line.geometry.attributes.position.set([newStartPoint.x, newStartPoint.y, newStartPoint.z], 0);
            line.geometry.attributes.position.set([newEndPoint.x, newEndPoint.y, newEndPoint.z], 3);
            line.geometry.attributes.position.needsUpdate = true;

            const distanceToTarget = newEndPoint.distanceTo(targetWorldPosition);
            if (distanceToTarget < hitboxRadius || currentTime - creationTime > maxProjectileLifetime) {
                scene.remove(line);
                projectiles.splice(i, 1);
            }

        } else if (mesh) {
            const targetWorldPosition = new THREE.Vector3();
            target.getWorldPosition(targetWorldPosition);
            const newDirection = new THREE.Vector3().subVectors(targetWorldPosition, mesh.position).normalize();

            mesh.position.add(newDirection.multiplyScalar(projectileSpeed));

            const distanceToTarget = mesh.position.distanceTo(targetWorldPosition);
            if (distanceToTarget < hitboxRadius || currentTime - creationTime > maxProjectileLifetime) {
                scene.remove(mesh);
                projectiles.splice(i, 1);
            }
        }
    }
}

// Function to set the target position based on screen coordinates
function setTargetPositionFromCoordinates(x, y) {
    const mouse = new THREE.Vector2();
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    targetPosition.copy(intersectPoint);
}

// Function to check if a ship is selected
function checkShipSelection(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(otherShips, true); // 'true' to traverse all descendants

    if (intersects.length > 0) {
        selectedShip = intersects[0].object; // Get the actual object that was clicked
        // Get the world position of the selected ship's parent group
        const worldPosition = new THREE.Vector3();
        selectedShip.getWorldPosition(worldPosition);

        // Position the selection indicator at the center of the selected ship
        selectionIndicator.position.set(
            worldPosition.x,
            worldPosition.y + 1, // Adjust the height as needed
            worldPosition.z
        );
        selectionIndicator.visible = true;
        return true;
    } else {
        return false;
    }
}

// Function to add random ships to the scene
function addRandomShips(numShips) {
    for (let i = 0; i < numShips; i++) {
        loader.load(`./spaceship.gltf`, (gltf) => {
            const otherShipGroup = new THREE.Group(); // Parent group for the other ship
            const otherShipModel = gltf.scene;
            otherShipModel.rotation.y = Math.PI; // Rotate 180 degrees
            otherShipGroup.add(otherShipModel);
            otherShipGroup.position.set(
                (Math.random() - 0.5) * 500,
                0,
                (Math.random() - 0.5) * 500
            );

            // Assign a unique ID to the ship
            otherShipGroup.userData.id = otherShips.length;
            otherShipGroup.userData.targetPosition = new THREE.Vector3();
            otherShipGroup.userData.moveSpeed = 1;

            scene.add(otherShipGroup);
            otherShips.push(otherShipGroup);

            // Create the username div for the ship
            const usernameDiv = document.createElement('div');
            usernameDiv.className = 'username';
            usernameDiv.textContent = `-=[ Venom ${otherShipGroup.userData.id} ]=-`; // Display the ship ID as username
            document.body.appendChild(usernameDiv);

            // Store the usernameDiv in the ship's userData for easy access
            otherShipGroup.userData.usernameDiv = usernameDiv;

            // Initialize the flight destination
            updateShipDestination(otherShipGroup);
        });
    }
}

// Create a selection indicator (red circle)
function createSelectionIndicator() {
    const geometry = new THREE.RingGeometry(10, 12, 32);
    const positions = geometry.attributes.position.array;
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: positions.length / 3 }, (_, i) =>
            new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
        )
    );

    const material = new THREE.LineDashedMaterial({
        color: 0xff0000,
        dashSize: 1, // Length of the dash
        gapSize: 0.5, // Length of the gap between dashes
        linewidth: 1,
        transparent: true,
        opacity: 0.8,
    });

    const line = new THREE.LineSegments(lineGeometry, material);
    line.computeLineDistances(); // Required for dashed lines to work

    line.rotation.x = -Math.PI / 2;
    line.visible = false;
    selectionIndicator = line;
    scene.add(selectionIndicator);
}

function updateSelectionIndicator() {
    if (selectedShip && selectionIndicator) {
        const shipPosition = new THREE.Vector3();
        selectedShip.getWorldPosition(shipPosition);
        
        // Update the selection indicator's position to follow the selected ship
        selectionIndicator.position.set(shipPosition.x, shipPosition.y + 1, shipPosition.z); // Adjust Y offset if needed
        selectionIndicator.visible = true;
    } else {
        selectionIndicator.visible = false; // Hide the indicator if no ship is selected
    }
}

// Call the function to create a selection indicator
createSelectionIndicator();

const maxUsernameRenderDistance = 300; // Set the maximum render distance for the usernames

function updateUsernames() {
    const spaceshipWorldPosition = new THREE.Vector3();
    spaceship.getWorldPosition(spaceshipWorldPosition); // Get your ship's world position

    // Update the main spaceship's username
    const mainUsernameDiv = spaceship.userData.usernameDiv;
    if (mainUsernameDiv) {
        const position = spaceshipWorldPosition.clone();
        position.project(camera);

        const x = (position.x * 0.5 + 0.5) * window.innerWidth;
        const y = (position.y * -0.5 + 0.5) * window.innerHeight;

        mainUsernameDiv.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + 40}px)`; // Offset below the ship
        mainUsernameDiv.style.display = 'block';
    }

    otherShips.forEach(ship => {
        const usernameDiv = ship.userData.usernameDiv;

        // Check if the usernameDiv exists before updating
        if (!usernameDiv) return;

        // Calculate the distance from your spaceship to the current ship
        const distanceToShip = spaceshipWorldPosition.distanceTo(ship.position);

        // Show or hide the username based on the distance
        if (distanceToShip <= maxUsernameRenderDistance) {
            usernameDiv.style.display = 'block'; // Show the username

            // Update the screen position of the username
            const position = ship.position.clone();
            position.project(camera);

            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = (position.y * -0.5 + 0.5) * window.innerHeight;

            usernameDiv.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + 20}px)`; // Offset below the ship
        } else {
            usernameDiv.style.display = 'none'; // Hide the username if out of range
        }
    });
}


// Update the camera position based on spherical coordinates
function updateCameraPosition() {
    if (spaceship) {
        const offsetX = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        const offsetY = spherical.radius * Math.cos(spherical.phi);
        const offsetZ = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

        camera.position.set(
            spaceship.position.x + offsetX,
            spaceship.position.y + offsetY,
            spaceship.position.z + offsetZ
        );

        camera.lookAt(spaceship.position);
    }
}
// Function to update the flight destination of a ship
function updateShipDestination(ship) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 350 + Math.random() * 150;

    // Set the new target position based on the angle and radius
    ship.userData.targetPosition.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
    );
}

// Function to move ships towards their destinations
function moveShips() {
    otherShips.forEach(ship => {
        const targetPosition = ship.userData.targetPosition;
        const direction = new THREE.Vector3().subVectors(targetPosition, ship.position);

        if (direction.length() > ship.userData.moveSpeed) {
            // Move towards the target position
            direction.normalize().multiplyScalar(ship.userData.moveSpeed);
            ship.position.add(direction);

            // Rotate the ship to face the direction of movement
            ship.lookAt(targetPosition);
        } else {
            // When the ship reaches its destination, update the destination
            updateShipDestination(ship);
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    stats.update();
    if (spaceship) {
        // Update target position continuously if left mouse button is held down
        if (isMouseDown && !isAltPressed) {
            setTargetPositionFromCoordinates(mouseX, mouseY);
        }

        // Move towards the target position
        const direction = new THREE.Vector3().subVectors(targetPosition, spaceship.position);
        if (direction.length() > moveSpeed) {
            direction.normalize().multiplyScalar(moveSpeed);
            spaceship.position.add(direction);
        }

        // Rotate towards the selected ship if one is selected
        if (lockedOn && selectedShip) {
            const targetWorldPosition = new THREE.Vector3();
            selectedShip.getWorldPosition(targetWorldPosition);
            const targetDirection = new THREE.Vector3().subVectors(targetWorldPosition, spaceship.position).normalize();
            spaceship.lookAt(spaceship.position.clone().add(targetDirection));
        } else {
            // If no ship is selected, rotate towards the movement direction
            spaceship.lookAt(spaceship.position.clone().add(direction));
        }

        // Move the ships towards their destinations
        moveShips();

        // Update the selection indicator to follow the selected ship
        updateSelectionIndicator();

        // Update projectiles
        updateProjectiles();

        // Check attack range and resume/stop attacking
        if (isAttacking && selectedShip) {
            const targetWorldPosition = new THREE.Vector3();
            selectedShip.getWorldPosition(targetWorldPosition);
            const distanceToTarget = spaceship.position.distanceTo(targetWorldPosition);
            if (distanceToTarget <= maxAttackRange) {
                // Start attacking if within range
                if (!attackInterval) {
                    attackInterval = setInterval(fireProjectile, 350);
                }
            } else {
                // Stop attacking if out of range
                clearInterval(attackInterval);
                attackInterval = null;
            }
        }

        updateUsernames();

        updateCameraPosition();
    }

    renderer.render(scene, camera);
}

// Start the animation loop
animate();


    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
      mountRef.current.removeChild(stats.dom);
      // Clean up any other resources, event listeners, or intervals
    };
  }, []);

  return <div ref={mountRef} />;
}

export default Game;
