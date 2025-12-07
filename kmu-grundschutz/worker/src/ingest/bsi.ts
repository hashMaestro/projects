/**
 * BSI RSS Feed Ingest (Stub)
 * In production, this would fetch from actual BSI RSS feed
 */

export interface BSIThreat {
  title: string
  ref: string
  description: string
  publishedAt: Date
  tags: string[]
  cvss?: number
}

export async function fetchBSIThreats(): Promise<BSIThreat[]> {
  // Stub: Return dummy threats
  // In production, fetch from: https://www.bsi.bund.de/DE/Service-Navi/Presse/Pressemitteilungen/Pressemitteilungen_node.html
  return [
    {
      title: "Kritische Schwachstelle in Remote-Desktop-Diensten",
      ref: "BSI-2024-001",
      description: "Eine kritische Schwachstelle ermöglicht unautorisierte Fernzugriffe auf Systeme.",
      publishedAt: new Date("2024-11-10"),
      tags: ["rdp", "remote-access", "critical"],
      cvss: 9.8,
    },
    {
      title: "Phishing-Kampagne zielt auf E-Mail-Systeme",
      ref: "BSI-2024-002",
      description: "Aktive Phishing-Kampagne nutzt gefälschte E-Mails zur Kompromittierung.",
      publishedAt: new Date("2024-11-08"),
      tags: ["phishing", "email", "social-engineering"],
      cvss: 7.5,
    },
    {
      title: "Ransomware-Angriffe nehmen zu",
      ref: "BSI-2024-003",
      description: "Erhöhte Aktivität von Ransomware-Gruppen, Backup-Systeme betroffen.",
      publishedAt: new Date("2024-11-05"),
      tags: ["ransomware", "backup", "data-loss"],
      cvss: 8.2,
    },
  ]
}

