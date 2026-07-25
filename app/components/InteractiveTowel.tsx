import {useEffect, useRef} from 'react';

const IMAGE_SOURCE = '/images/rudimenterre/home-kitchen-compare-towel.png';
const TEXTURE_WIDTH = 209;
const TEXTURE_HEIGHT = 632;
const LEFT_PADDING = 110;
const RIGHT_PADDING = 300;
const TOP_PADDING = 80;
const BOTTOM_PADDING = 160;
const CANVAS_WIDTH = TEXTURE_WIDTH + LEFT_PADDING + RIGHT_PADDING;
const CANVAS_HEIGHT = TEXTURE_HEIGHT + TOP_PADDING + BOTTOM_PADDING;
const COLUMN_COUNT = 5;
const ROW_COUNT = 9;
const GRAVITY = 0.46;
const AIR_RESISTANCE = 0.972;
const MAX_FALL_SPEED = 15;
const CONSTRAINT_ITERATIONS = 8;

type ClothPoint = {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  originX: number;
  originY: number;
  pinned: boolean;
};

type ClothConstraint = {
  first: number;
  second: number;
  length: number;
};

function drawTexturedTriangle(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  source: Array<[number, number]>,
  destination: Array<[number, number]>,
) {
  const [[sx0, sy0], [sx1, sy1], [sx2, sy2]] = source;
  const [[dx0, dy0], [dx1, dy1], [dx2, dy2]] = destination;
  const determinant =
    sx0 * (sy1 - sy2) +
    sx1 * (sy2 - sy0) +
    sx2 * (sy0 - sy1);

  if (Math.abs(determinant) < 0.001) return;

  const a =
    (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) /
    determinant;
  const b =
    (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) /
    determinant;
  const c =
    (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) /
    determinant;
  const d =
    (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) /
    determinant;
  const e =
    (dx0 * (sx1 * sy2 - sx2 * sy1) +
      dx1 * (sx2 * sy0 - sx0 * sy2) +
      dx2 * (sx0 * sy1 - sx1 * sy0)) /
    determinant;
  const f =
    (dy0 * (sx1 * sy2 - sx2 * sy1) +
      dy1 * (sx2 * sy0 - sx0 * sy2) +
      dy2 * (sx0 * sy1 - sx1 * sy0)) /
    determinant;

  context.save();
  context.beginPath();
  context.moveTo(dx0, dy0);
  context.lineTo(dx1, dy1);
  context.lineTo(dx2, dy2);
  context.closePath();
  context.clip();
  context.setTransform(a, b, c, d, e, f);
  context.drawImage(image, 0, 0);
  context.restore();
}

