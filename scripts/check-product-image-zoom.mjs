// Run with: node scripts/check-product-image-zoom.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const refs = [],
  states = [],
  effects = [];
let refIndex = 0,
  stateIndex = 0,
  frameId = 0;
const frames = new Map(),
  listeners = new Map(),
  timers = new Map();
const react = {
  useRef(value) {
    return (refs[refIndex++] ||= {current: value});
  },
  useState(value) {
    const index = stateIndex++;
    if (!(index in states)) states[index] = value;
    return [
      states[index],
      (next) => {
        states[index] = next;
      },
    ];
  },
  useEffect(effect) {
    effects.push(effect);
  },
};
const document = {
  fullscreenElement: null,
  addEventListener(name, callback) {
    listeners.set(name, callback);
  },
  removeEventListener(name) {
    listeners.delete(name);
  },
};
const window = {
  innerWidth: 1200,
  innerHeight: 800,
  matchMedia: () => ({matches: false}),
  requestAnimationFrame(callback) {
    frames.set(++frameId, callback);
    return frameId;
  },
  cancelAnimationFrame(id) {
    frames.delete(id);
  },
  clearTimeout(id) {
    timers.delete(id);
  },
  setTimeout(callback) {
    timers.set(1, callback);
    return 1;
  },
  addEventListener(name, callback) {
    listeners.set(name, callback);
  },
  removeEventListener(name) {
    listeners.delete(name);
  },
};
const jsx = (type, props) => ({type, props});
const module = {exports: {}};
const code = ts.transpileModule(
  readFileSync(
    new URL('../app/components/ProductImage.tsx', import.meta.url),
    'utf8',
  ),
  {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX},
  },
).outputText;
vm.runInNewContext(code, {
  module,
  exports: module.exports,
  document,
  window,
  ResizeObserver: class {
    observe() {}
    disconnect() {}
  },
  require(name) {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime')
      return {jsx, jsxs: jsx, Fragment: 'fragment'};
    if (name === '@shopify/hydrogen') return {Image: 'image'};
    throw new Error(name);
  },
});
const style = {
  setProperty(name, value) {
    this[name] = value;
  },
  removeProperty(name) {
    delete this[name];
  },
};
const classes = new Set();
const media = {
  naturalWidth: 400,
  naturalHeight: 800,
  style,
  classList: {
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  },
};
const slide = {
  querySelector: () => media,
  getBoundingClientRect: () => ({left: 0, top: 0, width: 1200, height: 800}),
};
const carousel = {
  children: [slide, slide],
  clientWidth: 1200,
  scrollLeft: 0,
  getBoundingClientRect: () => ({left: 0}),
  scrollTo({left}) {
    this.scrollLeft = left;
  },
  setPointerCapture() {},
  releasePointerCapture() {},
  classList: media.classList,
};
let selected = 0;
const props = {
  images: [
    {url: 'portrait', width: 400, height: 800},
    {url: 'landscape', width: 1600, height: 800},
  ],
  activeIndex: 0,
  onActiveIndexChange: (index) => {
    selected = index;
  },
};
const render = () => {
  refIndex = 0;
  stateIndex = 0;
  return module.exports.ProductImage(props);
};
const tree = render();
const track = tree.props.children[0].props;
tree.props.ref.current = {};
track.ref.current = carousel;
const cleanups = effects.splice(0).map((effect) => effect());
const move = (x, y, extra = {}) => {
  track.onPointerMove({
    pointerType: 'mouse',
    pointerId: 1,
    buttons: 0,
    clientX: x,
    clientY: y,
    ...extra,
  });
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback());
};
const zoomed = () => classes.has('is-zoomed');
move(600, 400);
assert.equal(zoomed(), false, 'No zoom outside fullscreen');
document.fullscreenElement = tree.props.ref.current;
listeners.get('fullscreenchange')();
move(600, 400);
assert.equal(style['--zoom-scale'], '2');
assert.equal(style['--zoom-x'], '50%');
assert.equal(style['--zoom-y'], '50%');
move(399, 400);
assert.equal(zoomed(), false, 'Ignore portrait letterbox');
move(400, 0);
assert.equal(zoomed(), true, 'Portrait corner is reachable');
assert.equal(style['--zoom-y'], '0%');
move(800, 800);
assert.equal(style['--zoom-y'], '100%');
move(600, 400, {pointerType: 'touch'});
assert.equal(style['--zoom-y'], '100%', 'Touch does not control zoom');
track.onPointerLeave();
assert.equal(zoomed(), false);
media.naturalWidth = 1600;
move(0, 100);
assert.equal(zoomed(), true, 'Landscape corner');
move(600, 99);
assert.equal(zoomed(), false, 'Ignore landscape letterbox');
media.naturalWidth = 4000;
move(600, 280);
assert.equal(zoomed(), true, 'Panoramic edge');
move(600, 279);
assert.equal(zoomed(), false, 'Ignore panoramic letterbox');
move(600, 400);
tree.props.onPointerMove({target: {closest: () => true}});
assert.equal(zoomed(), false, 'Controls reset zoom');
move(600, 400);
track.onPointerDown({button: 0, pointerId: 1, clientX: 600, clientY: 400});
assert.equal(zoomed(), false, 'Drag resets immediately');
assert.equal(style.transition, 'none');
move(600, 400);
assert.equal(zoomed(), false, 'No zoom while pressed');
track.onPointerUp({pointerId: 1});
move(600, 400);
assert.equal(zoomed(), true);
track.onScroll();
move(600, 400);
assert.equal(zoomed(), false, 'No zoom during scroll');
timers.get(1)();
move(600, 400);
assert.equal(zoomed(), true, 'Zoom resumes after scroll settles');
listeners.get('resize')();
assert.equal(zoomed(), false, 'Resize resets zoom');
assert.equal(carousel.scrollLeft, 0, 'Resize keeps snap aligned');
const fullscreenTree = render();
assert.equal(
  fullscreenTree.props.children[0].props.children[0].props.children.props.sizes,
  '400px',
  'Resolution capped at source',
);
assert.equal(
  fullscreenTree.props.children[0].props.children[1].props.children.props.sizes,
  '(min-width: 45em) 50vw, 100vw',
);
const candidates =
  fullscreenTree.props.children[0].props.children[0].props.children.props
    .srcSetOptions;
