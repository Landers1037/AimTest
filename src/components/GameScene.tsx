import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CircleTargetManager } from '@/engine/CircleTargetManager';
import { ShootingSystem2D } from '@/engine/ShootingSystem2D';
import { CrosshairManager } from '@/engine/CrosshairManager';
import { GameSettings, GameState, Target } from '@/types/game';

interface GameSceneProps {
  settings: GameSettings;
  gameState: GameState;
  score: number;
  timeLeft: number;
  onScoreUpdate: (newScore: number) => void;
  onGameEnd: () => void;
}

export default function GameScene({ 
  settings, 
  gameState, 
  score, 
  timeLeft, 
  onScoreUpdate, 
  onGameEnd 
}: GameSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const circleManagerRef = useRef<CircleTargetManager | null>(null);
  const shooting2DRef = useRef<ShootingSystem2D | null>(null);
  const crosshairManagerRef = useRef<CrosshairManager | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化3D场景
  useEffect(() => {
    if (!mountRef.current || isInitialized) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 创建星空背景
    createStarfield(scene);

    // 创建光照
    setupLighting(scene);

    circleManagerRef.current = new CircleTargetManager(container);
    shooting2DRef.current = new ShootingSystem2D(container);
    crosshairManagerRef.current = new CrosshairManager(container);

    // 更新准星样式
    crosshairManagerRef.current.updateStyle({
      color: settings.crosshairColor,
      size: settings.crosshairSize,
      thickness: settings.crosshairThickness
    });

    setIsInitialized(true);

    // 窗口大小调整
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (crosshairManagerRef.current) {
        crosshairManagerRef.current.destroy();
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 更新准星样式
  useEffect(() => {
    if (crosshairManagerRef.current) {
      crosshairManagerRef.current.updateStyle({
        color: settings.crosshairColor,
        size: settings.crosshairSize,
        thickness: settings.crosshairThickness
      });
    }
  }, [settings.crosshairColor, settings.crosshairSize, settings.crosshairThickness]);

  // 游戏循环
  useEffect(() => {
    if (!isInitialized || gameState !== GameState.PLAYING) return;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (deltaTime > 0.1) return; // 防止大的时间跳跃

      if (circleManagerRef.current) {
        circleManagerRef.current.updateTargets(deltaTime);
      }

      // 生成新目标
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current >= 2 / settings.spawnDensity) { // 根据密度调整生成频率
        spawnTimerRef.current = 0;
        if (circleManagerRef.current) {
          circleManagerRef.current.spawnTarget(settings);
        }
      }

      // 渲染场景
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isInitialized, gameState, settings]);

  // 处理鼠标点击
  const handleClick = (event: React.MouseEvent) => {
    if (gameState !== GameState.PLAYING || !shooting2DRef.current || !circleManagerRef.current || !mountRef.current) {
      return;
    }

    const rect = mountRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 更新鼠标位置
    shooting2DRef.current.updateMousePosition(event.clientX, event.clientY);

    // 检测命中
    const targets = circleManagerRef.current.getTargets();
    const hitTarget = shooting2DRef.current.checkHit(targets);

    if (hitTarget) {
      circleManagerRef.current.createExplosion(hitTarget.center.x, hitTarget.center.y, hitTarget.color);
      circleManagerRef.current.removeTarget(hitTarget);
      onScoreUpdate(score + 1);
    } else {
      // 未命中效果（可选）
      console.log('Miss!');
    }
  };

  // 创建星空背景
  const createStarfield = (scene: THREE.Scene) => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
  };

  // 设置光照
  const setupLighting = (scene: THREE.Scene) => {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 点光源（霓虹效果）
    const pointLight1 = new THREE.PointLight(0x00d4ff, 1, 50);
    pointLight1.position.set(-10, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ff88, 1, 50);
    pointLight2.position.set(10, -5, 5);
    scene.add(pointLight2);
  };

  // 清理函数
  useEffect(() => {
    return () => {
      if (circleManagerRef.current) {
        circleManagerRef.current.clearTargets();
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full relative cursor-none"
      onClick={handleClick}
      style={{ minHeight: '600px' }}
    >
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="text-cyan-400 text-lg">加载3D场景中...</div>
        </div>
      )}
    </div>
  );
}
