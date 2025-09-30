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