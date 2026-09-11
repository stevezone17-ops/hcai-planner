import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const AdaptiveNetwork3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Check WebGL availability
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Grid representing time slots
    const isDark = document.documentElement.classList.contains("dark");
    const gridHelper = new THREE.GridHelper(12, 12, 0x4f46e5, isDark ? 0x334155 : 0xc7d2fe);
    gridHelper.rotation.x = Math.PI / 2.8;
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Task Nodes
    const nodeCount = 14;
    const nodeGeom = new THREE.SphereGeometry(0.22, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const lockedMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const acceptedMaterial = new THREE.MeshBasicMaterial({ color: 0x34d399 });

    const nodes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const mat = i % 4 === 0 ? lockedMaterial : i % 3 === 0 ? acceptedMaterial : nodeMaterial;
      const mesh = new THREE.Mesh(nodeGeom, mat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3.5 + (i % 3) * 0.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.65);
      const z = (Math.sin(i) * 1.5) - 0.5;

      mesh.position.set(x, y, z);
      scene.add(mesh);
      nodes.push(mesh);
      nodePositions.push(mesh.position);
    }

    // Dynamic Connections (Constraints)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
    });

    const lineGeom = new THREE.BufferGeometry();
    const lineIndices: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 3.8) {
          lineIndices.push(i, j);
        }
      }
    }

    const points: THREE.Vector3[] = [];
    for (let k = 0; k < lineIndices.length; k += 2) {
      points.push(nodePositions[lineIndices[k]], nodePositions[lineIndices[k + 1]]);
    }
    lineGeom.setFromPoints(points);
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lines);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
    };
    container.addEventListener("mousemove", handleMouseMove);

    // Animation Loop with Visibility pausing
    let animationFrameId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = Date.now() * 0.001;

      if (!mediaQuery.matches) {
        // Gentle rotation
        scene.rotation.y = time * 0.08 + mouseX * 0.2;
        scene.rotation.x = mouseY * 0.15;

        // Subtle node pulsing
        nodes.forEach((node, idx) => {
          node.position.y += Math.sin(time * 2 + idx) * 0.002;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-80 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-6 text-center text-xs text-slate-500 dark:text-slate-400 shadow-subtle">
        <div className="space-y-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 mx-auto flex items-center justify-center">
            ✦
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">Adaptive Scheduling Graph</p>
          <p>Real-time constraint solver balancing priority, availability, and human preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Overlay caption */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle pointer-events-none">
        <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
          Interactive 3D Spatial Constraint Network
        </span>
        <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">Hover to tilt graph</span>
      </div>
    </div>
  );
};
