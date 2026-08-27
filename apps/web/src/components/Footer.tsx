import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ShieldCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface AnimatedFooterProps {
  headingLines?: string[];
  leftImage?: string;
  rightImage?: string;
  background?: string;
  textColor?: string;
  asciiChars?: string;
  charColor?: string;
  hoverColor?: string;
  hoverCharColor?: string;
  columns?: number;
  cellSize?: number;
  fontSize?: number;
  parallaxStrength?: number;
  hoverRadius?: number;
  revealOnScroll?: boolean;
  className?: string;
}

const DEFAULT_ASCII_CHARS = "........:::=+xX#0369";
const HIGHLIGHT_LIFETIME = 300;
const CLUSTER_SIZE = 10;
const PARALLAX_EASE = 0.05;

interface Cell {
  col: number;
  row: number;
  char: string;
  highlightEndTime: number;
}

interface Hand {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cells: Map<string, Cell>;
  cellList: Cell[];
  rows: number;
  columns: number;
  cellSize: number;
  baselineOffset: number;
  direction: 1 | -1;
}

function buildHandCells(
  image: HTMLImageElement,
  columns: number,
  asciiChars: string,
): { rows: number; cells: Map<string, Cell> } {
  const naturalAspect = (image.naturalWidth || 600) / (image.naturalHeight || 400);
  const rows = Math.max(1, Math.round(columns / naturalAspect));

  const sampler = document.createElement("canvas");
  sampler.width = columns;
  sampler.height = rows;
  const sampleCtx = sampler.getContext("2d", { willReadFrequently: true });
  const cells = new Map<string, Cell>();
  if (!sampleCtx) return { rows, cells };

  sampleCtx.drawImage(image, 0, 0, columns, rows);
  let pixels: Uint8ClampedArray;
  try {
    pixels = sampleCtx.getImageData(0, 0, columns, rows).data;
  } catch (e) {
    // Return empty cells on CORS origin restrictions
    return { rows, cells };
  }

  const backgroundCharIndex = asciiChars.lastIndexOf(".");

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const offset = (row * columns + col) * 4;
      const brightness =
        (pixels[offset] * 0.299 +
          pixels[offset + 1] * 0.587 +
          pixels[offset + 2] * 0.114) /
        255;
      const charIndex = Math.min(
        asciiChars.length - 1,
        Math.floor((1 - brightness) * asciiChars.length),
      );
      if (charIndex <= backgroundCharIndex) continue;

      cells.set(`${col},${row}`, {
        col,
        row,
        char: asciiChars[charIndex],
        highlightEndTime: 0,
      });
    }
  }

  return { rows, cells };
}

function highlightCluster(cells: Map<string, Cell>, startCell: Cell) {
  const now = Date.now();
  startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

  const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
  const litCells = [startCell];
  let current = startCell;

  for (let step = 0; step < steps; step++) {
    const neighbours: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const neighbour = cells.get(`${current.col + dx},${current.row + dy}`);
        if (neighbour && !litCells.includes(neighbour)) neighbours.push(neighbour);
      }
    }
    if (neighbours.length === 0) break;

    const next = neighbours[Math.floor(Math.random() * neighbours.length)];
    next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 10;
    litCells.push(next);
    current = next;
  }
}

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const overflowY = getComputedStyle(el).overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return el;
    el = el.parentElement;
  }
  return null;
}

