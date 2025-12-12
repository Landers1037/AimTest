import * as THREE from 'three';
import { Target, GameSettings, GameMode } from '@/types/game';

// 3D目标管理器
export class TargetManager {
  private scene: THREE.Scene;
  private targets: Target[];
  private spawnTimer: number;
  private lastSpawnTime: number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.targets = [];
    this.spawnTimer = 0;
    this.lastSpawnTime = 0;
  }

  // 生成新目标
  spawnTarget(settings: GameSettings): Target {
    const geometry = new THREE.SphereGeometry(settings.targetSize, 64, 64);
    const material = new THREE.MeshStandardMaterial({ 
      color: settings.targetColor,
      roughness: 0.1,
      metalness: 0.1,
      emissive: settings.targetColor,
      emissiveIntensity: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1, 1, 1);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // 随机位置
    const position = this.getRandomPosition();
    mesh.position.copy(position);
    
    // 根据游戏模式设置移动属性
    const velocity = this.getVelocityByMode(settings.gameMode, settings.moveSpeed);
    
    this.scene.add(mesh);
    
    const target: Target = {
      mesh,
      position: position.clone(),
      velocity,
      size: settings.targetSize,
      color: settings.targetColor,
      isMoving: settings.gameMode !== GameMode.FIXED,
      destroyed: false
    };
    
    this.targets.push(target);
    return target;
  }



  // 根据游戏模式获取速度
  private getVelocityByMode(gameMode: GameMode, moveSpeed: number): THREE.Vector3 {
    switch (gameMode) {
      case GameMode.FIXED:
        return new THREE.Vector3(0, 0, 0);
      case GameMode.MIXED:
        return Math.random() > 0.5 ? new THREE.Vector3(0, 0, 0) : this.getRandomVelocity(moveSpeed);
      case GameMode.RANDOM:
        return this.getRandomVelocity(moveSpeed);
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }

  // 获取随机速度
  private getRandomVelocity(moveSpeed: number): THREE.Vector3 {
    return new THREE.Vector3(
      (Math.random() - 0.5) * moveSpeed,
      (Math.random() - 0.5) * moveSpeed,
      (Math.random() - 0.5) * moveSpeed * 0.5
    );
  }

  // 获取随机位置
  private getRandomPosition(): THREE.Vector3 {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10
    );
  }

  // 更新所有目标
  updateTargets(deltaTime: number): void {
    this.targets.forEach(target => {
      if (target.destroyed || !target.isMoving) return;
      
      // 更新位置
      target.position.add(target.velocity.clone().multiplyScalar(deltaTime));
      target.mesh.position.copy(target.position);
      
      // 边界检测和反弹
      this.handleBoundaryCollision(target);
    });
    
    // 移除已销毁的目标
    this.targets = this.targets.filter(target => !target.destroyed);
  }

  // 处理边界碰撞
  private handleBoundaryCollision(target: Target): void {
    const bounds = { x: 10, y: 7.5, z: 5 };
    
    if (Math.abs(target.position.x) > bounds.x) {
      target.velocity.x *= -1;
      target.position.x = Math.sign(target.position.x) * bounds.x;
    }
    
    if (Math.abs(target.position.y) > bounds.y) {
      target.velocity.y *= -1;
      target.position.y = Math.sign(target.position.y) * bounds.y;
    }
    
    if (Math.abs(target.position.z) > bounds.z) {
      target.velocity.z *= -1;
      target.position.z = Math.sign(target.position.z) * bounds.z;
    }
  }

  // 检测射击命中
  checkHit(raycaster: THREE.Raycaster): Target | null {
    const meshes = this.targets.map(target => target.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const target = this.targets.find(t => t.mesh === hitMesh);
      
      if (target && !target.destroyed) {
        target.destroyed = true;
        return target;
      }
    }
    
    return null;
  }

  // 移除目标
  removeTarget(target: Target): void {
    target.destroyed = true;
    this.scene.remove(target.mesh);
    if (target.mesh.geometry) target.mesh.geometry.dispose();
    if (target.mesh.material instanceof THREE.Material) target.mesh.material.dispose();
    
    // 从数组中移除
    const index = this.targets.indexOf(target);
    if (index > -1) {
      this.targets.splice(index, 1);
    }
  }

  // 获取所有目标
  getTargets(): Target[] {
    return this.targets;
  }

  // 清除所有目标
  clearTargets(): void {
    this.targets.forEach(target => {
      this.scene.remove(target.mesh);
      if (target.mesh.geometry) target.mesh.geometry.dispose();
      if (Array.isArray(target.mesh.material)) {
        target.mesh.material.forEach(material => material.dispose());
      } else {
        if (target.mesh.material instanceof THREE.Material) target.mesh.material.dispose();
      }
    });
    this.targets = [];
  }
}
