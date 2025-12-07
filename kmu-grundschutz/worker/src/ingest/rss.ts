/**
 * RSS Feed Ingest
 * Fetches and parses RSS feeds from various security sources
 */

import Parser from "rss-parser"
import { config } from "../config.js"

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "KMU-Grundschutz/1.0",
  },
})

export interface RSSFeedItem {
  title: string
  description: string
  link: string
  pubDate: Date
  content?: string
  guid?: string
}

export interface RSSFeedSource {
  name: string
  url: string
  enabled: boolean
}

// Configured RSS feeds for KMU-relevant security news
export const rssFeeds: RSSFeedSource[] = [
  {
    name: "Heise Security",
    url: "https://www.heise.de/security/rss/news.rdf",
    enabled: true,
  },
  {
    name: "BSI Warnungen",
    url: "https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Cybersicherheit/Warnungen/warnung.rss",
    enabled: false, // Disabled - URL returns 404, needs verification
  },
  {
    name: "BSI Aktuell",
    url: "https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Presse/Pressemitteilungen/Presse_RSS/presse.rss",
    enabled: false, // Disabled - URL returns 404, needs verification
  },
  // Add more feeds as needed
  // Note: BSI RSS feeds may require authentication or have changed URLs
  // Check https://www.bsi.bund.de for current RSS feed locations
]

/**
 * Fetch all RSS feeds and return items
 */
export async function fetchRSSFeeds(): Promise<Array<{ source: string; items: RSSFeedItem[] }>> {
  const results: Array<{ source: string; items: RSSFeedItem[] }> = []

  for (const feed of rssFeeds) {
    if (!feed.enabled) {
      console.log(`⏭️  Skipping disabled feed: ${feed.name}`)
      continue
    }

    try {
      console.log(`📡 Fetching RSS feed: ${feed.name} (${feed.url})`)
      const feedData = await parser.parseURL(feed.url)

      const items: RSSFeedItem[] = (feedData.items || []).map((item) => ({
        title: item.title || "Untitled",
        description: item.contentSnippet || item.content || item.description || "",
        link: item.link || "",
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        content: item.content || item.contentSnippet || item.description || "",
        guid: item.guid || item.id || item.link || "",
      }))

      results.push({
        source: feed.name,
        items,
      })

      console.log(`  ✓ Fetched ${items.length} items from ${feed.name}`)
    } catch (error: any) {
      const errorMsg = error.message || String(error)
      const statusCode = error.statusCode || error.code
      
      if (statusCode === 404) {
        console.warn(`  ⚠️  RSS feed ${feed.name} not found (404). URL may have changed.`)
      } else if (statusCode === 403 || statusCode === 401) {
        console.warn(`  ⚠️  RSS feed ${feed.name} requires authentication or is forbidden.`)
      } else {
        console.error(`  ❌ Error fetching RSS feed ${feed.name}:`, errorMsg)
      }
      // Continue with other feeds - don't stop the entire process
    }
  }

  return results
}

/**
 * Try to extract CVSS score from description (if available)
 */
export function extractCVSS(description: string): number | undefined {
  // Try to find CVSS pattern: "CVSS: 9.8" or "CVSS 9.8" or "9.8/10"
  const cvssPatterns = [
    /CVSS[:\s]+(\d+\.\d+)/i,
    /(\d+\.\d+)\s*\/\s*10/i,
    /Schweregrad[:\s]+(\d+\.\d+)/i,
  ]

  for (const pattern of cvssPatterns) {
    const match = description.match(pattern)
    if (match) {
      const score = parseFloat(match[1])
      if (score >= 0 && score <= 10) {
        return score
      }
    }
  }

  return undefined
}

/**
 * Extract tags from title and description
 */
export function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase()
  const tags: string[] = []

  // Common security-related keywords
  const keywordMap: Record<string, string[]> = {
    rdp: ["rdp", "remote desktop", "remote-desktop"],
    mfa: ["mfa", "multi-factor", "two-factor", "2fa"],
    phishing: ["phishing", "phishing-kampagne"],
    ransomware: ["ransomware", "erpressungstrojaner"],
    backup: ["backup", "sicherung", "datensicherung"],
    encryption: ["verschlüsselung", "encryption", "tls", "ssl"],
    email: ["email", "e-mail", "mail"],
    malware: ["malware", "schadsoftware", "trojaner", "virus"],
    vulnerability: ["schwachstelle", "vulnerability", "cve", "sicherheitslücke"],
    patch: ["patch", "update", "aktualisierung"],
    access: ["zugriff", "access", "authentifizierung"],
    social: ["social engineering", "soziale manipulation"],
  }

  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push(tag)
    }
  }

  return [...new Set(tags)] // Remove duplicates
}

