import { PustaLiniaHelper, odswiezDialogi } from "./narzedzia.js";

let dialogTagow = null;
let htmlDialogTagow = null;

export async function otworzDialogTagow() {

  if (dialogTagow) { dialogTagow.bringToFront(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  PustaLiniaHelper();

  const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");

  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_tagi.hbs", {
    tagi
  });

  await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("NPCForge.DialogTagowTytul") },
    content,
    buttons: [
      { label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "close", default: true }
    ],
    render: (event, dialog) => {
      dialogTagow = dialog;
      const el = dialog.element;
      const $html = $(el);

      queueMicrotask(() => dialog.setPosition({ width: 250 }));

      htmlDialogTagow = $html;          // utrzymujemy typ jak wcześniej (jQuery)
      listaTagow($html, tagi);
    }
  });
  dialogTagow = null;
}


async function listaTagow(html, tagi) {
  const kontener = html[0].querySelector("#npcforge-listaTagow");
  if (!kontener) return;

  // Tworzenie listy
  kontener.innerHTML = tagi.map(tag => `
    <div class="npcforge-tagLinia" data-tag="${tag}">
      <span>${tag}</span>
      <span></span>
      <button type="button" class="npcforge-usunTag" data-tag="${tag}">🗑️</button>
    </div>
  `).join("");


  // Usuwanie tagów
  kontener.querySelectorAll(".npcforge-usunTag").forEach(btn => {
    btn.addEventListener("click", async () => {
      const tag = btn.dataset.tag;

      const potwierdz = await Dialog.confirm({
        title: game.i18n.localize("NPCForge.PotwierdzUsuniecie"),
        content: `<p>${game.i18n.format("NPCForge.CzyChceszUsunac")+": "+tag+"?"}</p>`
      });

      if (!potwierdz) return;

      const tagiAktualne = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
      const nowe = tagiAktualne.filter(t => t !== tag);
      await game.settings.set("swade-npc-forge-eph", "listaTagow", JSON.stringify(nowe));

      Hooks.call("npcforge:tagiZmienione");

      const noweTagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
      listaTagow(htmlDialogTagow, noweTagi);

    });
  });


  // Dodawanie tagu
  const przyciskDodajTag = html[0].querySelector("#dodaj-tag");
  const inputNowyTag = html[0].querySelector("#nowy-tag");

  przyciskDodajTag?.addEventListener("click", async () => {
    const nowyTag = inputNowyTag?.value?.trim();
    if (!nowyTag) return;

    const tagiAktualne = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");

    if (tagiAktualne.includes(nowyTag)) {
      ui.notifications.warn(game.i18n.format("NPCForge.TagJuzIstnieje", { tag: nowyTag }));
      return;
    }

    tagiAktualne.push(nowyTag);
    const posortowane = tagiAktualne.sort((a, b) => a.localeCompare(b));
    await game.settings.set("swade-npc-forge-eph", "listaTagow", JSON.stringify(posortowane));

    inputNowyTag.value = "";
    Hooks.call("npcforge:tagiZmienione");

    const noweTagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
    listaTagow(htmlDialogTagow, noweTagi);

  });
}