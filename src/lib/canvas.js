import * as THREE from 'three';

export const createParticles = (count = 100, color = '#3DB28B') => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < count; i++) {
        const x = THREE.MathUtils.randFloatSpread(20);
        const y = THREE.MathUtils.randFloatSpread(20);
        const z = THREE.MathUtils.randFloatSpread(20);
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: color,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
    });

    return new THREE.Points(geometry, material);
};

export const animateParticles = (particles, time) => {
    if (!particles) return;
    particles.rotation.y = time * 0.05;
    particles.rotation.x = time * 0.02;
};
