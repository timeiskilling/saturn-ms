import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";

const STATUS = {
  done: { color: "#22c55e", label: "Done" },
  active: { color: "#3b82f6", label: "Active" },
  soon: { color: "#f59e0b", label: "Soon" },
  planned: { color: "#52525b", label: "Planned" },
};

const tree = {
  branches: [
    {
      id: "interface",
      label: ["Interface", "Implementation"],
      color: "#e4e4e7",
      leaves: [
        { label: ["Templates executing", "History"], status: "done" },
        { label: ["Timer/Event", "to executing"], status: "planned" },
      ],
    },
    {
      id: "solana",
      label: ["Solana", "Ecosystem"],
      color: "#e4e4e7",
      leaves: [
        { label: ["JITO", "Bundling"], status: "done" },
        { label: ["JITO", "Bundle", "Tracking"], status: "done" },
        { label: ["Transaction", "viva Jupiter"], status: "done" },
      ],
    },
    {
      id: "ethereum",
      label: ["Ethereum", "Ecosystem"],
      color: "#e4e4e7",
      leaves: [
        { label: ["EVM", "Bundling"], status: "soon" },
        { label: ["COV Protocol", "Integration"], status: "soon" },
        { label: ["Bridge", "Layer"], status: "planned" },
      ],
    },
    {
      id: "protocol",
      label: ["Saturn", "Protocol"],
      color: "#e4e4e7",
      leaves: [
        { label: ["Transaction", "Routing"], status: "planned" },
        { label: ["MEV", "Protection"], status: "planned" },
        { label: ["Bridge viva", "LayerZero"], status: "planned" },
      ],
    },
  ],
};

const MAX_LEAVES = Math.max(...tree.branches.map((b) => b.leaves.length));
const LEAF_GAP = 360;
const SVG_H = 1100;

const ROOT_Y = 120;
const BRANCH_Y = 440;
const LEAF_Y = 840;

const SVG_W = Math.max(2800, MAX_LEAVES * LEAF_GAP * tree.branches.length);

const sectionWidth = SVG_W / tree.branches.length;
const BRANCH_XS = tree.branches.map((_, i) => sectionWidth * (i + 0.5));

const NODE_W = 360;
const NODE_H = 140;
const LEAF_W = 320;
const LEAF_H = 192;
const ROOT_W = 340;
const ROOT_H = 128;

function leafXs(bx: number, count: number) {
  const gap = LEAF_GAP;
  const totalWidth = (count - 1) * gap;
  return Array.from({ length: count }, (_, i) => {
    return bx - totalWidth / 2 + i * gap;
  });
}

