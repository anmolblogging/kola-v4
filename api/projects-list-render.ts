import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

const WP_API = "https://cms.kolacommunications.com/wp-json/wp/v2";
const SITE   = "https://kolacommunications.com";

/* ── Cache index.html in memory after first read ── */
let indexHtmlCache: string | null = null;
const getSPAShell = (): string => {
  if (indexHtmlCache) return indexHtmlCache;
  const filePath = path.join(process.cwd(), "dist", "index.html");
  indexHtmlCache = fs.readFileSync(filePath, "utf-8");
  return indexHtmlCache;
};

/* ── Escape special chars for HTML attribute values ── */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/* ── Prevent script injection in JSON data ── */
const safeJsonStringify = (obj: any): string =>
  JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

const decodeHtmlEntities = (str: string): string =>
  str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiRes = await fetch(
      `${WP_API}/project?per_page=9&page=1&status=publish&_embed=1`,
      { signal: AbortSignal.timeout(8000) } // 8s timeout
    );

    if (!apiRes.ok) throw new Error(`WP API ${apiRes.status}`);

    const totalPages = Number(apiRes.headers.get("X-WP-TotalPages") ?? 1);
    const totalItems = Number(apiRes.headers.get("X-WP-Total") ?? 0);
    const rawProjects = (await apiRes.json()) as Array<any>;

    const normalizedProjects = rawProjects.map((p) => {
      const img = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "https://kolacommunications.com/KolaFavicon.jpg";
      const terms: any[] = (p._embedded?.["wp:term"] ?? []).flat();
      const toItem = (t: any) => ({ id: t.id, name: decodeHtmlEntities(t.name), slug: t.slug, taxonomy: t.taxonomy });
      const categories = terms.filter((t) => t.taxonomy === "project-category").map(toItem);
      const tags = terms.filter((t) => t.taxonomy === "project-tag").map(toItem);

      return {
        id: p.id,
        slug: p.slug,
        title: decodeHtmlEntities(p.title.rendered),
        img,
        hoverImg: p.acf?.hover_img ?? img,
        categories,
        tags,
        liveUrl: p.acf?.live_url ?? "",
      };
    });

    const metaTitle  = "Our Work & Projects | Kola Communications";
    const metaDesc   = "Explore our portfolio of high-performance website development, SEO, branding, and digital marketing projects.";
    const canonical = `${SITE}/projects`;
    const ogImage    = "https://kolacommunications.com/KolaFavicon.jpg";

    const seoTags = `
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDesc}"/>
  <meta name="robots" content="index, follow"/>
  <link rel="canonical" href="${canonical}"/>

  <meta property="og:type"        content="website"/>
  <meta property="og:url"         content="${canonical}"/>
  <meta property="og:title"       content="${metaTitle}"/>
  <meta property="og:description" content="${metaDesc}"/>
  <meta property="og:image"       content="${ogImage}"/>

  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${metaTitle}"/>
  <meta name="twitter:description" content="${metaDesc}"/>
  <meta name="twitter:image"       content="${ogImage}"/>
  <script>window.__INITIAL_DATA__ = { projects: { projects: ${safeJsonStringify(normalizedProjects)}, totalPages: ${totalPages}, totalItems: ${totalItems} } };</script>
    `;

    const bodyContent = `
<div class="projects-list-seo-render" style="font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 4rem 1rem;">
  <h1 style="font-size: 3rem; margin-bottom: 1rem; text-align: center;">Our Projects</h1>
  <p style="text-align: center; color: #666; font-size: 1.2rem; max-width: 600px; margin: 0 auto 3rem;">A showcase of our recent digital marketing, SEO, and web development client work.</p>
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2.5rem;">
    ${normalizedProjects.map(p => `
      <article style="border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; background: #fff;">
        ${p.img ? `<img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 240px; object-fit: cover;" />` : ""}
        <div style="padding: 1.5rem; flex-grow: 1;">
          <h2 style="font-size: 1.4rem; margin-top: 0; margin-bottom: 1rem;">
            <a href="/project/${encodeURIComponent(p.slug)}" style="color: #000; text-decoration: none;">${escapeHtml(p.title)}</a>
          </h2>
          <a href="/project/${encodeURIComponent(p.slug)}" style="color: #000; text-decoration: none; font-weight: 600; font-size: 0.95rem;">View Project Details &rarr;</a>
        </div>
      </article>
    `).join("")}
  </div>
</div>
    `;

    let html = getSPAShell();
    html = html.replace(/<title>[^<]*<\/title>/i, seoTags);
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${bodyContent}</div>`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Projects list SSR failed, falling back to SPA shell:", err);
    try {
      const html = getSPAShell();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    } catch {
      return res.redirect(302, "/");
    }
  }
}