export const Footer = ({
  headingLines = ["VERO"],
  leftImage = "https://images.unsplash.com/photo-1595079672139-cee25815d088?auto=format&fit=crop&w=600&q=80",
  rightImage = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80",
  background,
  textColor,
  charColor = "#10b981",
  hoverColor = "#34d399",
  hoverCharColor = "#0f0f0f",
  asciiChars = DEFAULT_ASCII_CHARS,
  columns = 50,
  cellSize = 16,
  fontSize = 14,
  parallaxStrength = 15,
  hoverRadius = 8,
  revealOnScroll = true,
  className,
}: AnimatedFooterProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const leftWrapRef = useRef<HTMLDivElement>(null);
  const rightWrapRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);

  const liveRef = useRef({ charColor, hoverColor, hoverCharColor, parallaxStrength, hoverRadius });
  useEffect(() => {
    liveRef.current = { charColor, hoverColor, hoverCharColor, parallaxStrength, hoverRadius };
  }, [charColor, hoverColor, hoverCharColor, parallaxStrength, hoverRadius]);

  const sig = useMemo(
    () =>
      JSON.stringify({
        leftImage,
        rightImage,
        columns,
        cellSize,
        fontSize,
        asciiChars,
        revealOnScroll,
        headingLines,
      }),
    [leftImage, rightImage, columns, cellSize, fontSize, asciiChars, revealOnScroll, headingLines],
  );

  useEffect(() => {
    const root = rootRef.current;
    const leftWrap = leftWrapRef.current;
    const rightWrap = rightWrapRef.current;
    if (!root || !leftWrap || !rightWrap) return;

    const hands: Hand[] = [];
    const wrappers = [leftWrap, rightWrap];

    const setupHand = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      direction: 1 | -1,
    ) => {
      const { rows, cells } = buildHandCells(image, columns, asciiChars);
      if (cells.size === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = columns * cellSize * dpr;
      canvas.height = rows * cellSize * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const baselineOffset = cellSize / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

      hands.push({
        canvas,
        ctx,
        cells,
        cellList: [...cells.values()],
        rows,
        columns,
        cellSize,
        baselineOffset,
        direction,
      });
    };

    const loadHand = (src: string, canvas: HTMLCanvasElement, direction: 1 | -1) => {
      if (!src) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      let initialized = false;
      const init = () => {
        if (initialized) return;
        initialized = true;
        setupHand(image, canvas, direction);
      };
      image.onload = init;
      image.src = src;
      if (image.complete && image.naturalWidth) init();
    };

    loadHand(leftImage, leftCanvasRef.current!, 1);
    loadHand(rightImage, rightCanvasRef.current!, -1);

    const renderHand = (hand: Hand, now: number) => {
      const { ctx, cellList, cellSize: cs, baselineOffset, columns: cols, rows } = hand;
      const { charColor: cc, hoverColor: hc, hoverCharColor: hcc } = liveRef.current;
      ctx.clearRect(0, 0, cols * cs, rows * cs);

      for (const cell of cellList) {
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.fillStyle = hc;
          ctx.fillRect(x, y, cs, cs);
        }
        ctx.fillStyle = isHighlighted ? hcc : cc;
        ctx.fillText(cell.char, x + cs / 2, y + baselineOffset);
      }
    };

    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const curtain = { offset: revealOnScroll ? 100 : 0 };

    const hoverHand = (hand: Hand, clientX: number, clientY: number) => {
      const rect = hand.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const mouseCol = ((clientX - rect.left) / rect.width) * hand.columns;
      const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

      let closest: Cell | null = null;
      let closestDist = Infinity;
      for (const cell of hand.cellList) {
        const dx = mouseCol - cell.col;
        const dy = mouseRow - cell.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = cell;
        }
      }
      if (closest && closestDist <= liveRef.current.hoverRadius) {
        highlightCluster(hand.cells, closest);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const strength = liveRef.current.parallaxStrength;
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      pointer.x = ((event.clientX - rect.left) / w - 0.5) * strength * 2;
      pointer.y = ((event.clientY - rect.top) / h - 0.5) * strength * 2;
      for (const hand of hands) hoverHand(hand, event.clientX, event.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);

    let rafId = 0;
    const frame = () => {
      const now = Date.now();
      for (const hand of hands) renderHand(hand, now);

      drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y - drift.y) * PARALLAX_EASE;

      wrappers.forEach((wrapper, i) => {
        const dir = i === 0 ? -1 : 1;
        const revealX = i === 0 ? -curtain.offset : curtain.offset;
        const x = drift.x * (i === 0 ? 1 : -1);
        const y = -drift.y;

        // Uses translate3d for GPU acceleration across both left/right wrappers
        wrapper.style.transform = `translate3d(${revealX}%, 0, 0) translate3d(${x}px, ${y}px, 0)`;
      });

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const chars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-af-char]"));

    const animateIn = () => {
      gsap.to(curtain, { offset: 0, duration: 1, ease: "power3.out", overwrite: true });
      gsap.to(chars, {
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        stagger: { each: 0.04, from: "center" },
        overwrite: true,
      });
    };

    const animateOut = () => {
      gsap.to(curtain, { offset: 100, duration: 0.4, ease: "power2.in", overwrite: true });
      gsap.to(chars, {
        yPercent: 125,
        duration: 0.4,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
        overwrite: true,
      });
    };

    let observer: IntersectionObserver | null = null;

    if (revealOnScroll) {
      gsap.set(chars, { yPercent: 125 });
      let isRevealed = false;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !isRevealed) {
              isRevealed = true;
              animateIn();
            } else if (!entry.isIntersecting && isRevealed) {
              isRevealed = false;
              animateOut();
            }
          }
        },
        { root: getScrollParent(root), threshold: 0.15 },
      );
      observer.observe(root);
    } else {
      gsap.set(chars, { yPercent: 0 });
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      observer?.disconnect();
      gsap.killTweensOf([curtain, ...chars]);
    };
  }, [sig]);

  const offEdge = revealOnScroll ? 100 : 0;

  return (
    <footer
      ref={rootRef}
      className={cn(
        "relative min-h-[480px] w-full overflow-hidden bg-card text-foreground border-t border-border pt-16 pb-28",
        className
      )}
      style={{ backgroundColor: background, color: textColor, containerType: "inline-size" }}
    >
      {/* ASCII Canvas Layer - Fixed Left/Right Flex Positioning */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between opacity-50 z-0">
        <div
          ref={leftWrapRef}
          className="relative w-1/2 max-w-[45%] will-change-transform flex justify-start"
          style={{ transform: `translate3d(-${offEdge}%, 0, 0)` }}
        >
          <canvas ref={leftCanvasRef} className="block h-auto max-w-full" />
        </div>
        <div
          ref={rightWrapRef}
          className="relative w-1/2 max-w-[45%] will-change-transform flex justify-end"
          style={{ transform: `translate3d(${offEdge}%, 0, 0)` }}
        >
          <canvas ref={rightCanvasRef} className="block h-auto max-w-full" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-base font-semibold tracking-wide">Vero</span>
            </div>
            <p className="text-muted-foreground text-xs font-light leading-relaxed max-w-xs">
              Protecting African consumers from counterfeit products with instant SMS and web verification.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-emerald-400">Pages</h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light">
                  Verify
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light">
                  Report a fake
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light">
                  How it works
                </a>
              </li>
              <li>
                <Link to="/signup" className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light">
                  Sign up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light">
                  Log in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-emerald-400">Contact Us</h4>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:hello@vero.africa"
                className="text-muted-foreground hover:text-foreground transition-colors text-xs font-light flex items-center gap-2"
              >
                <Mail className="h-3.5 w-3.5" />
                hello@vero.africa
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground text-xs font-light">
          <p>&copy; 2026 Vero. All rights reserved.</p>
        </div>
      </div>

      {/* GSAP Typography Unmasking Layer */}
      <div className="absolute inset-x-0 bottom-2 flex items-end justify-center gap-4 pointer-events-none select-none opacity-20">
        {headingLines.map((word, wi) => (
          <h2
            key={`${word}-${wi}`}
            aria-label={word}
            className="overflow-hidden font-bold leading-none tracking-tighter"
            style={{ fontSize: "clamp(2rem, 12cqw, 9rem)" }}
          >
            {Array.from(word).map((ch, ci) => (
              <span
                key={ci}
                data-af-char
                aria-hidden="true"
                className="inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h2>
        ))}
      </div>
    </footer>
  );
};

export default Footer;