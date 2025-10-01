import { listaKosci_k4m1, listaKosci_k4, listaKosci_k12, listaKosci_k12p2, listaModyfikator,
         listaKosciKrotka_k6, listaModyfikatorNieujemny, PustaLiniaHelper } from "./narzedzia.js";
import { generujRase } from "./generator_rasy.js";
import { odswiezDialogMain } from "./dialog_main.js";

let dialogRasy = null;

export async function otworzKreatorRasy() {

  if (dialogRasy) { dialogRasy.bringToFront(); return; } // Zapobiega wielokrotnemu otwieraniu

  // Helpery
  listaKosci_k4m1();
  listaKosci_k4();
  listaKosci_k12();
  listaKosci_k12p2();
  listaKosciKrotka_k6();
  listaModyfikator();
  listaModyfikatorNieujemny();
  PustaLiniaHelper();

  // Dane do przekazania do szablonu - na razie pusto
  const dane = {
  };    
      
  // Renderuje szablon kreatora rasy
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_rasy.hbs", dane);

  // Tworzenie dialogu
  await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("NPCForge.TytulDialogRasa") },
    content,
    buttons: [
      {
        label: game.i18n.localize("NPCForge.PrzyciskStworz"),
        action: "stworz",
        default: true,
        callback: async (event, btn, dlg) => {
          const formularz = dlg.element.querySelector("form") || dlg.element;
          const daneFormularza = new FormData(formularz);
          await generujRase(daneFormularza);
          odswiezDialogMain();
          return "stworz";
        }
      },
      { label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "close" }
    ],
    render: async (event, dialog) => {
      dialogRasy = dialog;

      const el = dialog.element;
      const html = $(el);

      queueMicrotask(() => dialog.setPosition({ width: 500 })); // ROZMIAR OKNA wysokość auto

        obslugaUmiejetnosci(html);
        obslugaPrzewag(html);
        obslugaZawad(html);
        obslugaMocy(html);
        obslugaTablic(html);
        rozmiar(html);
        obslugaPrzyciskuStworz(html);
        dropzone(html);
        obslugaBroniNaturalnej(html);
        zabezpieczPola(html);

setTimeout(() => {
  const root = dialog.element;                 // ← bez [0]
  if (!root?.isConnected) return;

  const szer = root.offsetWidth;
  const wys  = root.offsetHeight;

  dialog.setPosition({
    left: (window.innerWidth  - szer) / 2,
    top:  (window.innerHeight - wys)  / 2
  });

  // Checkbox „Zwierzęcy Spryt” – szukaj w obrębie okna
  const checkbox = root.querySelector('input[name="npcforge-zwierzecy_spryt_rasa"]');
  const tekst    = root.querySelector('.npcforge-zwierzecySprytNapisRasa');
  if (checkbox && tekst) {
    tekst.style.opacity = checkbox.checked ? "1" : "0.3";
    checkbox.addEventListener("change", () => {
      tekst.style.opacity = checkbox.checked ? "1" : "0.3";
    });
  }
}, 50);


      }
  });
  dialogRasy = null;

}


