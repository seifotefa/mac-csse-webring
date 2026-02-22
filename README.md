# McMaster CS & Software Engineering Webring
## PLEASE MAKE SURE TO DO BOTH STEPS TO ENHANCE THE RING EXPERIENCE
## How to join the webring

1. Open a PR
2. Add your entry to `data/members.json` in this format:

```json
{
  "name": "Your Name",
  "year": 2026,
  "program": "CS",
  "website": "https://yoursite.com",
  "links": {
    "instagram": "",
    "twitter": "https://x.com/yourhandle",
    "linkedin": "https://www.linkedin.com/in/yourprofile"
  }
}
```

3. Open a pull request. Once merged, you're in the ring.

## Add the webring links to your site

**Live webring:** [https://mac-csse-webring.vercel.app/](https://mac-csse-webring.vercel.app/)

1. Replace `yoursite.com` with your site's domain (no `https://`).
2. **←** = previous site · **logo** = webring home · **→** = next site. Arrows use `color: inherit`; for dark backgrounds add `style="color: #fff"` to the wrapper.

### HTML snippet (minimal: arrow · logo · arrow)

```html
<p style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
  <a href="https://mac-csse-webring.vercel.app/#yoursite.com?nav=prev" style="color: inherit; text-decoration: none;" title="Previous site">←</a>
  <a href="https://mac-csse-webring.vercel.app/" style="line-height: 0;" title="McMaster CS & SE Webring">
    <img src="https://mac-csse-webring.vercel.app/assets/Uni_mcmaster_logo.svg.png" alt="McMaster CS & SE Webring" style="height: 24px; width: auto; display: block;">
  </a>
  <a href="https://mac-csse-webring.vercel.app/#yoursite.com?nav=next" style="color: inherit; text-decoration: none;" title="Next site">→</a>
</p>
```

### JSX snippet

```jsx
const WEBRING_URL = "https://mac-csse-webring.vercel.app/";
const MY_SITE = "yoursite.com";

<p style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
  <a href={`${WEBRING_URL}#${MY_SITE}?nav=prev`} style={{ color: "inherit", textDecoration: "none" }} title="Previous site">←</a>
  <a href={WEBRING_URL} style={{ lineHeight: 0 }} title="McMaster CS & SE Webring">
    <img src={`${WEBRING_URL}assets/Uni_mcmaster_logo.svg.png`} alt="McMaster CS & SE Webring" style={{ height: 24, width: "auto", display: "block" }} />
  </a>
  <a href={`${WEBRING_URL}#${MY_SITE}?nav=next`} style={{ color: "inherit", textDecoration: "none" }} title="Next site">→</a>
</p>
```

A copy of the HTML snippet is in **`embed-snippet.html`**.
