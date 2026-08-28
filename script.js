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


// =========================================
// SCHWARZES BRETT
// =========================================

function zeigeEintraege(eintraege) {

  const kategorien = {};

  // Einträge nach Kategorie gruppieren
  eintraege.forEach(item => {

    if (!kategorien[item.category]) {
      kategorien[item.category] = [];
    }

    kategorien[item.category].push(item);

  });


  const container = document.getElementById("aktuellesContainer");

  // Container leeren
  container.innerHTML = "";


  // =========================================
  // HAUPTCONTAINER
  // =========================================

  const noticeboard = document.createElement("div");
  noticeboard.className = "noticeboard";


  // =========================================
  // KATEGORIE-NAVIGATION
  // =========================================

  const navigation = document.createElement("nav");
  navigation.className = "category-nav";

  const navTitle = document.createElement("h2");
  navTitle.textContent = "Kategorien";

  navigation.appendChild(navTitle);


  // =========================================
  // INHALTSBEREICH
  // =========================================

  const content = document.createElement("div");
  content.className = "category-content";


  // =========================================
  // FUNKTION: KATEGORIE ANZEIGEN
  // =========================================

  function zeigeKategorie(kategorie) {

    // bisherigen Inhalt entfernen
    content.innerHTML = "";

    // Überschrift
    const categoryTitle = document.createElement("h2");
    categoryTitle.className = "category-title";
    categoryTitle.textContent = kategorie;

    content.appendChild(categoryTitle);


    // Einträge dieser Kategorie
    kategorien[kategorie].forEach(entry => {

      const block = document.createElement("article");
      block.className = "entry";


      // -----------------------------------------
      // Titel
      // -----------------------------------------

      const title = document.createElement("h3");
      title.className = "entry-title";
      title.textContent = entry.title;

      block.appendChild(title);


      // -----------------------------------------
      // Inhalt
      // -----------------------------------------

      const fullContent = document.createElement("div");
      fullContent.className = "entry-content";

      fullContent.innerHTML = entry.content || "";

      block.appendChild(fullContent);


      // -----------------------------------------
      // Read-More Button
      // -----------------------------------------

      const readMore = document.createElement("button");
      readMore.className = "read-more";
      readMore.textContent = "Mehr lesen";

      block.appendChild(readMore);


      // -----------------------------------------
      // Attachment
      // -----------------------------------------

      if (entry.attachment) {

        const link = document.createElement("a");

        link.href = entry.attachment;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        link.textContent = "📎 PDF herunterladen";
        link.className = "attachment-link";

        block.appendChild(link);
      }


      // -----------------------------------------
      // Read-More Funktion
      // -----------------------------------------

      readMore.addEventListener("click", () => {

        block.classList.toggle("expanded");

        if (block.classList.contains("expanded")) {

          readMore.textContent = "Weniger anzeigen";

        } else {

          readMore.textContent = "Mehr lesen";

        }

      });


      content.appendChild(block);

      requestAnimationFrame(() => {

      const isOverflowing =
          fullContent.scrollHeight > fullContent.clientHeight;

      if (!isOverflowing) {
          readMore.style.display = "none";
          fullContent.classList.add("no-overflow");
      }


    });

  }


  // =========================================
  // KATEGORIE-BUTTONS
  // =========================================

  Object.keys(kategorien).forEach((kategorie, index) => {

    const button = document.createElement("button");

    button.className = "category-button";
    button.textContent = kategorie;


    button.addEventListener("click", () => {

      // alle Buttons deaktivieren
      document
        .querySelectorAll(".category-button")
        .forEach(btn => btn.classList.remove("active"));

      // geklickten Button aktivieren
      button.classList.add("active");

      // Kategorie anzeigen
      zeigeKategorie(kategorie);

    });


    navigation.appendChild(button);


    // Erste Kategorie automatisch öffnen
    if (index === 0) {

      button.classList.add("active");
      zeigeKategorie(kategorie);

    }

  });


  // Navigation + Content zusammensetzen
  noticeboard.appendChild(navigation);
  noticeboard.appendChild(content);

  container.appendChild(noticeboard);

}


// =========================================
// JSON DATEIEN LADEN
// =========================================

function ladeAlleJSONs(dateien) {

  let geladen = 0;

  dateien.forEach(datei => {

    fetch(datei)

      .then(res => {

        if (!res.ok) {
          throw new Error(`Fehler beim Laden: ${datei}`);
        }

        return res.json();

      })

      .then(data => {

        alleEintraege.push(...data);

        geladen++;

        if (geladen === dateien.length) {
          zeigeEintraege(alleEintraege);
        }

      })

      .catch(err => {

        console.error(
          "Fehler beim Laden der Datei",
          datei,
          err
        );

      });

  });

}


// Start
ladeAlleJSONs(jsonDateien);


// =========================================
// MOBILE NAVIGATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {

    hamburger.addEventListener("click", () => {

      navMenu.classList.toggle("show");
      hamburger.classList.toggle("active");

    });

  }

});




