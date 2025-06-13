import { PustaLiniaHelper } from "./narzedzia.js";

let dialogNadprzyrodzone = null

export async function otworzEdytorPrzewagNadprzyrodzonych() {

  if (dialogNadprzyrodzone) { dialogNadprzyrodzone.bringToTop(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  PustaLiniaHelper();

  // Szablon
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_nadprzyrodzone.hbs", {

  });

  dialogNadprzyrodzone = new Dialog({
    title: game.i18n.localize("NPCForge.TytulDialogNadprzyrodzone"),
    content,
    buttons: {
      close: {
        label: game.i18n.localize("NPCForge.PrzyciskZamknij")
      }
    },
    render: async (html) => {

      const windowApp = html[0].closest(".window-app");
      windowApp.classList.add("npcforge-dialogNadprzyrodzone-okno"); // klasa okna do pliku css

      listaPrzewag(html);

    },
    close: () => {
      dialogNadprzyrodzone = null;
    }
  });
  await dialogNadprzyrodzone.render(true);
}


async function listaPrzewag(html) {

  // Pobieranie danych z kompendium
  const kompendiumId = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
  const pack = game.packs.get(kompendiumId);
  const przewagi = await pack.getDocuments();

  const kontener = html[0].querySelector("#lista-przewag");


  kontener.innerHTML = "";
  for (const przewaga of sortowanie(przewagi, null)) {
    kontener.appendChild(await renderujLinie(przewaga, przewagi));
  }
}

function sortowanie(przewagi) {
  return [...przewagi].sort((a, b) => {
    const aChecked = a.getFlag("swade-npc-forge-eph", "przewagaNadprzyrodzona") ? -1 : 0;
    const bChecked = b.getFlag("swade-npc-forge-eph", "przewagaNadprzyrodzona") ? -1 : 0;

    // najpierw zaznaczone
    if (aChecked !== bChecked) return aChecked - bChecked;

    // potem kategoria
    const aKat = a.system?.category || "";
    const bKat = b.system?.category || "";
    const porownanieKat = aKat.localeCompare(bKat);
    if (porownanieKat !== 0) return porownanieKat;

    // na końcu alfabetycznie
    return a.name.localeCompare(b.name);
  });
}

async function renderujLinie(przewaga, przewagi) {

  const div = document.createElement("div");
  div.classList.add("npcforge-liniaPrzewagiNadprzyrodzonej");

  const nadprzyrodzona = await przewaga.getFlag("swade-npc-forge-eph", "przewagaNadprzyrodzona") || false;
  const wybranaOpcja = await przewaga.getFlag("swade-npc-forge-eph", "wymaganaPrzewagaDajacaMoce") || "";
  const kategoria = przewaga.system?.category || game.i18n.localize("NPCForge.KategoriaInne");
  const listaZdolnosci = game.settings.get("swade-npc-forge-eph", "przewagiMocy").zdolnosci || [];

  // buduj <option>
let opcjeHTML = `<option value="">Dowolna</option>`;

for (let i = 0; i < listaZdolnosci.length; i++) {
  const przew = listaZdolnosci[i];
  const wartosc = przew.przewaga;

  // Znajdź dokument przewagi po ID
  const doc = przewagi.find(p => p.id === wartosc);
  const etykieta = doc?.name || wartosc; // jeśli nie znajdzie, pokaże ID (lepsze to niż nic)

  const selected = (wartosc === wybranaOpcja) ? "selected" : "";

  opcjeHTML += `<option value="${wartosc}" ${selected}>${etykieta}</option>`;
}



  div.innerHTML = `
      <span><strong>${kategoria}: ${przewaga.name}</strong></span>

      <span></span>

      <input type="checkbox" ${nadprzyrodzona ? "checked" : ""}>

      <span></span>

      <select>${opcjeHTML}</select>
  `;

    const checkbox = div.querySelector("input[type=checkbox]");
    const select = div.querySelector("select");

    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        await przewaga.setFlag("swade-npc-forge-eph", "przewagaNadprzyrodzona", true);
        const wartosc = select.value === "" ? "dowolna" : select.value;
        await przewaga.setFlag("swade-npc-forge-eph", "wymaganaPrzewagaDajacaMoce", wartosc);
      } else {
        await przewaga.unsetFlag("swade-npc-forge-eph", "przewagaNadprzyrodzona");
        await przewaga.unsetFlag("swade-npc-forge-eph", "wymaganaPrzewagaDajacaMoce");
      }
    });

    select.addEventListener("change", async () => {
      if (checkbox.checked) {
        const wartosc = select.value === "" ? "dowolna" : select.value;
        await przewaga.setFlag("swade-npc-forge-eph", "wymaganaPrzewagaDajacaMoce", wartosc);
      }
    });

  return div;
}