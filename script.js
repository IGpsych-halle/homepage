document.addEventListener("DOMContentLoaded", () => {
  console.log("Seite geladen.");
});

// Liste aller JSON-Dateien
const jsonDateien = [
  "json-files/jobangebote.json",
  "json-files/kongresseundworkshops.json",
  "json-files/newsletter.json",
  "json-files/infoveranstaltungen.json",
  "json-files/praktikumsstellen.json"
];

// Daten sammeln
const alleEintraege = [];

// Funktion: Accordion erzeugen aus gruppierten Daten
function zeigeEintraege(eintraege) {
  const kategorien = {};

  // Gruppieren nach Kategorie
  eintraege.forEach(item => {
    if (!kategorien[item.category]) {
      kategorien[item.category] = [];
    }
    kategorien[item.category].push(item);
  });

  console.log("Einträge erhalten:", eintraege);
  const container = document.getElementById("aktuellesContainer");

  for (let kat in kategorien) {
    const btn = document.createElement("button");
    btn.className = "accordion";
    btn.textContent = kat;
    container.appendChild(btn);

    const panel = document.createElement("div");
    panel.className = "panel";

    kategorien[kat].forEach(entry => {
      const block = document.createElement("div");
      block.className = "entry"; // neue CSS-Klasse
      block.innerHTML = `<h3 class="entry-title">${entry.title}</h3>${entry.content}`;

      // Attachment-Link hinzufügen, falls vorhanden
      if (entry.attachment) {
        const link = document.createElement("a");
        link.href = entry.attachment;
        link.target = "_blank";
        link.textContent = "📎 PDF herunterladen"; // kleines Icon zur Kennzeichnung
        link.className = "attachment-link"; // CSS-Klasse für Styling
        block.appendChild(link);
      }

      panel.appendChild(block);
    });

    container.appendChild(panel);
  }

  console.log("Kategorien:", kategorien);

  // Accordion aktivieren
  document.querySelectorAll(".accordion").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      btn.classList.toggle("active");
      panel.classList.toggle("show");
    });
  });
}

// Funktion: Alle JSON-Dateien laden
function ladeAlleJSONs(dateien) {
  let geladen = 0;

  dateien.forEach(datei => {
    fetch(datei)
      .then(res => {
        if (!res.ok) throw new Error(`Fehler beim Laden: ${datei}`);
        return res.json();
      })
      .then(data => {
        alleEintraege.push(...data);
        geladen++;

        // Wenn alle geladen wurden, dann anzeigen
        if (geladen === dateien.length) {
          zeigeEintraege(alleEintraege);
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden der Datei", datei, err);
      });
  });
}

// Start
ladeAlleJSONs(jsonDateien);
