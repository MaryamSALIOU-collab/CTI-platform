import axios from "axios";
import crypto from "crypto";

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
const HASH_RE = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
const DOMAIN_RE = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$/;

export function detectIocType(value) {
  const v = value.trim();
  if (IPV4_RE.test(v)) return "ip";
  if (HASH_RE.test(v)) return "hash";
  if (DOMAIN_RE.test(v)) return "domain";
  return "unknown";
}

function seededScore(seed, max = 100) {
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return parseInt(hash.slice(0, 8), 16) % (max + 1);
}

function mockVirusTotal(value, type) {
  const score = seededScore("vt:" + value);
  return { source: "VirusTotal", mode: "demo", score, details: { malicious_engines: Math.round((score/100)*70), total_engines: 70, type } };
}
function mockAbuseIPDB(value, type) {
  if (type !== "ip") return null;
  const score = seededScore("abuseipdb:" + value);
  return { source: "AbuseIPDB", mode: "demo", score, details: { abuseConfidenceScore: score, totalReports: Math.round(score/4), countryCode: ["SN","US","RU","CN","NL","FR"][score % 6] } };
}
function mockOTX(value, type) {
  const score = seededScore("otx:" + value);
  return { source: "AlienVault OTX", mode: "demo", score, details: { pulse_count: Math.round(score/10), tags: score>60?["malware","c2"]:score>30?["suspicious"]:["clean"] } };
}

async function realVirusTotal(value, type) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return mockVirusTotal(value, type);
  try {
    let url;
    if (type === "ip") url = `https://www.virustotal.com/api/v3/ip_addresses/${value}`;
    else if (type === "domain") url = `https://www.virustotal.com/api/v3/domains/${value}`;
    else if (type === "hash") url = `https://www.virustotal.com/api/v3/files/${value}`;
    else return mockVirusTotal(value, type);
    const { data } = await axios.get(url, { headers: { "x-apikey": apiKey }, timeout: 8000 });
    const stats = data?.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const total = malicious + (stats.suspicious||0) + (stats.harmless||0) + (stats.undetected||0);
    const score = total > 0 ? Math.round((malicious/total)*100) : 0;
    return { source: "VirusTotal", mode: "live", score, details: { malicious_engines: malicious, total_engines: total, type } };
  } catch { return { ...mockVirusTotal(value, type), warning: "Échec API réelle, repli en mode démo." }; }
}

async function realAbuseIPDB(value, type) {
  if (type !== "ip") return null;
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) return mockAbuseIPDB(value, type);
  try {
    const { data } = await axios.get("https://api.abuseipdb.com/api/v2/check", {
      params: { ipAddress: value, maxAgeInDays: 90 }, headers: { Key: apiKey, Accept: "application/json" }, timeout: 8000,
    });
    const d = data?.data || {};
    return { source: "AbuseIPDB", mode: "live", score: d.abuseConfidenceScore ?? 0, details: { abuseConfidenceScore: d.abuseConfidenceScore, totalReports: d.totalReports, countryCode: d.countryCode } };
  } catch { return { ...mockAbuseIPDB(value, type), warning: "Échec API réelle, repli en mode démo." }; }
}

async function realOTX(value, type) {
  const apiKey = process.env.OTX_API_KEY;
  if (!apiKey) return mockOTX(value, type);
  try {
    const section = type === "ip" ? "IPv4" : type === "domain" ? "domain" : "file";
    const url = `https://otx.alienvault.com/api/v1/indicators/${section}/${value}/general`;
    const { data } = await axios.get(url, { headers: { "X-OTX-API-KEY": apiKey }, timeout: 8000 });
    const pulseCount = data?.pulse_info?.count ?? 0;
    return { source: "AlienVault OTX", mode: "live", score: Math.min(100, pulseCount*8), details: { pulse_count: pulseCount } };
  } catch { return { ...mockOTX(value, type), warning: "Échec API réelle, repli en mode démo." }; }
}

export async function lookupIndicator(value) {
  const type = detectIocType(value);
  const [vt, abuse, otx] = await Promise.all([realVirusTotal(value, type), realAbuseIPDB(value, type), realOTX(value, type)]);
  const results = [vt, abuse, otx].filter(Boolean);
  const globalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  let verdict = "Inoffensif";
  if (globalScore >= 70) verdict = "Critique";
  else if (globalScore >= 40) verdict = "Suspect";
  else if (globalScore >= 15) verdict = "À surveiller";
  return { indicator: value, type, globalScore, verdict, sources: results, checkedAt: new Date().toISOString() };
}
