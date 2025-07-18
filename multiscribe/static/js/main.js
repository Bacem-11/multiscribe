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
            <button class="btn-modifier" data-id="${ab.id}">Modifier</button> |
            <button class="btn-supprimer" data-id="${ab.id}">Supprimer</button>
            <div class="form-modifier" style="display:none;"></div>
            <hr>
          `;
          container.appendChild(div);
        });
  
        
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
        
const btnAjouter = document.getElementById("btn-ajouter");
const formAjouter = document.getElementById("form-ajouter");

if (btnAjouter && formAjouter) {
  btnAjouter.addEventListener("click", () => {
    formAjouter.style.display = "block";

    fetch("/ajouter/", {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(res => res.text())
      .then(html => {
        formAjouter.innerHTML = html;

        const form = formAjouter.querySelector("form");
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = new FormData(form);

          fetch("/ajouter/", {
            method: "POST",
            headers: {
              "X-CSRFToken": getCSRFToken(),
            },
            body: formData
          })
            .then((res) => {
              if (res.redirected) {
                
                fetch("/api/abonnements/")
                  .then(res => res.json())
                  .then((abonnements) => {
                    
                    location.reload(); 
                  });
              } else {
                return res.text().then((html) => {
                  formAjouter.innerHTML = html; 
                });
              }
            });
        });
      });
  });
}

      });
  });
  
  function getCSRFToken() {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="));
    return cookie ? cookie.split("=")[1] : "";
  }
  
  