'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const smoothSpeed = 0.05;

export function ScrollCamera({ scrollProgress }: { scrollProgress: number }) {
  useFrame(({ camera }) => {
    const targetZ = THREE.MathUtils.lerp(6, 10, scrollProgress);
    const targetY = THREE.MathUtils.lerp(0, 1.5, scrollProgress);

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, smoothSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, smoothSpeed);

    camera.lookAt(0, THREE.MathUtils.lerp(0, 0.5, scrollProgress), 0);
  });

  return null;
}
