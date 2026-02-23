let mobileExists = false,
  desktopExists = false;

const getSites = () => (window.webringData?.sites ?? []);

// McMaster colours
const defaultNodeColor = "#495965";
const highlightedNodeColor = "#7A003C";
const defaultEdgeColor = "#e4e4e7";
const chartBgColor = "#faf8f8";

// Disabled: ring orbit (ring-orbit.js) is the only visualization. This D3 force graph is not used.
function checkIfGraphNeeded() {
  return; // do not render — avoid overlapping with createRingOrbit
}

function makeGraph(containerId) {
  const container = document.getElementById(containerId);
  if (!container || getSites().length === 0) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const nodeRadius = 8;

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background-color", chartBgColor)
    .style("cursor", "move");

  const g = svg.append("g");

  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);

  getSites().forEach((site, index) => {
    site.id = `node-${index}`;
  });

  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(nodeRadius * 2))
    .alphaDecay(0.02)
    .velocityDecay(0.4);

  const links = getSites().map((site, index) => ({
    source: site.id,
    target: getSites()[(index + 1) % getSites().length].id,
  }));

  const link = g
    .append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke", defaultEdgeColor)
    .attr("stroke-opacity", 1)
    .attr("stroke-width", 1);

  const node = g
    .append("g")
    .selectAll("g")
    .data(getSites())
    .enter()
    .append("g")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node
    .append("circle")
    .attr("r", nodeRadius)
    .attr("fill", defaultNodeColor)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);

  node
    .append("text")
    .attr("dx", 12)
    .attr("dy", 4)
    .text((d) => d.website.replace(/^https?:\/\//, ""))
    .attr("fill", "#495965")
    .style("font-size", "12px");

  simulation.nodes(getSites()).on("tick", ticked);
  simulation.force("link").links(links);

  function fitToView() {
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    node.each((d) => {
      minX = Math.min(minX, d.x);
      minY = Math.min(minY, d.y);
      maxX = Math.max(maxX, d.x);
      maxY = Math.max(maxY, d.y);
    });

    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scale = Math.min(w / (maxX - minX), h / (maxY - minY)) * 0.7;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(w / 2, h / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    svg.style("cursor", "grabbing");
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    svg.style("cursor", "grab");
    d.fx = null;
    d.fy = null;
  }

  function handleMouseOver(event, d) {
    d3.select(this).attr("fill", highlightedNodeColor);
    svg.style("cursor", "pointer");
  }

  function handleMouseOut(event, d) {
    d3.select(this).attr("fill", getNodeColor(d));
    svg.style("cursor", "move");
  }

  function handleClick(event, d) {
    window.open(d.website, "_blank");
  }

  function getNodeColor(d) {
    const searchInput = document.getElementById("search");
    const searchTerm = (searchInput?.value || "").toLowerCase();

    if (searchTerm === "") {
      return defaultNodeColor;
    } else {
      return d.name.toLowerCase().includes(searchTerm) ||
        d.year.toString().includes(searchTerm) ||
        d.website.toLowerCase().includes(searchTerm)
        ? highlightedNodeColor
        : defaultNodeColor;
    }
  }

  document.getElementById("search")?.addEventListener("input", (e) => {
    highlightAndZoomToNodes(e.target.value);
  });

  function highlightAndZoomToNodes(searchTerm) {
    searchTerm = (searchTerm || "").toLowerCase();

    node.selectAll("circle").attr("fill", (d) => {
      if (searchTerm === "") {
        return defaultNodeColor;
      }
      const matches =
        d.name.toLowerCase().includes(searchTerm) ||
        d.year.toString().includes(searchTerm) ||
        d.website.toLowerCase().includes(searchTerm);
      return matches ? highlightedNodeColor : defaultNodeColor;
    });

    const totalNodes = getSites().length;
    const highlightedNodes = searchTerm
      ? node
          .filter(
            (d) =>
              d.name.toLowerCase().includes(searchTerm) ||
              d.year.toString().includes(searchTerm) ||
              d.website.toLowerCase().includes(searchTerm)
          )
          .size()
      : 0;

    const statsText = searchTerm
      ? `Sites: ${totalNodes} | Highlighted: ${highlightedNodes}`
      : `Sites: ${totalNodes}`;

    const statsDisplay = svg.select("#stats-display");
    if (statsDisplay.node()) statsDisplay.text(statsText);

    const textWidth = statsDisplay.node() ? statsDisplay.node().getComputedTextLength() : 0;
    const statsBackground = svg.select("#stats-background");
    statsBackground.attr("width", textWidth + 20).attr("height", 25);

    if (searchTerm) {
      const matchingNodes = node.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm) ||
          d.year.toString().includes(searchTerm) ||
          d.website.toLowerCase().includes(searchTerm)
      );

      if (matchingNodes.size() > 0) {
        let minX = Infinity,
          minY = Infinity;
        let maxX = -Infinity,
          maxY = -Infinity;

        matchingNodes.each((d) => {
          minX = Math.min(minX, d.x);
          minY = Math.min(minY, d.y);
          maxX = Math.max(maxX, d.x);
          maxY = Math.max(maxY, d.y);
        });

        const padding = 100;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const w = container.clientWidth;
        const h = container.clientHeight;

        const scale =
          Math.min(w / (maxX - minX), h / (maxY - minY)) * 0.9;

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        svg
          .transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(w / 2, h / 2)
              .scale(scale)
              .translate(-centerX, -centerY)
          );
      }
    } else {
      fitToView();
    }
  }

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        highlightAndZoomToNodes(decodeURIComponent(hash));
      }, 2000);
    }
  });

  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    setTimeout(() => {
      highlightAndZoomToNodes(decodeURIComponent(hash));
    }, 2000);
  }

  simulation.on("tick", () => {
    ticked();
    if (simulation.alpha() < 0.1) {
      simulation.alphaTarget(0);
      fitToView();
      simulation.on("tick", ticked);
    }
  });

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);

    const statsDisplay = svg.select("#stats-display");
    const statsBackground = svg.select("#stats-background");
    if (statsDisplay.node()) statsDisplay.attr("y", newHeight - 13);
    if (statsBackground.node()) statsBackground.attr("y", newHeight - 30);

    simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
    simulation.alpha(0.3).restart();
  });

  const statsDisplay = svg
    .append("text")
    .attr("id", "stats-display")
    .attr("x", 10)
    .attr("y", height - 13)
    .attr("fill", "white")
    .attr("font-size", "1rem");

  const statsBackground = svg
    .append("rect")
    .attr("id", "stats-background")
    .attr("fill", "#7A003C")
    .attr("opacity", 0.8)
    .attr("x", 5)
    .attr("y", height - 30)
    .attr("rx", 5)
    .attr("ry", 5);

  statsBackground.raise();
  statsDisplay.raise();

  const totalNodes = getSites().length;
  statsDisplay.text(`Sites: ${totalNodes}`);

  const textWidth = statsDisplay.node() ? statsDisplay.node().getComputedTextLength() : 80;
  statsBackground.attr("width", textWidth + 20).attr("height", 25);
}

document.addEventListener("DOMContentLoaded", async () => {
  await (window.webringDataReady ?? Promise.resolve());
  checkIfGraphNeeded();
});
window.addEventListener("resize", checkIfGraphNeeded);
