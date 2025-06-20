import { otworzDialogTagow } from "./dialog_tagi.js";
import { PustaLiniaHelper } from "./narzedzia.js";

let dialogPancerza = null;
let tagHookPancerza = null;

export async function otworzEdytorPancerza() {

  if (dialogPancerza) { dialogPancerza.bringToTop(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  PustaLiniaHelper();

  // Szablon
  const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_edytor_pancerza.hbs", {
    tagi
  });

  dialogPancerza = new Dialog({
    title: game.i18n.localize("NPCForge.TytulDialogPancerza"),
    content,
    buttons: {
      close: {
        label: game.i18n.localize("NPCForge.PrzyciskZamknij")
      }
    },
    render: async (html) => {

      const windowApp = html[0].closest(".window-app");
      windowApp.classList.add("npcforge-dialogPancerza-okno"); // klasa okna do pliku css

      listaPancerza(html);

      // Przycisk
      html[0].querySelector("#edytuj-tagi").addEventListener("click", () => otworzDialogTagow());

      tagHookPancerza = Hooks.on("npcforge:tagiZmienione", async () => {
        const select = html[0].querySelector("#wybor-tagu");
        if (!select) return;

        const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
        const selected = select.value;

        select.innerHTML = `<option value="">--</option>`;
        for (const tag of tagi) {
          const opt = document.createElement("option");
          opt.value = tag;
          opt.textContent = tag;
          if (tag === selected) opt.selected = true;
          select.appendChild(opt);
        }
      });

    },
    close: () => {
      dialogPancerza = null;

      if (tagHookPancerza !== null) {
        Hooks.off("npcforge:tagiZmienione", tagHookPancerza);
        tagHookPancerza = null;
      }
    }
  });
  await dialogPancerza.render(true);
}


async function listaPancerza(html) {

  // Pobieranie danych z kompendium
  const kompendiumId = game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
  const pack = game.packs.get(kompendiumId);
  const sprzet = await pack.getDocuments();

    const pancerz = sprzet
      ? (await pack.getDocuments())
        .filter(e => e.type === "armor")
      : [];

  let wybranyTag = null;

  const select = html[0].querySelector("#wybor-tagu");
  const kontener = html[0].querySelector("#lista-pancerza");

  // Bez taga
  kontener.innerHTML = "";
  for (const panc of sortowanie(pancerz, null)) {
    kontener.appendChild(await renderujLinie(panc, null));
  }

  // Po wybraniu taga
  select.addEventListener("change", async (e) => {
    wybranyTag = e.target.value || null;
    const nowe = sortowanie(pancerz, wybranyTag);
    kontener.innerHTML = "";
    for (const panc of nowe) {
      kontener.appendChild(await renderujLinie(panc, wybranyTag));
    }
  });
}


function sortowanie(pancerz, tag) {
  return [...pancerz].sort((a, b) => {

    // najpierw przewagi z tagiem
    if (tag) {
      const aTag = (a.getFlag("swade-npc-forge-eph", "tags") || []).includes(tag);
      const bTag = (b.getFlag("swade-npc-forge-eph", "tags") || []).includes(tag);
      if (aTag && !bTag) return -1;
      if (!aTag && bTag) return 1;
    }

    // następnie kategoria
    const aKat = a.system?.category || "";
    const bKat = b.system?.category || "";
    const porównanieKat = aKat.localeCompare(bKat);
    if (porównanieKat !== 0) return porównanieKat;

    // na końcu alfabetycznie
    return a.name.localeCompare(b.name);
  
  });
}


async function renderujLinie(panc, aktualnyTag) {

  const div = document.createElement("div");
  div.classList.add("linia-pancerza");

  const przypisane = panc.getFlag("swade-npc-forge-eph", "tags") || [];
  const zaznaczone = aktualnyTag ? przypisane.includes(aktualnyTag) : false;
  const kategoria = panc.system?.category || game.i18n.localize("NPCForge.KategoriaInne");

  div.innerHTML = `
    <label style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" ${zaznaczone ? "checked" : ""} ${!aktualnyTag ? "disabled" : ""}>
      <span><strong>${kategoria}:</strong> ${panc.name}</span>
    </label>
  `;

  const checkbox = div.querySelector("input[type=checkbox]");

  if (aktualnyTag) {
    checkbox.addEventListener("change", async () => {

      const tags = panc.getFlag("swade-npc-forge-eph", "tags") || [];
      const istnieje = tags.includes(aktualnyTag);
      let noweTagi = [...tags];

      if (checkbox.checked && !istnieje) {
        noweTagi.push(aktualnyTag);
      } else if (!checkbox.checked && istnieje) {
        noweTagi = tags.filter(t => t !== aktualnyTag);
      }

      if (noweTagi.length > 0) {
        await panc.setFlag("swade-npc-forge-eph", "tags", noweTagi);
      } else {
        await panc.unsetFlag("swade-npc-forge-eph", "tags");
      }
    });
  }
  return div;
}