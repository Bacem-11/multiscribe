document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/abonnements/")
    .then((res) => res.json())
    .then((abonnements) => {
      const container = document.getElementById("abonnements-container");

      if (!abonnements.length) {
        container.innerHTML = "<p>Aucun abonnement enregistré.</p>";
        return;
      }

      abonnements.forEach((ab) => {
        const div = document.createElement("div");
        div.setAttribute("data-id", ab.id);

        div.innerHTML = `
          <strong class="nom">${ab.nom}</strong> - 
          <span class="prix">${ab.prix}</span> TND 
          (<span class="type">${ab.type_facturation}</span>)<br>
          Prochain paiement : <span class="date">${ab.date_prochain_paiement}</span><br>
          
          <a href="/modifier/${ab.id}/">
            <button class="btn-modifier">Modifier</button>
          </a>

          <form method="post" action="/supprimer/${ab.id}/" style="display:inline;">
              <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">
              <button type="submit" class="btn-supprimer">Supprimer</button>
          </form>
          <hr>
        `;
        container.appendChild(div);
      });
    });

  // Bouton ajouter → redirection
  const ajouterBtn = document.getElementById("btn-ajouter");
  if (ajouterBtn) {
    ajouterBtn.addEventListener("click", function () {
      window.location.href = "/ajouter/";
    });
  }

  // Confirmation avant suppression
  document.addEventListener("submit", function (e) {
    if (e.target.matches("form[action^='/supprimer/']")) {
      const confirmed = confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?");
      if (!confirmed) {
        e.preventDefault(); // Stop form submit
      }
    }
  });
});

// Récupération du token CSRF
function getCSRFToken() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return cookie ? cookie.split("=")[1] : "";
}
