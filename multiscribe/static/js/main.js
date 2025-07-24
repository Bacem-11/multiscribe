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

        const logoURL = getLogoURL(ab.nom); // 🔁 ici on récupère le bon logo

        div.innerHTML = `
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:0.5rem;">
    <img src="${logoURL}" alt="${ab.nom}" class="subscription-logo">
    <strong class="nom">${ab.nom}</strong> - 
    <span class="prix">${ab.prix}</span> TND 
    (<span class="type">${ab.type_facturation === "M" ? "monthly" : "yearly"}</span>)
  </div>
  <div>Prochain paiement : ${ab.date_prochain_paiement}</div>
  <button class="btn-modifier" data-id="${ab.id}">Modifier</button>
  <span style="margin: 0 0.5rem;">|</span>
  <button class="btn-supprimer" data-id="${ab.id}">Supprimer</button>
`;
        container.appendChild(div);
      });

      // 🔴 Supprimer via AJAX
      document.querySelectorAll(".btn-supprimer").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.id;
          if (!confirm("Confirmer la suppression ?")) return;

          fetch(`/supprimer/${id}/`, {
            method: "POST",
            headers: {
              "X-CSRFToken": getCSRFToken(),
            },
          }).then((res) => {
            if (res.ok || res.redirected) {
              document.querySelector(`div[data-id="${id}"]`)?.remove();
            }
          });
        });
      });

      // 🟡 Modifier via AJAX
      document.querySelectorAll(".btn-modifier").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.id;
          const parent = button.closest("div[data-id]");
          const formContainer = parent.querySelector(".form-modifier");
          formContainer.style.display = "block";

          fetch(`/modifier/${id}/`, {
            headers: { "X-Requested-With": "XMLHttpRequest" }
          })
            .then((res) => res.text())
            .then((html) => {
              formContainer.innerHTML = html;

              const form = formContainer.querySelector("form");
              form.addEventListener("submit", (e) => {
                e.preventDefault();

                const formData = new FormData(form);

                fetch(`/modifier/${id}/`, {
                  method: "POST",
                  headers: {
                    "X-CSRFToken": getCSRFToken(),
                  },
                  body: formData
                })
                  .then((res) => {
                    if (res.redirected) {
                      location.reload(); // ou actualisation partielle possible
                    } else {
                      return res.text().then((html) => {
                        formContainer.innerHTML = html;
                      });
                    }
                  });
              });
            });
        });
      });
    });
});

function getCSRFToken() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return cookie ? cookie.split("=")[1] : "";
}

// ✅ Fonction pour récupérer l’image correspondante au nom
function getLogoURL(nom) {
  nom = nom.toLowerCase();

  if (nom.includes("spotify")) return "/static/images/logos/spotify.png";
  if (nom.includes("netflix")) return "/static/images/logos/netflix.png";
  if (nom.includes("youtube")) return "/static/images/logos/youtube.png";
  if (nom.includes("apple")) return "/static/images/logos/apple.png";
  if (nom.includes("prime")) return "/static/images/logos/prime.png";

  return "/static/images/logos/default.png";
}
