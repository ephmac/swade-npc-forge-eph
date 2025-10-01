import { odswiezDialogMain } from "./dialog_main.js";
import { PustaLiniaHelper } from "./narzedzia.js";
import { generujArchetyp } from "./generator_archetypu.js";
import { otworzEdytorPrzewag } from "./dialog_edytor_przewag.js";
import { otworzEdytorMocy } from "./dialog_edytor_mocy.js";
import { otworzEdytorPancerza } from "./dialog_edytor_pancerza.js";
import { otworzEdytorBroni } from "./dialog_edytor_broni.js";
import { otworzEdytorAmunicji } from "./dialog_amunicji.js";
import { otworzEdytorPrzewagNadprzyrodzonych } from "./dialog_nadprzyrodzone.js"

let dialogArchetypu = null;

export async function otworzKreatorArchetypu() {

  if (dialogArchetypu) { dialogArchetypu.bringToFront(); return; } // Zapobiega wielokrotnemu otwieraniu
  
  // Helpery
  PustaLiniaHelper();

  // Dane do przekazania do szablonu - na razie pusto
  const dane = {
    rangi: ["Novice", "Seasoned", "Veteran", "Heroic", "Legendary"],
    poziomy: ["P", "1", "2", "3", "4", "5"],
    lokacje: [
      { kod: "K", label: "pancerzKorpus" },
      { kod: "G", label: "pancerzGlowa" },
      { kod: "R", label: "pancerzRece" },
      { kod: "N", label: "pancerzNogi" }
    ]
  };  
  
  // Renderuje szablon kreatora rasy
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_archetypu.hbs", dane);

  // Tworzenie dialogu
  await foundry.applications.api.DialogV2.wait({
  window: { title: game.i18n.localize("NPCForge.TytulDialogArchetyp") },
  content,
  buttons: [
    {
      label: game.i18n.localize("NPCForge.PrzyciskStworz"),
      action: "stworz",
      callback: async (event, btn, dlg) => {
        const formularz = dlg.element.querySelector("form") || dlg.element;
        const daneFormularza = new FormData(formularz);
        await generujArchetyp(daneFormularza);
        odswiezDialogMain();
        return "stworz";
      }
    },
    { label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "close" }
  ],
    render: async (event, dialog) => {
      dialogArchetypu = dialog;

      const el = dialog.element;
      const html = $(el);

      queueMicrotask(() => dialog.setPosition({ width: 500 }));


        obslugaPrzyciskuStworz(html);
        obslugaAtrybutów(html);
        obslugaUmiejetnosci(html);
        przewagiArchetyp(html);
        przewagiMocyArchetyp(html);
        moceArchetyp(html);
        obslugaZakladekRangiPancerz(html);
        obslugaZakladekRangiBron(html);
        obsluzDropItemGrants(html);
        
        const lokacje = ["K", "G", "R", "N"];
        const poziomy = ["P", "1", "2", "3", "4", "5"];
        for (const lok of lokacje) {
          for (const poz of poziomy) {
            const kod = lok + poz;
            await pancerz(html, kod);
          }
        }
    }
  });
    dialogArchetypu = null;
    licznikWariantowP = 0;
    licznikWariantow1 = 0;
    licznikWariantow2 = 0;
    licznikWariantow3 = 0;
    licznikWariantow4 = 0;
    licznikWariantow5 = 0;
}



function gwiazdki(panel, domyslnyPoziom = 0, callback = null) {

  const ikony = panel.querySelectorAll("img");
  panel.classList.add("npcforge-gwiazdki");

  ustawPoziom(domyslnyPoziom);

  ikony.forEach(ikona => {
    ikona.addEventListener("click", () => {
      const klikniety = parseInt(ikona.dataset.index);
      ustawPoziom(klikniety);
    });
  });

  function ustawPoziom(poziom) {
    panel.dataset.wartosc = poziom;

    const base = "modules/swade-npc-forge-eph/icons/poziomy/";

    // Tarcza (ikona 1)
    ikony[0].src = poziom === 1 ? `${base}tarcza1.png` : `${base}tarcza0.png`;

    // Kowadła (ikony 2–4)
    if (poziom === 2) {
      ikony[1].src = `${base}kowadlo1.png`;
      ikony[2].src = `${base}kowadlo0.png`;
      ikony[3].src = `${base}kowadlo0.png`;
    } else if (poziom === 3) {
      ikony[1].src = `${base}kowadlo2.png`;
      ikony[2].src = `${base}kowadlo2.png`;
      ikony[3].src = `${base}kowadlo0.png`;
    } else if (poziom === 4) {
      ikony[1].src = `${base}kowadlo3.png`;
      ikony[2].src = `${base}kowadlo3.png`;
      ikony[3].src = `${base}kowadlo3.png`;
    } else {
      // poziom 1 lub 5
      ikony[1].src = `${base}kowadlo0.png`;
      ikony[2].src = `${base}kowadlo0.png`;
      ikony[3].src = `${base}kowadlo0.png`;
    }

    // Ogień (ikona 5)
    ikony[4].src = poziom === 5 ? `${base}ogien1.png` : `${base}ogien0.png`;

    // PROSTA wersja
    let hiddenInput = panel.parentElement.querySelector('input[type="hidden"]');
    
    if (!hiddenInput) {
      // AWARYJNA wersja
      const kontener = panel.closest(
        ".npcforge-liniaAtrybutArchetyp, .npcforge-liniaUmiejetnoscArchetyp, .npcforge-liniaPrzewagaArchetyp, .npcforge-liniaMocArchetyp, .npcforge-liniaPancerzaArchetyp, .npcforge-linia-bron"
      ) || panel.closest(".npcforge-kafelekUmiejetnosc, .npcforge-kafelekUmiejetnoscNadprzyrodzona");

      let nazwa;
      if (kontener?.classList.contains("npcforge-liniaAtrybutArchetyp")) {
        nazwa = "npcforge-" + kontener.dataset.nazwa + "Archetyp";
      } else if (
        kontener?.classList.contains("npcforge-kafelekUmiejetnosc") ||
        kontener?.classList.contains("npcforge-kafelekUmiejetnoscNadprzyrodzona")
      ) {
        nazwa = "um-" + kontener.closest("[data-id]")?.dataset.id;
      } else {
        nazwa = kontener?.dataset.nazwa;
      }

      if (kontener) hiddenInput = kontener.querySelector(`input[name="${nazwa}"]`);
    }

    if (hiddenInput) hiddenInput.value = poziom;

    // wariant broni
    const inputWariant = panel.parentElement.querySelector('input[type="hidden"][data-lacznik]');
    if (inputWariant) inputWariant.value = poziom;
    if (typeof callback === "function") {
      callback(poziom);
    }

  }
}


// ATRYBUTY
        function obslugaAtrybutów(html) {
          const panele = html[0].querySelectorAll(".npcforge-atrybutyArchetyp .npcforge-gwiazdki2");

          panele.forEach(panel => {
            gwiazdki(panel, 3);
          });
}


