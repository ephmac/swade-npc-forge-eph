import { generujNPC } from "./generator.js";
import { otworzKreatorRasy } from "./dialog_rasy.js";
import { otworzKreatorArchetypu } from "./dialog_archetypu.js";
import { otworzOpcje } from "./dialog_opcji.js";
import { otworzDialogWsparcia } from "./dialog_wsparcie.js";

let dialogMain = null;

export async function otworzDialog() {

  if (dialogMain) { dialogMain.bringToFront(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Pobieranie kompendiów z ustawień
  const archetypyComp = game.settings.get("swade-npc-forge-eph", "kompendiumArchetypy");
  const rasyComp = game.settings.get("swade-npc-forge-eph", "kompendiumRasy");
  
  const rasySpozaGeneratora = game.settings.get("swade-npc-forge-eph", "rasySpozaGeneratora");

  // Tworzenie listy elementów kompendiów
  const archetypy = (await game.packs.get(archetypyComp)?.getDocuments() || [])
    .filter(a => a.getFlag("swade-npc-forge-eph", "archetypDane"));

  let rasy = [];
  if(rasySpozaGeneratora) {
    rasy = (await game.packs.get(rasyComp)?.getDocuments() || [])
  }
  else {
    rasy = (await game.packs.get(rasyComp)?.getDocuments() || [])
    .filter(r => r.getFlag("swade-npc-forge-eph", "rasaDane"));
  }

  // Dane do przekazania do szablonu
  const dane = {
    archetypy: archetypy.map(a => ({ id: a.id, nazwa: a.name })),
    rasy: rasy.map(r => ({
      id: r.id,
      nazwa: r.name + (rasySpozaGeneratora && !r.getFlag("swade-npc-forge-eph", "rasaDane") ? " ⟡" : "")
    })),
  };
  
  // Renderuje szablon
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_main.hbs", dane);
    
  // Tworzenie dialogu
    await foundry.applications.api.DialogV2.wait({
    window: { title: "SWADE NPC Forge" },
    content,
    buttons: [
      {
        label: game.i18n.localize("NPCForge.PrzyciskGeneruj"),
        action: "generuj",
        default: true,
        callback: async (event, btn, dlg) => {
         
          const outer = dlg.element;
          const formularz = outer.querySelector("form") || outer;
          const daneFormularza = new FormData(formularz);

          const liczba = parseInt(daneFormularza.get("liczba")) || 1;
          const nazwaBazowa = daneFormularza.get("nazwa")?.trim() || "NPC";

          for (let i = 0; i < liczba; i++) {
            const nowaNazwa = i === 0 ? nazwaBazowa : `${nazwaBazowa} ${i + 1}`;
            daneFormularza.set("nazwa", nowaNazwa);
            await generujNPC(daneFormularza);
          }
          return "generuj";
        }
      },
      { label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "close" }
    ],
    render: (event, dialog) => {
      dialogMain = dialog;
      window.dialogMainInstance = dialog;

      const el = dialog.element;
      const html = $(el);

      //queueMicrotask(() => dialog.setPosition({ width: 450, height: 360 })); // ROZMIAR OKNA ALE NA RAZIE GENERUJE SIĘ AUTOMATYCZNIE< WIĘC ZAKOMENTOWANE

      liczbaPostaci(html);
      obslugaPrzyciskuGeneruj(html);

      el.querySelector(".kreator-rasy")?.addEventListener("click", () => otworzKreatorRasy());
      el.querySelector(".kreator-archetypu")?.addEventListener("click", () => otworzKreatorArchetypu());
      el.querySelector("#otworz_opcje_generatora")?.addEventListener("click", () => otworzOpcje());
      el.querySelector("#otworz_wsparcie")?.addEventListener("click", () => otworzDialogWsparcia());
    }
  });
  // po zamknięciu:
  dialogMain = null;
  window.dialogMainInstance = null;
}   

export async function odswiezDialogMain() {
  const dlg = window.dialogMainInstance;
  if (!dlg) return otworzDialog();       // jeśli głównego nie ma, po prostu otwórz

  try { await dlg.close(); } catch {}     // zamknij i poczekaj aż się faktycznie domknie

  // w tym momencie wait() z otworzDialog() już się rozwiąże i posprząta referencje
  return otworzDialog();                  // otwórz świeży dialog z nowymi danymi
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
  const przyciskGeneruj = html.find("button[data-action='generuj']");
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
