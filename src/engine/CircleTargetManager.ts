export interface CircleTarget {
  element: HTMLElement;
  center: { x: number; y: number };
  radius: number;
  color: string;
  velocity: { x: number; y: number };
  destroyed: boolean;
}

export class CircleTargetManager {
  private container: HTMLElement;
  private targets: CircleTarget[];

  constructor(container: HTMLElement) {
    this.container = container;
    this.targets = [];
  }

  spawnTarget(settings: { targetColor: string; targetSize: number; gameMode: string; moveSpeed: number; }): CircleTarget {
    const radius = Math.max(6, Math.round(settings.targetSize * 16));
    const color = settings.targetColor;
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.width = `${radius * 2}px`;
    element.style.height = `${radius * 2}px`;
    element.style.borderRadius = '50%';
    element.style.background = color;
    element.style.boxShadow = `0 0 12px ${color}`;
    element.style.transform = 'translate(-50%, -50%)';
    element.style.willChange = 'transform';

    const rect = this.container.getBoundingClientRect();
    const center = this.getRandomCenter(radius, rect);
    element.style.left = `${center.x}px`;
    element.style.top = `${center.y}px`;

    const velocity = this.getVelocityByMode(settings.gameMode, settings.moveSpeed);

    this.container.appendChild(element);

    const target: CircleTarget = { element, center, radius, color, velocity, destroyed: false };
    this.targets.push(target);
    return target;
  }

  updateTargets(deltaTime: number): void {
    const rect = this.container.getBoundingClientRect();
    const bounds = { w: rect.width, h: rect.height };
    this.targets.forEach(t => {
      if (t.destroyed) return;
      t.center.x += t.velocity.x * deltaTime * 60;
      t.center.y += t.velocity.y * deltaTime * 60;
      if (t.center.x < t.radius) { t.center.x = t.radius; t.velocity.x *= -1; }
      if (t.center.x > bounds.w - t.radius) { t.center.x = bounds.w - t.radius; t.velocity.x *= -1; }
      if (t.center.y < t.radius) { t.center.y = t.radius; t.velocity.y *= -1; }
      if (t.center.y > bounds.h - t.radius) { t.center.y = bounds.h - t.radius; t.velocity.y *= -1; }
      t.element.style.left = `${Math.round(t.center.x)}px`;
      t.element.style.top = `${Math.round(t.center.y)}px`;
    });
    this.targets = this.targets.filter(t => {
      if (t.destroyed) {
        if (t.element.parentNode) t.element.parentNode.removeChild(t.element);
        return false;
      }
      return true;
    });
  }

  removeTarget(target: CircleTarget): void {
    target.destroyed = true;
  }

  getTargets(): CircleTarget[] {
    return this.targets;
  }

  clearTargets(): void {
    this.targets.forEach(t => {
      if (t.element.parentNode) t.element.parentNode.removeChild(t.element);
    });
    this.targets = [];
  }

  createExplosion(x: number, y: number, color: string): void {
    const burst = document.createElement('div');
    burst.style.position = 'absolute';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.width = '4px';
    burst.style.height = '4px';
    burst.style.borderRadius = '50%';
    burst.style.background = color;
    burst.style.boxShadow = `0 0 10px ${color}`;
    burst.style.transform = 'translate(-50%, -50%) scale(1)';
    burst.style.opacity = '0.9';
    burst.style.transition = 'transform 300ms ease, opacity 300ms ease';
    this.container.appendChild(burst);
    requestAnimationFrame(() => {
      burst.style.transform = 'translate(-50%, -50%) scale(12)';
      burst.style.opacity = '0';
    });
    setTimeout(() => {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 350);
  }

  private getRandomCenter(radius: number, rect: DOMRect): { x: number; y: number } {
    const x = radius + Math.random() * (rect.width - 2 * radius);
    const y = radius + Math.random() * (rect.height - 2 * radius);
    return { x, y };
  }

  private getVelocityByMode(mode: string, speed: number): { x: number; y: number } {
    const s = speed;
    if (mode === 'fixed') return { x: 0, y: 0 };
    if (mode === 'mixed') return Math.random() > 0.5 ? { x: 0, y: 0 } : this.getRandomVelocity(s);
    return this.getRandomVelocity(s);
  }

  private getRandomVelocity(speed: number): { x: number; y: number } {
    return { x: (Math.random() - 0.5) * speed, y: (Math.random() - 0.5) * speed };
  }
}
