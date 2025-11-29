import { CircleTarget } from './CircleTargetManager';

export class ShootingSystem2D {
  private mouse: { x: number; y: number };
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.mouse = { x: 0, y: 0 };
  }

  updateMousePosition(x: number, y: number): void {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = x - rect.left;
    this.mouse.y = y - rect.top;
  }

  checkHit(targets: CircleTarget[]): CircleTarget | null {
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      if (t.destroyed) continue;
      const dx = this.mouse.x - t.center.x;
      const dy = this.mouse.y - t.center.y;
      if (dx * dx + dy * dy <= t.radius * t.radius) {
        return t;
      }
    }
    return null;
  }
}
