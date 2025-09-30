document.addEventListener("DOMContentLoaded", () => {
  // Optional future interactivity
  console.log("Seite geladen.");
});

 /*const acc = document.querySelectorAll(".accordion");

    acc.forEach(button => {
      button.addEventListener("click", () => {
        const panel = button.nextElementSibling;
        panel.classList.toggle("show");
      });
    });
*/
    const aktuelles = [
      {
        title: "Stellenangebot: SHK gesucht",
        category: "Jobangebote",
        content: "<p>Für die Abteilung Kognitionspsychologie wird ab <strong>November 2025</strong> eine <em>studentische Hilfskraft</em> gesucht.</p><p>Bei Interesse melden Sie sich bei <a href='mailto:someone@example.com'>someone@example.com</a>.</p>"
      },
      {
        title: "Workshop zur qualitativen Forschung",
        category: "Kongresse und Workshops",
        content: "<p>Am <strong>7. Oktober</strong> findet ein Online-Workshop via Zoom statt.</p><img src='images/workshop.jpg' alt='Workshop Bild' style='max-width:100%; height:auto;'>"
      },
      {
        title: "Workshop zur qualitativen Forschung",
        category: "Praktikumsstellen",
        content: "<p>Am <strong>7. Oktober</strong> findet ein Online-Workshop via Zoom statt.</p><img src='images/workshop.jpg' alt='Workshop Bild' style='max-width:100%; height:auto;'>"
      },
      {
        title: "Workshop zur qualitativen Forschung",
        category: "Infoveranstaltungen",
        content: "<p>Am <strong>7. Oktober</strong> findet ein Online-Workshop via Zoom statt.</p><img src='images/workshop.jpg' alt='Workshop Bild' style='max-width:100%; height:auto;'>"
      },
      {
        title: "Workshop zur qualitativen Forschung",
        category: "Newsletter",
        content: "<p>Am <strong>7. Oktober</strong> findet ein Online-Workshop via Zoom statt.</p><img src='images/workshop.jpg' alt='Workshop Bild' style='max-width:100%; height:auto;'>"
      }
    ];

    // Gruppieren nach Kategorie
    const kategorien = {};
    aktuelles.forEach(item => {
      if (!kategorien[item.category]) {
        kategorien[item.category] = [];
      }
      kategorien[item.category].push(item);
    });

    const container = document.getElementById("aktuellesContainer");

    for (let kat in kategorien) {
      // Kategorie-Accordion-Button
      const btn = document.createElement("button");
      btn.className = "accordion";
      btn.textContent = kat;
      container.appendChild(btn);

      // Panel erstellen
      const panel = document.createElement("div");
      panel.className = "panel";

      kategorien[kat].forEach(entry => {
        const block = document.createElement("div");
        block.style.marginBottom = "1.5em";
        block.innerHTML = `<h3>${entry.title}</h3>${entry.content}`;
        panel.appendChild(block);
      });

      container.appendChild(panel);
    }

    // Accordion-Funktion
    document.querySelectorAll(".accordion").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        panel.classList.toggle("show");
      });
    });