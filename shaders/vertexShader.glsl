uniform float time;
varying vec2 vUv;
uniform float distanceFromCenter;

float PI = 3.14159265359;

void main() {
  vUv = uv;  // Передаем стандартный атрибут uv в varying переменную
  vUv = (uv - vec2(0.5))*(1. - 0.1*distanceFromCenter*(2. - distanceFromCenter)) + vec2(0.5);

  vec3 pos = position;
  pos.y += sin(PI*uv.x)*0.03;
  pos.z += sin(PI*uv.x)*0.02;

  pos.y += sin(time*0.3)*0.01;
  vUv.y -= sin(time*0.3)*0.01;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