// UMIEJĘTNOŚCI
        async function obslugaUmiejetnosci(html) {

          // Pobieranie kompendium z ustawień
          const umiejetnosciComp = game.settings.get("swade-npc-forge-eph", "kompendiumUmiejetnosci");
          const umiejetnosciPack = game.packs.get(umiejetnosciComp);

          const umiejetnosci = umiejetnosciPack
          ? (await umiejetnosciPack.getDocuments())
              .filter(e => e.type === "skill")
              .map(e => ({ id: e.id, name: e.name }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];

          const przyciskDodaj = html[0].querySelector("#npcforge-dodajUmiejetnoscRasy");
          const calyBlok = html[0].querySelector("#npcforge-listaUmiejetnosciRasy");

          przyciskDodaj.addEventListener("click", dodajUmiejetnosc);
          
          function dodajUmiejetnosc() {
            const linia = document.createElement("div");

              linia.innerHTML = `
                <select name="npcforge-umiejetnoscRasa[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${umiejetnosci.map(u => `<option value="${u.id}">${u.name}</option>`).join("")}
                </select>
            
                <select name="npcforge-umiejetnoscKoscRasa">
                  <option value="d4" selected>d4</option>
                  <option value="d6">d6</option>
                  <option value="d8">d8</option>
                  <option value="d10">d10</option>
                  <option value="d12">d12</option>
                </select>

              
                <select name="npcforge-umiejetnoscModyfikatorRasa">
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

                <span></span>
            
              <button type="button" class="npcforge-usunUmiejetnoscRasa">➖</button>
              `;
            
            calyBlok.appendChild(linia);
            linia.classList.add("npcforge-linia-umiejetnosci"); //CSS
            linia.querySelector(".npcforge-usunUmiejetnoscRasa").addEventListener("click", () => linia.remove());
          }

          const przyciskPodstawowe = html[0].querySelector("#npcforge-dodajUmiejetnoscPodstawowe");

          const umiejetnosciPodstawowe = umiejetnosciPack
          ? (await umiejetnosciPack.getDocuments())
              .filter(e => e.type === "skill")
              .filter(e => e.system.isCoreSkill === true)
              .map(e => ({ id: e.id, name: e.name }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];

          przyciskPodstawowe.addEventListener("click", () => {

            for (const u of umiejetnosciPodstawowe) {
              const linia = document.createElement("div");

              linia.innerHTML = `
                <select name="npcforge-umiejetnoscRasa[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${umiejetnosci.map(e => 
                    `<option value="${e.id}" ${e.id === u.id ? "selected" : ""}>${e.name}</option>`
                  ).join("")}
                </select>

                <select name="npcforge-umiejetnoscKoscRasa">
                  ${["d4", "d6", "d8", "d10", "d12"].map(k => 
                    `<option value="${k}" ${k === "d4" ? "selected" : ""}>${k}</option>`
                  ).join("")}
                </select>

                <select name="npcforge-umiejetnoscModyfikatorRasa">
                  ${Array.from({ length: 21 }, (_, i) => i - 10).map(n =>
                    `<option value="${n}" ${n === 0 ? "selected" : ""}>${n >= 0 ? "+" : ""}${n}</option>`
                  ).join("")}
                </select>

                <span></span>
                <button type="button" class="npcforge-usunUmiejetnoscRasa">➖</button>
              `;

              linia.classList.add("npcforge-linia-umiejetnosci");
              calyBlok.appendChild(linia);
              linia.querySelector(".npcforge-usunUmiejetnoscRasa").addEventListener("click", () => linia.remove());
            }
          });

        }


// PRZEWAGI
        async function obslugaPrzewag(html) {

          // Pobieranie kompendium z ustawień
          const przewagiComp = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
          const przewagiPack = game.packs.get(przewagiComp);

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

          const przyciskDodaj = html[0].querySelector("#npcforge-dodajPrzewageRasy");
          const calyBlok = html[0].querySelector("#npcforge-listaPrzewagRasy");

          przyciskDodaj.addEventListener("click", dodajPrzewage);
          
          function dodajPrzewage() {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-przewagaLiniaRasa");
            linia.innerHTML = `
                <select name="npcforge-przewagaRasa[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${przewagi.map(u => `<option value="${u.id}" data-nazwa="${u.name}">${u.category}: ${u.name}</option>`).join("")}
                </select>

                <span></span>
        
                <button type="button" class="npcforge-usunPrzewageRasa">➖</button>
              `;
            
            calyBlok.appendChild(linia);
            linia.classList.add("npcforge-linia-przewagi"); // CSS
            linia.querySelector(".npcforge-usunPrzewageRasa").addEventListener("click", () => linia.remove());

          stylPrzewagi(linia); // CSS
          }
        }

        function przewagaDrop(item) {
          const calyBlok = document.querySelector("#npcforge-listaPrzewagRasy");
          const linia = document.createElement("div");
          linia.classList.add("npcforge-przewagaLiniaRasa");

          linia.innerHTML = `
            <select name="npcforge-przewagaRasa[]" disabled>
              <option value="${item.uuid}" data-nazwa="${item.name}" selected>${item.name}</option>
            </select>
            <span></span>
            <button type="button" class="npcforge-usunPrzewageRasa">➖</button>
          `;

          calyBlok.appendChild(linia);
          linia.classList.add("npcforge-linia-przewagi"); //CSS
          linia.querySelector(".npcforge-usunPrzewageRasa").addEventListener("click", () => linia.remove());

          stylPrzewagi(linia, true); // CSS

        }

        function stylPrzewagi(linia, disabled = false) {
          if (disabled) {
            const select = linia.querySelector("select");
            if (select) {
              select.disabled = true;
              select.classList.add("npcforge-select-disabled-rasa");
            }
          }
        }


// ZAWADY
        async function obslugaZawad(html) {

          // Pobieranie kompendium z ustawień
          const zawadyComp = game.settings.get("swade-npc-forge-eph", "kompendiumZawady");
          const zawadyPack = game.packs.get(zawadyComp);

          const zawady = zawadyPack
          ? (await zawadyPack.getDocuments())
              .filter(e => e.type === "hindrance")
              .map(e => ({ id: e.id, name: e.name }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];

          const przyciskDodaj = html[0].querySelector("#npcforge-dodajZawadeRasy");
          const calyBlok = html[0].querySelector("#npcforge-listaZawadRasy");

          przyciskDodaj.addEventListener("click", dodajZawade);
          
          function dodajZawade() {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-zawadaLiniaRasa");

              linia.innerHTML = `
                <select name="npcforge-zawadaRasa[]" class="zawada_select">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${zawady.map(u => `<option value="${u.id}">${u.name}</option>`).join("")}
                </select>

                <span></span>
            
              <button type="button" class="npcforge-usunZawadeRasa">➖</button>
              `;
            
            calyBlok.appendChild(linia);
            linia.classList.add("npcforge-linia-zawady"); // CSS
            linia.querySelector(".npcforge-usunZawadeRasa").addEventListener("click", () => linia.remove());

          stylZawady(linia); // CSS

          }
        }

        function zawadaDrop(item) {
          const calyBlok = document.querySelector("#npcforge-listaZawadRasy");
          const linia = document.createElement("div");
          linia.classList.add("npcforge-zawadaLiniaRasa");

          linia.innerHTML = `
            <select name="npcforge-zawadaRasa[]" disabled>
              <option value="${item.uuid}" selected>${item.name}</option>
            </select>
            <span></span>
            <button type="button" class="npcforge-usunZawadeRasa">➖</button>
          `;

          calyBlok.appendChild(linia);
          linia.classList.add("npcforge-linia-zawady"); // CSS
          linia.querySelector(".npcforge-usunZawadeRasa").addEventListener("click", () => linia.remove());

          stylZawady(linia, true); // CSS

        }

        function stylZawady(linia, disabled = false) {
            if (disabled) {
            const select = linia.querySelector("select");
            if (select) {
              select.disabled = true;
              select.classList.add("npcforge-select-disabled-rasa");
            }
          }
        }


// MOCE
        async function obslugaMocy(html) {

          // Pobieranie kompendium z ustawień
          const moceComp = game.settings.get("swade-npc-forge-eph", "kompendiumMoce");
          const mocePack = game.packs.get(moceComp);

          const moce = mocePack
          ? (await mocePack.getDocuments())
              .filter(e => e.type === "power")
              .map(e => ({ id: e.id, name: e.name }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];

          const przyciskDodaj = html[0].querySelector("#npcforge-dodajMocRasy");
          const calyBlok = html[0].querySelector("#npcforge-listaMocyRasy");

          przyciskDodaj.addEventListener("click", dodajMoc);
          
          function dodajMoc() {
            const linia = document.createElement("div");
            linia.classList.add("npcforge-mocLiniaRasa");

              linia.innerHTML = `
                <select name="npcforge-mocRasa[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${moce.map(u => `<option value="${u.id}">${u.name}</option>`).join("")}
                </select>

                <div>
                  <input type="text" name="npcforge-mocArkanaRasa" disabled="true"/>
                </div>

                <span></span>

              <button type="button" class="npcforge-usunMocRasa">➖</button>
              `;
            
            calyBlok.appendChild(linia);
            linia.classList.add("npcforge-linia-moce");
            linia.querySelector(".npcforge-usunMocRasa").addEventListener("click", () => {
              linia.remove();
              punktyMocy();
            });


            // Obsługa punktów mocy
            const selectMocy = linia.querySelector("select[name='npcforge-mocRasa[]']");
            const poleArkana = linia.querySelector("input[name='npcforge-mocArkanaRasa']");

            selectMocy.addEventListener("change", async (event) => {
              const wybraneId = event.target.value;

              if (!wybraneId) {
                poleArkana.value = "";
                punktyMocy();
                return;
              }

              const moc = await mocePack.getDocument(wybraneId);
              const arkana = moc?.system?.arcane || game.i18n.localize("NPCForge.OgólnePunktyMocy");
              poleArkana.value = arkana;
              punktyMocy();
            });

            stylMoce(linia); // CSS

          }
        }

        function punktyMocy() {
          const kontener = document.querySelector("#npcforge-listaArkanRasa");
          const fieldset = document.querySelector("#npcforge-fieldsetArkanaRasy");
          kontener.innerHTML = ""; // czyszczenie

          const linieMocy = document.querySelectorAll(".npcforge-mocLiniaRasa");
          const arkanaSet = new Set();

          linieMocy.forEach(linia => {
            const input = linia.querySelector("input[name='npcforge-mocArkanaRasa']");
              if (input.value) arkanaSet.add(input.value);
          });

          // Pokazuj lub ukrywaj fieldset
          if (arkanaSet.size === 0) { fieldset.style.display = "none"; return;} 
          else { fieldset.style.display = "block" }

          // Tworzenie pól dla unikalnych arkan
          for (let arkana of arkanaSet) {

            const label = document.createElement("label");
            label.textContent = arkana;

            const input = document.createElement("input");
            input.name = `punkty_mocy_${arkana}`;
            input.type = "number";
            input.value = "0";

            kontener.appendChild(label);
            kontener.appendChild(input);
          }
        }

        function mocDrop(item) {
          const calyBlok = document.querySelector("#npcforge-listaMocyRasy");
          const linia = document.createElement("div");
          linia.classList.add("npcforge-mocLiniaRasa");

        const arkana = item.system?.arcane?.trim() || game.i18n.localize("NPCForge.OgólnePunktyMocy");

        linia.innerHTML = `
          <select name="npcforge-mocRasa[]" disabled>
            <option value="${item.uuid}" selected>${item.name}</option>
          </select>
          <div><input type="text" name="npcforge-mocArkanaRasa" value="${arkana}" disabled /></div>
          <span></span>
          <button type="button" class="npcforge-usunMocRasa">➖</button>
        `;

          calyBlok.appendChild(linia);
          linia.classList.add("npcforge-linia-moce");
          linia.querySelector(".npcforge-usunMocRasa").addEventListener("click", () => {
            linia.remove();
            punktyMocy();
          });

          stylMoce(linia, true);  // CSS
          punktyMocy();
        }

        function stylMoce(linia, disabled = false) {

          const input = linia.querySelector("input[name='npcforge-mocArkanaRasa']");
          if (input) input.style.textAlign = "center";

          if (disabled) {
            const select = linia.querySelector("select");
            if (select) {
              select.disabled = true;
              select.classList.add("npcforge-select-disabled-rasa");
            }
          }
        }


// BROŃ NATURALNA

        async function obslugaBroniNaturalnej(html) {

          const przyciskDodaj = html[0].querySelector("#npcforge-dodajBronNaturalnaRasy");
          const calyBlok = html[0].querySelector("#npcforge-listaBroniNaturalnejRasy");
          const poleKategorii = html[0].querySelector("#npcforge-bronNaturalnaKategoria");
          const checkbox = html[0].querySelector("[name='npcforge-bronNaturalnaCheckbox']");

          checkbox?.addEventListener("change", () => {
            if (!poleKategorii) return;
            poleKategorii.disabled = !checkbox.checked;
          });

          const zapisanaKategoria = game.settings.get("swade-npc-forge-eph", "ostatniaKategoriaBroniNaturalnej");
          if (poleKategorii && zapisanaKategoria) {
            poleKategorii.value = zapisanaKategoria;
          }

          // Pobieranie kompendium z ustawień
          const bronNaturalnaComp = game.settings.get("swade-npc-forge-eph", "kompendiumBronNaturalna") || game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
          const sprzetPack = game.packs.get(bronNaturalnaComp);

          const wszystkieBronie = sprzetPack
            ? (await sprzetPack.getDocuments())
                .filter(e => e.type === "weapon")
                .map(e => ({
                  id: e.id,
                  name: e.name,
                  category: (e.system?.category || "").trim().toLowerCase()
                }))
            : [];

          przyciskDodaj.addEventListener("click", dodajBrońNaturalna);
          
          async function dodajBrońNaturalna() {

            const poleKategorii = html[0].querySelector("#npcforge-bronNaturalnaKategoria");
            const wybranaKategoria = poleKategorii?.value?.trim().toLowerCase() || "";
            const filtruj = html[0].querySelector("[name='npcforge-bronNaturalnaCheckbox']")?.checked;

            if (filtruj && wybranaKategoria) {
              await game.settings.set("swade-npc-forge-eph", "ostatniaKategoriaBroniNaturalnej", wybranaKategoria);
            }

            const dostepneBronie = filtruj && wybranaKategoria
              ? wszystkieBronie.filter(b => b.category === wybranaKategoria)
              : wszystkieBronie;

            const linia = document.createElement("div");
            linia.classList.add("npcforge-bronNaturalnaLiniaRasa");

            linia.innerHTML = `
              <select name="npcforge-bronNaturalnaRasa[]" class="bronNaturalna_select">
                <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                ${dostepneBronie.map(u => `<option value="Compendium.${sprzetPack.collection}.${u.id}">${u.name}</option>`).join("")}
              </select>
              <span></span>
              <button type="button" class="npcforge-usunBronNaturalnaRasa">➖</button>
            `;

            calyBlok.appendChild(linia);
            linia.classList.add("npcforge-linia-bronNaturalna");
            linia.querySelector(".npcforge-usunBronNaturalnaRasa").addEventListener("click", () => linia.remove());

            stylBronNaturalna(linia); // Css
          }
        }

        function bronNaturalnaDrop(item) {
          const calyBlok = document.querySelector("#npcforge-listaBroniNaturalnejRasy");
          const linia = document.createElement("div");
          linia.classList.add("npcforge-bronNaturalnaLiniaRasa");

          linia.innerHTML = `
            <select name="npcforge-bronNaturalnaRasa[]" disabled>
              <option value="${item.uuid}" selected>${item.name}</option>
            </select>
            <span></span>
            <button type="button" class="npcforge-usunBronNaturalnaRasa">➖</button>
          `;

          calyBlok.appendChild(linia);
          linia.classList.add("npcforge-linia-bronNaturalna"); // CSS
          linia.querySelector(".npcforge-usunBronNaturalnaRasa").addEventListener("click", () => linia.remove());

          stylBronNaturalna(linia, true); // CSS
        }

        function stylBronNaturalna(linia, disabled = false) {
            if (disabled) {
            const select = linia.querySelector("select");
            if (select) {
              select.disabled = true;
              select.classList.add("npcforge-select-disabled-rasa");
            }
          }
        }


// TABLICE
        async function obslugaTablic(html) {

        // Pobieranie wszystkich rollable tables stworzonych w świecie
        const tablice = game.tables.contents
          .map(t => ({
            id: t.id,
            uuid: t.uuid,
            name: t.name
          }))
          .sort((a, b) => a.name.localeCompare(b.name));


          const przyciskDodaj = html[0].querySelector("#npcforge-dodajTabliceRasy");
          const calyBlok = html[0].querySelector("#npcforge-listaTablicRasy");

          przyciskDodaj.addEventListener("click", dodajTablice);
          
          function dodajTablice() {
            const linia = document.createElement("div");

              linia.innerHTML = `
                <select name="npcforge-tablicaRasa[]">
                  <option value="">${game.i18n.localize("NPCForge.WybierzZListy")}</option>
                  ${tablice.map(t => `<option value="${t.uuid}">${t.name}</option>`).join("")}
                </select>

                <span></span>
            
              <button type="button" class="npcforge-usunTabliceRasa">➖</button>
              `;
            
            calyBlok.appendChild(linia);
            linia.classList.add("npcforge-linia-tablice");
            linia.querySelector(".npcforge-usunTabliceRasa").addEventListener("click", () => linia.remove());
          }
        }


// MODYFIKATORY
        function rozmiar(html) {
          const selectRozmiar = html[0].querySelector("select[name='npcforge-rozmiarRasa']");
          const poleWytrzymalosc = html[0].querySelector("input[name='npcforge-rozmiarWytrzymaloscRasa']");
          const poleModyfikatorSkali = html[0].querySelector("input[name='npcforge-modyfikatorSkaliRasa']");
          const poleZasiegAtaku = html[0].querySelector("input[name='npcforge-zasiegAtakuRasa']");
          const poleMaksymalneRany = html[0].querySelector("input[name='npcforge-maksymalneRanyRasa']");

          selectRozmiar.addEventListener("change", () => {
            const rozmiar = parseInt(selectRozmiar.value);
            
            let mod = "";
            let zas = "-";
            switch (rozmiar) {
              case -4: mod = "-6"; break;
              case -3: mod = "-4"; break;
              case -2: mod = "-2"; break;
              case -1:
              case 0:
              case 1:
              case 2:
              case 3: mod = "-"; break;
              case 4:
              case 5:
              case 6:
              case 7: mod = "+2"; zas = "+1"; break;
              case 8:
              case 9:
              case 10:
              case 11: mod = "+4"; zas = "+2"; break;
              case 12:
              case 13:
              case 14:
              case 15:
              case 16:
              case 17:
              case 18:
              case 19:
              case 20: mod = "+6"; zas = "+3"; break;
            }

            let wytrzymalosc;
            if (rozmiar<0) {
              wytrzymalosc = rozmiar;
            } else {
              wytrzymalosc = "+"+rozmiar;
            }

            poleWytrzymalosc.value = wytrzymalosc;
            poleModyfikatorSkali.value = mod;
            poleZasiegAtaku.value = zas;
            poleMaksymalneRany.value = zas;

          });

          selectRozmiar.dispatchEvent(new Event("change"));
        }

async function obslugaPrzyciskuStworz(html) {
  
  const przyciskStworz = html.find("button[data-action='stworz']");
  const poleNazwa = html.find("[name='npcforge-nazwaRasy']");

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

  if (poleNazwa.val()?.trim()) {
    przyciskStworz.prop("disabled", false);
  }

  // Tooltip od razu po najechaniu
  przyciskStworz.on("mouseenter", function () {
    if (przyciskStworz.prop("disabled")) {
      const tooltip = document.createElement("div");
      tooltip.textContent = game.i18n.localize("NPCForge.BrakNazwyRasa");
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

function dropzone(html) {
  const root = html[0] || html;

  let formularz = root.querySelector("form.npc-forge-dialogRasy");
  if (!formularz) {
    if (root.tagName && root.tagName.toLowerCase() === "form") {
      formularz = root;                 // DialogV2 form jako root
    } else {
      formularz = root.querySelector("form");
    }
  }
  if (!formularz) return;               // defensywnie

  formularz.addEventListener("dragover", (ev) => ev.preventDefault());

  formularz.addEventListener("drop", async (ev) => {
    ev.preventDefault();
    let data;
    try {
      const raw = ev.dataTransfer.getData("text/plain");
      data = JSON.parse(raw);
    } catch { return; }

    const item = data?.uuid ? await fromUuid(data.uuid) : null;
    if (!item) return;

    switch (item.type) {
      case "edge":      return przewagaDrop(item);
      case "hindrance": return zawadaDrop(item);
      case "power":     return mocDrop(item);
      case "weapon":    return bronNaturalnaDrop(item);
      default: ui.notifications.warn(game.i18n.localize("NPCForge.PrzeciaganieBladRasa"));
    }
  });
}


function zabezpieczPoleLiczbowe(input, min = 0, max = null) {
  input.on("blur", function () {
    let val = Number(this.value);
    let poprawiona;

    if (isNaN(val) || val < min) {
      poprawiona = min;
    } else {
      poprawiona = Math.round(val);
      if (max !== null && poprawiona > max) poprawiona = max;
    }

    if (this.value != poprawiona) {
      this.value = poprawiona;
      this.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

export function zabezpieczPola(html) {
  const pola = [
    "npcforge-tempoNaZiemiRasa",
    "npcforge-tempoLotRasa",
    "npcforge-tempoPlywanieRasa",
    "npcforge-tempoPodZiemiaRasa",
    "npcforge-zrecznosc_anomalia",
    "npcforge-spryt_anomalia",
    "npcforge-duch_anomalia",
    "npcforge-sila_anomalia",
    "npcforge-wigor_anomalia",
    "npcforge-mocArkanaRasa"
  ];

  for (const nazwa of pola) {
    const input = html.find(`input[name='${nazwa}']`);
    if (input.length) zabezpieczPoleLiczbowe(input, 0); // min = 0, max = null (brak limitu górnego)
  }
}
