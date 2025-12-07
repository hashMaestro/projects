import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import { prisma } from "@/lib/prisma"
import { loadPlaybookFromFile } from "@/lib/actions/wizard-session"

export async function POST(
  request: NextRequest,
  { params }: { params: { controlId: string } }
) {
  try {
    const { messages } = await request.json()

    // Get control info
    const control = await prisma.control.findUnique({
      where: { id: params.controlId },
    })

    if (!control) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    // Only allow PDF export for controls 1.1, 1.2, 1.3
    if (!["1.1", "1.2", "1.3"].includes(control.key)) {
      return NextResponse.json(
        { error: "PDF export only available for controls 1.1, 1.2, 1.3" },
        { status: 403 }
      )
    }

    // Load playbook
    const playbook = await loadPlaybookFromFile(control.key)
    if (!playbook) {
      return NextResponse.json({ error: "Playbook not found" }, { status: 404 })
    }

    // Extract answers from messages
    const userMessages = messages.filter((msg: any) => msg.role === "USER")
    const assistantMessages = messages.filter((msg: any) => msg.role === "ASSISTANT")

    // Match questions with answers
    const answers: Record<string, string> = {}
    const questions = playbook.questions_to_user || []

    for (let i = 0; i < assistantMessages.length; i++) {
      const assistantMsg = assistantMessages[i]
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const question = questions[qIdx]
        const questionKeyWords = question
          .toLowerCase()
          .replace(/[?.,!]/g, "")
          .split(" ")
          .filter((w: string) => w.length > 3)
          .slice(0, 5)

        const msgLower = assistantMsg.content.toLowerCase()
        const matchingWords = questionKeyWords.filter((word: string) => msgLower.includes(word))
        const questionFound = matchingWords.length >= 2

        if (questionFound) {
          // Look for user response after this question
          for (let j = i + 1; j < messages.length; j++) {
            if (messages[j].role === "USER") {
              answers[question] = messages[j].content
              break
            }
            if (messages[j].role === "ASSISTANT") {
              break
            }
          }
          break
        }
      }
    }

    // Create PDF using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    let yPos = 20

    // Header - dynamic based on control
    const controlTitle = control.title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(controlTitle, 105, yPos, { align: "center" })
    yPos += 10

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Control ${control.key}`, 105, yPos, { align: "center" })
    yPos += 15

    // Date
    doc.setFontSize(10)
    doc.text(`Erstellt am: ${new Date().toLocaleDateString("de-DE")}`, 160, yPos, { align: "right" })
    yPos += 15

    // Introduction
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("1. Einführung", 20, yPos)
    yPos += 8

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const introLines = doc.splitTextToSize(playbook.explanation_for_laymen || "", 170)
    doc.text(introLines, 20, yPos)
    yPos += introLines.length * 6 + 10

    // Questions and Answers
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("2. Erfasste Informationen:", 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    questions.forEach((question: string, idx: number) => {
      const answer = answers[question] || "Nicht beantwortet"
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont("helvetica", "bold")
      doc.text(`${idx + 1}. ${question}`, 20, yPos)
      yPos += 6

      doc.setFont("helvetica", "normal")
      const answerLines = doc.splitTextToSize(`   Antwort: ${answer}`, 170)
      doc.text(answerLines, 25, yPos)
      yPos += answerLines.length * 5 + 3
    })

    yPos += 5

    // Control-specific content
    if (control.key === "1.1") {
      // Sicherheitsleitlinie
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("3. Sicherheitsleitlinie", 20, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      const companyName = answers[questions[0]] || "Ihr Unternehmen"
      const importantServices = answers[questions[1]] || "Nicht angegeben"
      const itDecisionMaker = answers[questions[2]] || "Nicht angegeben"
      const existingRules = answers[questions[3]] || "Nicht angegeben"

      const policyContent = `Diese Sicherheitsleitlinie wurde für ${companyName} erstellt.

Ziele:
- Schutz der IT-Systeme und Daten
- Klare Verantwortlichkeiten definieren
- Grundlage für weitere Sicherheitsmaßnahmen schaffen

Geltungsbereich:
Diese Leitlinie gilt für alle IT-Systeme, Daten und Prozesse in ${companyName}.

Wichtige Dienste/Daten:
${importantServices}

Verantwortlichkeiten:
IT-Entscheidungen: ${itDecisionMaker}

Bestehende Regeln:
${existingRules}

Diese Leitlinie sollte von der Geschäftsführung schriftlich bestätigt werden.`

      const policyLines = doc.splitTextToSize(policyContent, 170)
      doc.text(policyLines, 20, yPos)
      yPos += policyLines.length * 5 + 10

    } else if (control.key === "1.2") {
      // Rollen & Zuständigkeiten
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("3. Rollenmatrix", 20, yPos)
      yPos += 8

      // Extract role information from answers
      const itResponsible = answers[questions[0]] || "Nicht angegeben"
      const externalProviders = answers[questions[1]] || "Nicht angegeben"
      const hrResponsible = answers[questions[2]] || "Nicht angegeben"
      const procurementResponsible = answers[questions[3]] || "Nicht angegeben"

      const roles = [
        { role: "IT", responsible: itResponsible },
        { role: "HR", responsible: hrResponsible },
        { role: "Einkauf", responsible: procurementResponsible },
        { role: "Externe Dienstleister", responsible: externalProviders },
      ]

      doc.setFontSize(10)
      roles.forEach((roleInfo) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFont("helvetica", "bold")
        doc.text(`${roleInfo.role}:`, 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(roleInfo.responsible, 50, yPos)
        yPos += 6
      })

      yPos += 5

      // Responsibilities
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("4. Verantwortlichkeiten", 20, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      const respLines = doc.splitTextToSize(
        "Die Verantwortlichkeiten wurden im Rahmen des Wizards definiert und dokumentiert.",
        170
      )
      doc.text(respLines, 20, yPos)
      yPos += respLines.length * 6 + 10

      // Escalation Path
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("5. Eskalationspfad", 20, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      const escLines = doc.splitTextToSize(
        "Bei Sicherheitsproblemen erfolgt die Eskalation über die definierten Verantwortlichkeiten.",
        170
      )
      doc.text(escLines, 20, yPos)
      yPos += escLines.length * 6 + 10

    } else if (control.key === "1.3") {
      // Risiko- und Schutzbedarfsanalyse
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("3. Geschäftsprozesse und Systeme", 20, yPos)
      yPos += 8

      const itSystems = answers[questions[0]] || "Nicht angegeben"
      const criticalSystems = answers[questions[1]] || "Nicht angegeben"
      const criticalData = answers[questions[2]] || "Nicht angegeben"
      const customerSystems = answers[questions[3]] || "Nicht angegeben"

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      
      doc.setFont("helvetica", "bold")
      doc.text("Täglich genutzte IT-Systeme:", 20, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")
      const systemsLines = doc.splitTextToSize(itSystems, 170)
      doc.text(systemsLines, 25, yPos)
      yPos += systemsLines.length * 5 + 5

      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont("helvetica", "bold")
      doc.text("Geschäftskritische Systeme:", 20, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")
      const criticalLines = doc.splitTextToSize(criticalSystems, 170)
      doc.text(criticalLines, 25, yPos)
      yPos += criticalLines.length * 5 + 5

      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont("helvetica", "bold")
      doc.text("Kritische Daten:", 20, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")
      const dataLines = doc.splitTextToSize(criticalData, 170)
      doc.text(dataLines, 25, yPos)
      yPos += dataLines.length * 5 + 5

      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont("helvetica", "bold")
      doc.text("Systeme für Kunden/Partner:", 20, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")
      const customerLines = doc.splitTextToSize(customerSystems, 170)
      doc.text(customerLines, 25, yPos)
      yPos += customerLines.length * 5 + 10

      // Schutzbedarfs-Tabelle
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("4. Schutzbedarfs-Tabelle", 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const tableNote = doc.splitTextToSize(
        "Basierend auf den erfassten Informationen wurden die Geschäftsprozesse identifiziert und einem Schutzbedarf zugeordnet. Diese Tabelle dient als Grundlage für weitere Sicherheitsmaßnahmen.",
        170
      )
      doc.text(tableNote, 20, yPos)
      yPos += tableNote.length * 5 + 10
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        "Dieses Dokument wurde automatisch durch den KMU Grundschutz Wizard erstellt.",
        105,
        287,
        { align: "center" }
      )
    }

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${control.key.replace(".", "-")}-${control.title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("PDF export error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 })
  }
}

