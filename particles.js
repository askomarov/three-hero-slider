const svgPaths = [
    "m47.38.379-23.5 40.299h46.99L47.38.378Z",
    "M7.58 4.319H5.287a2.027 2.027 0 0 0-2.025-2.025V0A4.321 4.321 0 0 1 7.58 4.319",
    "M7.644 7.657H0V0h2.293v5.364h5.35z"
]

const svgImagesPath = [
    "santa.svg",
    "glass.svg",
    "bottle.svg",
    "gift.svg",
    "logo.svg",
    "tree.svg",
]

class Paricle {
  constructor(x, y, effect) {
    this.originX = x;
    this.originY = y;
    this.effect = effect;
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.ctx = this.effect.ctx;
    this.ctx.fillStyle = "white";
    this.vx = 0;
    this.vy = 0;
    this.ease = 0.2;
    this.friction = 0.95;
    this.dx = 0;
    this.dy = 0;
    this.distance = 0;
    this.force = 0;
    this.angle = 0;
    this.size = Math.floor(Math.random() * 30); // уменьшение размера частиц
    this.path = new Path2D(svgPaths[Math.floor(Math.random() * svgPaths.length)]); // случайный SVG path
    this.svgImage = new Image();
    this.svgImage.src = svgImagesPath[Math.floor(Math.random() * svgImagesPath.length)]; // случайный путь к SVG изображению
    this.svgImage.onload = () => {
      this.draw();
    };
    this.draw();
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.drawImage(this.svgImage, -24, -24, 48, 48); // установка размера SVG 48x48
    this.ctx.restore();

    // просто кдваратики
    // this.ctx.beginPath();
    // this.ctx.fillRect(this.x, this.y, this.size, this.size)
  }

  update() {
    this.dx = this.effect.mouse.x - this.x;
    this.dy = this.effect.mouse.y - this.y;
    this.distance = this.dx * this.dx + this.dy * this.dy;
    this.force = (-this.effect.mouse.radius / this.distance) * 1;

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    this.draw();
  }

  reset() {
    this.x = this.originX;
    this.y = this.originY;
    this.vx = 0;
    this.vy = 0;
    this.draw();
  }
}

class MoveParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Элемент с id "${canvasId}" не найден.`);
    }
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;

    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particlesArray = [];
    this.gap = 120; // уменьшение расстояния между частицами
    this.mouse = {
      radius: 30000, // увеличение радиуса взаимодействия мыши
      x: 0,
      y: 0,
    };
    this.mouseMoved = false;
    this.animationFrameId = null;

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX * window.devicePixelRatio;
      this.mouse.y = e.pageY * window.devicePixelRatio;
      this.mouseMoved = true;
    });

    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth * window.devicePixelRatio;
      this.canvas.height = window.innerHeight * window.devicePixelRatio;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;

      this.particlesArray = [];
      this.init();
    });
  }

  init() {
    for (let x = 0; x < this.width; x += this.gap) {
      for (let y = 0; y < this.height; y += this.gap) {
        this.particlesArray.push(new Paricle(x, y, this));
      }
    }
    this.animate();
  }

  update() {
    if (this.mouseMoved) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      for (let i = 0; i < this.particlesArray.length; i++) {
        this.particlesArray[i].update();
      }
      this.mouseMoved = false;
    }
  }

  animate() {
    this.update();
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.particlesArray.forEach(particle => particle.reset());
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.particlesArray.forEach(particle => particle.draw());
  }

  pause() {
    this.particlesArray.forEach(particle => particle.reset());
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.particlesArray.forEach(particle => particle.draw());
    cancelAnimationFrame(this.animationFrameId);
  }

  play() {
    this.animate();
  }
}

export default MoveParticles;
