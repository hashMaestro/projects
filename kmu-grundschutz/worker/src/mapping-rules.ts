/**
 * Mapping rules: tags → Controls
 * Maps threat tags to relevant controls with weights
 */

export interface MappingRule {
  tags: string[]
  controlKey: string
  weight: number // 1-10
}

export const mappingRules: MappingRule[] = [
  // Governance & Verantwortlichkeit
  {
    tags: ["policy", "governance", "documentation"],
    controlKey: "1.1",
    weight: 8,
  },
  {
    tags: ["roles", "responsibility", "management"],
    controlKey: "1.2",
    weight: 7,
  },
  {
    tags: ["risk", "assessment", "vulnerability"],
    controlKey: "1.3",
    weight: 8,
  },
  {
    tags: ["review", "audit", "management"],
    controlKey: "1.4",
    weight: 6,
  },
  {
    tags: ["policy", "documentation"],
    controlKey: "1.5",
    weight: 7,
  },
  {
    tags: ["metrics", "reporting", "governance"],
    controlKey: "1.6",
    weight: 6,
  },
  // Asset & Konfigurationsmanagement
  {
    tags: ["inventory", "asset", "hardware", "software"],
    controlKey: "2.1",
    weight: 7,
  },
  {
    tags: ["hardening", "baseline", "configuration"],
    controlKey: "2.2",
    weight: 8,
  },
  {
    tags: ["change-management", "documentation", "updates"],
    controlKey: "2.3",
    weight: 7,
  },
  {
    tags: ["mobile", "policy", "byod"],
    controlKey: "2.5",
    weight: 7,
  },
  {
    tags: ["vulnerability", "scanning", "cvss", "patch"],
    controlKey: "2.6",
    weight: 9,
  },
  {
    tags: ["allowlisting", "endpoint", "software"],
    controlKey: "2.7",
    weight: 8,
  },
  // Zugriff & Identitätsmanagement
  {
    tags: ["password", "identity", "authentication"],
    controlKey: "3.1",
    weight: 8,
  },
  {
    tags: ["mfa", "multi-factor", "authentication", "identity"],
    controlKey: "3.2",
    weight: 9,
  },
  {
    tags: ["access-control", "least-privilege", "privilege-escalation"],
    controlKey: "3.3",
    weight: 9,
  },
  // Endpunkt- & Netzwerkschutz
  {
    tags: ["patch", "endpoint", "updates"],
    controlKey: "4.1",
    weight: 9,
  },
  {
    tags: ["antivirus", "endpoint", "malware"],
    controlKey: "4.2",
    weight: 9,
  },
  {
    tags: ["network", "segmentation", "firewall"],
    controlKey: "4.3",
    weight: 8,
  },
  {
    tags: ["vpn", "remote-access", "rdp", "remote-desktop"],
    controlKey: "4.4",
    weight: 9,
  },
  {
    tags: ["usb", "endpoint", "removable-media"],
    controlKey: "4.5",
    weight: 7,
  },
  {
    tags: ["browser", "hardening", "web"],
    controlKey: "4.6",
    weight: 7,
  },
  // Datensicherheit & Backup
  {
    tags: ["data", "classification"],
    controlKey: "5.1",
    weight: 7,
  },
  {
    tags: ["encryption", "tls", "ssl", "data-protection"],
    controlKey: "5.2",
    weight: 9,
  },
  {
    tags: ["backup", "restore", "data-loss", "ransomware"],
    controlKey: "5.3",
    weight: 10,
  },
  {
    tags: ["data", "deletion"],
    controlKey: "5.4",
    weight: 6,
  },
  {
    tags: ["dlp", "data-protection"],
    controlKey: "5.6",
    weight: 8,
  },
  // Awareness & Schulung
  {
    tags: ["awareness", "training", "social-engineering"],
    controlKey: "6.1",
    weight: 8,
  },
  {
    tags: ["phishing", "training"],
    controlKey: "6.2",
    weight: 9,
  },
  // Monitoring & Protokollierung
  {
    tags: ["logging", "monitoring"],
    controlKey: "7.1",
    weight: 8,
  },
  {
    tags: ["alerts", "monitoring", "anomaly"],
    controlKey: "7.2",
    weight: 8,
  },
  {
    tags: ["logging", "retention"],
    controlKey: "7.3",
    weight: 7,
  },
  {
    tags: ["logging", "siem"],
    controlKey: "7.5",
    weight: 8,
  },
  {
    tags: ["siem", "alerts"],
    controlKey: "7.6",
    weight: 8,
  },
  // Incident Response
  {
    tags: ["incident", "communication"],
    controlKey: "8.1",
    weight: 8,
  },
  {
    tags: ["incident", "response", "emergency"],
    controlKey: "8.2",
    weight: 9,
  },
  {
    tags: ["incident", "training", "disaster-recovery"],
    controlKey: "8.3",
    weight: 8,
  },
  // Lieferketten- & Dienstleistersicherheit
  {
    tags: ["vendor", "supply-chain"],
    controlKey: "9.1",
    weight: 7,
  },
  {
    tags: ["vendor", "policy"],
    controlKey: "9.2",
    weight: 7,
  },
  {
    tags: ["vendor", "access"],
    controlKey: "9.3",
    weight: 8,
  },
  {
    tags: ["vendor", "logging"],
    controlKey: "9.4",
    weight: 7,
  },
  {
    tags: ["vendor", "review"],
    controlKey: "9.5",
    weight: 7,
  },
  {
    tags: ["vendor", "risk"],
    controlKey: "9.6",
    weight: 8,
  },
  // Kontinuierliche Verbesserung
  {
    tags: ["audit", "improvement"],
    controlKey: "10.1",
    weight: 7,
  },
  {
    tags: ["incident", "learning"],
    controlKey: "10.2",
    weight: 7,
  },
  {
    tags: ["threat", "monitoring"],
    controlKey: "10.3",
    weight: 8,
  },
  {
    tags: ["continuity", "drp"],
    controlKey: "10.4",
    weight: 8,
  },
]

/**
 * Find controls for a threat based on tags
 */
export function mapThreatToControls(tags: string[]): Array<{ controlKey: string; weight: number }> {
  const tagLower = tags.map((t) => t.toLowerCase())
  const mappings: Array<{ controlKey: string; weight: number }> = []

  for (const rule of mappingRules) {
    const ruleTagsLower = rule.tags.map((t) => t.toLowerCase())
    const matches = ruleTagsLower.some((rt) => tagLower.some((tt) => tt.includes(rt) || rt.includes(tt)))

    if (matches) {
      mappings.push({
        controlKey: rule.controlKey,
        weight: rule.weight,
      })
    }
  }

  // Deduplicate by controlKey, keep highest weight
  const unique = new Map<string, number>()
  for (const mapping of mappings) {
    const existing = unique.get(mapping.controlKey)
    if (!existing || mapping.weight > existing) {
      unique.set(mapping.controlKey, mapping.weight)
    }
  }

  return Array.from(unique.entries()).map(([controlKey, weight]) => ({ controlKey, weight }))
}

