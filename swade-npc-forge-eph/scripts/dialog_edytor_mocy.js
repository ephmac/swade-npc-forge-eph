import { otworzDialogTagow } from "./dialog_tagi.js";
import { PustaLiniaHelper } from "./narzedzia.js";

let dialogMocy = null;
let tagHookMocy = null;

export async function otworzEdytorMocy() {

  if (dialogMocy) { dialogMocy.bringToTop(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  PustaLiniaHelper();

  // Szablon
  const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_edytor_mocy.hbs", {
    tagi
  });

  dialogMocy = new Dialog({
    title: game.i18n.localize("NPCForge.TytulDialogMocy"),
    content,
    buttons: {
      close: {
        label: game.i18n.localize("NPCForge.PrzyciskZamknij")
      }
    },
    render: async (html) => {

      const windowApp = html[0].closest(".window-app");
      windowApp.classList.add("npcforge-dialogMocy-okno"); // klasa okna do pliku css

      listaMocy(html);

      // Przycisk
      html[0].querySelector("#edytuj-tagi").addEventListener("click", () => otworzDialogTagow());

      tagHookMocy = Hooks.on("npcforge:tagiZmienione", async () => {
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
      dialogMocy = null;

      if (tagHookMocy !== null) {
        Hooks.off("npcforge:tagiZmienione", tagHookMocy);
        tagHookMocy = null;
      }
    }
  });
  await dialogMocy.render(true);
}


async function listaMocy(html) {

  // Pobieranie danych z kompendium
  const kompendiumId = game.settings.get("swade-npc-forge-eph", "kompendiumMoce");
  const pack = game.packs.get(kompendiumId);
  const moce = (await pack.getDocuments()).filter(e => e.type === "power");

  let wybranyTag = null;

  const select = html[0].querySelector("#wybor-tagu");
  const kontener = html[0].querySelector("#lista-mocy");

  // Bez taga
  kontener.innerHTML = "";
  for (const moc of sortowanie(moce, null)) {
    kontener.appendChild(await renderujLinie(moc, null));
  }

  // Po wybraniu taga
  select.addEventListener("change", async (e) => {
    wybranyTag = e.target.value || null;
    const nowe = sortowanie(moce, wybranyTag);
    kontener.innerHTML = "";
    for (const moc of nowe) {
      kontener.appendChild(await renderujLinie(moc, wybranyTag));
    }
  });
}


function sortowanie(moce, tag) {
  return [...moce].sort((a, b) => {

    // najpierw moce z tagiem
    if (tag) {
      const aTag = (a.getFlag("swade-npc-forge-eph", "tags") || []).includes(tag);
      const bTag = (b.getFlag("swade-npc-forge-eph", "tags") || []).includes(tag);
      if (aTag && !bTag) return -1;
      if (!aTag && bTag) return 1;
    }

    // następnie ranga
    const aRanga = parseInt(a.getFlag("swade-npc-forge-eph", "ranga") || 0) || 0;
    const bRanga = parseInt(b.getFlag("swade-npc-forge-eph", "ranga") || 0) || 0;

    const aSort = aRanga === 0 ? 99 : aRanga;
    const bSort = bRanga === 0 ? 99 : bRanga;

    if (aSort !== bSort) return aSort - bSort;


    // na końcu alfabetycznie
    return a.name.localeCompare(b.name);
  
  });
}


async function renderujLinie(moc, aktualnyTag) {

  const div = document.createElement("div");
  div.classList.add("linia-mocy");

  const przypisane = moc.getFlag("swade-npc-forge-eph", "tags") || [];
  const zaznaczone = aktualnyTag ? przypisane.includes(aktualnyTag) : false;
  const ranga = moc.getFlag("swade-npc-forge-eph", "ranga") || "0";

  div.innerHTML = `
  <label style="display:flex; align-items:center; gap:8px;">

      <input type="checkbox" ${zaznaczone ? "checked" : ""} ${!aktualnyTag ? "disabled" : ""}>

      <select name="ranga">
        <option value="0" ${ranga === "0" ? "selected" : ""}>${game.i18n.localize("NPCForge.BezRangi")}</option>
        <option value="1" ${ranga === "1" ? "selected" : ""}>${game.i18n.localize("NPCForge.Nowicjusz")}</option>
        <option value="2" ${ranga === "2" ? "selected" : ""}>${game.i18n.localize("NPCForge.Doswiadczony")}</option>
        <option value="3" ${ranga === "3" ? "selected" : ""}>${game.i18n.localize("NPCForge.Weteran")}</option>
        <option value="4" ${ranga === "4" ? "selected" : ""}>${game.i18n.localize("NPCForge.Heros")}</option>
        <option value="5" ${ranga === "5" ? "selected" : ""}>${game.i18n.localize("NPCForge.Legenda")}</option>
      </select>

      <span>
        ${moc.name}
      </span>

  </label>
  `;


  const checkbox = div.querySelector("input[type=checkbox]");

  if (aktualnyTag) {
    checkbox.addEventListener("change", async () => {

      const tags = moc.getFlag("swade-npc-forge-eph", "tags") || [];
      const istnieje = tags.includes(aktualnyTag);
      let noweTagi = [...tags];

      if (checkbox.checked && !istnieje) {
        noweTagi.push(aktualnyTag);
      } else if (!checkbox.checked && istnieje) {
        noweTagi = tags.filter(t => t !== aktualnyTag);
      }

      if (noweTagi.length > 0) {
        await moc.setFlag("swade-npc-forge-eph", "tags", noweTagi);
      } else {
        await moc.unsetFlag("swade-npc-forge-eph", "tags");
      }
    });
  }

  // Obsługa selecta (ustawienie rangi)
    const select = div.querySelector("select[name='ranga']");
    select.addEventListener("change", async () => {
      const nowaRanga = select.value;
      if (nowaRanga === "0") {
        await moc.unsetFlag("swade-npc-forge-eph", "ranga");
      } else {
        await moc.setFlag("swade-npc-forge-eph", "ranga", nowaRanga);
      }
    });

  return div;
}