// UMIEJĘTNOŚĆI
        async function obslugaUmiejetnosci(html) {
          
          // Pobranie kompendium z ustawień
          const umiejetnosciComp = game.settings.get("swade-npc-forge-eph", "kompendiumUmiejetnosci");
          const umiejetnosciPack = game.packs.get(umiejetnosciComp);
          if (!umiejetnosciPack) return;

          const ustawienia = game.settings.get("swade-npc-forge-eph", "przewagiMocy");
          const zdolnosciNadprzyrodzone = ustawienia.zdolnosci.map(z => z.umiejetnosc);

          const umiejetnosci = (await umiejetnosciPack.getDocuments())
            .filter(e => e.type === "skill")
            .map(e => ({ id: e.id, name: e.name }))
            .sort((a, b) => a.name.localeCompare(b.name));

          const grid = html[0].querySelector("#npcforge-listaUmiejetnosciArchetyp");

          for (const um of umiejetnosci) {
            const czyNadprzyrodzona = zdolnosciNadprzyrodzone.includes(um.id);
            const div = document.createElement("div");
            div.classList.add("npcforge-liniaUmiejetnoscArchetyp");
            div.dataset.id = um.id;
            div.dataset.nazwa = um.name;

            const kontener = document.createElement("div");
            if (czyNadprzyrodzona) { kontener.classList.add("npcforge-kafelekUmiejetnoscNadprzyrodzona"); }
            else { kontener.classList.add("npcforge-kafelekUmiejetnosc"); };


            kontener.innerHTML = `
              <label style="font-weight:bold;">${um.name}</label>
              <div class="npcforge-gwiazdki2" data-wartosc="0">
                ${[1, 2, 3, 4, 5].map(i =>
                  `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                ).join("")}
              </div>
              <input type="hidden" name="um-${um.id}" value="0" />
            `;

            grid.appendChild(kontener);

            // Aktywuj gwiazdki
            const panel = kontener.querySelector(".npcforge-gwiazdki2");
            if (panel) gwiazdki(panel, 2);
          }
        }


// PRZEWAGI
        async function przewagiArchetyp(html) {

          // Pobieranie kompendium z ustawień
          const przewagiComp = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
          const przewagiPack = game.packs.get(przewagiComp);
          const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow"));

          const przewagi = przewagiPack
          ? (await przewagiPack.getDocuments())
              .filter(e => e.type === "edge")
              .map(e => ({
                id: e.id,
                name: e.name,
                category: e.system?.category || game.i18n.localize("NPCForge.KategoriaInne")
              }))
              .sort((a, b) => {
                const catCmp = a.category.localeCompare(b.category);
                return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
              })
          : [];

          const przyciskDodaj = html[0].querySelector("#dodaj_przewage_archetyp");
          const przyciskDodajGrupe = html[0].querySelector("#dodaj_grupe_przewag_archetyp");
          const przyciskEdytor = html[0].querySelector("#otworz_edytor_przewag_archetyp");
          const blok = html[0].querySelector("#lista_przewag_archetyp");

          przyciskDodaj.addEventListener("click", () => dodajPrzewage("pojedyncza"));
          przyciskDodajGrupe.addEventListener("click", () => dodajPrzewage("grupowa"));
          przyciskEdytor.addEventListener("click", () => otworzEdytorPrzewag());

          function dodajPrzewage(typ) {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaPrzewagaArchetyp");

            if (typ === "pojedyncza") {
              linia.innerHTML = `

                <select name="npcforge-przewagaArchetyp[]">
                  <option value="">${game.i18n.localize("NPCForge.WszystkiePrzewagi")}</option>
                  ${przewagi.map(p => `<option value="${p.id}">${p.category}: ${p.name}</option>`).join("")}
                </select>

                <div class="npcforge-gwiazdki2" data-wartosc="0">
                  ${[1, 2, 3, 4, 5].map(i =>
                    `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                  ).join("")}
                </div>

                <span></span>

                <button type="button" class="npcforge-usunPrzewageArchetyp">➖</button>

              `;


              const select = linia.querySelector("select");

              select.addEventListener("change", () => {
                const istniejący = linia.querySelector("input[name^='prze-']");
                if (istniejący) istniejący.remove();

                const nazwa = select.value || "ALL";
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = `prze-${nazwa}`;
                input.value = "3"; // domyślna waga
                linia.appendChild(input);
              });
              select.dispatchEvent(new Event("change"));

            }

            if (typ === "grupowa") {
              linia.innerHTML = `
                
                <select name="npcforge-tagArchetyp[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                </select>

                <div class="npcforge-gwiazdki2" data-wartosc="0">
                  ${[1, 2, 3, 4, 5].map(i =>
                    `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                  ).join("")}
                </div>

                <span></span>

                <button type="button" class="npcforge-usunPrzewageArchetyp">➖</button>

              `;

              const select = linia.querySelector("select");

              const tagiAktualne = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
                for (const tag of tagiAktualne) {
                  const opt = document.createElement("option");
                  opt.value = tag;
                  opt.textContent = `${game.i18n.localize("NPCForge.Zestaw")}: ${tag}`;
                  select.appendChild(opt);
                }

              select.addEventListener("change", () => {
                const istniejący = linia.querySelector("input[name^='prze-tag-']");
                if (istniejący) istniejący.remove();

                if (!select.value) return; // nie rób nic, jeśli nic nie wybrano

                const input = document.createElement("input");
                input.type = "hidden";
                input.name = `prze-tag-${select.value}`;
                input.value = "3"; // domyślna waga
                linia.appendChild(input);
              });

            }

            blok.appendChild(linia);

            const panel = linia.querySelector(".npcforge-gwiazdki2");
            if (panel) gwiazdki(panel, 3);

            linia.querySelector(".npcforge-usunPrzewageArchetyp").addEventListener("click", () => linia.remove());
          }
        }


// MOCE

        export async function przewagiMocyArchetyp(html) {

          const dane = foundry.utils.deepClone(game.settings.get("swade-npc-forge-eph", "przewagiMocy")) || {};
          let zdolnosci = dane.zdolnosci || [];
          let noweMoce = dane.noweMoce || [];
          let punktyMocy = dane.punktyMocy || [];

          const przewagiComp = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
          const przewagiPack = game.packs.get(przewagiComp);
          if (!przewagiPack) return;

          const umiejetnosciComp = game.settings.get("swade-npc-forge-eph", "kompendiumUmiejetnosci");
          const umiejetnosciPack = game.packs.get(umiejetnosciComp);
          if (!umiejetnosciPack) return;

          const przewagi = przewagiPack
          ? (await przewagiPack.getDocuments())
              .filter(e => e.type === "edge")
              .map(e => ({
                id: e.id,
                name: e.name,
                category: e.system?.category || game.i18n.localize("NPCForge.KategoriaInne")
              }))
              .sort((a, b) => {
                const catCmp = a.category.localeCompare(b.category);
                return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
              })
          : [];

          const umiejetnosci = (await umiejetnosciPack.getDocuments())
            .filter(e => e.type === "skill")
            .map(e => ({ id: e.id, name: e.name }))
            .sort((a, b) => a.name.localeCompare(b.name));

          const przyciskDodajZdolnosc = html[0].querySelector("#dodaj-zdolnosc");
          const przyciskDodajNoweMoce = html[0].querySelector("#dodaj-nowe-moce");
          const przyciskDodajPunktyMocy = html[0].querySelector("#dodaj-punkty-mocy");
          const blokZdolnosc = html[0].querySelector("#lista-zdolnosci");
          const blokNeweMoce = html[0].querySelector("#lista-nowe-moce");
          const blokPunktyMocy = html[0].querySelector("#lista-punkty-mocy");

          przyciskDodajZdolnosc.addEventListener("click", () => dodajZdolnosc());
          przyciskDodajNoweMoce.addEventListener("click", () => dodajNoweMoce());
          przyciskDodajPunktyMocy.addEventListener("click", () => dodajPunktyMocy());

          const noweMoceNazwa = game.i18n.localize("NPCForge.NoweMoce");
          const punktyMocyNazwa = game.i18n.localize("NPCForge.PunktyMocy");

          function dodajZdolnosc() {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaZdolnosc");

            linia.innerHTML = `

              <div class="npcforge-liniaZdolnosci1">

                <select name="npcforge-zdolnoscNadprzyrodzona[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${przewagi.map(p => `<option value="${p.id}">${p.category}: ${p.name}</option>`).join("")}
                </select>

                <div class="npcforge-noweMoceLinia">
                  <img src="modules/swade-npc-forge-eph/icons/noweMoce.png" title="${noweMoceNazwa}"/>
                  <input type="number" name="npcforge-zdolnoscNadprzyrodzonaNoweMoce[]"/>
                </div>

                <div class="npcforge-punktyMocyLinia">
                  <img src="modules/swade-npc-forge-eph/icons/pm.png" title="${punktyMocyNazwa}"/>
                  <input type="number" name="npcforge-zdolnoscNadprzyrodzonaPunktyMocy[]"/>
                </div>

                <button type="button" class="npcforge-usunZdolnoscNadprzyrodzonaArchetyp npcforge-usunPrzyciskMoce">➖</button>
              </div>


              <div class="npcforge-liniaZdolnosci2">

                <label>${game.i18n.localize("NPCForge.UmiejetnoscNadprzyrodzona")}</label>

                <select name="npcforge-umiejetnoscNadprzyrodzona[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${umiejetnosci.map(p => `<option value="${p.id}">${p.name}</option>`).join("")}
                </select>

                <label>${game.i18n.localize("NPCForge.Arkana")}</label>

                <input type="text" name="npcforge-arkana[]" value="${game.i18n.localize("NPCForge.OgólnePunktyMocy")}" />

              </div>

            `;

            blokZdolnosc.appendChild(linia);

            // zmiana = zapis
            linia.querySelectorAll("select, input").forEach(elem => {
              elem.addEventListener("change", zapiszDoUstawien);
            });

            // usuwanie
            linia.querySelector(".npcforge-usunZdolnoscNadprzyrodzonaArchetyp").addEventListener("click", () => {
              linia.remove();
              zapiszDoUstawien();
            });
          }

          function dodajNoweMoce() {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaNoweMoce");

            linia.innerHTML = `
              <select name="npcforge-noweMoce[]">
                <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                 ${przewagi.map(p => `<option value="${p.id}">${p.category}: ${p.name}</option>`).join("")}
              </select>

              <div class="npcforge-noweMoceLinia">
                <img src="modules/swade-npc-forge-eph/icons/noweMoce.png" title="${noweMoceNazwa}"/>
                <input type="number" name="npcforge-NoweMoce[]"/>
              </div>

              <span></span>

              <button type="button" class="npcforge-usunNoweMoceArchetyp npcforge-usunPrzyciskMoce">➖</button>

            `;
            blokNeweMoce.appendChild(linia);

            // zmiana = zapis
            linia.querySelectorAll("select, input").forEach(elem => {
              elem.addEventListener("change", zapiszDoUstawien);
            });

            // usuwanie
            linia.querySelector(".npcforge-usunNoweMoceArchetyp").addEventListener("click", () => {
              linia.remove();
              zapiszDoUstawien();
            });
          }

          function dodajPunktyMocy() {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaPunktyMocy");

            linia.innerHTML = `
              <select name="npcforge-punktyMocy[]">
                <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                ${przewagi.map(p => `<option value="${p.id}">${p.category}: ${p.name}</option>`).join("")}
              </select>

              <div class="npcforge-punktyMocyLinia">
                <img src="modules/swade-npc-forge-eph/icons/pm.png" title="${punktyMocyNazwa}"/>
                <input type="number" name="npcforge-PunktyMocy[]"/>
              </div>

              <span></span>

              <button type="button" class="npcforge-usunPunktyMocyArchetyp npcforge-usunPrzyciskMoce">➖</button>

            `;
            blokPunktyMocy.appendChild(linia);
  
            // zmiana = zapis
            linia.querySelectorAll("select, input").forEach(elem => {
              elem.addEventListener("change", zapiszDoUstawien);
            });

            // usuwanie
            linia.querySelector(".npcforge-usunPunktyMocyArchetyp").addEventListener("click", () => {
              linia.remove();
              zapiszDoUstawien();});
          }

          // Rozwijanie / zwijanie sekcji
          const przycisk = html[0].querySelector("#npcforge-przyciskUstawieniaMocy");
          const blok = html[0].querySelector("#npcforge-ustawieniaMocy");
          if (przycisk && blok) {
            przycisk.addEventListener("click", () => {
              blok.style.display = blok.style.display === "none" ? "block" : "none";
            });
          }

          function zapiszDoUstawien() {
            const zdolnosci = [];
            const noweMoce = [];
            const punktyMocy = [];

            blokZdolnosc.querySelectorAll(".npcforge-liniaZdolnosc").forEach((linia) => {
              zdolnosci.push({
                przewaga: linia.querySelector('select[name="npcforge-zdolnoscNadprzyrodzona[]"]').value,
                noweMoce: linia.querySelector('input[name="npcforge-zdolnoscNadprzyrodzonaNoweMoce[]"]').value || 0,
                punktyMocy: linia.querySelector('input[name="npcforge-zdolnoscNadprzyrodzonaPunktyMocy[]"]').value || 0,
                umiejetnosc: linia.querySelector('select[name="npcforge-umiejetnoscNadprzyrodzona[]"]').value,
                arkana: linia.querySelector('input[name="npcforge-arkana[]"]').value.trim() || ""
              });
            });

            blokNeweMoce.querySelectorAll(".npcforge-liniaNoweMoce").forEach((linia) => {
              noweMoce.push({
                przewaga: linia.querySelector('select[name="npcforge-noweMoce[]"]').value,
                noweMoce: linia.querySelector('input[name="npcforge-NoweMoce[]"]').value || 0
              });
            });

            blokPunktyMocy.querySelectorAll(".npcforge-liniaPunktyMocy").forEach((linia) => {
              punktyMocy.push({
                przewaga: linia.querySelector('select[name="npcforge-punktyMocy[]"]').value,
                punktyMocy: linia.querySelector('input[name="npcforge-PunktyMocy[]"]').value || 0
              });
            });

            game.settings.set("swade-npc-forge-eph", "przewagiMocy", {
              zdolnosci,
              noweMoce,
              punktyMocy
            });
          }

          for (let i = 0; i < zdolnosci.length; i++) { wczytajZdolnosc(zdolnosci[i]); };
          for (let i = 0; i < noweMoce.length; i++) { wczytajNoweMoce(noweMoce[i]); };
          for (let i = 0; i < punktyMocy.length; i++) { wczytajPunktyMocy(punktyMocy[i]); };

          function wczytajZdolnosc(dane) {
            const przewagaId = dane.przewaga;
            const noweMoce = dane.noweMoce;
            const punktyMocy = dane.punktyMocy;
            const umiejetnoscId = dane.umiejetnosc;
            const arkana = dane.arkana

            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaZdolnosc");

            linia.innerHTML = `

              <div class="npcforge-liniaZdolnosci1">
                <select name="npcforge-zdolnoscNadprzyrodzona[]">
                  ${Object.entries(
                      przewagi.reduce((acc, p) => {
                        const cat = p.category || "Inne";
                        (acc[cat] ??= []).push(p);
                        return acc;
                      }, {})
                    ).map(([cat, arr]) => `
                      <optgroup label="${cat}">
                        ${arr.map(p => `
                          <option value="${p.id}" ${p.id === przewagaId ? "selected" : ""}>${p.name}</option>
                        `).join("")}
                      </optgroup>
                    `).join("")}
                </select>

                <div class="npcforge-noweMoceLinia">
                  <img src="modules/swade-npc-forge-eph/icons/noweMoce.png" title="${noweMoceNazwa}"/>
                  <input type="number" name="npcforge-zdolnoscNadprzyrodzonaNoweMoce[]" value="${noweMoce}" />
                </div>

                <div class="npcforge-punktyMocyLinia">
                  <img src="modules/swade-npc-forge-eph/icons/pm.png" title="${punktyMocyNazwa}"/>
                  <input type="number" name="npcforge-zdolnoscNadprzyrodzonaPunktyMocy[]" value="${punktyMocy}" />
                </div>

                <button type="button" class="npcforge-usunZdolnoscNadprzyrodzonaArchetyp npcforge-usunPrzyciskMoce">➖</button>
              </div>

              <div class="npcforge-liniaZdolnosci2">
                
                <label>${game.i18n.localize("NPCForge.UmiejetnoscNadprzyrodzona")}</label>
                  
                <select name="npcforge-umiejetnoscNadprzyrodzona[]">
                  ${umiejetnosci.map(u => `<option value="${u.id}" ${u.id === umiejetnoscId ? "selected" : ""}>${u.name}</option>`).join("")}
                </select>

                <label>${game.i18n.localize("NPCForge.Arkana")}</label>

                <input type="text" name="npcforge-arkana[]" value="${arkana}" />
                
              </div>

            `;

            blokZdolnosc.appendChild(linia);

            // zmiana = zapis
            linia.querySelectorAll("select, input").forEach(elem => {
              elem.addEventListener("change", zapiszDoUstawien);
            });

            // usuwanie
            linia.querySelector(".npcforge-usunZdolnoscNadprzyrodzonaArchetyp").addEventListener("click", () => {
              linia.remove();
              zapiszDoUstawien();
            });
          }

          function wczytajNoweMoce(dane) {

            const przewagaId = dane.przewaga;
            const noweMoce = dane.noweMoce;

            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaNoweMoce");

            linia.innerHTML = `
              <select name="npcforge-noweMoce[]">
                <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                ${przewagi.map(p => `<option value="${p.id}" ${p.id === przewagaId ? "selected" : ""}>${p.category}: ${p.name}</option>`).join("")}
              </select>

              <div class="npcforge-noweMoceLinia">
                <img src="modules/swade-npc-forge-eph/icons/noweMoce.png" title="${noweMoceNazwa}"/>
                <input type="number" name="npcforge-NoweMoce[]" value="${noweMoce}" />
              </div>

              <span></span>

              <button type="button" class="npcforge-usunNoweMoceArchetyp npcforge-usunPrzyciskMoce">➖</button>

            `;

            blokNeweMoce.appendChild(linia);

            // zmiana = zapis
            linia.querySelectorAll("select, input").forEach(elem => {
              elem.addEventListener("change", zapiszDoUstawien);
            });

            // usuwanie
            linia.querySelector(".npcforge-usunNoweMoceArchetyp").addEventListener("click", () => {
              linia.remove();
              zapiszDoUstawien();
            });
          }

          function wczytajPunktyMocy(dane) {

            const przewagaId = dane.przewaga;
            const punktyMocy = dane.punktyMocy;

            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaPunktyMocy");

            linia.innerHTML = `

              <select name="npcforge-punktyMocy[]">
                <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                ${przewagi.map(p => `<option value="${p.id}" ${p.id === przewagaId ? "selected" : ""}>${p.category}: ${p.name}</option>`).join("")}
              </select>

              <div class="npcforge-punktyMocyLinia">
                <img src="modules/swade-npc-forge-eph/icons/pm.png" title="${punktyMocyNazwa}"/>
                <input type="number" name="npcforge-PunktyMocy[]" value="${punktyMocy}" />
              </div>

              <span></span>

              <button type="button" class="npcforge-usunPunktyMocyArchetyp npcforge-usunPrzyciskMoce">➖</button>

            `;
            blokPunktyMocy.appendChild(linia);
  
            // zmiana = zapis
            linia.querySelectorAll("select, input").forEach(elem => {
              elem.addEventListener("change", zapiszDoUstawien);
            });

            // usuwanie
            linia.querySelector(".npcforge-usunPunktyMocyArchetyp").addEventListener("click", () => {
              linia.remove();
              zapiszDoUstawien();});
          }
        }

        async function moceArchetyp(html) {
          
          const moceComp = game.settings.get("swade-npc-forge-eph", "kompendiumMoce");
          const mocePack = game.packs.get(moceComp);
          const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow"));

          const moce = mocePack
            ? (await mocePack.getDocuments())
                .filter(e => e.type === "power")
                .map(e => ({
                  id: e.id,
                  name: e.name,
                  ranga: parseInt(e.getFlag("swade-npc-forge-eph", "ranga")) || 0
                }))
                .sort((a, b) => {
                  const aRanga = a.ranga === 0 ? 99 : a.ranga;
                  const bRanga = b.ranga === 0 ? 99 : b.ranga;
                  const rankCmp = aRanga - bRanga;
                  return rankCmp !== 0 ? rankCmp : a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
                })

            : [];

          const przyciskDodaj = html[0].querySelector("#dodaj_moc_archetyp");
          const przyciskDodajGrupe = html[0].querySelector("#dodaj_grupe_mocy_archetyp");
          const przyciskEdytor = html[0].querySelector("#otworz_edytor_mocy_archetyp");
          const przyciskNadprzyrodzone = html[0].querySelector("#otworz_edytor_nadprzyrodzonych_archetyp");
          const blok = html[0].querySelector("#lista_mocy_archetyp");

          // Obsługa przycisków
          przyciskDodaj.addEventListener("click", () => dodajMoc("pojedyncza"));
          przyciskDodajGrupe.addEventListener("click", () => dodajMoc("grupowa"));
          przyciskEdytor.addEventListener("click", () => otworzEdytorMocy());
          przyciskNadprzyrodzone.addEventListener("click", () => otworzEdytorPrzewagNadprzyrodzonych());

          function lokalizujRangę(numer) {
            switch (numer) {
              case 1: return game.i18n.localize("NPCForge.Nowicjusz");
              case 2: return game.i18n.localize("NPCForge.Doswiadczony");
              case 3: return game.i18n.localize("NPCForge.Weteran");
              case 4: return game.i18n.localize("NPCForge.Heros");
              case 5: return game.i18n.localize("NPCForge.Legenda");
              default: return "";
            }
          }

          // Dodawanie nowej mocy lub grupy mocy
          function dodajMoc(typ) {
            
            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaMocArchetyp");

              if (typ === "pojedyncza") {
                linia.innerHTML = `

                  <select name="npcforge-mocArchetyp[]">
                    <option value="">${game.i18n.localize("NPCForge.WszystkieMoce")}</option>
                    ${moce.map(m =>
                      `<option value="${m.id}">${m.ranga ? lokalizujRangę(m.ranga) + ": " : ""}${m.name}</option>`
                    ).join("")}
                  </select>

                  <div class="npcforge-gwiazdki2" data-wartosc="0">
                    ${[1, 2, 3, 4, 5].map(i =>
                      `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                    ).join("")}
                  </div>

                  <span></span>

                  <button type="button" class="npcforge-usunMocArchetyp">➖</button>
                `;


                const select = linia.querySelector("select");

                select.addEventListener("change", () => {
                  const istniejący = linia.querySelector("input[name^='moc-']");
                  if (istniejący) istniejący.remove();

                  const nazwa = select.value || "ALL";
                  const input = document.createElement("input");
                  input.type = "hidden";
                  input.name = `moc-${nazwa}`;
                  input.value = "3"; // domyślna waga
                  linia.appendChild(input);
                });
                select.dispatchEvent(new Event("change"));

              }

              if (typ === "grupowa") {
                linia.innerHTML = `

                  <select name="npcforge-tagMocArchetyp[]">
                    <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  </select>

                  <div class="npcforge-gwiazdki2" data-wartosc="0">
                    ${[1, 2, 3, 4, 5].map(i =>
                      `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                    ).join("")}
                  </div>

                  <span></span>

                  <button type="button" class="npcforge-usunMocArchetyp">➖</button>
                `;

                const select = linia.querySelector("select");

                const tagiAktualne = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
                  for (const tag of tagiAktualne) {
                    const opt = document.createElement("option");
                    opt.value = tag;
                    opt.textContent = `${game.i18n.localize("NPCForge.Zestaw")}: ${tag}`;
                    select.appendChild(opt);
                  }

                select.addEventListener("change", () => {
                  const istniejący = linia.querySelector("input[name^='moc-tag-']");
                  if (istniejący) istniejący.remove();

                  if (!select.value) return; // nie rób nic, jeśli nic nie wybrano

                  const input = document.createElement("input");
                  input.type = "hidden";
                  input.name = `moc-tag-${select.value}`;
                  input.value = "3"; // domyślna waga
                  linia.appendChild(input);
                });

              }

            blok.appendChild(linia);

            const panel = linia.querySelector(".npcforge-gwiazdki2");
            if (panel) gwiazdki(panel, 3);

            linia.querySelector(".npcforge-usunMocArchetyp").addEventListener("click", () => linia.remove());
          }
        }


// PANCERZ

        export function obslugaZakladekRangiPancerz(html) {
          const przelacznik = html[0].querySelector("#przelacznikTrybu");
          const zakladki = html[0].querySelector(".npcforge-zakladkiRangi");
          const sekcjaProsta = html[0].querySelector(".npcforge-sekcjaRangi[data-ranga='Prosty']");
          const sekcjeSzczegolowe = html[0].querySelector(".npcforge-sekcjeRangi");
          const sekcje = html[0].querySelectorAll(".npcforge-sekcjaRangi");
          const wszystkiePancerze = html[0].querySelectorAll(".npcforge-sekcjaRangiPancerza");
          const wszystkieZakladki = html[0].querySelectorAll(".npcforge-zakladkaRangi");

          const przyciskEdytor = html[0].querySelector("#otworz_edytor_pancerza_archetyp");
          przyciskEdytor.addEventListener("click", () => otworzEdytorPancerza());

          function pokazSekcjeRangi(nazwaRangi) {
            sekcje.forEach(s => s.style.display = "none");
            wszystkiePancerze.forEach(p => {
              if (p.dataset.ranga === nazwaRangi) {
                p.style.display = "block";
              } else {
                p.style.display = "none";
              }
            });

            const sekcja = html[0].querySelector(`.npcforge-sekcjaRangi[data-ranga='${nazwaRangi}']`);
            if (sekcja) sekcja.style.display = "block";
          }

          przelacznik.addEventListener("change", (event) => {
            const szczegolowy = event.target.checked;

            if (szczegolowy) {
              sekcjaProsta.style.display = "none";
              zakladki.style.display = "flex";
              sekcjeSzczegolowe.style.display = "block";

              const aktywna = html[0].querySelector(".npcforge-zakladkaRangi.active")?.dataset.ranga;
              pokazSekcjeRangi(aktywna || "Nowicjusz");
            } else {
              zakladki.style.display = "none";
              sekcjeSzczegolowe.style.display = "none";
              wszystkiePancerze.forEach(p => {
                if (p.dataset.ranga === "Prosty") p.style.display = "block";
                else p.style.display = "none";
              });
              sekcjaProsta.style.display = "block";
            }
          });

          wszystkieZakladki.forEach(btn => {
            btn.addEventListener("click", (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              wszystkieZakladki.forEach(b => b.classList.remove("active"));
              btn.classList.add("active");

              const ranga = btn.dataset.ranga;
              pokazSekcjeRangi(ranga);
            });
          });

        }

        async function pancerz(html, kod) {

          // Pobieranie kompendium z ustawień
          const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow"));
          const sprzetComp = game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
          const sprzetPack = game.packs.get(sprzetComp);

          let typPancerza;
          if(kod[0] === "K") {typPancerza = "torso"};
          if(kod[0] === "G") {typPancerza = "head"};
          if(kod[0] === "R") {typPancerza = "arms"};
          if(kod[0] === "N") {typPancerza = "legs"};

          const pancerz = sprzetPack
            ? (await sprzetPack.getDocuments())
                .filter(e => e.type === "armor")
            : [];


          const danePancerza = pancerz
            .filter(p => p.system?.locations?.[typPancerza])
            .map(p => ({
              id: p.id,
              name: p.name,
              armor: p.system?.armor ?? 0,
              locations: {
                head: !!p.system?.locations?.head,
                torso: !!p.system?.locations?.torso,
                arms: !!p.system?.locations?.arms,
                legs: !!p.system?.locations?.legs
              }
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          const blok = html[0].querySelector(`#lista_pancerza_${kod}`);
          const przyciskDodaj = html[0].querySelector(`#dodaj_pancerz_${kod}`);
          const przyciskDodajGrupe = html[0].querySelector(`#dodaj_grupe_pancerz_${kod}`);

          przyciskDodaj.addEventListener("click", () => dodaj("pojedyncza"));
          przyciskDodajGrupe.addEventListener("click", () => dodaj("grupowa"));

          function dodaj(typ) {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaPancerzaArchetyp");

            if (typ === "pojedyncza") {
              linia.innerHTML = `
                <select name="npcforge-pancerz_${kod}[]">
                  <option value="">${game.i18n.localize("NPCForge.BrakPancerza")}</option>
                  ${danePancerza.map(p => `
                    <option value="${p.id}" data-armor="${p.armor}" data-head="${p.locations.head}" data-torso="${p.locations.torso}" data-arms="${p.locations.arms}" data-legs="${p.locations.legs}">
                      ${p.name}
                    </option>`).join("")}
                </select>
                
                <div class="npcforge-ikonaPancerza">
                  <img class="npcforge-ikonaPancerzaImg" style="display: none;" />
                  <span class="npcforge-poziomPancerza"></span>
                </div>

                <div class="npcforge-ikonyLokacji"></div>

                <div class="npcforge-gwiazdki2" data-wartosc="0">
                  ${[1, 2, 3, 4, 5].map(i =>
                    `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                  ).join("")}
                </div>

                <button type="button" class="npcforge-usunPancerzArchetyp">➖</button>
              `;

              const select = linia.querySelector("select");
              const polePancerza = linia.querySelector(".npcforge-poziomPancerza");
              const kontenerIkon = linia.querySelector(".npcforge-ikonyLokacji");
              const obrazekPancerza = linia.querySelector(".npcforge-ikonaPancerzaImg");

              select.addEventListener("change", () => {

                const istniejący = linia.querySelector("input[name^='panc-']");
                if (istniejący) istniejący.remove();

                const id = select.value || "BRAK";  // "BRAK dla pustego wyboru
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = `panc-${kod}-${id}`;  // np. panc-KP-abc123
                input.value = "3";  // domyślnie waga 3, jak u mocy
                linia.appendChild(input);

                const option = select.selectedOptions[0];
                if (!option) return;

                const armor = option.dataset.armor;
                const head = option.dataset.head === "true";
                const torso = option.dataset.torso === "true";
                const arms = option.dataset.arms === "true";
                const legs = option.dataset.legs === "true";

                if (armor>0) {
                  obrazekPancerza.src = "modules/swade-npc-forge-eph/icons/tarczaPancerz.png";
                  obrazekPancerza.style.display = "block";
                  polePancerza.textContent = armor;
                }
                else {  
                  obrazekPancerza.src = "";
                  obrazekPancerza.style.display = "none";
                  polePancerza.textContent = ""
                }

                const ikony = [];
                if (head) ikony.push(`<img class="npcforge_lokacje_pancerz_dark" src="modules/swade-npc-forge-eph/icons/pancerz/glowaC.png" style="width:20px; height:20px; border: none;"/>
                                      <img class="npcforge_lokacje_pancerz_light" src="modules/swade-npc-forge-eph/icons/pancerz/glowaJ.png" style="width:20px; height:20px; border: none;"/>`);
                if (torso) ikony.push(`<img class="npcforge_lokacje_pancerz_dark" src="modules/swade-npc-forge-eph/icons/pancerz/korpusC.png" style="width:20px; height:20px; border: none;"/>
                                      <img class="npcforge_lokacje_pancerz_light" src="modules/swade-npc-forge-eph/icons/pancerz/korpusJ.png" style="width:20px; height:20px; border: none;"/>`);
                if (arms) ikony.push(`<img class="npcforge_lokacje_pancerz_dark" src="modules/swade-npc-forge-eph/icons/pancerz/receC.png" style="width:20px; height:20px; border: none;"/>
                                      <img class="npcforge_lokacje_pancerz_light" src="modules/swade-npc-forge-eph/icons/pancerz/receJ.png" style="width:20px; height:20px; border: none;"/>`);
                if (legs) ikony.push(`<img class="npcforge_lokacje_pancerz_dark" src="modules/swade-npc-forge-eph/icons/pancerz/nogiC.png" style="width:20px; height:20px; border: none;"/>
                                      <img class="npcforge_lokacje_pancerz_light" src="modules/swade-npc-forge-eph/icons/pancerz/nogiJ.png" style="width:20px; height:20px; border: none;"/>`);

                kontenerIkon.innerHTML = ikony.join(" ");
              });
              select.dispatchEvent(new Event("change"));
            }

            if (typ === "grupowa") {
              linia.innerHTML = `
                <select name="npcforge-tag_${kod}[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                </select>

                <span></span>
                <span></span>

                <div class="npcforge-gwiazdki2" data-wartosc="0">
                  ${[1, 2, 3, 4, 5].map(i =>
                    `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                  ).join("")}
                </div>

                <button type="button" class="npcforge-usunPancerzArchetyp">➖</button>
              `;

              const select = linia.querySelector("select");
              
              const tagiAktualne = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow") || "[]");
                for (const tag of tagiAktualne) {
                  const opt = document.createElement("option");
                  opt.value = tag;
                  opt.textContent = `${game.i18n.localize("NPCForge.Zestaw")}: ${tag}`;
                  select.appendChild(opt);
                }

              select.addEventListener("change", () => {
                const istniejący = linia.querySelector("input[name^='panc-tag-']");
              if (istniejący) istniejący.remove();

              if (!select.value) return;

              const input = document.createElement("input");
              input.type = "hidden";
              input.name = `panc-${kod}-tag-${select.value}`;  // np. panc-tag-KP-lekka
              input.value = "3";

              linia.appendChild(input);
              });

            }

            blok.appendChild(linia);

            const panel = linia.querySelector(".npcforge-gwiazdki2");
            if (panel) gwiazdki(panel, 3);

            linia.querySelector(".npcforge-usunPancerzArchetyp").addEventListener("click", () => linia.remove());
          }
        }


