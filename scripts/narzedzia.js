import { otworzEdytorPrzewag } from "./dialog_edytor_przewag.js";
import { otworzEdytorMocy } from "./dialog_edytor_mocy.js";
import { otworzDialogTagow } from "./dialog_tagi.js";
import { otworzKreatorArchetypu } from "./dialog_archetypu.js";
import { otworzEdytorPancerza } from "./dialog_edytor_pancerza.js";
import { otworzEdytorBroni } from "./dialog_edytor_broni.js";

export function losuj(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function wytnijZakres(min, max, tablica) {
  const iMin = tablica.indexOf(min);
  const iMax = tablica.indexOf(max);
  return tablica.slice(iMin, iMax + 1);
}

export function sciankiKosci(kosc) {
  const osc = kosc.slice(1);
  let koniec;

  if (osc.includes("+")) {
    koniec = osc.indexOf("+");
  } else if (osc.includes("-")) {
    koniec = osc.indexOf("-");
  } else {
    koniec = osc.length;
  }
  
  return parseInt(osc.slice(0, koniec));
}
  
export function modyfikatorKosci(kosc) {
  let modyfikator = 0;
 
  if (kosc.includes("+")) {
    const indeks = kosc.indexOf("+");
    modyfikator = parseInt(kosc.slice(indeks));
  } else if (kosc.includes("-")) {
    const indeks = kosc.indexOf("-");
    modyfikator = parseInt(kosc.slice(indeks));
  }
  
  return modyfikator;
}

export function listaKosci_k4m1() {
  const listaKosciHTML = `
    <select name="{{nazwa}}">
      <option value="d4-3">d4-3</option>
      <option value="d4-2">d4-2</option>
      <option value="d4-1" selected>d4-1</option>
      <option value="d4">d4</option>
      <option value="d6">d6</option>
      <option value="d8">d8</option>
      <option value="d10">d10</option>
      <option value="d12">d12</option>
      <option value="d12+1">d12+1</option>
      <option value="d12+2">d12+2</option>
      <option value="d12+3">d12+3</option>
      <option value="d12+4">d12+4</option>
      <option value="d12+5">d12+5</option>
      <option value="d12+6">d12+6</option>
      <option value="d12+7">d12+7</option>
      <option value="d12+8">d12+8</option>
      <option value="d12+9">d12+9</option>
      <option value="d12+10">d12+10</option>
      <option value="d12+11">d12+11</option>
    </select>
  `;
  Handlebars.registerPartial("listaKosciK4m1", listaKosciHTML);
}

export function listaKosci_k4() {
  const listaKosciHTML = `
    <select name="{{nazwa}}">
      <option value="d4-3">d4-3</option>
      <option value="d4-2">d4-2</option>
      <option value="d4-1">d4-1</option>
      <option value="d4" selected>d4</option>
      <option value="d6">d6</option>
      <option value="d8">d8</option>
      <option value="d10">d10</option>
      <option value="d12">d12</option>
      <option value="d12+1">d12+1</option>
      <option value="d12+2">d12+2</option>
      <option value="d12+3">d12+3</option>
      <option value="d12+4">d12+4</option>
      <option value="d12+5">d12+5</option>
      <option value="d12+6">d12+6</option>
      <option value="d12+7">d12+7</option>
      <option value="d12+8">d12+8</option>
      <option value="d12+9">d12+9</option>
      <option value="d12+10">d12+10</option>
      <option value="d12+11">d12+11</option>
    </select>
  `;
  Handlebars.registerPartial("listaKosciK4", listaKosciHTML);
}

export function listaKosci_k12() {
  const listaKosciHTML = `
    <select name="{{nazwa}}">
      <option value="d4-3">d4-3</option>
      <option value="d4-2">d4-2</option>
      <option value="d4-1">d4-1</option>
      <option value="d4">d4</option>
      <option value="d6">d6</option>
      <option value="d8">d8</option>
      <option value="d10">d10</option>
      <option value="d12" selected>d12</option>
      <option value="d12+1">d12+1</option>
      <option value="d12+2">d12+2</option>
      <option value="d12+3">d12+3</option>
      <option value="d12+4">d12+4</option>
      <option value="d12+5">d12+5</option>
      <option value="d12+6">d12+6</option>
      <option value="d12+7">d12+7</option>
      <option value="d12+8">d12+8</option>
      <option value="d12+9">d12+9</option>
      <option value="d12+10">d12+10</option>
      <option value="d12+11">d12+11</option>
    </select>
  `;
  Handlebars.registerPartial("listaKosciK12", listaKosciHTML);
}

export function listaKosci_k12p2() {
  const listaKosciHTML = `
    <select name="{{nazwa}}">
      <option value="d4-3">d4-3</option>
      <option value="d4-2">d4-2</option>
      <option value="d4-1">d4-1</option>
      <option value="d4">d4</option>
      <option value="d6">d6</option>
      <option value="d8">d8</option>
      <option value="d10">d10</option>
      <option value="d12">d12</option>
      <option value="d12+1">d12+1</option>
      <option value="d12+2" selected>d12+2</option>
      <option value="d12+3">d12+3</option>
      <option value="d12+4">d12+4</option>
      <option value="d12+5">d12+5</option>
      <option value="d12+6">d12+6</option>
      <option value="d12+7">d12+7</option>
      <option value="d12+8">d12+8</option>
      <option value="d12+9">d12+9</option>
      <option value="d12+10">d12+10</option>
      <option value="d12+11">d12+11</option>
    </select>
  `;
  Handlebars.registerPartial("listaKosciK12p2", listaKosciHTML);
}

export function listaModyfikator() {
  const listaModyfikatorHTML = `
    <select name="{{nazwa}}">
      <option value="-10">-10</option>
      <option value="-9">-9</option>
      <option value="-8">-8</option>
      <option value="-7">-7</option>
      <option value="-6">-6</option>
      <option value="-5">-5</option>
      <option value="-4">-4</option>
      <option value="-3">-3</option>
      <option value="-2">-2</option>
      <option value="-1">-1</option>
      <option value="0" selected>+0</option>
      <option value="1">+1</option>
      <option value="2">+2</option>
      <option value="3">+3</option>
      <option value="4">+4</option>
      <option value="5">+5</option>
      <option value="6">+6</option>
      <option value="7">+7</option>
      <option value="8">+8</option>
      <option value="9">+9</option>
      <option value="10">+10</option>
    </select>
  `;
  Handlebars.registerPartial("listaModyfikator", listaModyfikatorHTML);
}

export function listaModyfikatorNieujemny() {
  const listaModyfikatorHTML = `
    <select name="{{nazwa}}">
      <option value="0" selected>+0</option>
      <option value="1">+1</option>
      <option value="2">+2</option>
      <option value="3">+3</option>
      <option value="4">+4</option>
      <option value="5">+5</option>
      <option value="6">+6</option>
      <option value="7">+7</option>
      <option value="8">+8</option>
      <option value="9">+9</option>
      <option value="10">+10</option>
    </select>
  `;
  Handlebars.registerPartial("listaModyfikatorNieujemny", listaModyfikatorHTML);
}

export function listaKosciKrotka_k6() {
  const listaKosciHTML = `
    <select name="{{nazwa}}">
      <option value="d4">d4</option>
      <option value="d6" selected>d6</option>
      <option value="d8">d8</option>
      <option value="d10">d10</option>
      <option value="d12">d12</option>
    </select>
  `;
  Handlebars.registerPartial("listaKosciKrotka_k6", listaKosciHTML);
}

export function listaKosciKrotka_k4() {
  const listaKosciHTML = `
    <select name="{{nazwa}}">
      <option value="d4" selected>d4</option>
      <option value="d6">d6</option>
      <option value="d8">d8</option>
      <option value="d10">d10</option>
      <option value="d12">d12</option>
    </select>
  `;
  Handlebars.registerPartial("listaKosciKrotka_k4", listaKosciHTML);
}

export function PustaLiniaHelper() {
  if (!Handlebars.helpers.pustaLinia) {
    Handlebars.registerHelper("pustaLinia", function () {
      return new Handlebars.SafeString('<div style="height: 10px;"></div>');
    });
  }
}

export async function odswiezDialogi() {/*
  const dialogiDoOdswiezenia = [
    { tytul: game.i18n.localize("NPCForge.TytulDialogArchetyp"), otworz: otworzKreatorArchetypu },
    { tytul: game.i18n.localize("NPCForge.TytulDialogPrzewag"), otworz: otworzEdytorPrzewag },
    { tytul: game.i18n.localize("NPCForge.TytulDialogMocy"), otworz: otworzEdytorMocy },
    { tytul: game.i18n.localize("NPCForge.TytulDialogPancerza"), otworz: otworzEdytorPancerza },
    { tytul: game.i18n.localize("NPCForge.TytulDialogBroni"), otworz: otworzEdytorBroni },
    { tytul: game.i18n.localize("NPCForge.DialogTagowTytul"), otworz: otworzDialogTagow },
  ];
  for (const { tytul, otworz } of dialogiDoOdswiezenia) {
    for (const app of Object.values(ui.windows)) {
      if (app instanceof Dialog && app.title === tytul) {
        app.close();
        if (typeof otworz === "function") {
          await otworz();
        }
        break;
      }
    }
  }*/
}

// ŁADOWARKA Z KOMENDIÓW
const wariantyKompendiow = {
  "archetypy":      { ustawienie: "kompendiumArchetypy",      typ: "Item" },
  "rasy":           { ustawienie: "kompendiumRasy",           typ: "Actor" },
  "umiejetnosci":   { ustawienie: "kompendiumUmiejetnosci",   typ: "Item" },
  "przewagi":       { ustawienie: "kompendiumPrzewagi",       typ: "edge" },
  "zawady":         { ustawienie: "kompendiumZawady",         typ: "hindrance" },
  "moce":           { ustawienie: "kompendiumMoce",           typ: "power" },
  "sprzet":         { ustawienie: "kompendiumSprzet",         typ: "item" },
  "bronnaturalna":  { ustawienie: "kompendiumBronNaturalna",  typ: "item" },
};

export async function zaladujKompendium(wariant) {
  const wpis = wariantyKompendiow[wariant.toLowerCase()];
  if (!wpis) {
    console.warn(`⛔ Nieznany wariant kompendium: "${wariant}"`);
    return [];
  }

  const { ustawienie, typ } = wpis;

  try {
    const idKompendium = game.settings.get("swade-npc-forge-eph", ustawienie);
    if (!idKompendium) return [];

    const pack = game.packs.get(idKompendium);
    if (!pack) {
      console.warn(`❗ Kompendium "${idKompendium}" nie istnieje.`);
      return [];
    }

    const dokumenty = await pack.getDocuments();
    return dokumenty.filter(d => d.type?.toLowerCase() === typ.toLowerCase());
  } catch (err) {
    console.error(`Błąd przy ładowaniu kompendium "${wariant}":`, err);
    return [];
  }
}

export const Kosci = {

  // krótka lista
  K: ["d4", "d6", "d8", "d10", "d12"],

  // długa lista
  D: [  "d4-3", "d4-2", "d4-1", "d4", "d6", "d8", "d10", "d12",
        "d12+1", "d12+2", "d12+3", "d12+4", "d12+5", "d12+6",
        "d12+7", "d12+8", "d12+9", "d12+10", "d12+11" ],

  // Zwraca indeks wartości
  Liczba(kosc, typ) {
    const mapa = this[typ];
    return mapa.indexOf(kosc);
  },

  // Zwraca tekstową wartość z indeksu
  Tekst(index, typ) {
    const mapa = this[typ];
    return mapa[index] || null;
  },

  // Podnosi wartość o 1 (lub więcej)
  Plus(kosc, typ, oIle = 1) {
    const mapa = this[typ];
    const index = mapa.indexOf(kosc);
    const nowyIndex = Math.min(index + oIle, mapa.length - 1);
    return mapa[nowyIndex];
  },

  // Obniża wartość o 1 (lub więcej)
  Minus(kosc, typ, oIle = 1) {
    const mapa = this[typ];
    const index = mapa.indexOf(kosc);
    const nowyIndex = Math.max(index - oIle, 0);
    return mapa[nowyIndex];
  }
};


/*export async function odswiezDialogi() {
  const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");

  // 1. Lista tagów w dialogu tagów
  if (dialogTagow) {
    const kontener = dialogTagow.element[0].querySelector("#npcforge-listaTagow");
    if (kontener) {
      kontener.innerHTML = tagi.map(tag => `
        <div class="npcforge-tagLinia" data-tag="${tag}">
          <span>${tag}</span>
          <span></span>
          <button type="button" class="npcforge-usunTag" data-tag="${tag}">🗑️</button>
        </div>
      `).join("");

      kontener.querySelectorAll(".npcforge-usunTag").forEach(btn => {
        btn.addEventListener("click", async () => {
          const tag = btn.dataset.tag;

          const potwierdz = await Dialog.confirm({
            title: game.i18n.localize("NPCForge.PotwierdzUsuniecie"),
            content: `<p>${game.i18n.format("NPCForge.CzyChceszUsunac") + ": " + tag + "?"}</p>`
          });

          if (!potwierdz) return;

          const tagiAktualne = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
          const nowe = tagiAktualne.filter(t => t !== tag);
          await game.settings.set("swade-npc-forge-eph", "listaTagow", JSON.stringify(nowe));

          odswiezDialogi();
        });
      });
    }
  }

  // 2. Wszystkie selecty z tagami
  document.querySelectorAll("select.npcforge-select-tagow").forEach(select => {
    const wybrany = select.value; // zapamiętaj zaznaczoną opcję
    select.innerHTML = ""; // wyczyść

    // domyślna pusta opcja
    const opcjaPusta = document.createElement("option");
    opcjaPusta.value = "";
    opcjaPusta.textContent = "--";
    select.appendChild(opcjaPusta);

    for (const tag of tagi) {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      if (tag === wybrany) option.selected = true;
      select.appendChild(option);
    }
  });
}*/
