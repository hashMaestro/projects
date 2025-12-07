/**
 * LLM Service for threat summarization, filtering, and mapping
 * Uses GPT-4o for various tasks
 */

import OpenAI from "openai"
import { config } from "./config.js"

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
})

export async function summarizeThreat(
  title: string,
  description: string,
  tags: string[]
): Promise<string> {
  if (!config.openaiApiKey) {
    // Fallback if no API key
    return `**${title}**\n\n${description}\n\nBetroffene Bereiche: ${tags.join(", ")}`
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein IT-Sicherheitsexperte, der Bedrohungen für Geschäftsführer und IT-Verantwortliche in kleinen und mittleren Unternehmen verständlich erklärt. Du schreibst professionell, aber zugänglich - nicht zu technisch, aber auch nicht kindisch. Verwende nur die bereitgestellten Informationen, keine zusätzlichen Quellen.",
        },
        {
          role: "user",
          content: `Erstelle eine prägnante, geschäftsfreundliche Zusammenfassung für diese IT-Bedrohung:

Titel: ${title}
Beschreibung: ${description}
Tags: ${tags.join(", ")}

Struktur:
1. **Was ist das Problem?** - Kurze, präzise Beschreibung der Bedrohung
2. **Auswirkungen für Ihr Unternehmen** - Konkrete Risiken und mögliche Schäden
3. **Empfohlene Maßnahmen** - Praktische Schritte zur Abwehr

WICHTIG:
- Professioneller, aber verständlicher Ton (wie ein IT-Berater, der einem Geschäftsführer erklärt)
- Technische Begriffe sind erlaubt, sollten aber kurz erklärt werden
- Fokus auf geschäftliche Auswirkungen, nicht nur technische Details
- Maximal 250 Wörter
- Klare, strukturierte Sätze`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    return response.choices[0]?.message?.content || description
  } catch (error) {
    console.error("LLM summarization failed:", error)
    return description
  }
}

/**
 * Check if a news item is relevant for KMUs (small/medium enterprises)
 * Returns true if relevant, false otherwise
 */
export async function isRelevantForKMU(
  title: string,
  description: string
): Promise<boolean> {
  if (!config.openaiApiKey) {
    // Fallback: accept all if no API key
    return true
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Experte für IT-Sicherheit in kleinen und mittleren Unternehmen (KMUs). Du bewertest, ob eine Sicherheitsmeldung für KMUs relevant ist. KMUs sind alle Unternehmen, die nicht zu den Großkonzernen gehören - von Einzelunternehmen bis zu mittelständischen Betrieben mit mehreren hundert Mitarbeitern. Sei SEHR GROSSZÜGIG bei der Bewertung: Wenn eine Meldung auch nur entfernt mit KMUs zu tun haben könnte, ist sie relevant.",
        },
        {
          role: "user",
          content: `Bewerte, ob diese Sicherheitsmeldung für kleine und mittlere Unternehmen (KMUs) relevant ist:

Titel: ${title}
Beschreibung: ${description.substring(0, 1000)}${description.length > 1000 ? "..." : ""}

Antworte NUR mit "JA" oder "NEIN". Keine Erklärung.

WICHTIG: Sei SEHR GROSSZÜGIG! Eine Meldung ist relevant, wenn sie:
- Irgendetwas mit Unternehmen zu tun hat (auch wenn es spezifische Software wie SAP, ERP-Systeme, oder Branchensoftware betrifft)
- IT-Sicherheit, Cyberangriffe, Datenlecks, oder ähnliche Themen behandelt
- Software, Hardware, oder Services betrifft, die auch KMUs nutzen könnten
- Allgemeine Sicherheitspraktiken oder -risiken beschreibt
- Auch nur entfernt mit dem Betrieb von Unternehmen zu tun haben könnte

Nur als NICHT relevant gelten:
- Reine Consumer-Produkte, die ausschließlich für Privatpersonen gedacht sind
- Sehr spezifische Großkonzern-Infrastruktur, die KMUs definitiv nicht nutzen
- Reine Forschung oder Theorie ohne praktische Relevanz

Antwort:`,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    })

    const answer = response.choices[0]?.message?.content?.trim().toUpperCase() || "NEIN"
    return answer === "JA" || answer === "YES"
  } catch (error) {
    console.error("LLM relevance check failed:", error)
    // On error, accept the item to be safe
    return true
  }
}

