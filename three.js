import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";
import textureDefault from "./3.jpg";
import gsap from "gsap";

class Sketch {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // Основные параметры
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();

    this.cube = this.createCube();
    this.clock;

    this.speed = 0;
    this.position = 0;
    this.rounded = 0;
    this.imageAspectRatio = 1.7;
    this.scrollGap = 3000;

    this.mousePos = new THREE.Vector2(0, 0);
    this.sections = document.querySelectorAll(".hero__slide");
    this.titleElement = document.querySelector(".move-title");

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        distanceFromCenter: { type: "f", value: 0 },
        texture1: { type: "t", value: textureDefault },
      },
      wireframe: false,
      transparent: true,
      // blending: THREE.AdditiveBlending,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
    });

    this.materials = [];
    this.meshes = [];
    this.imagesWrapper = document.querySelector(".images");
    this.images = []; // Инициализация свойства images
    this.groups = []; // Инициализация свойства groups

    this.scrollTimeline = gsap.timeline();
    this.attractMode = false;
    this.attractTo = 0;
    this.handleImages(); // Вызов handleImages после инициализации images

    this.time = 0; // Инициализация свойства time

    // Запускаем инициализацию
    this.init();
  }

  async init() {
    this.clock = new THREE.Clock();
    // Добавляем объекты на сцену
    this.addObjects();

    // Обработчики событий
    this.addEventListeners();

    // Добавляем освещение
    this.addLight();

    // Настройка ScrollTrigger
    this.setupScrollTrigger();

    // Запуск анимации
    this.animate();
  }

  handleImages() {
    this.images = [...document.querySelectorAll(".images__image img")];
    this.images.forEach((img, index) => {
      let mat = this.material.clone();
      mat.uniforms.texture1 = {
        value: new THREE.TextureLoader().load(img.src),
      };
      this.materials.push(mat);

      let geo = new THREE.PlaneGeometry(this.imageAspectRatio, 1, 20, 20);
      let mesh = new THREE.Mesh(geo, mat);
      let group = new THREE.Group();
      group.add(mesh);
      this.scene.add(group);
      this.groups.push(group);
      this.meshes.push(mesh);

      mesh.position.y = index * this.imageAspectRatio;
      group.rotation.set(-0.3,-0.5,-0.1);
    });
  }

  // Создание сцены
  createScene() {
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x686868);
    return scene;
  }

  // Создание камеры
  createCamera() {
    const fov = 75;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 3);
    return camera;
  }

  // Создание рендера
  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(this.width, this.height);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (this.container) {
      this.container.appendChild(renderer.domElement);
    } else {
      console.error(`Элемент с id "${this.containerId}" не найден.`);
    }

    return renderer;
  }

  addLight() {
    const hemiLight = new THREE.HemisphereLight(0x099ff, 0xaa5500);
    this.scene.add(hemiLight);
  }

  createCube() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(geo, this.material);
    mesh.position.set(0, 0, 0);
    return mesh;
  }

  addObjects() {
    // this.scene.add(this.cube);
  }

  // Обработчик изменения размеров окна
  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  onWheel(e) {
    this.speed += e.deltaY * 0.0003;
  }

  setupScrollTrigger() {
    let wheelEventAdded = false;

    this.scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: `+=${this.scrollGap}`,
        pin: true,
        scrub: true,
        onEnter: ({progress}) => {
            if (!wheelEventAdded) {
            // window.addEventListener("wheel", this.onWheel.bind(this));
            // wheelEventAdded = true;
          }
        },
        onLeave: () => {
          if (wheelEventAdded) {
            // window.removeEventListener("wheel", this.onWheel.bind(this));
            // wheelEventAdded = false;
          }
        },
        onUpdate: (self) => {
          // if (!this.attractMode) {
            this.position = self.progress * (this.images.length - 1);
            this.rounded = Math.round(this.position);
            this.position = Math.max(0, Math.min(this.position, this.images.length - 1));
            let diff = this.rounded - this.position;
            this.position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015;
          // }
        },
      }
    });
  }

  onMouseMove(evt) {
    this.mousePos.x = (evt.clientX / this.width) * 2 - 1;
    this.mousePos.y = -(evt.clientY / this.height) * 2 + 1;
  }

  // Добавление обработчиков событий
  addEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
    // window.addEventListener("wheel", this.onWheel.bind(this));

    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);

    this.imagesWrapper.addEventListener("mouseenter", () => {
      this.attractMode = true;
    });
    this.imagesWrapper.addEventListener("mouseleave", () => {
      this.attractMode = false;
    });

    this.images.forEach((img, index) => {
      img.addEventListener("mouseenter", () => {
        const scrollToPosition = index * (this.scrollGap / (this.images.length - 1));
        this.attractTo = index;
        if (scrollToPosition === 0) {
          gsap.to(window, {
            scrollTo: { y: '.hero', autoKill: true },
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              // ScrollTrigger.refresh();
            }
          });
        } else {
          gsap.to(window, {
            scrollTo: { y: scrollToPosition, autoKill: true },
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              // ScrollTrigger.refresh();
            }
          });
        }
      });
    });
  }

  // Анимация
  animate() {
    this.position += this.speed;
    // this.speed *= 0.8;

    this.position = Math.max(0, Math.min(this.position, this.images.length - 1));

    this.meshes.forEach((m, index) => {
      m.dist = Math.min(Math.abs(this.position - index), 1);
      m.dist = 1 - m.dist * m.dist;
      let scale = 1 + 0.4 * m.dist;
      m.position.x = 1
      m.position.y = index*this.imageAspectRatio - this.position * this.imageAspectRatio;
      m.scale.set(scale, scale, scale);
      m.material.uniforms.distanceFromCenter.value = m.dist;
    });

    this.rounded = Math.round(this.position);

    let diff = this.rounded - this.position;

    if (this.attractMode) {
      this.position += -(this.position - this.attractTo) * 0.015;
    } else {
      // this.position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015;
    }

    this.sections.forEach((section, index) => {
      if (index === this.rounded) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    })

    this.titleElement.style.transform = `translateY(${this.position * 100}px)`;

    const delta = this.clock.getDelta();
    this.time += 0.05;
    if (this.materials) {
      this.materials.forEach((m, index) => {
        m.uniforms.time.value = this.time;
        // this.meshes[index].rotation.z += delta * 0.5;
      });
    }
    this.material.uniforms.time.value = delta;

    this.cube.rotation.z += delta;
    this.cube.rotation.y += delta;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}

// Запуск инициализации, передаем id элемента
export default Sketch;

// Чтобы запустить, просто нужно создать экземпляр класса
// const sketch = new Sketch('canvas');
