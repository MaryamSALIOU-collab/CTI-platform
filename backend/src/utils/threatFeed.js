import Parser from "rss-parser";
const parser = new Parser({ timeout: 8000 });

const RSS_SOURCES = [
  { url: "https://www.bleepingcomputer.com/feed/", category: "Vulnérabilité" },
  { url: "https://feeds.feedburner.com/TheHackersNews", category: "Malware" },
];

const CATEGORIES = ["Malware", "Hameçonnage", "DDoS", "Vulnérabilité", "Fuite de données"];
const SEVERITIES = ["Critique", "Haute", "Moyenne", "Faible"];
const COUNTRIES = ["Russie", "Chine", "États-Unis", "Nigéria", "Pays-Bas", "Brésil"];
const randomFrom = (arr, seed) => arr[seed % arr.length];

function generateMockFeed(count = 24) {
  const now = Date.now();
  const items = [];
  for (let i = 0; i < count; i++) {
    const hoursAgo = i * 3 + Math.floor(Math.random() * 3);
    items.push({
      id: `mock-${i}-${now}`,
      title: `${randomFrom(CATEGORIES, i)} détecté depuis ${randomFrom(COUNTRIES, i + 2)}`,
      source: randomFrom(["AlienVault OTX", "Flux RSS sécurité", "Communauté CTI"], i),
      category: randomFrom(CATEGORIES, i),
      severity: randomFrom(SEVERITIES, i + 1),
      link: "#",
      publishedAt: new Date(now - hoursAgo * 3600 * 1000).toISOString(),
    });
  }
  return items;
}

export async function fetchThreatFeed() {
  const collected = [];
  for (const src of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(src.url);
      for (const entry of feed.items.slice(0, 8)) {
        collected.push({
          id: entry.guid || entry.link, title: entry.title, source: feed.title || src.url,
          category: src.category, severity: randomFrom(SEVERITIES, collected.length),
          link: entry.link, publishedAt: entry.isoDate || new Date().toISOString(),
        });
      }
    } catch { /* source indisponible, ignorée silencieusement */ }
  }
  if (collected.length === 0) return { items: generateMockFeed(), mode: "demo" };
  return { items: collected, mode: "live" };
}
