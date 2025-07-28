document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/abonnements/")
    .then(res => res.json())
    .then(abonnements => {
      const container = document.getElementById("abonnements-container");
      const totalMensuelEl = document.getElementById("total-mensuel");
      const totalAnnuelEl = document.getElementById("total-annuel");

      container.innerHTML = "";
      if (!abonnements.length) {
        container.innerHTML = "<p>Aucun abonnement enregistré.</p>";
        totalMensuelEl.textContent = "0.00";
        totalAnnuelEl.textContent = "0.00";
        return;
      }

      const visibles = abonnements.slice(0, 2);
      visibles.forEach(ab => {
        const bloc = document.createElement("div");
        bloc.innerHTML = `
          <strong>${ab.name}</strong><br>
          ${ab.price} TND (${ab.billing_type})<br>
          Prochain paiement : ${ab.next_payment_date}
          <hr>
        `;
        container.appendChild(bloc);
      });

      let totalMensuel = 0;
      let totalAnnuel = 0;

      const today = new Date();
      const moisActuel = today.getMonth();
      const anneeActuelle = today.getFullYear();

      abonnements.forEach(ab => {
        const prix = parseFloat(ab.price);
        const datePaiement = new Date(ab.next_payment_date);

        if (ab.billing_type === "monthly") {
          totalAnnuel += prix * 12;
        } else if (ab.billing_type === "yearly") {
          totalAnnuel += prix;
        }

        if (
          datePaiement.getMonth() === moisActuel &&
          datePaiement.getFullYear() === anneeActuelle
        ) {
          if (ab.billing_type === "monthly") {
            totalMensuel += prix;
          } else if (ab.billing_type === "yearly") {
            totalMensuel += prix / 12;
          }
        }
      });

      totalMensuelEl.textContent = totalMensuel.toFixed(2);
      totalAnnuelEl.textContent = totalAnnuel.toFixed(2);
    })
    .catch(err => {
      console.error("Erreur :", err);
      document.getElementById("abonnements-container").innerHTML =
        "<p>Erreur lors du chargement des abonnements.</p>";
    });
});
