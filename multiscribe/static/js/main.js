document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/abonnements/")
    .then((res) => res.json())
    .then((abonnements) => {
      const container = document.getElementById("abonnements-container");

      if (!abonnements.length) {
        container.innerHTML = "<p>Aucun abonnement enregistré.</p>";
        return;
      }

      container.classList.add("cards-container"); // Ajout de la classe pour le grid

      abonnements.forEach((ab) => {
        const card = document.createElement("div");
        card.classList.add("subscription-card");
        card.setAttribute("data-id", ab.id);

        const sanitizedName = ab.name.toLowerCase().replace(/\s+/g, '');
        const logoURL = `/static/images/logos/${sanitizedName}.png`;

        card.innerHTML = `
          <div class="card-header">
            <img src="${logoURL}" alt="logo" 
                 onerror="this.onerror=null; this.src='/static/images/logos/default.png';" 
                 class="subscription-logo">
            <span class="subscription-name">${ab.name}</span>
          </div>

          <div class="card-body">
            <p><strong>Prix :</strong> ${ab.price} TND</p>
            <p><strong>Type :</strong> ${ab.billing_type}</p>
            <p><strong>Prochain paiement :</strong> ${ab.next_payment_date}</p>
          </div>

          <div class="card-footer">
            <button class="btn-modifier" data-id="${ab.id}">Modifier</button>
            <div class="form-modifier" style="display:none;"></div>

            <form method="post" action="/supprimer/${ab.id}/" style="display:inline;">
              <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">
              <button type="submit" class="btn-supprimer">Supprimer</button>
            </form>
          </div>
        `;
        container.appendChild(card);
      });

      attachModifierListeners();
    });

  // Bouton Ajouter
  const ajouterBtn = document.getElementById("btn-ajouter");
  if (ajouterBtn) {
    ajouterBtn.addEventListener("click", () => {
      window.location.href = "/ajouter/";
    });
  }

  // Confirmation avant suppression
  document.addEventListener("submit", (e) => {
    if (e.target.matches("form[action^='/supprimer/']")) {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?")) {
        e.preventDefault();
      }
    }
  });
});

function attachModifierListeners() {
  document.querySelectorAll(".btn-modifier").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const parent = button.closest(".subscription-card");
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
                  location.reload();
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
}

function getCSRFToken() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return cookie ? cookie.split("=")[1] : "";
}
