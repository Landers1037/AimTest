import * as THREE from 'three';
import { Target } from '@/types/game';

// 射击检测系统
export class ShootingSystem {
  private camera: THREE.PerspectiveCamera;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  // 更新鼠标位置
  updateMousePosition(x: number, y: number, canvas: HTMLElement): void {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  // 检测射击命中
  checkHit(targets: Target[]): Target | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const meshes = targets
      .filter(target => !target.destroyed)
      .map(target => target.mesh);
    
    if (meshes.length === 0) {
      return null;
    }
    
    const intersects = this.raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const target = targets.find(t => t.mesh === hitMesh);
      
      if (target && !target.destroyed) {
        return target;
      }
    }
    
    return null;
  }

  // 获取射线（用于调试）
  getRay(): THREE.Ray {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.ray;
  }

  // 获取鼠标位置
  getMousePosition(): THREE.Vector2 {
    return this.mouse.clone();
  }
}