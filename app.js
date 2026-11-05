/* Personalize this address to enable the contact link. */
const CONTACT_EMAIL = '';
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let renderer, scene, camera, animationFrame, sceneObserver, flowMaterial;
let pointer = { x: 0, y: 0 };
let sceneVisible = true;
let previousFocus;
const app = Vue.createApp({
  data() {
    return {
      year: new Date().getFullYear(), menuOpen: false, paused: motionPreference.matches,
      activeFilter: 'All work', filters: ['All work', 'Web development', 'Creative coding'],
      activeColor: '#2559f4', colors: [{name:'electric blue',hex:'#2559f4'},{name:'pink',hex:'#e781b3'},{name:'lavender',hex:'#8b73e8'}],
      contactEmail: CONTACT_EMAIL, contactOpen: false, selectedProject: null,
      projects: [
        { id:1, title:'Orbit — a fresh take on finance', category:'Web development', subtitle:'Product concept', theme:'mint', tags:['Vue.js','Tailwind CSS','Interface design'], description:'A concept for a calmer personal finance dashboard. A soft green palette, clear hierarchy, and approachable data visuals explore how a financial interface can feel more human.' },
        { id:2, title:'Forma — objects with intention', category:'Web development', subtitle:'Editorial concept', theme:'cream', tags:['HTML & CSS','JavaScript','Art direction'], description:'An illustrative storefront for thoughtfully designed everyday objects. The concept pairs editorial typography with warm materials and generous space, putting the objects at the centre of the experience.' },
        { id:3, title:'Wavelength — an experiment in motion', category:'Creative coding', subtitle:'Visual exploration', theme:'violet', tags:['Three.js','Creative coding','Interaction'], description:'A visual concept exploring repetition, rhythm, and depth. Its concentric forms are an invitation to experiment with the same geometry, light, and motion used in this portfolio’s interactive flow field.' }
      ]
    };
  },
  computed: {
    filteredProjects() { return this.projects.filter(p => this.activeFilter === 'All work' || p.category === this.activeFilter); },
    dialogIsOpen() { return this.contactOpen || !!this.selectedProject; }
  },
  watch: {
    dialogIsOpen(open) {
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { previousFocus = document.activeElement; this.$nextTick(() => this.$refs.dialog?.focus()); }
      else previousFocus?.focus();
    }
  },
  methods: {
    closeDialog() { this.contactOpen=false; this.selectedProject=null; },
    toggleMotion() { this.paused = !this.paused; if (this.paused) renderFrame(); },
    changeColor(hex) { this.activeColor=hex; if(flowMaterial) { flowMaterial.uniforms.uColor.value.set(hex); renderFrame(); } }
  },
  mounted() {
    setupScene(this);
    document.addEventListener('keydown', event => {
      if(!this.dialogIsOpen) return;
      if(event.key==='Escape') this.closeDialog();
      if(event.key==='Tab') {
        const dialog=this.$refs.dialog;
        const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')];
        if(!focusable.length) { event.preventDefault(); return; }
        const first=focusable[0], last=focusable[focusable.length-1];
        if(event.shiftKey && (document.activeElement===first || document.activeElement===dialog)) {event.preventDefault();last.focus();}
        else if(!event.shiftKey && (document.activeElement===last || document.activeElement===dialog)) {event.preventDefault();first.focus();}
      }
    });
    motionPreference.addEventListener('change', event => { this.paused = event.matches; });
  }
}).mount('#app');

function renderFrame() { if(renderer && scene && camera) renderer.render(scene,camera); }
function setupScene(vm) {
  const container = document.getElementById('scene');
  if (!window.THREE) { showFallback(container); return; }
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, .1, 50);
    camera.position.set(0, 3.5, 6.8); camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0); container.appendChild(renderer.domElement);
    const positions = [], indices = [], rows = 48, columns = 100;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        positions.push((col / (columns - 1) - .5) * 12, 0, (row / (rows - 1) - .5) * 7);
        if (col < columns - 1) { const index = row * columns + col; indices.push(index, index + 1); }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices);
    flowMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color(vm.activeColor) } },
      vertexShader: `
        uniform float uTime; uniform vec2 uPointer;
        varying float vHeight; varying float vDepth; varying float vAccent;
        void main() {
          vec3 p = position;
          float d = length(p.xz - uPointer * vec2(4.0, 2.0));
          float wave = sin(p.x * 0.72 + p.z * 0.5 + uTime * 0.3) * 0.46;
          wave += cos(p.x * 0.4 - p.z * 0.85 - uTime * 0.22) * 0.5;
          wave += exp(-d * 0.65) * 0.48;
          p.y = wave; vHeight = wave; vDepth = (p.z + 3.5) / 7.0;
          vAccent = smoothstep(0.74, 1.0, sin(p.z * 1.3 + 0.6));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uColor; varying float vHeight; varying float vDepth; varying float vAccent;
        void main() {
          vec3 ice = mix(uColor, vec3(0.72, 0.84, 1.0), 0.7);
          vec3 color = mix(ice, vec3(1.0, 0.65, 0.83), vAccent * 0.8);
          float alpha = mix(0.12, 0.8, vDepth) * (0.7 + vHeight * 0.18);
          gl_FragColor = vec4(color, alpha);
        }`
    });
    const field = new THREE.LineSegments(geometry, flowMaterial);
    field.rotation.z = -.14; field.position.y = -.45; scene.add(field);
    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); renderFrame();
    };
    new ResizeObserver(resize).observe(container); resize();
    container.addEventListener('pointermove', event => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    });
    container.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
    sceneObserver = new IntersectionObserver(entries => { sceneVisible = entries[0].isIntersecting; }); sceneObserver.observe(container);
    let lastTime = 0; const target = new THREE.Vector2();
    function animate(time) {
      animationFrame = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, .05); lastTime = time;
      if (!sceneVisible || document.hidden || vm.paused) return;
      flowMaterial.uniforms.uTime.value += delta;
      flowMaterial.uniforms.uPointer.value.lerp(target.set(pointer.x, pointer.y), 1 - Math.exp(-delta * 3)); renderFrame();
    }
    animationFrame = requestAnimationFrame(animate);
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault(); cancelAnimationFrame(animationFrame); renderer.dispose(); showFallback(container);
    });
  } catch (error) {
    console.warn('Flow field unavailable.', error); if (renderer) renderer.dispose(); showFallback(container);
  }
}
function showFallback(container) {
  container.innerHTML = '<div class="flow-fallback" aria-hidden="true">' +
    Array.from({length: 24}, (_, index) => '<i style="--line:' + index + '"></i>').join('') + '</div>';
}