assert.equal(
  candidates.startingWidth +
    (candidates.intervals - 1) * candidates.incrementSize,
  400,
  'Srcset reaches the source resolution',
);
move(600, 400);
assert.equal(zoomed(), true, 'Zoom resumes on the next move after resize');
tree.props.children[1].props.children[1].props.onClick();
assert.equal(zoomed(), false, 'Arrow navigation resets zoom');
assert.equal(selected, 1);
selected = 0;
document.fullscreenElement = null;
listeners.get('fullscreenchange')();
move(600, 400);
assert.equal(zoomed(), false, 'Exit resets zoom');
document.fullscreenElement = tree.props.ref.current;
track.onPointerMove({
  pointerType: 'mouse',
  pointerId: 1,
  buttons: 0,
  clientX: 600,
  clientY: 400,
});
assert.equal(frames.size, 1, 'Hover schedules a frame');
cleanups.forEach((cleanup) => cleanup?.());
assert.equal(frames.size, 0, 'Unmount cancels RAF');
assert.equal(listeners.size, 0, 'Unmount removes listeners');
assert.equal(selected, 0, 'Hover never changes the selected image');
const css = readFileSync(
  new URL('../app/styles/product.css', import.meta.url),
  'utf8',
);
assert.match(
  css,
  /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.product--desktop \.product-image--interactive:fullscreen img\s*\{\s*transition:\s*none;/,
  'Reduced motion removes the zoom transition',
);
process.stdout.write('Product image zoom checks passed\n');
