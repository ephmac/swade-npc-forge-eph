import { otworzDialogTagow } from "./dialog_tagi.js";
import { PustaLiniaHelper } from "./narzedzia.js";

let dialogPrzewag = null
let tagHookPrzewag = null;

export async function otworzEdytorPrzewag() {

  if (dialogPrzewag) { dialogPrzewag.bringToTop(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  PustaLiniaHelper();

  // Szablon
  const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_edytor_przewag.hbs", {
    tagi
  });

  dialogPrzewag = new Dialog({
    title: game.i18n.localize("NPCForge.TytulDialogPrzewag"),
    content,
    buttons: {
      close: {
        label: game.i18n.localize("NPCForge.PrzyciskZamknij")
      }
    },
    render: async (html) => {

      const windowApp = html[0].closest(".window-app");
      windowApp.classList.add("npcforge-dialogPrzewag-okno"); // klasa okna do pliku css

      listaPrzewag(html);

      // Przycisk
      html[0].querySelector("#edytuj-tagi").addEventListener("click", () => otworzDialogTagow());

      tagHookPrzewag = Hooks.on("npcforge:tagiZmienione", async () => {
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
      dialogPrzewag = null;

      if (tagHookPrzewag !== null) {
        Hooks.off("npcforge:tagiZmienione", tagHookPrzewag);
        tagHookPrzewag = null;
      }
    }
  });
  await dialogPrzewag.render(true);
}


async function listaPrzewag(html) {

  // Pobieranie danych z kompendium
  const kompendiumId = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
  const pack = game.packs.get(kompendiumId);
  const przewagi = (await pack.getDocuments()).filter(e => e.type === "edge");

  let wybranyTag = null;

  const select = html[0].querySelector("#wybor-tagu");
  const kontener = html[0].querySelector("#lista-przewag");

  // Bez taga
  kontener.innerHTML = "";
  for (const przewaga of sortowanie(przewagi, null)) {
    kontener.appendChild(await renderujLinie(przewaga, null));
  }

  // Po wybraniu taga
  select.addEventListener("change", async (e) => {
    wybranyTag = e.target.value || null;
    const nowe = sortowanie(przewagi, wybranyTag);
    kontener.innerHTML = "";
    for (const przewaga of nowe) {
      kontener.appendChild(await renderujLinie(przewaga, wybranyTag));
    }
  });
}


function sortowanie(przewagi, tag) {
  return [...przewagi].sort((a, b) => {

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


async function renderujLinie(przewaga, aktualnyTag) {

  const div = document.createElement("div");
  div.classList.add("linia-przewagi");

  const przypisane = przewaga.getFlag("swade-npc-forge-eph", "tags") || [];
  const zaznaczone = aktualnyTag ? przypisane.includes(aktualnyTag) : false;
  const kategoria = przewaga.system?.category || game.i18n.localize("NPCForge.KategoriaInne");

  div.innerHTML = `
    <label style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" ${zaznaczone ? "checked" : ""} ${!aktualnyTag ? "disabled" : ""}>
      <span><strong>${kategoria}:</strong> ${przewaga.name}</span>
    </label>
  `;

  const checkbox = div.querySelector("input[type=checkbox]");

  if (aktualnyTag) {
    checkbox.addEventListener("change", async () => {

      const tags = przewaga.getFlag("swade-npc-forge-eph", "tags") || [];
      const istnieje = tags.includes(aktualnyTag);
      let noweTagi = [...tags];

      if (checkbox.checked && !istnieje) {
        noweTagi.push(aktualnyTag);
      } else if (!checkbox.checked && istnieje) {
        noweTagi = tags.filter(t => t !== aktualnyTag);
      }

      if (noweTagi.length > 0) {
        await przewaga.setFlag("swade-npc-forge-eph", "tags", noweTagi);
      } else {
        await przewaga.unsetFlag("swade-npc-forge-eph", "tags");
      }
    });
  }
  return div;
}