uniform float time;
varying vec2 vUv;
uniform sampler2D texture1;
uniform float distanceFromCenter;

void main() {
  vec4 img = texture2D(texture1, vUv);
  float bw = (img.r + img.b + img.g) / 3.0;
  vec3 colored = vec3(bw, bw, bw); // Изменено на vec3
  gl_FragColor = mix(vec4(colored, 1.0), img, distanceFromCenter); // Преобразование colored в vec4
  gl_FragColor.a = clamp(distanceFromCenter, 0.3, 1.0);
}
