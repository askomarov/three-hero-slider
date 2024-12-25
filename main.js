import "./style.css";
import Sketch from "./three";
import MoveParticles from "./particles";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

console.log("hello js asd");

document.addEventListener(
  "DOMContentLoaded",
  () => {
    // new Sketch("canvas");
    window.addEventListener("load", () => {
      const sketch = new Sketch("canvas");
      const particles = new MoveParticles("particles");
      particles.init();

      const heroTop = document.querySelector(".hero-top");
      const heroTopTitle = heroTop.querySelector("h2");
      const fakeContentBg = document.querySelector(".fake-content-bg");
      // const heroIntroContent = document.querySelector(".hero-intro-content");

      heroTop.style.clipPath =
        "circle(var(--lantern-radius) at var(--lantern-x) var(--lantern-y))";
      gsap.set(heroTop, {
        "--lantern-radius": "0px",
        "--lantern-x": `${window.innerWidth / 2}px`,
        "--lantern-y": `${window.innerHeight / 2}px`,
      });

      const setLanternX = gsap.quickTo(heroTop, "--lantern-x", {
        duration: 0.5,
        ease: "power3.out",
      });
      const setLanternY = gsap.quickTo(heroTop, "--lantern-y", {
        duration: 0.5,
        ease: "power3.out",
      });
      const setLanternRadius = gsap.quickTo(heroTop, "--lantern-radius", {
        duration: 0.5,
        ease: "power3.out",
      });

      const animData = {
        current: 0,
        ease: 0.1,
        previousRadius: 0,
      };

      const updateHeroTop = () => {
        if (!animData.current) return;
        const scrollPosition = animData.current * window.innerHeight;
        let radius;

        const baseRadius = 0.075 * window.innerHeight;
        const gaussian =
          (1 / (0.2 * Math.sqrt(2 * Math.PI))) *
          Math.pow(
            Math.E,
            -1 *
              (Math.pow(scrollPosition / window.innerHeight - 0.5, 2) / 0.1)
          );

        if (animData.current <= 0.5) {
          radius = baseRadius + baseRadius * gaussian;
          animData.previousRadius = radius;
        } else {
          radius =
            animData.previousRadius +
            window.innerHeight * (animData.current - 0.5) * 2.5;
        }

        setLanternX(window.innerWidth / 2);
        setLanternY(window.innerHeight / 2);
        setLanternRadius(radius);

        if (animData.current > 0) {
          particles.pause();
        } else {
          particles.play();
        }
      };

      const introTimeline = gsap.timeline({
        defaults: {
          overwrite: true,
          ease: "power2.out",
        },
        scrollTrigger: {
          trigger: heroTop,
          pin: true,
          pinSpacing: false,
          // anticipatePin: 1,
          start: "bottom bottom",
          end: "+=".concat(1.2 * window.innerHeight),
          // toggleActions: "play none reverse reset",
          markers: true,
          id: "intro",
          once: false,
          scrub: 1,
          onUpdate: (self) => {
            animData.current = self.progress.toFixed(2);
            updateHeroTop();
          },
          onLeave: () => {
            gsap.to(fakeContentBg, {
              // opacity: 0,
            })
          },
          onEnterBack: () => {
            gsap.to(fakeContentBg, {
              // opacity: 1,
            })
          }
        },
      });

      gsap.set(fakeContentBg, {
        scale: 0,
        }
      )
      introTimeline.to(heroTopTitle, {
        scale: 1.5,
        // opacity: 0
      }, '+=0.5');
      introTimeline.to(fakeContentBg, { scale: 1.5 }, '<+0.2');
      const onMouseMove = (evt) => {
        if (animData.current > 0) {
          return;
        }
        const mouseX = evt.clientX;
        const mouseY = evt.clientY;
        const distanceToCenter = Math.sqrt(
          Math.pow(mouseX - window.innerWidth / 2, 2) +
            Math.pow(mouseY - window.innerHeight / 2, 2)
        );
        const maxDistance = Math.sqrt(
          Math.pow(window.innerWidth / 2, 2) +
            Math.pow(window.innerHeight / 2, 2)
        );
        const radius = Math.max((1 - distanceToCenter / maxDistance) * 300, 75);

        setLanternX(mouseX);
        setLanternY(mouseY);
        setLanternRadius(radius);
      };

      window.addEventListener("mousemove", onMouseMove);
    });
  },
  true
);
