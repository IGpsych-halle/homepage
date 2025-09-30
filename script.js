document.addEventListener("DOMContentLoaded", () => {
  // Optional future interactivity
  console.log("Seite geladen.");
});

 const acc = document.querySelectorAll(".accordion");

    acc.forEach(button => {
      button.addEventListener("click", () => {
        const panel = button.nextElementSibling;
        panel.classList.toggle("show");
      });
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
        block.style.marginBottom = "1.5em";
        block.innerHTML = `<h3>${entry.title}</h3>${entry.content}`;
        panel.appendChild(block);
      });

      container.appendChild(panel);
    }

    // Accordion aktivieren
    document.querySelectorAll(".accordion").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
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