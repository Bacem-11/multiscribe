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

        // ✅ Option 2 : Logo basé sur le nom de l'abonnement (ex: spotify → spotify.png)
        const sanitizedName = ab.name.toLowerCase().replace(/\s+/g, '');
        const logoURL = `/static/images/logos/${sanitizedName}.png`;

        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <img src="${logoURL}" alt="logo" onerror="this.onerror=null; this.src='/static/images/logos/default.png';" style="width: 30px; height: 30px; border-radius: 50%; object-fit: contain;">
            <strong class="nom">${ab.name}</strong>
          </div>
          <span class="prix">${ab.price}</span> TND 
          (<span class="type">${ab.billing_type}</span>)<br>
          Prochain paiement : <span class="date">${ab.next_payment_date}</span><br>

          <button class="btn-modifier" data-id="${ab.id}">Modifier</button>
          <div class="form-modifier" style="display:none;"></div>

          <form method="post" action="/supprimer/${ab.id}/" style="display:inline;">
              <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">
              <button type="submit" class="btn-supprimer" style="background-color:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px;">Supprimer</button>
          </form>
          <hr>
        `;
        container.appendChild(div);
      });

      attachModifierListeners();
    });

  // ✅ Bouton Ajouter
  const ajouterBtn = document.getElementById("btn-ajouter");
  if (ajouterBtn) {
    ajouterBtn.addEventListener("click", () => {
      window.location.href = "/ajouter/";
    });
  }

  // ✅ Confirmation avant suppression
  document.addEventListener("submit", (e) => {
    if (e.target.matches("form[action^='/supprimer/']")) {
      const confirmed = confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?");
      if (!confirmed) {
        e.preventDefault();
      }
    }
  });
});

function attachModifierListeners() {
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

// ✅ CSRF helper
function getCSRFToken() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return cookie ? cookie.split("=")[1] : "";
}
