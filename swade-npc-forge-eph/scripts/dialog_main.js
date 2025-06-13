import { generujNPC } from "./generator.js";
import { otworzKreatorRasy } from "./dialog_rasy.js";
import { otworzKreatorArchetypu } from "./dialog_archetypu.js";
import { otworzOpcje } from "./dialog_opcji.js";

let dialogMain = null;

export async function otworzDialog() {

  if (dialogMain) { dialogMain.bringToTop(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Pobieranie kompendiów z ustawień
  const archetypyComp = game.settings.get("swade-npc-forge-eph", "kompendiumArchetypy");
  const rasyComp = game.settings.get("swade-npc-forge-eph", "kompendiumRasy");
  
  // Tworzenie listy elementów kompendiów
  const archetypy = (await game.packs.get(archetypyComp)?.getDocuments() || [])
    .filter(a => a.getFlag("swade-npc-forge-eph", "archetypDane"));
  const rasy = (await game.packs.get(rasyComp)?.getDocuments() || [])
  .filter(r => r.getFlag("swade-npc-forge-eph", "rasaDane"));

  
  // Dane do przekazania do szablonu
  const dane = {
    archetypy: archetypy.map(a => ({ id: a.id, nazwa: a.name })),
    rasy: rasy.map(r => ({ id: r.id, nazwa: r.name })),
  };
  
  // Renderuje szablon
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_main.hbs", dane);
    
  // Tworzenie dialogu
  dialogMain = new Dialog({
    title: "SWADE NPC Forge",
    content, // z szablonu
    classes: ["npc-forge-dialog"],
    buttons: {
      generuj: {
        label: game.i18n.localize("NPCForge.PrzyciskGeneruj"),
        callback: async html => {
          const formularz = html[0].querySelector("form");
          const daneFormularza = new FormData(formularz);

          const liczba = parseInt(daneFormularza.get("liczba")) || 1;
          const nazwaBazowa = daneFormularza.get("nazwa")?.trim() || "NPC";

          for (let i = 0; i < liczba; i++) {
            const nowaNazwa = i === 0 ? nazwaBazowa : `${nazwaBazowa} ${i + 1}`;
            daneFormularza.set("nazwa", nowaNazwa);
            await generujNPC(daneFormularza);
          }
        }
      },
      close: {
        label: game.i18n.localize("NPCForge.PrzyciskZamknij")
      }
    },
    
    render: html => {

      const windowApp = html[0].closest(".window-app");
      windowApp.classList.add("npcforge-dialogMain-okno"); // klasa okna do pliku css

      liczbaPostaci(html);
      obslugaPrzyciskuGeneruj(html);

      const przyciskKreatorRasy = html[0].querySelector(".kreator-rasy");
      const przyciskKreatorArchetypu = html[0].querySelector(".kreator-archetypu");
      const przyciskOpcji = html[0].querySelector("#otworz_opcje_generatora");     
    
      przyciskKreatorRasy?.addEventListener("click", () => {
        otworzKreatorRasy();
      });
    
      przyciskKreatorArchetypu?.addEventListener("click", () => {
        otworzKreatorArchetypu();
      });
      przyciskOpcji?.addEventListener("click", () => {
        otworzOpcje();
      });
    },
      close: () => { dialogMain = null; }
  });
  window.dialogMainInstance = dialogMain;
  dialogMain.render(true);
}   

export function odswiezDialogMain() {
  if (window.dialogMainInstance) {
    window.dialogMainInstance.close();
    setTimeout(() => {
      window.dialogMainInstance = null;
      otworzDialog();
    }, 100);
  }
}

async function liczbaPostaci(html) {
  html.find("input[name='liczba']").on("blur", function () {
    let val = Number(this.value);
    if (isNaN(val) || val < 1) {
      this.value = 1;
    } else {
      this.value = Math.round(val);
    }
  });
}

async function obslugaPrzyciskuGeneruj(html) {
  const przyciskGeneruj = html.find("button[data-button='generuj']");
  const poleNazwa = html.find("input[name='nazwa']");
  const poleArchetyp = html.find("select[name='archetyp']");
  const poleRasa = html.find("select[name='rasa']");

  function sprawdzCzyGotowe() {
    const nazwa = poleNazwa.val()?.trim();
    const archetyp = poleArchetyp.val();
    const rasa = poleRasa.val();
    const gotowe = nazwa && archetyp && rasa;
    przyciskGeneruj.prop("disabled", !gotowe);
    return gotowe;
  }

  // Pierwsze sprawdzenie przy otwarciu
  sprawdzCzyGotowe();

  // Reakcja na zmianę któregokolwiek pola
  poleNazwa.on("input", sprawdzCzyGotowe);
  poleArchetyp.on("change", sprawdzCzyGotowe);
  poleRasa.on("change", sprawdzCzyGotowe);

  // Tooltip jak kliknięcie zablokowane
  przyciskGeneruj.on("mouseenter", function () {
    if (przyciskGeneruj.prop("disabled")) {
      const tooltip = document.createElement("div");
      tooltip.textContent = game.i18n.localize("NPCForge.BrakNazwyLubWyboru");
      tooltip.classList.add("npcforge-tooltip");
      document.body.appendChild(tooltip);

      const rect = this.getBoundingClientRect();
      tooltip.style.cssText = `
        position: absolute;
        background-color: #333;
        color: #fff;
        padding: 5px 8px;
        font-size: 12px;
        border-radius: 4px;
        z-index: 9999;
        pointer-events: none;
        white-space: nowrap;
        box-shadow: 0 0 4px #000;
        top: ${rect.top - 30}px;
        left: ${rect.left + rect.width / 2}px;
        transform: translateX(-50%);
      `;
    }
  });

  przyciskGeneruj.on("mouseleave", function () {
    document.querySelectorAll(".npcforge-tooltip").forEach(e => e.remove());
  });
}
