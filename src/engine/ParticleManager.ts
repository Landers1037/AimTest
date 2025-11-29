import * as THREE from 'three';

// 粒子效果管理器
export class ParticleManager {
  private scene: THREE.Scene;
  private particles: THREE.Points[];
  private particleSystems: Array<{
    points: THREE.Points;
    velocities: THREE.Vector3[];
    lifetimes: number[];
    maxLifetime: number;
  }>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.particles = [];
    this.particleSystems = [];
  }

  // 创建爆炸效果
  createExplosion(position: THREE.Vector3, color: string = '#ff6b35'): void {
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorObj = new THREE.Color(color);
    
    const velocities: THREE.Vector3[] = [];
    const lifetimes: number[] = [];
    const maxLifetime = 1.0;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 位置
      positions[i3] = position.x + (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
      
      // 颜色（随机变化）
      colors[i3] = colorObj.r + (Math.random() - 0.5) * 0.3;
      colors[i3 + 1] = colorObj.g + (Math.random() - 0.5) * 0.3;
      colors[i3 + 2] = colorObj.b + (Math.random() - 0.5) * 0.3;
      
      // 速度（向外扩散）
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ));
      
      // 生命周期
      lifetimes.push(maxLifetime);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    
    this.particleSystems.push({
      points,
      velocities,
      lifetimes,
      maxLifetime
    });
  }

  // 创建击中标记
  createHitMarker(position: THREE.Vector3, color: string = '#00ff88'): void {
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorObj = new THREE.Color(color);
    
    const velocities: THREE.Vector3[] = [];
    const lifetimes: number[] = [];
    const maxLifetime = 0.5;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 位置
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;
      
      // 颜色
      colors[i3] = colorObj.r;
      colors[i3 + 1] = colorObj.g;
      colors[i3 + 2] = colorObj.b;
      
      // 速度（环形扩散）
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      velocities.push(new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 2
      ));
      
      // 生命周期
      lifetimes.push(maxLifetime);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    
    this.particleSystems.push({
      points,
      velocities,
      lifetimes,
      maxLifetime
    });
  }

  // 更新所有粒子系统
  update(deltaTime: number): void {
    this.particleSystems = this.particleSystems.filter(system => {
      const positions = system.points.geometry.attributes.position.array as Float32Array;
      const colors = system.points.geometry.attributes.color.array as Float32Array;
      
      let activeParticles = 0;
      
      for (let i = 0; i < system.lifetimes.length; i++) {
        // 更新生命周期
        system.lifetimes[i] -= deltaTime;
        
        if (system.lifetimes[i] > 0) {
          const i3 = i * 3;
          
          // 更新位置
          positions[i3] += system.velocities[i].x * deltaTime;
          positions[i3 + 1] += system.velocities[i].y * deltaTime;
          positions[i3 + 2] += system.velocities[i].z * deltaTime;
          
          // 更新速度（重力、阻力等）
          system.velocities[i].y -= 9.8 * deltaTime * 0.5; // 重力
          system.velocities[i].multiplyScalar(0.98); // 阻力
          
          // 更新透明度
          const alpha = system.lifetimes[i] / system.maxLifetime;
          colors[i3 + 2] *= alpha; // 简单淡出效果
          
          activeParticles++;
        }
      }
      
      // 更新几何体
      system.points.geometry.attributes.position.needsUpdate = true;
      system.points.geometry.attributes.color.needsUpdate = true;
      
      // 更新材质透明度
      const material = system.points.material as THREE.PointsMaterial;
      const avgLifetime = system.lifetimes.reduce((a, b) => a + b, 0) / system.lifetimes.length;
      material.opacity = avgLifetime / system.maxLifetime;
      
      // 如果没有活跃的粒子，移除系统
      if (activeParticles === 0) {
        this.scene.remove(system.points);
        system.points.geometry.dispose();
        material.dispose();
        return false;
      }
      
      return true;
    });
  }

  // 清除所有粒子
  clearParticles(): void {
    this.particleSystems.forEach(system => {
      this.scene.remove(system.points);
      system.points.geometry.dispose();
      (system.points.material as THREE.Material).dispose();
    });
    this.particleSystems = [];
  }
}