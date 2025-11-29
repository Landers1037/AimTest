import * as THREE from 'three';

// 十字准星管理器
export class CrosshairManager {
  private container: HTMLElement;
  private crosshairElement: HTMLElement;
  private mouseMoveHandler: (e: MouseEvent) => void;
  private settings: {
    color: string;
    size: number;
    thickness: number;
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.settings = {
      color: '#00ff88',
      size: 20,
      thickness: 2
    };
    this.crosshairElement = this.createCrosshairElement();
    this.mouseMoveHandler = (e: MouseEvent) => this.handleMouseMove(e);
    this.setupEventListeners();
  }

  // 创建十字准星元素
  private createCrosshairElement(): HTMLElement {
    const crosshair = document.createElement('div');
    crosshair.className = 'crosshair';
    crosshair.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
    `;

    this.crosshairElement = crosshair;
    this.updateCrosshairStyle();
    document.body.appendChild(crosshair);

    return crosshair;
  }

  // 更新十字准星样式
  private updateCrosshairStyle(): void {
    if (!this.crosshairElement) return;
    const halfSize = this.settings.size / 2;
    const thickness = this.settings.thickness;
    
    this.crosshairElement.innerHTML = `
      <div style="
        position: absolute;
        left: ${-thickness/2}px;
        top: ${-halfSize}px;
        width: ${thickness}px;
        height: ${this.settings.size}px;
        background: ${this.settings.color};
        box-shadow: 0 0 10px ${this.settings.color};
      "></div>
      <div style="
        position: absolute;
        left: ${-halfSize}px;
        top: ${-thickness/2}px;
        width: ${this.settings.size}px;
        height: ${thickness}px;
        background: ${this.settings.color};
        box-shadow: 0 0 10px ${this.settings.color};
      "></div>
      <div style="
        position: absolute;
        left: ${-thickness/2}px;
        top: ${-thickness/2}px;
        width: ${thickness}px;
        height: ${thickness}px;
        background: ${this.settings.color};
        border-radius: 50%;
        box-shadow: 0 0 8px ${this.settings.color};
      "></div>
    `;
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    document.addEventListener('mousemove', this.mouseMoveHandler);
    
    // 隐藏默认鼠标指针
    this.container.style.cursor = 'none';
  }

  // 处理鼠标移动
  private handleMouseMove(event: MouseEvent): void {
    this.updatePosition(event.clientX, event.clientY);
  }

  // 更新位置
  updatePosition(x: number, y: number): void {
    this.crosshairElement.style.left = `${x}px`;
    this.crosshairElement.style.top = `${y}px`;
  }

  // 更新样式
  updateStyle(settings: { color: string; size: number; thickness: number }): void {
    this.settings = { ...this.settings, ...settings };
    this.updateCrosshairStyle();
  }

  // 显示十字准星
  show(): void {
    this.crosshairElement.style.display = 'block';
  }

  // 隐藏十字准星
  hide(): void {
    this.crosshairElement.style.display = 'none';
  }

  // 获取当前设置
  getSettings(): { color: string; size: number; thickness: number } {
    return { ...this.settings };
  }

  // 销毁
  destroy(): void {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.crosshairElement.parentNode) {
      this.crosshairElement.parentNode.removeChild(this.crosshairElement);
    }
    this.container.style.cursor = 'default';
  }
}