// BROŃ

        export async function obslugaZakladekRangiBron(html) {
          const przelacznik = html[0].querySelector("#przelacznikTrybuBron");
          const zakladki = html[0].querySelector(".npcforge-zakladkiRangiBron");
          const sekcjaProsta = html[0].querySelector(".npcforge-sekcjaRangiBronWarianty[data-ranga='Prosty']");
          const wszystkieWarianty = html[0].querySelectorAll(".npcforge-sekcjaRangiBronWarianty");
          const wszystkieZakladki = html[0].querySelectorAll(".npcforge-zakladkaRangiBron");

          const przyciskEdytor = html[0].querySelector("#otworz_edytor_broni_archetyp");
          przyciskEdytor?.addEventListener("click", () => otworzEdytorBroni());
          const przyciskAmunicja = html[0].querySelector("#otworz_edytor_amunicji_archetyp");
          przyciskAmunicja.addEventListener("click", () => otworzEdytorAmunicji());

          function pokazSekcjeRangi(nazwaRangi) {
            wszystkieWarianty.forEach(p => {
              p.style.display = (p.dataset.ranga === nazwaRangi) ? "block" : "none";
            });
          }

          przelacznik.addEventListener("change", (event) => {
            const szczegolowy = event.target.checked;

            if (szczegolowy) {
              sekcjaProsta.style.display = "none";
              zakladki.style.display = "flex";

              const aktywna = html[0].querySelector(".npcforge-zakladkaRangiBron.active")?.dataset.ranga;
              pokazSekcjeRangi(aktywna || "Nowicjusz");
            } else {
              zakladki.style.display = "none";
              wszystkieWarianty.forEach(p => {
                p.style.display = (p.dataset.ranga === "Prosty") ? "block" : "none";
              });
              sekcjaProsta.style.display = "block";
            }
          });

          wszystkieZakladki.forEach(btn => {
            btn.addEventListener("click", (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              wszystkieZakladki.forEach(b => b.classList.remove("active"));
              btn.classList.add("active");

              const ranga = btn.dataset.ranga;
              pokazSekcjeRangi(ranga);
            });
          });

          await bron(html);
        }

        export async function bron(html) {
          const przyciskiDodajWariant = html[0].querySelectorAll(".npcforge-dodajWariantBroni");

          przyciskiDodajWariant.forEach(btn => {
            btn.addEventListener("click", () => {
              const poziom = btn.dataset.poziom;
              dodajWariantBroni(poziom, html);
            });
          });
        }

        const widocznoscPaneliWag = [];
        let licznikWariantowP = 0;
        let licznikWariantow1 = 0;
        let licznikWariantow2 = 0;
        let licznikWariantow3 = 0;
        let licznikWariantow4 = 0;
        let licznikWariantow5 = 0;

        function dodajWariantBroni(poziom, html) {
          const kontener = html[0].querySelector(`#kontener_wariantow_broni_${poziom}`);
          if (!kontener) return;

          let nr;
          switch (poziom) {
            case "P": nr = ++licznikWariantowP; break;
            case "1": nr = ++licznikWariantow1; break;
            case "2": nr = ++licznikWariantow2; break;
            case "3": nr = ++licznikWariantow3; break;
            case "4": nr = ++licznikWariantow4; break;
            case "5": nr = ++licznikWariantow5; break;
          }
          const id = poziom+nr;

          const isFirst = kontener.children.length === 0;
          widocznoscPaneliWag[id] = !isFirst;

          const wrapper = document.createElement("div");

          // InnerHTML całości
          wrapper.innerHTML = `
            ${!isFirst ? `
              <div class="npcforge-lacznikWariantu">
                <select name="npcforge-lacznikWariantu[]">
                  <option value="i">${game.i18n.localize("NPCForge.I")}</option>
                  <option value="lub">${game.i18n.localize("NPCForge.Lub")}</option>
                </select>
              </div>` : ""}

            <div class="npcforge-wariantBroni" data-wariant-id="${id}">
              <div class="npcforge-naglowekWariantu">
                <span></span>
                <label>${game.i18n.localize("NPCForge.TypWariantu")}</label>
                <select name="npcforge-typWariantuBroni_${id}" class="npcforge-selectTypBroni">
                  <option value="dwureczna">${game.i18n.localize("NPCForge.Dwureczna")}</option>
                  <option value="jednoreczne">${game.i18n.localize("NPCForge.DwieJednoreczne")}</option>
                </select>
                <span></span>
              </div>

              <!-- SLOT 1 -->
              <div class="npcforge-slotBroni" id="slot_1_wariant_${id}">
                <div class="npcforge-listaSlotu" id="lista_bron_slot_1_${id}"></div>
                <div class="npcforge-przyciskiSlotu">
                  <button type="button" class="npcforge-dodajBronSlot" data-wariant="${id}" data-slot="1">➕</button>
                  <button type="button" class="npcforge-dodajGrupeBroniSlot" data-wariant="${id}" data-slot="1">🔖</button>
                </div>
              </div>

              <!-- SLOT 2 -->
              <div class="npcforge-slotBroni" id="slot_2_wariant_${id}" style="display: none;">
                <hr>
                <div class="npcforge-listaSlotu" id="lista_bron_slot_2_${id}"></div>
                <div class="npcforge-przyciskiSlotu">
                  <button type="button" class="npcforge-dodajBronSlot" data-wariant="${id}" data-slot="2">➕</button>
                  <button type="button" class="npcforge-dodajGrupeBroniSlot" data-wariant="${id}" data-slot="2">🔖</button>
                </div>
              </div>

              <div class="npcforge-usunWariantBroniPrzycisk">

                <div class="npcforge-wagaWariantu">
                  <label>${game.i18n.localize("NPCForge.DlaCałegoWariantu")}</label>
                  <div class="npcforge-gwiazdki2" data-wartosc="0">
                  ${[1, 2, 3, 4, 5].map(i =>
                    `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
                  ).join("")}
                  </div>
                </div>

                <span></span>
             
                <button type="button" class="npcforge-usunWariantBroni npcforge-przyciskMinusWariant">➖</button>
              
              </div>
            </div>
          `;

          kontener.appendChild(wrapper);
          kontener.parentElement.scrollIntoView({ behavior: "smooth", block: "end" });

          const inputWariant = document.createElement("input");
          inputWariant.type = "hidden";
          inputWariant.name = `war-RANGA:${poziom}-WARIANT:${id}`;
          inputWariant.value = "3|i"; // domyślna waga i łącznik
          wrapper.appendChild(inputWariant);

          const panel = wrapper.querySelector(".npcforge-wagaWariantu .npcforge-gwiazdki2");
          if (panel) {
            gwiazdki(panel, 3, () => {
              const lacznik = inputWariant.value.split("|")[1] || "i";
              inputWariant.value = `${panel.dataset.wartosc || "3"}|${lacznik}`;
            });
          }

          const panelWagi = wrapper.querySelector(".npcforge-wagaWariantu");
          if (panelWagi) panelWagi.classList.toggle("npcforge-wagaWariantuUkryta", !widocznoscPaneliWag[id]);


          if (!isFirst) {
         
            const lacznikSelect = wrapper.querySelector(".npcforge-lacznikWariantu select");
            if (lacznikSelect) {
              lacznikSelect.addEventListener("change", () => {
                const lacznikWrapper = lacznikSelect.closest(".npcforge-lacznikWariantu");
                if (!lacznikWrapper) return;

                const czyLub = lacznikSelect.value === "lub";

                const obecnaWaga = inputWariant.value.split("|")[0] || "3";
                inputWariant.value = `${obecnaWaga}|${lacznikSelect.value}`;

                lacznikWrapper.classList.toggle("npcforge-lacznikLubowy", czyLub);

                const nrUpUp = nr - 2;
                const nrUp = nr - 1;
                const nrDown = nr;
                const nrDownDown = nr + 1
                const idUpUp = poziom+nrUpUp;
                const idUp = poziom+nrUp;
                const idDown = poziom+nrDown;
                const idDownDown = poziom+nrDownDown;

                const lubNad = widocznoscPaneliWag[idUpUp] === true && widocznoscPaneliWag[idUp] === true;
                const lubPod = widocznoscPaneliWag[idDown] === true && widocznoscPaneliWag[idDownDown] === true;

                // Modyfikujemy tylko jeśli NIE ma połączenia przez "lub"
                if (!czyLub && !lubNad) {widocznoscPaneliWag[idUp] = false;}
                if (!czyLub && !lubPod) {widocznoscPaneliWag[idDown] = false;}
                if (czyLub) {
                  widocznoscPaneliWag[idUp] = true;
                  widocznoscPaneliWag[idDown] = true;
                }

                [idUp, idDown].forEach(nr => {
                  const blok = html[0].querySelector(`.npcforge-wariantBroni[data-wariant-id="${nr}"] .npcforge-wagaWariantu`);
                  if (blok) {
                    const czyUkryte = !widocznoscPaneliWag[nr];
                    blok.classList.toggle("npcforge-wagaWariantuUkryta", czyUkryte);

                    if (czyUkryte) {
                      const panel = blok.querySelector(".npcforge-gwiazdki2");
                      if (panel) gwiazdki(panel, 3);
                    }
                  }

                });
              });
              lacznikSelect.dispatchEvent(new Event("change"));
            }
          }

          const selectTypu = wrapper.querySelector(`select[name='npcforge-typWariantuBroni_${id}']`);
          const slot2 = wrapper.querySelector(`#slot_2_wariant_${id}`);
          selectTypu?.addEventListener("change", () => {
            if (selectTypu.value === "jednoreczne") {
              slot2.style.display = "block";
            } else {
              slot2.style.display = "none";
              const lista2 = slot2.querySelector(".npcforge-listaSlotu");
              if (lista2) lista2.innerHTML = ""; // 🧹 czyści zawartość slotu 2
            }
          });

          wrapper.querySelector(".npcforge-usunWariantBroni").addEventListener("click", () => {
            wrapper.remove();
          });


          wrapper.querySelectorAll(".npcforge-dodajBronSlot").forEach(btn => {
            btn.addEventListener("click", () => {
              const wariantId = btn.dataset.wariant;
              const slotId = btn.dataset.slot;
              dodajLinieBroniPojedynczej(poziom, wariantId, slotId);
            });
          });

          wrapper.querySelectorAll(".npcforge-dodajGrupeBroniSlot").forEach(btn => {
            btn.addEventListener("click", () => {
              const wariantId = btn.dataset.wariant;
              const slotId = btn.dataset.slot;
              dodajLinieBroniGrupowej(poziom, wariantId, slotId);
            });
          });
        }

        async function dodajLinieBroniPojedynczej(poziom, wariantId, slotId) {

          const sprzetComp = game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
          const sprzetPack = game.packs.get(sprzetComp);

          const bron = sprzetPack
          ? (await sprzetPack.getDocuments())
              .filter(e => e.type === "weapon" || e.type === "shield")
              .map(e => ({
                id: e.id,
                name: e.name,
                category: e.system?.category || game.i18n.localize("NPCForge.KategoriaInne"),
                ap: e.system?.ap || 0,
                damage: e.system?.damage || "",
                parry: e.system?.parry || 0,
                cover: e.system?.cover || 0,
                ammo: e.system?.ammo || "",
              }))
              .sort((a, b) => {
                const catCmp = a.category.localeCompare(b.category);
                return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
              })
          : [];

          const lista = document.getElementById(`lista_bron_slot_${slotId}_${wariantId}`);
          if (!lista) return;

          const linia = document.createElement("div");
          linia.classList.add("npcforge-linia-bron");

          linia.innerHTML = `
            <select class="npcforge-selectBroni" name="npcforge-bronSlot_${wariantId}_${slotId}[]">
              <option value="">${game.i18n.localize("NPCForge.BrakBroni")}</option>
              ${bron.map(p => 
                `<option 
                  value="${p.id}" 
                  data-name="${p.name}" 
                  data-ammo="${p.ammo}" 
                  data-damage="${p.damage}" 
                  data-ap="${p.ap}" 
                  data-parry="${p.parry}" 
                  data-cover="${p.cover}">
                    ${p.category}: ${p.name}</option>`
              ).join("")}
            </select>

            <div class="npcforge-ikonaObrazen">
              <img class="npcforge-ikonaObrazenImg" style="display: none;" />
              <span class="npcforge-poziomObrazen"></span>
              <img class="npcforge-ikonaObronyImg" style="display: none;" />
              <span class="npcforge-poziomObrony"></span>
            </div>

            <div class="npcforge-ikonaPrzebicia">
              <img class="npcforge-ikonaPrzebiciaImg" style="display: none;" />
              <span class="npcforge-poziomPrzebicia"></span>
              <img class="npcforge-ikonaOslonyImg" style="display: none;" />
              <span class="npcforge-poziomOslony"></span>
            </div>

            <div class="npcforge-gwiazdki2" data-wartosc="0">
              ${[1, 2, 3, 4, 5].map(i =>
                `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
              ).join("")}
            </div>

            <button type="button" class="npcforge-usunBronSlot">➖</button>
          `;

          const select = linia.querySelector("select");
          const poleObrazen = linia.querySelector(".npcforge-poziomObrazen");
          const obrazekObrazen = linia.querySelector(".npcforge-ikonaObrazenImg");
          const polePrzebicia = linia.querySelector(".npcforge-poziomPrzebicia");
          const obrazekPrzebicia = linia.querySelector(".npcforge-ikonaPrzebiciaImg");
          const poleObrony = linia.querySelector(".npcforge-poziomObrony");
          const obrazekObrony = linia.querySelector(".npcforge-ikonaObronyImg");
          const poleOslony = linia.querySelector(".npcforge-poziomOslony");
          const obrazekOslony = linia.querySelector(".npcforge-ikonaOslonyImg");

          select.addEventListener("change", () => {

            const istniejący = linia.querySelector("input[name^='bron-']");
            if (istniejący) istniejący.remove();

            const id = select.value || "BRAK";  // "BRAK" dla pustego wyboru
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = `bron-RANGA:${poziom}-WARIANT:${wariantId}-SLOT:${slotId}-${id}`;
            input.value = "3";  // domyślnie waga 3
            linia.appendChild(input);

            const option = select.selectedOptions[0];
            if (!option) return;

            if (option && option.dataset.name) {
              option.textContent = option.dataset.name;
            }

            const damage = option.dataset.damage;
            const ap = option.dataset.ap;
            const parry = option.dataset.parry;
            const cover = option.dataset.cover;

            if (damage && damage.trim() !== "") {
              obrazekObrazen.src = "modules/swade-npc-forge-eph/icons/obrazenia.png";
              obrazekObrazen.style.display = "block";
              poleObrazen.textContent = damage;
            }
            else {  
              obrazekObrazen.src = "";
              obrazekObrazen.style.display = "none";
              poleObrazen.textContent = ""
            }

            if (ap && ap !== "0") {
              obrazekPrzebicia.src = "modules/swade-npc-forge-eph/icons/pp.png";
              obrazekPrzebicia.style.display = "block";
              polePrzebicia.textContent = ap;
            }
            else {  
              obrazekPrzebicia.src = "";
              obrazekPrzebicia.style.display = "none";
              polePrzebicia.textContent = "";
            }

            if (parry && parry !== "0") {
              obrazekObrony.src = "modules/swade-npc-forge-eph/icons/tarczaObrony.png";
              obrazekObrony.style.display = "block";
              poleObrony.textContent = parry;
            }
            else {  
              obrazekObrony.src = "";
              obrazekObrony.style.display = "none";
              poleObrony.textContent = "";
            }

            if (cover && cover !== "0") {
              obrazekOslony.src = "modules/swade-npc-forge-eph/icons/oslona.png";
              obrazekOslony.style.display = "block";
              poleOslony.textContent = cover;
            }
            else {  
              obrazekOslony.src = "";
              obrazekOslony.style.display = "none";
              poleOslony.textContent = "";
            }
          });
          select.dispatchEvent(new Event("change"));

          const inputAmunicji = linia.querySelector(`input[name="npcforge-iloscAmunicji_${slotId}_${wariantId}"]`);
          if (inputAmunicji) {
            inputAmunicji.addEventListener("input", () => {
              input.dataset.ammoCount = inputAmunicji.value || "0";
            });
          }

          linia.querySelector(".npcforge-usunBronSlot").addEventListener("click", () => linia.remove());

          const panel = linia.querySelector(".npcforge-gwiazdki2");
          if (panel) gwiazdki(panel, 3);
          lista.appendChild(linia);
        }

        function dodajLinieBroniGrupowej(poziom, wariantId, slotId) {

          const tagi = JSON.parse(game.settings.get("swade-npc-forge-eph", "listaTagow"));

          const lista = document.getElementById(`lista_bron_slot_${slotId}_${wariantId}`);
          if (!lista) return;

          const linia = document.createElement("div");
          linia.classList.add("npcforge-linia-bron");

          linia.innerHTML = `
            <select class="npcforge-selectBroni" name="npcforge-tagSlot_${wariantId}_${slotId}[]">
              <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
              ${tagi.map(t => `<option value="${t}">${game.i18n.localize("NPCForge.Zestaw")}: ${t}</option>`).join("")}
            </select>

            <div class="npcforge-ikonaObrazen">
              <img class="npcforge-ikonaObrazenImg" style="display: none;" />
              <span class="npcforge-poziomObrazen"></span>
              <img class="npcforge-ikonaObronyImg" style="display: none;" />
              <span class="npcforge-poziomObrony"></span>
            </div>

            <div class="npcforge-ikonaPrzebicia">
              <img class="npcforge-ikonaPrzebiciaImg" style="display: none;" />
              <span class="npcforge-poziomPrzebicia"></span>
              <img class="npcforge-ikonaOslonyImg" style="display: none;" />
              <span class="npcforge-poziomOslony"></span>
            </div>

            <div class="npcforge-gwiazdki2" data-wartosc="0">
              ${[1, 2, 3, 4, 5].map(i =>
                `<img data-index="${i}" src="modules/swade-npc-forge-eph/icons/poziomy/kowadlo0.png" style="width:24px; height:24px; border:none;" />`
              ).join("")}
            </div>

            <button type="button" class="npcforge-usunBronSlot">➖</button>
          `;

          linia.querySelector(".npcforge-usunBronSlot").addEventListener("click", () => linia.remove());


              const select = linia.querySelector("select");

              select.addEventListener("change", () => {
              const istniejący = linia.querySelector("input[name^='bron-']");
                if (istniejący) istniejący.remove();

              if (!select.value) return;

              const id = select.value || "USUN";
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = `bron-RANGA:${poziom}-WARIANT:${wariantId}-SLOT:${slotId}-tag-${id}`;
              input.value = "3";

              linia.appendChild(input);
              });

          const panel = linia.querySelector(".npcforge-gwiazdki2");
          if (panel) gwiazdki(panel, 3);
          lista.appendChild(linia);
        }


// ITEM GRANTS

        export function obsluzDropItemGrants(html) {
          const kontener = html[0].querySelector("#lista_itemGrants_archetyp");

          html[0].querySelector("form").addEventListener("dragover", ev => ev.preventDefault());

          html[0].querySelector("form").addEventListener("drop", async ev => {
            ev.preventDefault();

            const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
            const uuid = data?.uuid;
            if (!uuid) return;

            const item = await fromUuid(uuid);
            if (!item) return;

            if (
              item.type === "ancestry" ||
              item.system?.subtype === "archetype"
            ) {
              ui.notifications.warn(game.i18n.localize("NPCForge.PrzeciaganieBladItemGrant"));
              return;
            }


            const linia = document.createElement("div");
            linia.classList.add("npcforge-liniaItemGrant");

            linia.innerHTML = `
              <select name="npcforge-itemGrant[]" disabled class="npcforge-select-disabled npcforge-select-bez-strzalki">
                <option value="${item.uuid}" selected>${item.name}</option>
              </select>
              <span></span>
              <button type="button" class="npcforge-usunItemGrant">➖</button>
            `;

            kontener.appendChild(linia);
            kontener.parentElement.scrollIntoView({ behavior: "smooth", block: "end" });
            linia.querySelector(".npcforge-usunItemGrant").addEventListener("click", () => linia.remove());

            const select = linia.querySelector("select");
            select.addEventListener("change", () => {
              const istniejący = linia.querySelector("input[name^='IG-']");
                if (istniejący) istniejący.remove();

                const input = document.createElement("input");
                input.type = "hidden";
                input.name = `IG-${item.uuid}`;
                linia.appendChild(input);
              });
              select.dispatchEvent(new Event("change"));

          });
        }


// ZABEZPIECZENIE PRZED PUSTĄ NAZWĄ

          async function obslugaPrzyciskuStworz(html) {

            const przyciskStworz = html.find("button[data-action='stworz']");
            const poleNazwa = html.find("[name='npcforge-nazwaArchetypu']");

            // Startowo: blokuj
            przyciskStworz.prop("disabled", true);

            // Reakcja na wpisywanie
            poleNazwa.on("input", function () {
              const wartosc = $(this).val()?.trim();
              const aktywuj = !!wartosc;
              przyciskStworz.prop("disabled", !aktywuj);

              if (aktywuj) {
                document.querySelectorAll(".npcforge-tooltip").forEach(e => e.remove());
              }
            });
            przyciskStworz.prop("disabled", !(poleNazwa.val()?.trim()));

            if (poleNazwa.val()?.trim()) {
              przyciskStworz.prop("disabled", false);
            }

            // Tooltip
            przyciskStworz.on("mouseenter", function () {
              if (przyciskStworz.prop("disabled")) {
                const tooltip = document.createElement("div");
                tooltip.textContent = game.i18n.localize("NPCForge.BrakNazwyArchetypu");
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

            przyciskStworz.on("mouseleave", function () {
              document.querySelectorAll(".npcforge-tooltip").forEach(e => e.remove());
            });
          }