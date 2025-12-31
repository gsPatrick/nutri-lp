'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import styles from './CanvasBackground.module.css';

/* 
  Absolute Cinema Concept:
  - Deep depth of field (Bokeh)
  - Golden/Champagne sparkles floating lazily
  - Subtle camera movement
*/

const CinemaParticles = () => {
    return (
        <group>
            {/* Foreground particles - larger, faster, out of focus? */}
            <Sparkles
                count={50}
                scale={10}
                size={4}
                speed={0.2}
                opacity={0.5}
                color="#D4A373" // Gold/Bronze
            />

            {/* Midground - main focus */}
            <Sparkles
                count={100}
                scale={12}
                size={2}
                speed={0.1}
                opacity={0.8}
                color="#FFF"
            />

            {/* Background - deep stars/dust */}
            <Float speed={0.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            </Float>
        </group>
    );
};

const CameraRig = () => {
    useFrame((state) => {
        // Very subtle camera drift for cinematic feeling
        const t = state.clock.getElapsedTime();
        state.camera.position.x = Math.sin(t * 0.1) * 0.2;
        state.camera.position.y = Math.cos(t * 0.1) * 0.2;
        state.camera.lookAt(0, 0, 0);
    });
    return null;
};

export default function CanvasBackground() {
    return (
        <div className={styles.canvasWrapper}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.5} />
                <CinemaParticles />
                <CameraRig />
            </Canvas>
        </div>
    );
}
