import { otworzDialog } from "./dialog_main.js";
import { ustawienia } from "./settings.js";

/*
  Hej!
  Witaj w moim kodzie. Wybacz, że nie jest tak całkiem zgodny ze sztuką.
  Nie spodziewałem się gości i wolę mieć na przykład polskie zmienne, zamiast milion komentarzy.
  I wiadomo - kod który się powtarza zamiast automatyzacji. Jestem amatorem, co robić ;)

  Dasz znać, że tu byłeś/aś? Zawsze to milej jak ktoś odwiedzi ;)

  Ephaltes
*/

Hooks.once("setup", async () => {
  
  ustawienia();

});

function dialogBrakuKompendiow() {
  foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("NPCForge.BrakKompendiowTitle") },
    content: `<p>${game.i18n.localize("NPCForge.BrakKompendiowInfo")}</p>`,
    buttons: [
      { label: "OK", action: "ok", default: true }
    ]
  });
}

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  const pokazana = game.settings.get("swade-npc-forge-eph", "wiadomoscPokazana");
  if (pokazana) return;

  const content = `
    <div>
      <h2>${game.i18n.localize("NPCForge.WiadomoscPowitalnaNaglowek")}</h2>
      <p>${game.i18n.localize("NPCForge.WiadomoscPowitalnaTresc")}</p>
    </div>
  `;

  // Chat – zobaczą wszyscy
  ChatMessage.create({
    content: content,
    speaker: { alias: "NPC Forge" }
  });

  // Dialog
  await foundry.applications.api.DialogV2.wait({
  window: { title: "SWADE NPC FORGE" },
  content,
  buttons: [{ label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "ok", default: true }],
  render: (ev, dialog) => {
    queueMicrotask(() => {
      dialog.setPosition({ width: 420 });
      // opcjonalnie wycentruj:
      const el = dialog.element;
      const szer = el.offsetWidth;
      const wys  = el.offsetHeight;
      dialog.setPosition({
        left: (window.innerWidth  - szer) / 2,
        top:  (window.innerHeight - wys)  / 2
      });
    });
  }
});

  await game.settings.set("swade-npc-forge-eph", "wiadomoscPokazana", true);
});

Hooks.on('renderActorDirectory', (app, html, data) => {
  if (!game.user.isGM) return; // tylko dla GM-a
    
  const header = html.querySelector(".directory-header .header-actions");
    if (header) {
      const buttonForge = document.createElement("a");
      buttonForge.classList.add("header-button");
      buttonForge.title = "NPC Forge";
      buttonForge.style.flex = "0 0 auto";
      buttonForge.innerHTML = `<i class="fas fa-hammer"></i>`;

      buttonForge.addEventListener("click", async () => {
        const gotowe = sprawdzKompendia();
        if (gotowe) {
          otworzDialog();
        } else {
          dialogBrakuKompendiow();
        }
      });

      header.appendChild(buttonForge);
    }
});


export function sprawdzKompendia() {
  const wymagane = [
    "swade-npc-forge-eph.kompendiumArchetypy",
    "swade-npc-forge-eph.kompendiumRasy",
    "swade-npc-forge-eph.kompendiumUmiejetnosci",
    "swade-npc-forge-eph.kompendiumPrzewagi",
    "swade-npc-forge-eph.kompendiumZawady",
    "swade-npc-forge-eph.kompendiumMoce",
    "swade-npc-forge-eph.kompendiumSprzet"
  ];

  return wymagane.every(klucz => {
    const [modul, ustawienie] = klucz.split(".");
    const wartosc = game.settings.get(modul, ustawienie);
    return !!wartosc && wartosc !== "";
  });
}

