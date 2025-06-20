export async function generujArchetyp(daneFormularza) {

  // Pobieranie kompendium z ustawień
  const archetypyComp = game.settings.get("swade-npc-forge-eph", "kompendiumArchetypy");
  const archetypy = game.packs.get(archetypyComp);

  // Dane z formularza

    // Nazwa
      const nazwa = daneFormularza.get("npcforge-nazwaArchetypu");

    // Atrybuty
      const zrecznosc = parseInt(daneFormularza.get("npcforge-zrecznoscArchetyp")) || 0;
      const spryt     = parseInt(daneFormularza.get("npcforge-sprytArchetyp"))     || 0;
      const duch      = parseInt(daneFormularza.get("npcforge-duchArchetyp"))      || 0;
      const sila      = parseInt(daneFormularza.get("npcforge-silaArchetyp"))      || 0;
      const wigor     = parseInt(daneFormularza.get("npcforge-wigorArchetyp"))     || 0;

    // Umiejętności
      const umiejetnosci = [];

      for (const [klucz, wartosc] of daneFormularza.entries()) {
        if (klucz.startsWith("um-")) {
          umiejetnosci.push({
            id: klucz.slice(3), // obcina "um-"
            waga: parseInt(wartosc || "0")
          });
        }
      }

    // Przewagi

      const kompPrzewagi = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
      const przewagiPack = game.packs.get(kompPrzewagi);
      const przewagiKompendium = (await przewagiPack.getDocuments()).filter(moc => moc.type === "edge");

      const wszystkiePrzewagi = [];
      let przewagiALL = [];
      let przewagiTagi = [];
      let przewagiPojedyncze = [];
      const przewagiZTagow = [];
      let przewagiUnikalne = [];
      let przewagiPelnaLista = [];
      let przewagiLista;
      let przewagi;
      let pALL = 1;

      for (const [klucz, wartosc] of daneFormularza.entries()) {
        if (!klucz.startsWith("prze-")) continue;

        const id = klucz.slice(5); // wycina "prze-"
        const waga = parseInt(wartosc, 10) || 0;

        wszystkiePrzewagi.push({ id, waga });
      }

      for (let i = 0; i < wszystkiePrzewagi.length; i++) {
        const { id, waga } = wszystkiePrzewagi[i];

        if (id === "ALL") {
          przewagiALL.push(waga);
        } else if (id.startsWith("tag-")) {
          przewagiTagi.push({ id: id.slice(4), waga });
        } else {
          przewagiPojedyncze.push({ id, waga });
        }
      }

      if (przewagiALL.length > 0) {
        pALL = Math.max(...przewagiALL);
      }

      for (const { id: szukanyTag, waga } of przewagiTagi) {
        for (const przewaga of przewagiKompendium) {
          const tagi = przewaga.getFlag("swade-npc-forge-eph", "tags") || [];
          if (tagi.includes(szukanyTag)) {
            przewagiZTagow.push({ id: przewaga.id, waga });
          }
        }
      }

      przewagiLista = przewagiPojedyncze.concat(przewagiZTagow);

      for (let i = 0; i < przewagiLista.length; i++) {
        const obecna = przewagiLista[i];

        const indeks = przewagiUnikalne.findIndex(p => p.id === obecna.id);

        if (indeks === -1) { przewagiUnikalne.push(obecna); } 
        else { if (obecna.waga > przewagiUnikalne[indeks].waga) { przewagiUnikalne[indeks] = obecna; }}
      }

      for (const przewaga of przewagiKompendium) {
        const id = przewaga.id;

        const znaleziony = przewagiUnikalne.find(p => p.id === id);

        if (znaleziony) {
          przewagiPelnaLista.push({ id, waga: znaleziony.waga });
        } else {
          przewagiPelnaLista.push({ id, waga: pALL });
        }
      }

      przewagi = przewagiPelnaLista.filter(p => p.waga > 1);

    // Moce

      const kompMoce = game.settings.get("swade-npc-forge-eph", "kompendiumMoce");
      const mocePack = game.packs.get(kompMoce);
      const moceKompendium = (await mocePack.getDocuments()).filter(moc => moc.type === "power");

      const wszystkieMoce = [];
      let moceALL = [];
      let moceTagi = [];
      let mocePojedyncze = [];
      const moceZTagow = [];
      let moceUnikalne = [];
      let mocePelnaLista = [];
      let moceLista;
      let moce;
      let mALL = 1;

      for (const [klucz, wartosc] of daneFormularza.entries()) {
        if (!klucz.startsWith("moc-")) continue;

        const id = klucz.slice(4); // wycina "moc-"
        const waga = parseInt(wartosc, 10) || 0;

        wszystkieMoce.push({ id, waga });
      }

      for (let i = 0; i < wszystkieMoce.length; i++) {
        const { id, waga } = wszystkieMoce[i];

        if (id === "ALL") {
          moceALL.push(waga);
        } else if (id.startsWith("tag-")) {
          moceTagi.push({ id: id.slice(4), waga });
        } else {
          mocePojedyncze.push({ id, waga });
        }
      }

      if (moceALL.length > 0) {
        mALL = Math.max(...moceALL);
      }

      for (const { id: szukanyTag, waga } of moceTagi) {
        for (const moc of moceKompendium) {
          const tagi = moc.getFlag("swade-npc-forge-eph", "tags") || [];
          if (tagi.includes(szukanyTag)) {
            moceZTagow.push({ id: moc.id, waga });
          }
        }
      }

      moceLista = mocePojedyncze.concat(moceZTagow);

      for (let i = 0; i < moceLista.length; i++) {
        const obecna = moceLista[i];

        const indeks = moceUnikalne.findIndex(m => m.id === obecna.id);

        if (indeks === -1) { moceUnikalne.push(obecna); } 
        else { if (obecna.waga > moceUnikalne[indeks].waga) { moceUnikalne[indeks] = obecna; }}
      }

      for (const moc of moceKompendium) {
        const id = moc.id;

        const znaleziony = moceUnikalne.find(m => m.id === id);

        if (znaleziony) {
          mocePelnaLista.push({ id, waga: znaleziony.waga });
        } else {
          mocePelnaLista.push({ id, waga: mALL });
        }
      }

      moce = mocePelnaLista.filter(m => m.waga > 1);

    // Pancerze

      const kompSprzet = game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
      const sprzetPack = game.packs.get(kompSprzet);
      const sprzet = await sprzetPack.getDocuments();
      const pancerzeKompendium = sprzet.filter(i => i.type === "armor");

      const pancerzSzczegolowy = daneFormularza.get("przelacznikPancerz") === "on";

      const lokacje = ["K", "G", "R", "N"];
      const rangi = ["P", "1", "2", "3", "4", "5"];

      const pancerze = {};

      for (let j = 0; j < rangi.length; j++) {
        const ranga = rangi[j];
        pancerze[ranga] = {}; // <- ranga jako klucz

        for (let i = 0; i < lokacje.length; i++) {
          const lokacja = lokacje[i];
          const prefix = `${lokacja}${ranga}`;
          const lista = przetworzPancerze(daneFormularza, prefix, pancerzeKompendium);

          pancerze[ranga][lokacja] = lista;
        }
      }
  
      function przetworzPancerze(daneFormularza, prefix, pancerzeKompendium) {

        const kodLokacji = prefix[0];  // "K", "G", "R", "N"
        const typLokacji =
          kodLokacji === "K" ? "torso" :
          kodLokacji === "G" ? "head" :
          kodLokacji === "R" ? "arms" :
          kodLokacji === "N" ? "legs" :
          null;
        
        const wszystkiePancerze = [];
        let pancerzeBRAK = [];
        let pancerzeTagi = [];
        let pancerzePojedyncze = [];
        const pancerzeZTagow = [];
        let pancerzeUnikalne = [];
        let pancerzeLista;
        let pancerze;
        let pBRAK = 1;


        for (const [klucz, wartosc] of daneFormularza.entries()) {
          if (!klucz.startsWith(`panc-${prefix}`)) continue;

          const id = klucz.slice(8); // wycina "panc-(prefix)-"
          const waga = parseInt(wartosc, 10) || 0;

          wszystkiePancerze.push({ id, waga });
        }

        for (let i = 0; i < wszystkiePancerze.length; i++) {
          const { id, waga } = wszystkiePancerze[i];

          if (id === "BRAK") {
            pancerzeBRAK.push(waga);
          } else if (id.startsWith("tag-")) {
            pancerzeTagi.push({ id: id.slice(4), waga });
          } else {
            pancerzePojedyncze.push({ id, waga });
          }
        }

        if (pancerzeBRAK.length > 0) {
          pBRAK = Math.max(...pancerzeBRAK);
        }

        for (const { id: szukanyTag, waga } of pancerzeTagi) {
          for (const pancerz of pancerzeKompendium) {
            const tagi = pancerz.getFlag("swade-npc-forge-eph", "tags") || [];
            if (tagi.includes(szukanyTag) && pancerz.system?.locations?.[typLokacji]) {
              pancerzeZTagow.push({ id: pancerz.id, waga });
            }
          }
        }

        pancerzeLista = pancerzePojedyncze.concat(pancerzeZTagow);



        for (let i = 0; i < pancerzeLista.length; i++) {
              const obecna = pancerzeLista[i];

              const indeks = pancerzeUnikalne.findIndex(p => p.id === obecna.id);

              if (indeks === -1) { pancerzeUnikalne.push(obecna); } 
              else { if (obecna.waga > pancerzeUnikalne[indeks].waga) { pancerzeUnikalne[indeks] = obecna; }}
            }


            pancerzeUnikalne.push({ id: "BRAK", waga: pBRAK });


          pancerze = pancerzeUnikalne.filter(p => p.waga > 1);
        
        return pancerze;
      }

    // Bron

      const bronKompendium = sprzet.filter(i => i.type === "weapon" || i.type === "shield");
      // const rangi = ["P", "1", "2", "3", "4", "5"]; ^^

      const bronSzczegolowa = daneFormularza.get("przelacznikBron") === "on";

      const wstepnaListaWariantow = [];
      const wstepnaListaSlotow = [];
      const wariantyMap = {};
      const bron = {};
      const linieBezTagow = [];
      const linieZTaga = [];
      const linieZTagowRozwiniete = [];
      let linieFinalne;

      for (const [klucz, wartosc] of daneFormularza.entries()) {
        if (!klucz.startsWith("bron-")) continue;

        wstepnaListaSlotow.push({
          klucz,    // pełna nazwa inputa, np. "bron-RANGA2-WARIANT1-SLOT0-tag-bronieSzermiercze"
          wartosc   // np. "3"
        });
      }

      for (const [klucz, wartosc] of daneFormularza.entries()) {
        if (!klucz.startsWith("war-")) continue;

        const [waga, lacznik] = wartosc.split("|");
        wstepnaListaWariantow.push({ klucz, waga, lacznik });
      }

      for (const wpis of wstepnaListaWariantow) {
        const czesci = wpis.klucz.split("-");
        const ranga = czesci[1].split(":")[1];      // "RANGA:P" → "P"
        const wariantStr = czesci[2].split(":")[1]; // "WARIANT:P1" → "P1"
        const wariant = parseInt(wariantStr.slice(1), 10); // "P1" → 1

        if (!wariantyMap[ranga]) wariantyMap[ranga] = [];

        wariantyMap[ranga].push({
          wariant,
          waga: parseInt(wpis.waga, 10),
          lacznik: wpis.lacznik,
          sloty: {}
        });
      }

      for (const ranga in wariantyMap) {
        const warianty = wariantyMap[ranga].sort((a, b) => a.wariant - b.wariant);
        bron[ranga] = { zestawy: [] };

        let aktualnyZestaw = [];

        for (let i = 0; i < warianty.length; i++) {
          const wariant = warianty[i];

          if (i === 0 || wariant.lacznik === "i") {
            if (aktualnyZestaw.length > 0) {
              bron[ranga].zestawy.push({ warianty: aktualnyZestaw });
            }
            aktualnyZestaw = [wariant];
          } else {
            aktualnyZestaw.push(wariant);
          }
        }
        // dodaj ostatni zestaw
        if (aktualnyZestaw.length > 0) {
          bron[ranga].zestawy.push({ warianty: aktualnyZestaw });
        }
      }

      for (const ranga in bron) {
        for (const zestaw of bron[ranga].zestawy) {
          for (const wariant of zestaw.warianty) {
            delete wariant.lacznik;
          }
        }
      }

      for (const wpis of wstepnaListaSlotow) {
        const czesci = wpis.klucz.split("-");

        const ranga = czesci[1].split(":")[1];               // "RANGA:P" → "P"
        const wariantStr = czesci[2].split(":")[1];          // "WARIANT:P1" → "P1"
        const wariant = parseInt(wariantStr.slice(1), 10);   // "P1" → 1
        const slot = parseInt(czesci[3].split(":")[1], 10);  // "SLOT:0" → 0

        if (czesci[4] === "tag") {
          const tag = czesci[5]; // np. "bronieSzermiercze"
          linieZTaga.push({
            ranga,
            wariant,
            slot,
            tag,
            waga: parseInt(wpis.wartosc, 10)
          });
        } else {
          const id = czesci[4]; // np. "abc123"
          linieBezTagow.push({
            ranga,
            wariant,
            slot,
            id,
            waga: parseInt(wpis.wartosc, 10)
          });
        }
      }

      for (const wpis of linieZTaga) {
        const pasujace = bronKompendium.filter(item => {
          const tagi = item.getFlag("swade-npc-forge-eph", "tags") || [];
          return tagi.includes(wpis.tag);
        });

        for (const item of pasujace) {
          linieZTagowRozwiniete.push({
            ranga: wpis.ranga,
            wariant: wpis.wariant,
            slot: wpis.slot,
            id: item.id,
            waga: wpis.waga
          });
        }
      }

      linieFinalne = [...linieBezTagow, ...linieZTagowRozwiniete];

      for (const linia of linieFinalne) {
        const { ranga, wariant, slot, id, waga } = linia;

        const zestawy = bron[ranga]?.zestawy || [];

        for (const zestaw of zestawy) {
          const wariantObiekt = zestaw.warianty.find(w => w.wariant === wariant);
          if (!wariantObiekt) continue;

          if (!wariantObiekt.sloty[slot]) {
            wariantObiekt.sloty[slot] = [];
          }

          wariantObiekt.sloty[slot].push({ id, waga });
          break; // znaleźliśmy i przypisaliśmy – koniec szukania
        }
      }

    // Item grants

      const itemGrants = [];

      for (const [klucz] of daneFormularza.entries()) {
        if (!klucz.startsWith("IG-")) continue;

        const id = klucz.slice(3); // wycina "IG-"

        itemGrants.push({ id });
      }

      const grants = itemGrants.map(grant => ({
        uuid: grant.id,
        count: 1,
        optional: false,
        filter: ""
      }));

  const daneArchetypu = {
    nazwa,
    atrybuty: { zrecznosc, spryt, duch, sila, wigor },
    umiejetnosci,
    przewagi,
    moce,
    pancerze,
    bron,
    pancerzSzczegolowy,
    bronSzczegolowa,
  };

  let opis = game.i18n.localize("NPCForge.InfoArchetypKarta");

  
const ArchetypItem = CONFIG.Item.documentClass;
const item = new ArchetypItem({
  name: nazwa,
  type: "ability",
  img: "modules/swade-npc-forge-eph/icons/archetyp.png",
  system: {
    grants,
    subtype: "archetype",
    source: "NPC Forge",
    description: opis,
  }
});


// Zapisz do kompendium (zwraca nowy obiekt)
const stworzonyItem = await archetypy.importDocument(item);

// Zapisz flagę z danymi
await stworzonyItem.setFlag("swade-npc-forge-eph", "archetypDane", daneArchetypu);
    
}