/**
 * Map a threat to controls using LLM
 * Returns array of { controlKey, weight } mappings
 */
export async function mapThreatToControlsLLM(
  title: string,
  description: string,
  tags: string[]
): Promise<Array<{ controlKey: string; weight: number }>> {
  if (!config.openaiApiKey) {
    // Fallback to rule-based mapping
    return []
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Experte für IT-Grundschutz (BSI IT-Grundschutz). Du mappst Sicherheitsbedrohungen auf relevante Controls aus dem IT-Grundschutz-Kompendium. Antworte NUR mit einem JSON-Array im Format: [{\"controlKey\": \"1.1\", \"weight\": 8}, ...]. controlKey ist der Control-Schlüssel. weight ist eine Zahl von 1-10 (10 = sehr relevant).",
        },
        {
          role: "user",
          content: `Mappe diese Sicherheitsbedrohung auf IT-Grundschutz-Controls:

Titel: ${title}
Beschreibung: ${description.substring(0, 1500)}${description.length > 1500 ? "..." : ""}
Tags: ${tags.join(", ")}

Verfügbare Controls:
Governance & Verantwortlichkeit:
- 1.1: Sicherheitsleitlinie
- 1.2: Rollen & Zuständigkeiten
- 1.3: Risiko- und Schutzbedarfsanalyse
- 1.4: Review-Zyklus
- 1.5: Policy-Übersicht
- 1.6: Metriken & Reporting

Asset & Konfigurationsmanagement:
- 2.1: Inventarliste
- 2.2: Konfigurationsrichtlinien
- 2.3: Change-Regel
- 2.5: Mobile Devices
- 2.6: Schwachstellenmanagement
- 2.7: Software-Allowlisting

Zugriff & Identitätsmanagement:
- 3.1: Passwort- und Passphrase-Regeln
- 3.2: Multi-Factor Authentication
- 3.3: Rechteverwaltung

Endpunkt- & Netzwerkschutz:
- 4.1: Patch- und Update-Management
- 4.2: Malware-Schutz
- 4.3: Netzwerksegmente
- 4.4: Secure Remote Access
- 4.5: USB- und Wechseldatenträger-Regeln
- 4.6: Browserhärtung

Datensicherheit & Backup:
- 5.1: Datenklassifikation
- 5.2: Verschlüsselung
- 5.3: Backup-Konzept
- 5.4: Löschkonzept
- 5.6: Datenverlustschutz (DLP light)

Awareness & Schulung:
- 6.1: Basistraining
- 6.2: Phishing-Simulation

Monitoring & Protokollierung:
- 7.1: Basis-Logging
- 7.2: Alarmierung
- 7.3: Logaufbewahrung
- 7.5: Log-Integrität & Zentrales Logging
- 7.6: Use-Cases und Alarm-Szenarien

Incident Response:
- 8.1: Meldeweg
- 8.2: Incident Response Plan
- 8.3: Incident Übung

Lieferketten- & Dienstleistersicherheit:
- 9.1: Dienstleister-Inventar
- 9.2: Mindestanforderungen an Dienstleister
- 9.3: Dienstleister-Zugangskontrolle
- 9.4: Zugriffsmonitoring für Dienstleister
- 9.5: Ablaufkontrolle
- 9.6: Lieferanten-Risikobewertung

Kontinuierliche Verbesserung:
- 10.1: Self-Audit
- 10.2: Lessons Learned
- 10.3: Regelmäßiger Threat-Abgleich
- 10.4: Business Continuity / DR-Test

Antworte NUR mit einem JSON-Array, keine Erklärung. Wähle die 2-5 relevantesten Controls aus. Beispiel: [{\"controlKey\": \"4.4\", \"weight\": 9}, {\"controlKey\": \"3.2\", \"weight\": 7}]`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content || "{}"
    
    // Try to parse as JSON object or array
    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      return []
    }

    // Handle both { mappings: [...] } and [...] formats
    const mappings = Array.isArray(parsed) ? parsed : parsed.mappings || parsed.controls || []

    return mappings
      .filter((m: any) => m.controlKey && typeof m.weight === "number")
      .map((m: any) => ({
        controlKey: String(m.controlKey),
        weight: Math.max(1, Math.min(10, Math.round(m.weight))), // Clamp to 1-10
      }))
  } catch (error) {
    console.error("LLM control mapping failed:", error)
    return []
  }
}

