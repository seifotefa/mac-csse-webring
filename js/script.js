import { fuzzyMatch, formatUrl } from "./helpers.js";

let logConsoleMessage = () => {
  console.log(
    "%c👋 Hey there" +
      "\n\n%cWhy not add your site to the McMaster CS & SE webring? Open a pull request on the repo.",
    "font-size: 16px; font-weight: bold; color: #7A003C;",
    "font-size: 13px; color: #495965;"
  );
};

const getSites = () => (window.webringData?.sites ?? []);

const socialIconSvg = (type) => {
  if (type === "instagram") {
    return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
  }
  if (type === "twitter") {
    return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  }
  if (type === "linkedin") {
    return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
  }
  return "";
};

const createSocialLink = (type, url, isHighlighted) => {
  if (!url || typeof url !== "string" || url.trim() === "") return null;
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.title = type === "twitter" ? "Twitter/X" : type[0].toUpperCase() + type.slice(1);
  a.className = "inline-flex items-center justify-center w-8 h-8 rounded-md text-maroon-600 hover:text-gold-600 hover:bg-gold-100 transition-colors";
  a.innerHTML = socialIconSvg(type);
  return a;
};

function createWebringList(matchedSiteIndices) {
  const container = document.getElementById("webring-list");
  if (!container) return;
  container.innerHTML = "";

  let firstHighlighted = null;

  getSites().forEach((site, index) => {
    const displayUrl = formatUrl(site.website);
    const isHighlighted =
      matchedSiteIndices.includes(index) && matchedSiteIndices.length !== getSites().length;
    const program = site.program || "CS";

    const tr = document.createElement("tr");
    tr.className = "member-row";
    if (isHighlighted) tr.classList.add("member-row--highlight");
    if (firstHighlighted === null && isHighlighted) firstHighlighted = tr;

    const tdProgram = document.createElement("td");
    tdProgram.className = "py-3 pr-3";
    const programSpan = document.createElement("span");
    programSpan.className = "badge-program text-[11px] font-semibold px-1.5 py-0.5 rounded";
    programSpan.textContent = program;
    tdProgram.appendChild(programSpan);

    const tdYear = document.createElement("td");
    tdYear.className = "py-3 pr-3";
    tdYear.textContent = site.year;

    const tdName = document.createElement("td");
    tdName.className = "py-3 pr-3 font-semibold text-maroon-600";
    tdName.textContent = site.name;

    const tdWebsite = document.createElement("td");
    tdWebsite.className = "py-3 pr-3 max-w-[220px] truncate";
    const link = document.createElement("a");
    link.href = site.website;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "text-maroon-600 underline hover:no-underline text-sm";
    link.textContent = displayUrl;
    tdWebsite.appendChild(link);

    const tdSocials = document.createElement("td");
    tdSocials.className = "py-3 pl-2";
    const icons = document.createElement("div");
    icons.className = "flex items-center gap-0.5";
    const instagramLink = createSocialLink("instagram", site?.links?.instagram, isHighlighted);
    const twitterLink = createSocialLink("twitter", site?.links?.twitter, isHighlighted);
    const linkedinLink = createSocialLink("linkedin", site?.links?.linkedin, isHighlighted);
    if (instagramLink) icons.appendChild(instagramLink);
    if (twitterLink) icons.appendChild(twitterLink);
    if (linkedinLink) icons.appendChild(linkedinLink);
    if (!instagramLink && !twitterLink && !linkedinLink) {
      const empty = document.createElement("span");
      empty.className = "text-macgrey-400 text-xs";
      empty.textContent = "—";
      icons.appendChild(empty);
    }
    tdSocials.appendChild(icons);

    tr.appendChild(tdProgram);
    tr.appendChild(tdYear);
    tr.appendChild(tdName);
    tr.appendChild(tdWebsite);
    tr.appendChild(tdSocials);
    container.appendChild(tr);
  });

  if (firstHighlighted) {
    setTimeout(() => {
      firstHighlighted.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }
}

function handleUrlFragment(searchInput) {
  const fragment = (window.location.hash.slice(1) || "").trim();
  if (!fragment || !searchInput) return;
  const decoded = decodeURIComponent(fragment);
  // Don't use in-page anchors (e.g. #what, #join) as search terms
  const ignoreAsSearch = /^(what|join|faq)$/i;
  if (ignoreAsSearch.test(decoded)) return;
  searchInput.value = decoded;
  filterWebring(decoded);
}

function filterWebring(searchTerm) {
  const searchLower = (searchTerm || "").toLowerCase();
  const matchedSiteIndices = [];
  getSites().forEach((site, index) => {
    if (
      site.name.toLowerCase().includes(searchLower) ||
      fuzzyMatch((site.website || "").toLowerCase(), searchLower) ||
      (site.year && site.year.toString().includes(searchLower)) ||
      (site.program && site.program.toLowerCase().includes(searchLower)) ||
      (site?.links?.instagram || "").toLowerCase().includes(searchLower) ||
      (site?.links?.twitter || "").toLowerCase().includes(searchLower) ||
      (site?.links?.linkedin || "").toLowerCase().includes(searchLower)
    ) {
      matchedSiteIndices.push(index);
    }
  });
  createWebringList(matchedSiteIndices);
}

function navigateWebring() {
  const fragment = window.location.hash.slice(1);
  if (!fragment.includes("?")) return;
  const [currentSite, query] = fragment.split("?");
  const params = new URLSearchParams(query);
  const nav = params.get("nav")?.replace(/\/+$/, "").trim();
  if (!nav || !["next", "prev"].includes(nav)) return;

  const currIndex = getSites().findIndex((site) => fuzzyMatch(currentSite, site.website));
  if (currIndex === -1) return;
  const increment = nav === "next" ? 1 : -1;
  let newIndex = (currIndex + increment) % getSites().length;
  if (newIndex < 0) newIndex = getSites().length - 1;
  const nextSite = getSites()[newIndex];
  if (!nextSite) return;

  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#7A003C;color:#FDBF57;">
      Redirecting…
    </div>
  `;
  window.location.href = nextSite.website;
}

document.addEventListener("DOMContentLoaded", async () => {
  await (window.webringDataReady ?? Promise.resolve());

  if (window.location.hash.includes("?nav=")) {
    navigateWebring();
    return;
  }

  const searchInput = document.getElementById("search");

  logConsoleMessage();
  createWebringList(getSites().map((_, i) => i));
  handleUrlFragment(searchInput);

  if (searchInput) {
    searchInput.addEventListener("input", (e) => filterWebring(e.target.value));
  }
  window.addEventListener("hashchange", () => {
    handleUrlFragment(searchInput);
    navigateWebring();
  });
});
