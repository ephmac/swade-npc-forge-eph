import { PustaLiniaHelper } from "./narzedzia.js";

let dialogAmunicji = null

export async function otworzEdytorAmunicji() {

  if (dialogAmunicji) { dialogAmunicji.bringToFront(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  PustaLiniaHelper();

  // Szablon
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_amunicja.hbs", {

  });

  const action = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("NPCForge.TytulDialogAmunicji") },
    content,
    buttons: [
      { label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "close", default: true }
    ],
    render: (event, dialog) => {
      dialogAmunicji = dialog;
      const el = dialog.element;
      //el.classList.add("npcforge-dialogAmunicji-okno");
      const $html = $(el);

      queueMicrotask(() => dialog.setPosition({ width: 600 }));

      listaAmunicji($html);
    }
  });
  dialogAmunicji = null; // po zamknięciu

}


async function listaAmunicji(html) {

  // Pobieranie danych z kompendium
  const kompendiumId = game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
  const pack = game.packs.get(kompendiumId);
  const sprzet = await pack.getDocuments();

    // lista wszystkich nazw amunicji w kompendium
    const amunicjeZKompendium = sprzet
      .map(e => e.name);

    const bron = sprzet
        .filter(e => e.type === "weapon" && e.system?.ammo?.trim() !== "");

  const kontener = html[0].querySelector("#lista-amunicji");

  // Bez taga
  kontener.innerHTML = "";
  for (const br of sortowanie(bron, null)) {
    kontener.appendChild(await renderujLinie(br, amunicjeZKompendium));
  }

}

function sortowanie(bron) {
  return [...bron].sort((a, b) => {

    // kategoria
    const aKat = a.system?.category || "";
    const bKat = b.system?.category || "";
    const porównanieKat = aKat.localeCompare(bKat);
    if (porównanieKat !== 0) return porównanieKat;

    // na końcu alfabetycznie
    return a.name.localeCompare(b.name);
  
  });
}


async function renderujLinie(bron, amunicjeZKompendium) {

  const div = document.createElement("div");
  div.classList.add("npcforge-liniaAmunicji");

  const amunicja = bron.system?.ammo
  const wartoscFlagi = await bron.getFlag("swade-npc-forge-eph", "amunicjaIlosc") || 0;

  const istnieje = amunicjeZKompendium.includes(amunicja);

  div.innerHTML = `
      <span class="${istnieje ? "npcforge-alert-ukryty" : ""}">❗</span>
      <span><strong>${bron.name}</strong></span>
      <span></span>
      <img class="npcforge_amunicja_dark" src="modules/swade-npc-forge-eph/icons/amunicjaC.png" style="width:24px; height:24px; border:none;" />
      <img  class="npcforge_amunicja_light"src="modules/swade-npc-forge-eph/icons/amunicjaJ.png" style="width:24px; height:24px; border:none;" />
      <input type="number" name="npcforge-iloscAmunicji" value="${wartoscFlagi}" />
      <span>${amunicja}</span>

      <style>
        .theme-dark .npcforge_amunicja_light, 
        .theme-light .npcforge_amunicja_dark {
          display: none;
        }
      </style>
  `;

  const input = div.querySelector('input[name="npcforge-iloscAmunicji"]');
  input.addEventListener("input", async () => {
    const nowaWartosc = parseInt(input.value) || 0;
    await bron.setFlag("swade-npc-forge-eph", "amunicjaIlosc", nowaWartosc);
  });
  
  return div;
}