/**
 * Ring orbit by graduation year — contained box, one visualization only.
 * Normalized viewBox (0 0 100 100): center 50, radii scaled to fit. No randomness, no simulation.
 */

const VIEWBOX = 100;
const CENTER = 50;
const MARGIN = 24;
const BASE_R = 12;
const RING_SPACING = 10;
const GAP_DEG = 48;
const NODE_R = 3.6;
const NODE_COLOR = "#7A003C";
const RING_STROKE = "rgba(122, 0, 60, 0.45)";
const STROKE_CENTER = 0.5;
const STROKE_RING = 0.35;

function getSites() {
  return window.webringData?.sites ?? [];
}

function getSortedYears(sites) {
  const years = [...new Set(sites.map((s) => Number(s.year)).filter((y) => !Number.isNaN(y)))];
  years.sort((a, b) => a - b);
  return years;
}

function groupByYear(sites) {
  const byYear = new Map();
  for (const site of sites) {
    const y = Number(site.year);
    if (Number.isNaN(y)) continue;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(site);
  }
  return byYear;
}

function radiusForIndex(i) {
  return BASE_R + i * RING_SPACING;
}

function nodePosition(nodeIndex, total, radius) {
  if (total <= 0) return { x: CENTER, y: CENTER };
  const arcDeg = 360 - GAP_DEG;
  const startDeg = 270 + GAP_DEG / 2;
  const angleDeg = startDeg + (arcDeg * nodeIndex) / total;
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function ringPath(radius) {
  const toRad = (d) => (d * Math.PI) / 180;
  const top = 270;
  const gapStart = top - GAP_DEG / 2;
  const gapEnd = top + GAP_DEG / 2;
  const start = toRad(gapEnd);
  const end = toRad(gapStart);
  const x1 = CENTER + radius * Math.cos(start);
  const y1 = CENTER + radius * Math.sin(start);
  const x2 = CENTER + radius * Math.cos(end);
  const y2 = CENTER + radius * Math.sin(end);
  return `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x2} ${y2}`;
}

function labelPosition(radius) {
  return { x: CENTER, y: CENTER - radius - 0.35 };
}

function initOrbit(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let svg = null;
  let g = null;

  function render() {
    const sites = getSites();
    const years = getSortedYears(sites);
    const byYear = groupByYear(sites);

    if (years.length === 0) {
      if (svg) {
        container.innerHTML = "";
        svg = null;
        g = null;
      }
      return;
    }

    const maxR = CENTER - MARGIN;
    const maxLogical = radiusForIndex(years.length - 1);
    const scale = maxR / maxLogical;

    if (!svg) {
      container.innerHTML = "";
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("aria-hidden", "true");
      svg.style.display = "block";
      g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svg.appendChild(g);
      container.appendChild(svg);
    }

    g.innerHTML = "";

    years.forEach((year, i) => {
      const r = radiusForIndex(i) * scale;
      const nodes = byYear.get(year) || [];
      const total = nodes.length;
      const strokeW = i === 0 ? STROKE_CENTER : STROKE_RING;
      const rotateClass = i % 2 === 0 ? "ring-rotate-cw" : "ring-rotate-ccw";

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", rotateClass);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", ringPath(r));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", RING_STROKE);
      path.setAttribute("stroke-width", String(strokeW));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("pointer-events", "none");
      group.appendChild(path);

      const { x: lx, y: ly } = labelPosition(r);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", lx);
      label.setAttribute("y", ly);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("fill", RING_STROKE);
      label.setAttribute("font-size", "3.2");
      label.setAttribute("font-weight", "600");
      label.setAttribute("pointer-events", "none");
      label.textContent = String(year);
      group.appendChild(label);

      const nodeRadius = Math.max(0.8, NODE_R * scale / (maxLogical / BASE_R));
      const totalNodes = Math.max(1, total);
      nodes.forEach((site, nodeIndex) => {
        const { x, y } = nodePosition(nodeIndex, totalNodes, r);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(x));
        circle.setAttribute("cy", String(y));
        circle.setAttribute("r", String(nodeRadius));
        circle.setAttribute("fill", NODE_COLOR);
        circle.setAttribute("pointer-events", "auto");
        circle.style.cursor = "pointer";
        circle.style.pointerEvents = "auto";
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `${site.name} (${site.year})`;
        circle.appendChild(title);

        let tooltipEl = null;
        let tooltipTimeout = null;
        circle.addEventListener("mouseenter", (e) => {
          tooltipTimeout = setTimeout(() => {
            tooltipTimeout = null;
            tooltipEl = document.createElement("div");
            tooltipEl.className = "ring-orbit-tooltip";
            tooltipEl.textContent = `${site.name} (${site.year})`;
            tooltipEl.style.cssText = "position:fixed;left:" + e.clientX + "px;top:" + (e.clientY - 36) + "px;transform:translateX(-50%);background:#2d3439;color:#fff;padding:5px 10px;border-radius:6px;font-size:12px;pointer-events:none;z-index:9999;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);";
            document.body.appendChild(tooltipEl);
          }, 180);
        });
        circle.addEventListener("mousemove", (e) => {
          if (tooltipEl) {
            tooltipEl.style.left = e.clientX + "px";
            tooltipEl.style.top = (e.clientY - 36) + "px";
          }
        });
        circle.addEventListener("mouseleave", () => {
          if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
          }
          if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
          }
        });
        circle.addEventListener("click", () => {
          if (site.website) window.open(site.website, "_blank");
        });

        group.appendChild(circle);
      });

      g.appendChild(group);
    });
  }

  render();
  const ro = new ResizeObserver(() => requestAnimationFrame(render));
  ro.observe(container);
  window.addEventListener("webringDataUpdated", render);
}

document.addEventListener("DOMContentLoaded", async () => {
  await (window.webringDataReady ?? Promise.resolve());
  initOrbit("ring-orbit-container");
});