function RoadmapSVG() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeBranch, setActiveBranch] = useState<number | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isShortScreen, setIsShortScreen] = useState(false);

  useLayoutEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
      setIsShortScreen(window.innerHeight < 600);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const rootX = SVG_W / 2;

  useLayoutEffect(() => {
    if (!svgRef.current) return;

    let targetViewBox = `0 0 ${SVG_W} ${SVG_H}`;

    if (activeBranch !== null && tree.branches[activeBranch]) {
      const bx = BRANCH_XS[activeBranch] || 0;
      const count = tree.branches[activeBranch].leaves.length;

      // On short screens, zoom in tighter vertically
      // Doubled the widths/heights to maintain same view ratio but nodes are 2x bigger in it
      const width = Math.max(
        isSmallScreen ? 760 : 1000,
        count * LEAF_GAP + 200,
      );
      const height = isShortScreen ? SVG_H * 0.7 : SVG_H * 0.85;

      const cx = bx;
      const cy = (BRANCH_Y + LEAF_Y) / 2;

      const vx = cx - width / 2;
      const vy = cy - height / 2;

      targetViewBox = `${vx} ${vy} ${width} ${height}`;
    } else if (isSmallScreen) {
      // Zoom in more on mobile/tablet by default
      // Doubled viewbox width/height (650->1300, 850->1700)
      const width = isShortScreen ? 1300 : 1700;
      const height = isShortScreen ? SVG_H * 0.9 : SVG_H;
      const vy = isShortScreen ? 40 : 0;
      targetViewBox = `${rootX - width / 2} ${vy} ${width} ${height}`;
    }

    gsap.to(svgRef.current, {
      attr: { viewBox: targetViewBox },
      duration: 0.8,
      ease: "power3.inOut",
      overwrite: true,
    });

    // Handle leaves and lines animation
    if (activeBranch === null) {
      // Hide all leaves and lines
      gsap.to(".leaf-node", {
        opacity: 0,
        y: -20,
        duration: 0.3,
        overwrite: true,
      });
      gsap.to(".leaf-line", {
        strokeDashoffset: 1000,
        opacity: 0,
        duration: 0.3,
        overwrite: true,
      });
    } else {
      // Hide leaves and lines of OTHER branches
      tree.branches.forEach((_, bi) => {
        if (bi !== activeBranch) {
          gsap.to(`.leaf-node-${bi}`, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            overwrite: true,
          });
          gsap.to(`.leaf-line-${bi}`, {
            strokeDashoffset: 1000,
            opacity: 0,
            duration: 0.3,
            overwrite: true,
          });
        }
      });

      // Show leaves and lines of ACTIVE branch
      gsap.to(`.leaf-line-${activeBranch}`, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        overwrite: true,
      });
      gsap.to(`.leaf-node-${activeBranch}`, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.5)",
        stagger: 0.1,
        delay: 0.2,
        overwrite: true,
      });
    }
  }, [activeBranch, isSmallScreen]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      height="100%"
      style={{ display: "block", margin: "0 auto", maxHeight: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      onClick={(e) => {
        if (e.target === svgRef.current) {
          setActiveBranch(null);
        }
      }}
    >
      {/* Branches & Leaves Grouped */}
      {tree.branches.map((b, bi) => {
        const originalBx = BRANCH_XS[bi] || 0;
        const totalBranches = tree.branches.length;
        const centerOffset = (bi - (totalBranches - 1) / 2) * 480;
        const targetBx =
          activeBranch === null ? rootX + centerOffset : originalBx;
        const dx = targetBx - originalBx;
        const isActive = activeBranch === bi;
        const isFaded = activeBranch !== null && !isActive;

        return (
          <g key={b.id}>
            {/* Root → branch line */}
            <path
              d={`M ${rootX} ${ROOT_Y + ROOT_H / 2} C ${rootX} ${(ROOT_Y + ROOT_H / 2 + BRANCH_Y - NODE_H / 2) / 2} ${targetBx} ${(ROOT_Y + ROOT_H / 2 + BRANCH_Y - NODE_H / 2) / 2} ${targetBx} ${BRANCH_Y - NODE_H / 2}`}
              fill="none"
              stroke="#27272a"
              strokeWidth="3"
              style={{
                opacity: activeBranch === null || activeBranch === bi ? 1 : 0.1,
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: "none",
              }}
            />

            {/* Translated Group for Branch Node & Leaves */}
            <g
              style={{
                transform: `translateX(${dx}px)`,
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Leaves and Leaf Lines */}
              {b.leaves.map((leaf, li) => {
                const lxs = leafXs(originalBx, b.leaves.length);
                const lx = lxs[li] || 0;
                const s =
                  STATUS[leaf.status as keyof typeof STATUS] || STATUS.planned;

                return (
                  <g key={`${b.id}-leaf${li}`}>
                    <path
                      className={`leaf-line leaf-line-${bi}`}
                      d={`M ${originalBx} ${BRANCH_Y + NODE_H / 2} C ${originalBx} ${(BRANCH_Y + NODE_H / 2 + LEAF_Y - LEAF_H / 2) / 2} ${lx} ${(BRANCH_Y + NODE_H / 2 + LEAF_Y - LEAF_H / 2) / 2} ${lx} ${LEAF_Y - LEAF_H / 2}`}
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="3"
                      strokeDasharray="1000"
                      strokeDashoffset="1000"
                      style={{ opacity: 0, pointerEvents: "none" }}
                    />
                    <g
                      className={`leaf-node leaf-node-${bi}`}
                      style={{
                        opacity: 0,
                        transform: "translateY(-20px)",
                        pointerEvents: "none",
                      }}
                    >
                      <rect
                        x={lx - LEAF_W / 2}
                        y={LEAF_Y - LEAF_H / 2}
                        width={LEAF_W}
                        height={LEAF_H}
                        rx="12"
                        fill="#09090b"
                        stroke="#27272a"
                        strokeWidth="3"
                      />
                      {leaf.label.map((textLine, i) => {
                        const isThreeLines = leaf.label.length === 3;
                        const startY = isThreeLines ? -40 : -20;
                        const step = 32;
                        return (
                          <text
                            key={i}
                            x={lx}
                            y={LEAF_Y + startY + i * step}
                            textAnchor="middle"
                            fill="#a1a1aa"
                            fontSize={isSmallScreen ? "26" : "24"}
                            fontFamily="monospace"
                          >
                            {textLine}
                          </text>
                        );
                      })}
                      <text
                        x={lx}
                        y={LEAF_Y + 64}
                        textAnchor="middle"
                        fill={s.color}
                        fontSize={isSmallScreen ? "24" : "22"}
                        fontWeight="600"
                        fontFamily="monospace"
                        letterSpacing="0.05em"
                      >
                        {s.label.toUpperCase()}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Branch Node (Rendered last to sit on top of leaf lines) */}
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBranch(isActive ? null : bi);
                }}
                style={{
                  cursor: isFaded ? "default" : "pointer",
                  opacity: isFaded ? 0.3 : 1,
                  transition: "opacity 0.6s ease",
                  pointerEvents: isFaded ? "none" : "auto",
                }}
                className="hover:opacity-80 transition-opacity"
              >
                <rect
                  x={originalBx - NODE_W / 2}
                  y={BRANCH_Y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx="12"
                  fill="#09090b"
                  stroke={isActive ? "#f4f4f5" : "#27272a"}
                  strokeWidth={isActive ? "3" : "2"}
                  style={{ transition: "all 0.3s ease" }}
                />
                <text
                  x={originalBx}
                  y={BRANCH_Y - 12}
                  textAnchor="middle"
                  fill={isActive ? "#ffffff" : b.color}
                  fontSize={isSmallScreen ? "30" : "26"}
                  fontWeight="600"
                  fontFamily="monospace"
                  style={{
                    pointerEvents: "none",
                    transition: "fill 0.3s ease",
                  }}
                >
                  {b.label[0] || ""}
                </text>
                <text
                  x={originalBx}
                  y={BRANCH_Y + 24}
                  textAnchor="middle"
                  fill={isActive ? "#ffffff" : b.color}
                  fontSize={isSmallScreen ? "30" : "26"}
                  fontWeight="600"
                  fontFamily="monospace"
                  style={{
                    pointerEvents: "none",
                    transition: "fill 0.3s ease",
                  }}
                >
                  {b.label[1] || ""}
                </text>
              </g>
            </g>
          </g>
        );
      })}

      {/* Root node (Rendered last to sit on top of root-to-branch lines) */}
      <g
        onClick={() => setActiveBranch(null)}
        style={{
          cursor: activeBranch === null ? "default" : "pointer",
          opacity: activeBranch === null ? 1 : 0.5,
          transition: "opacity 0.5s",
          pointerEvents: activeBranch === null ? "none" : "auto",
        }}
      >
        <rect
          x={rootX - ROOT_W / 2}
          y={ROOT_Y - ROOT_H / 2}
          width={ROOT_W}
          height={ROOT_H}
          rx="12"
          fill="#09090b"
          stroke="#3f3f46"
          strokeWidth="2"
        />
        <text
          x={rootX}
          y={ROOT_Y + 10}
          textAnchor="middle"
          fill="#f4f4f5"
          fontSize={isSmallScreen ? "32" : "28"}
          fontWeight="600"
          fontFamily="monospace"
          letterSpacing="0.1em"
          style={{ pointerEvents: "none" }}
        >
          SATURN
        </text>
      </g>
    </svg>
  );
}
export function RoadmapView() {
  const [isShortScreen, setIsShortScreen] = useState(false);

  useLayoutEffect(() => {
    const checkSize = () => {
      setIsShortScreen(window.innerHeight < 600);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 overflow-hidden items-center">
      <div
        className={`text-center shrink-0 px-4 transition-all duration-300 ${isShortScreen ? "pt-2 pb-1" : "pt-4 sm:pt-6 pb-2"}`}
      >
        <p
          className={`text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-mono mb-1 ${isShortScreen ? "mt-1" : "mt-2"}`}
        >
          Development Roadmap
        </p>
        <h1
          className={`${isShortScreen ? "text-xl" : "text-2xl sm:text-3xl"} font-medium text-zinc-200 tracking-tight font-mono`}
        >
          Saturn
        </h1>
        {!isShortScreen && (
          <p className="text-zinc-600 text-xs sm:text-sm mt-3 font-mono">
            Click on a branch to zoom in. Click anywhere else to zoom out.
          </p>
        )}
      </div>
      <div
        className={`w-full flex-1 flex justify-center items-center min-h-0 ${isShortScreen ? "pb-4" : "pb-8"}`}
      >
        <RoadmapSVG />
      </div>
    </div>
  );
}
export default RoadmapView;
