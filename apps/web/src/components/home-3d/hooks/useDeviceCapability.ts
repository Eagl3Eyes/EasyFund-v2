'use client';

import { useEffect, useState } from 'react';

type Capability = 'high' | 'medium' | 'low';

export function useDeviceCapability(): Capability {
  const [capability, setCapability] = useState<Capability>('medium');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      setCapability('low');
      return;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : '';
    const low = /SwiftShader|llvmpipe|Software/i.test(renderer);
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;

    if (low || memory < 4 || cores < 4) {
      setCapability('low');
    } else if (memory >= 8 && cores >= 8) {
      setCapability('high');
    } else {
      setCapability('medium');
    }
  }, []);

  return capability;
}
