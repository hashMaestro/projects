/**
 * HIBP (Have I Been Pwned) API integration
 * Documentation: https://haveibeenpwned.com/API/v3
 * 
 * API Key: Get a free API key from https://haveibeenpwned.com/API/Key
 * Rate Limit: 1500 requests/day with API key
 */

import { config } from "../config.js"

export interface HIBPResult {
  breaches: Array<{
    name: string
    domain: string
    breachDate: string
    addedDate: string
    description: string
  }>
}

interface HIBPBreach {
  Name: string
  Title: string
  Domain: string
  BreachDate: string
  AddedDate: string
  Description: string
  DataClasses: string[]
  IsVerified: boolean
  IsFabricated: boolean
  IsSensitive: boolean
  IsRetired: boolean
  IsSpamList: boolean
}

/**
 * Check HIBP API for domain breaches
 * Uses the Domain Search endpoint: https://haveibeenpwned.com/API/v3#DomainSearch
 */
export async function checkHIBP(domain: string): Promise<HIBPResult> {
  const apiKey = config.hibpApiKey

  // If no API key, fall back to mock for development
  if (!apiKey) {
    console.warn("⚠️  HIBP_API_KEY not set, using mock data")
    return checkHIBPMock(domain)
  }

  try {
    const url = `https://haveibeenpwned.com/api/v3/breacheddomain/${encodeURIComponent(domain)}?truncateResponse=false`
    
    const response = await fetch(url, {
      headers: {
        "hibp-api-key": apiKey,
        "User-Agent": "KMU-Grundschutz/1.0",
      },
    })

    // 404 means no breaches found
    if (response.status === 404) {
      return { breaches: [] }
    }

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After")
      console.warn(`⚠️  HIBP rate limit exceeded. Retry after ${retryAfter} seconds`)
      // Fall back to mock for now
      return checkHIBPMock(domain)
    }

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status} ${response.statusText}`)
    }

    const breaches: HIBPBreach[] = await response.json()

    // Transform HIBP response to our format
    return {
      breaches: breaches.map((breach) => ({
        name: breach.Name,
        domain: breach.Domain || domain,
        breachDate: breach.BreachDate,
        addedDate: breach.AddedDate,
        description: breach.Description || `Data breach: ${breach.Title}`,
      })),
    }
  } catch (error) {
    console.error(`❌ Error checking HIBP for domain ${domain}:`, error)
    
    // On error, fall back to mock for development
    if (error instanceof Error && error.message.includes("fetch")) {
      console.warn("⚠️  Network error, falling back to mock data")
      return checkHIBPMock(domain)
    }
    
    throw error
  }
}

/**
 * Mock HIBP check - returns dummy data for testing/development
 */
async function checkHIBPMock(domain: string): Promise<HIBPResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock: Return dummy breach for example.com and test domains
  if (domain.includes("example.com") || domain.includes("test")) {
    return {
      breaches: [
        {
          name: "Example Breach 2024",
          domain: domain,
          breachDate: "2024-01-15",
          addedDate: "2024-02-01",
          description: "A data breach that exposed email addresses and passwords",
        },
        {
          name: "Test Leak 2023",
          domain: domain,
          breachDate: "2023-11-20",
          addedDate: "2023-12-01",
          description: "Another breach affecting this domain",
        },
      ],
    }
  }

  // No breaches found
  return {
    breaches: [],
  }
}

