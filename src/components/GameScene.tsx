import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TargetManager } from '@/engine/TargetManager';
import { ShootingSystem } from '@/engine/ShootingSystem';
import { ParticleManager } from '@/engine/ParticleManager';
import { CrosshairManager } from '@/engine/CrosshairManager';
import { GameSettings, GameState, Target } from '@/types/game';

interface GameSceneProps {
  settings: GameSettings;
  gameState: GameState;
  score: number;
  timeLeft: number;
  onScoreUpdate: (newScore: number) => void;
  onShoot: () => void;
  onGameEnd: () => void;
}

export default function GameScene({ 
  settings, 
  gameState, 
  score, 
  timeLeft, 
  onScoreUpdate, 
  onShoot,
  onGameEnd 
}: GameSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetManagerRef = useRef<TargetManager | null>(null);
  const shootingSystemRef = useRef<ShootingSystem | null>(null);
  const particleManagerRef = useRef<ParticleManager | null>(null);
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
    // 使用较小的FOV（视场角）来减少透视畸变，使球体在屏幕边缘看起来更圆
    // 原来是75度，现在改为30度，并相应拉远相机距离以保持视野范围不变
    // 计算公式：Distance = (VisibleHeight / 2) / tan(FOV / 2)
    // 目标高度约16单位，tan(15°) ≈ 0.268，Distance ≈ 8 / 0.268 ≈ 30
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);
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

    targetManagerRef.current = new TargetManager(scene);
    shootingSystemRef.current = new ShootingSystem(camera);
    particleManagerRef.current = new ParticleManager(scene);
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

      if (targetManagerRef.current) {
        targetManagerRef.current.updateTargets(deltaTime);
      }

      if (particleManagerRef.current) {
        particleManagerRef.current.update(deltaTime);
      }

      // 生成新目标
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current >= 2 / settings.spawnDensity) { // 根据密度调整生成频率
        spawnTimerRef.current = 0;
        if (targetManagerRef.current) {
          targetManagerRef.current.spawnTarget(settings);
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
    if (gameState !== GameState.PLAYING || !shootingSystemRef.current || !targetManagerRef.current || !mountRef.current) {
      return;
    }

    // 更新鼠标位置
    shootingSystemRef.current.updateMousePosition(event.clientX, event.clientY, mountRef.current);

    // 记录射击
    onShoot();

    // 检测命中
    const targets = targetManagerRef.current.getTargets();
    const hitTarget = shootingSystemRef.current.checkHit(targets);

    if (hitTarget) {
      // 爆炸效果
      if (particleManagerRef.current) {
        particleManagerRef.current.createExplosion(hitTarget.position, hitTarget.color);
      }
      targetManagerRef.current.removeTarget(hitTarget);
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
      if (targetManagerRef.current) {
        targetManagerRef.current.clearTargets();
      }
      if (particleManagerRef.current) {
        particleManagerRef.current.clearParticles();
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