export function InteractiveTowel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitAreaRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hitArea = hitAreaRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !hitArea || !context) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) return;

    const image = new Image();
    let animationFrame = 0;
    let lastFrameTime = 0;
    let lastInteractionTime = 0;
    let visible = false;
    let initialized = false;
    let draggedPoint: number | null = null;
    let hoverPointer: {x: number; y: number} | null = null;
    let quietFrames = 0;
    const points: ClothPoint[] = [];
    const constraints: ClothConstraint[] = [];
    const columnStep = TEXTURE_WIDTH / (COLUMN_COUNT - 1);
    const rowStep = TEXTURE_HEIGHT / (ROW_COUNT - 1);

    const pointIndex = (column: number, row: number) =>
      row * COLUMN_COUNT + column;

    const addConstraint = (first: number, second: number) => {
      const pointA = points[first];
      const pointB = points[second];
      constraints.push({
        first,
        second,
        length: Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y),
      });
    };

    const initializeMesh = () => {
      for (let row = 0; row < ROW_COUNT; row += 1) {
        for (let column = 0; column < COLUMN_COUNT; column += 1) {
          const x = LEFT_PADDING + column * columnStep;
          const y = TOP_PADDING + row * rowStep;
          points.push({
            x,
            y,
            previousX: x,
            previousY: y,
            originX: x,
            originY: y,
            pinned: row === 0 && column === Math.floor(COLUMN_COUNT / 2),
          });
        }
      }

      for (let row = 0; row < ROW_COUNT; row += 1) {
        for (let column = 0; column < COLUMN_COUNT; column += 1) {
          const current = pointIndex(column, row);
          if (column < COLUMN_COUNT - 1) {
            addConstraint(current, pointIndex(column + 1, row));
          }
          if (row < ROW_COUNT - 1) {
            addConstraint(current, pointIndex(column, row + 1));
          }
          if (column < COLUMN_COUNT - 1 && row < ROW_COUNT - 1) {
            addConstraint(current, pointIndex(column + 1, row + 1));
            addConstraint(pointIndex(column + 1, row), pointIndex(column, row + 1));
          }
        }
      }
    };

    const render = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (let row = 0; row < ROW_COUNT - 1; row += 1) {
        for (let column = 0; column < COLUMN_COUNT - 1; column += 1) {
          const topLeft = points[pointIndex(column, row)];
          const topRight = points[pointIndex(column + 1, row)];
          const bottomLeft = points[pointIndex(column, row + 1)];
          const bottomRight = points[pointIndex(column + 1, row + 1)];
          const sourceTopLeft: [number, number] = [
            column * columnStep,
            row * rowStep,
          ];
          const sourceTopRight: [number, number] = [
            (column + 1) * columnStep,
            row * rowStep,
          ];
          const sourceBottomLeft: [number, number] = [
            column * columnStep,
            (row + 1) * rowStep,
          ];
          const sourceBottomRight: [number, number] = [
            (column + 1) * columnStep,
            (row + 1) * rowStep,
          ];

          drawTexturedTriangle(
            context,
            image,
            [sourceTopLeft, sourceTopRight, sourceBottomRight],
            [
              [topLeft.x, topLeft.y],
              [topRight.x, topRight.y],
              [bottomRight.x, bottomRight.y],
            ],
          );
          drawTexturedTriangle(
            context,
            image,
            [sourceTopLeft, sourceBottomRight, sourceBottomLeft],
            [
              [topLeft.x, topLeft.y],
              [bottomRight.x, bottomRight.y],
              [bottomLeft.x, bottomLeft.y],
            ],
          );
        }
      }

      canvas.dataset.ready = 'true';
    };

    const constrainMesh = () => {
      for (
        let iteration = 0;
        iteration < CONSTRAINT_ITERATIONS;
        iteration += 1
      ) {
        for (const constraint of constraints) {
          const pointA = points[constraint.first];
          const pointB = points[constraint.second];
          const differenceX = pointB.x - pointA.x;
          const differenceY = pointB.y - pointA.y;
          const distance = Math.hypot(differenceX, differenceY) || 1;
          const correction =
            ((distance - constraint.length) / distance) * 0.94;
          const pointAFixed =
            pointA.pinned || constraint.first === draggedPoint;
          const pointBFixed =
            pointB.pinned || constraint.second === draggedPoint;

          if (!pointAFixed && !pointBFixed) {
            pointA.x += differenceX * correction * 0.5;
            pointA.y += differenceY * correction * 0.5;
            pointB.x -= differenceX * correction * 0.5;
            pointB.y -= differenceY * correction * 0.5;
          } else if (pointAFixed && !pointBFixed) {
            pointB.x -= differenceX * correction;
            pointB.y -= differenceY * correction;
          } else if (!pointAFixed && pointBFixed) {
            pointA.x += differenceX * correction;
            pointA.y += differenceY * correction;
          }
        }

        for (const point of points) {
          if (!point.pinned) continue;
          point.x = point.originX;
          point.y = point.originY;
        }
      }
    };

    const simulate = (delta: number) => {
      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        if (point.pinned || index === draggedPoint) continue;
        const velocityX =
          (point.x - point.previousX) * AIR_RESISTANCE;
        const velocityY = Math.min(
          MAX_FALL_SPEED,
          (point.y - point.previousY) * AIR_RESISTANCE +
            GRAVITY * delta * delta,
        );
        point.previousX = point.x;
        point.previousY = point.y;
        point.x += velocityX;
        point.y += velocityY;
      }
      constrainMesh();
      let totalMotion = 0;
      let movingPointCount = 0;
      for (const point of points) {
        if (point.pinned) continue;
        totalMotion += Math.hypot(
          point.x - point.previousX,
          point.y - point.previousY,
        );
        movingPointCount += 1;
      }
      return totalMotion / movingPointCount;
    };

    const animate = (time: number) => {
      animationFrame = 0;
      if (!visible || !initialized) return;

      const delta = Math.min(1.5, Math.max(0.5, (time - lastFrameTime) / 16.67));
      lastFrameTime = time;
      const motion = simulate(delta);
      render();

      if (draggedPoint !== null) {
        quietFrames = 0;
      } else if (time - lastInteractionTime > 500 && motion < 0.3) {
        quietFrames += 1;
      } else {
        quietFrames = 0;
      }

      if (
        draggedPoint !== null ||
        (quietFrames < 18 && time - lastInteractionTime < 10000)
      ) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      lastInteractionTime = performance.now();
      lastFrameTime = lastInteractionTime - 16.67;
      quietFrames = 0;
      if (!animationFrame && visible && initialized) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const pointerPosition = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * CANVAS_WIDTH,
        y: ((event.clientY - bounds.top) / bounds.height) * CANVAS_HEIGHT,
      };
    };

    const pointIsInsideTriangle = (
      pointer: {x: number; y: number},
      pointA: ClothPoint,
      pointB: ClothPoint,
      pointC: ClothPoint,
    ) => {
      const crossProduct = (
        first: ClothPoint,
        second: ClothPoint,
      ) =>
        (pointer.x - second.x) * (first.y - second.y) -
        (first.x - second.x) * (pointer.y - second.y);
      const sideA = crossProduct(pointA, pointB);
      const sideB = crossProduct(pointB, pointC);
      const sideC = crossProduct(pointC, pointA);
      const hasNegativeSide = sideA < 0 || sideB < 0 || sideC < 0;
      const hasPositiveSide = sideA > 0 || sideB > 0 || sideC > 0;

      return !(hasNegativeSide && hasPositiveSide);
    };

    const pointerTouchesTowel = (pointer: {x: number; y: number}) => {
      for (let row = 0; row < ROW_COUNT - 1; row += 1) {
        for (let column = 0; column < COLUMN_COUNT - 1; column += 1) {
          const topLeft = points[pointIndex(column, row)];
          const topRight = points[pointIndex(column + 1, row)];
          const bottomLeft = points[pointIndex(column, row + 1)];
          const bottomRight = points[pointIndex(column + 1, row + 1)];

          if (
            pointIsInsideTriangle(pointer, topLeft, topRight, bottomRight) ||
            pointIsInsideTriangle(pointer, topLeft, bottomRight, bottomLeft)
          ) {
            return true;
          }
        }
      }

      return false;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!initialized) return;
      const pointer = pointerPosition(event);
      if (!pointerTouchesTowel(pointer)) return;
      let nearestPoint = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      points.forEach((point, index) => {
        if (point.pinned) return;
        const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPoint = index;
        }
      });

      if (nearestPoint < 0 || nearestDistance > 90) return;
      event.preventDefault();
      hoverPointer = null;
      draggedPoint = nearestPoint;
      hitArea.setPointerCapture(event.pointerId);
      hitArea.dataset.dragging = 'true';
      points[nearestPoint].previousX = points[nearestPoint].x;
      points[nearestPoint].previousY = points[nearestPoint].y;
      points[nearestPoint].x = pointer.x;
      points[nearestPoint].y = pointer.y;
      startAnimation();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (draggedPoint === null) return;
      event.preventDefault();
      const pointer = pointerPosition(event);
      const point = points[draggedPoint];
      point.x = Math.max(
        0,
        Math.min(CANVAS_WIDTH, pointer.x),
      );
      point.y = Math.max(0, Math.min(CANVAS_HEIGHT, pointer.y));
      lastInteractionTime = performance.now();
      render();
    };

    const onAmbientPointerMove = (event: PointerEvent) => {
      if (
        event.pointerType !== 'mouse' ||
        draggedPoint !== null ||
        !visible ||
        !initialized
      ) {
        return;
      }

      const pointer = pointerPosition(event);
      if (!pointerTouchesTowel(pointer)) {
        hoverPointer = null;
        return;
      }

      if (!hoverPointer) {
        hoverPointer = pointer;
        return;
      }

      const movementX = Math.max(
        -65,
        Math.min(65, pointer.x - hoverPointer.x),
      );
      const movementY = Math.max(
        -65,
        Math.min(65, pointer.y - hoverPointer.y),
      );
      const influenceRadius = 200;
      let affected = false;

      points.forEach((point) => {
        if (point.pinned) return;
        const depth = Math.max(
          0,
          Math.min(1, (point.originY - TOP_PADDING) / TEXTURE_HEIGHT),
        );
        const distance = Math.hypot(
          point.x - pointer.x,
          point.y - pointer.y,
        );
        if (distance >= influenceRadius) return;
        const influence = (1 - distance / influenceRadius) ** 2;
        const wave = depth ** 1.35;
        point.previousX -=
          movementX * (influence * 0.18 + wave * 0.1);
        point.previousY -=
          movementY * (influence * 0.12 + wave * 0.05);
        affected = true;
      });

      if (affected && Math.abs(movementX) + Math.abs(movementY) > 0.5) {
        startAnimation();
      }
      hoverPointer = pointer;
    };

    const releasePointer = (event: PointerEvent) => {
      if (draggedPoint === null) return;
      const point = points[draggedPoint];
      const pointer = pointerPosition(event);
      point.previousX = point.x - (pointer.x - point.previousX) * 0.08;
      point.previousY = point.y - (pointer.y - point.previousY) * 0.08;
      draggedPoint = null;
      delete hitArea.dataset.dragging;
      if (hitArea.hasPointerCapture(event.pointerId)) {
        hitArea.releasePointerCapture(event.pointerId);
      }
      startAnimation();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible && animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        } else if (visible && initialized) {
          points.forEach((point) => {
            if (point.originY > TEXTURE_HEIGHT * 0.35) {
              point.previousX += 4 * (point.originY / TEXTURE_HEIGHT);
            }
          });
          startAnimation();
        }
      },
      {rootMargin: '120px'},
    );

    image.onload = () => {
      initializeMesh();
      initialized = true;
      render();
      if (visible) startAnimation();
    };
    image.src = IMAGE_SOURCE;

    hitArea.addEventListener('pointerdown', onPointerDown);
    hitArea.addEventListener('pointermove', onPointerMove);
    hitArea.addEventListener('pointerup', releasePointer);
    hitArea.addEventListener('pointercancel', releasePointer);
    document.addEventListener('pointermove', onAmbientPointerMove, {
      passive: true,
    });
    observer.observe(canvas);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
      hitArea.removeEventListener('pointerdown', onPointerDown);
      hitArea.removeEventListener('pointermove', onPointerMove);
      hitArea.removeEventListener('pointerup', releasePointer);
      hitArea.removeEventListener('pointercancel', releasePointer);
      document.removeEventListener('pointermove', onAmbientPointerMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="home-kitchen-compare__towel"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      <span
        ref={hitAreaRef}
        className="home-kitchen-compare__towel-hit-area"
      />
    </>
  );
}
