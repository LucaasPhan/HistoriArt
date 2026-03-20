/* eslint-disable react-hooks/exhaustive-deps */
import Matter from "matter-js";
import { useInView } from "motion/react";
import { memo, useEffect, useRef, useState } from "react";

interface FallingTextProps {
  text?: string;
  highlightWords?: string[];
  trigger?: "auto" | "scroll" | "click" | "hover";
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
}

const FallingText: React.FC<FallingTextProps> = memo(
  ({
    text = "",
    highlightWords = [],
    trigger = "auto",
    backgroundColor = "transparent",
    wireframes = false,
    gravity = 1,
    mouseConstraintStiffness = 0.2,
    fontSize = "1rem",
  }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);

    const [effectStarted, setEffectStarted] = useState(false);

    useEffect(() => {
      if (!textRef.current) return;
      const words = text.split(" ");

      const newHTML = words
        .map((word) => {
          const isHighlighted = highlightWords.some((hw) => word.startsWith(hw));
          return `<span
          class="inline-block mx-[2px] select-none ${isHighlighted ? "text-cyan-500 font-bold" : ""}"
        >
          ${word}
        </span>`;
        })
        .join(" ");

      textRef.current.innerHTML = newHTML;
    }, [text, highlightWords]);

    const isVisible = useInView(containerRef, { amount: 0.1 });

    useEffect(() => {
      if (trigger === "auto") {
        setEffectStarted(true);
        return;
      }
      if (trigger === "scroll" && isVisible) {
        setEffectStarted(true);
      }
    }, [trigger, isVisible]);

    useEffect(() => {
      if (!effectStarted) return;

      const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

      if (!containerRef.current || !canvasContainerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;

      if (width <= 0 || height <= 0) return;

      const engine = Engine.create();
      engine.world.gravity.y = gravity;

      const render = Render.create({
        element: canvasContainerRef.current,
        engine,
        options: {
          width,
          height,
          background: backgroundColor,
          wireframes,
        },
      });

      const boundaryOptions = {
        isStatic: true,
        render: { fillStyle: "transparent" },
      };
      const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions);
      const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions);
      const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions);
      const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions);

      if (!textRef.current) return;
      const wordSpans = textRef.current.querySelectorAll("span");
      const wordBodies = [...wordSpans].map((elem) => {
        const rect = elem.getBoundingClientRect();

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
          render: { fillStyle: "transparent" },
          restitution: 0.8,
          frictionAir: 0.01,
          friction: 0.2,
        });
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 5,
          y: 0,
        });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

        return { elem, body };
      });

      wordBodies.forEach(({ elem, body }) => {
        elem.style.position = "absolute";
        elem.style.left = `${body.position.x - body.bounds.max.x + body.bounds.min.x / 2}px`;
        elem.style.top = `${body.position.y - body.bounds.max.y + body.bounds.min.y / 2}px`;
        elem.style.transform = "none";
      });

      const mouse = Mouse.create(containerRef.current);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: mouseConstraintStiffness,
          render: { visible: false },
        },
      });
      render.mouse = mouse;

      // Allow scrolling and other interactions
      // @ts-expect-error - mousewheel is not in the types but exists in Matter.js
      mouse.element.removeEventListener("wheel", mouse.mousewheel);
      // @ts-expect-error - mousewheel is not in the types but exists in Matter.js
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
      // @ts-expect-error - touchmove is not in the types but exists in Matter.js
      mouse.element.removeEventListener("touchmove", mouse.mousemove);
      // @ts-expect-error - touchend is not in the types but exists in Matter.js
      mouse.element.removeEventListener("touchstart", mouse.mousedown);
      // @ts-expect-error - touchend is not in the types but exists in Matter.js
      mouse.element.removeEventListener("touchend", mouse.mouseup);

      // Important: Allow swiping on touch devices
      if (containerRef.current) {
        containerRef.current.style.touchAction = "auto";
      }

      World.add(engine.world, [
        floor,
        leftWall,
        rightWall,
        ceiling,
        mouseConstraint,
        ...wordBodies.map((wb) => wb.body),
      ]);

      const runner = Runner.create();
      Runner.run(runner, engine);
      Render.run(render);

      const updateLoop = () => {
        if (!engine || !render) return; // Guard

        wordBodies.forEach(({ body, elem }) => {
          if (!body || !elem) return;
          const { x, y } = body.position;
          elem.style.left = `${x}px`;
          elem.style.top = `${y}px`;
          elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
        });

        Matter.Engine.update(engine);
        frameId = requestAnimationFrame(updateLoop);
      };

      let frameId = requestAnimationFrame(updateLoop);

      return () => {
        cancelAnimationFrame(frameId);
        Render.stop(render);
        Runner.stop(runner);
        if (render.canvas && canvasContainerRef.current) {
          canvasContainerRef.current.removeChild(render.canvas);
        }
        World.clear(engine.world, false);
        Engine.clear(engine);
      };
    }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

    const handleTrigger = () => {
      if (!effectStarted && (trigger === "click" || trigger === "hover")) {
        setEffectStarted(true);
      }
    };

    return (
      <div
        ref={containerRef}
        className="relative z-1 h-full w-full cursor-pointer touch-auto overflow-hidden pt-8 text-center"
        onClick={trigger === "click" ? handleTrigger : undefined}
        onMouseEnter={trigger === "hover" ? handleTrigger : undefined}
      >
        <div
          ref={textRef}
          className="inline-block"
          style={{
            fontSize,
            lineHeight: 1.4,
          }}
        />

        <div className="absolute top-0 left-0 z-0" ref={canvasContainerRef} />
      </div>
    );
  },
);

FallingText.displayName = "FallingText";

export default FallingText;
