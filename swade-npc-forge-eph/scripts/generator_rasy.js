export async function generujRase(daneFormularza) {

  // Pobieranie kompendium z ustawień
  const rasyComp = game.settings.get("swade-npc-forge-eph", "kompendiumRasy");
  const rasy = game.packs.get(rasyComp);

  // Dane z formularza

    // Nazwa
      const nazwa = daneFormularza.get("npcforge-nazwaRasy");

    // Atrybuty
      const zrecznosc = [daneFormularza.get("npcforge-zrecznosc_min"), daneFormularza.get("npcforge-zrecznosc_max"), daneFormularza.get("npcforge-zrecznosc_anomalia")];
      const spryt = [daneFormularza.get("npcforge-spryt_min"), daneFormularza.get("npcforge-spryt_max"), daneFormularza.get("npcforge-spryt_anomalia")];
      const duch = [daneFormularza.get("npcforge-duch_min"), daneFormularza.get("npcforge-duch_max"), daneFormularza.get("npcforge-duch_anomalia")];
      const sila = [daneFormularza.get("npcforge-sila_min"), daneFormularza.get("npcforge-sila_max"), daneFormularza.get("npcforge-sila_anomalia")];
      const wigor = [daneFormularza.get("npcforge-wigor_min"), daneFormularza.get("npcforge-wigor_max"), daneFormularza.get("npcforge-wigor_anomalia")];
      const zwierzecySpryt = daneFormularza.has("npcforge-zwierzecy_spryt_rasa");

    // Umiejętności
      const umiejetnosci_id = [];
      const umiejetnosci_kosci = [];
      const umiejetnosci_modyfikatory = [];

      const bloki_umiejetnosci = document.querySelectorAll(".npcforge-linia-umiejetnosci");

      bloki_umiejetnosci.forEach(blok => {
        const id_umiejetnosc = blok.querySelector("select[name='npcforge-umiejetnoscRasa[]']").value;
        const kosc_umiejetnosc = blok.querySelector("select[name='npcforge-umiejetnoscKoscRasa']").value;
        const mod_umiejetnosc = parseInt(blok.querySelector("select[name='npcforge-umiejetnoscModyfikatorRasa']").value);

        if (id_umiejetnosc) {
          umiejetnosci_id.push(id_umiejetnosc);
          umiejetnosci_kosci.push(kosc_umiejetnosc);
          umiejetnosci_modyfikatory.push(mod_umiejetnosc);
        }
      });

    // Przewagi
      const przewagi = [];

      const bloki_przewag = document.querySelectorAll(".npcforge-linia-przewagi");

      bloki_przewag.forEach(blok => {
        const select = blok.querySelector("select[name='npcforge-przewagaRasa[]']");
        const id = select.value;
        const nazwa = select.selectedOptions[0]?.dataset.nazwa || "";

        if (id) {
          przewagi.push({ id, nazwa });
        }
      });

    // Zawady
      const zawady_id = [];

      const bloki_zawad = document.querySelectorAll(".npcforge-linia-zawady");

      bloki_zawad.forEach(blok => {
        const id_zawada = blok.querySelector("select[name='npcforge-zawadaRasa[]']").value;

        if (id_zawada) {
          zawady_id.push(id_zawada);
        }
      });

    // Moce
      const moce_id = [];
      const arkana_nazwy = [];
      const arkana_punkty = [];

      const bloki_mocy = document.querySelectorAll(".npcforge-linia-moce");

      bloki_mocy.forEach(blok => {
        const id_moc = blok.querySelector("select[name='npcforge-mocRasa[]']").value;

        if (id_moc) {
          moce_id.push(id_moc);
        }
      });

      const inputyPunktow = document.querySelectorAll("input[name^='punkty_mocy_']");

      inputyPunktow.forEach(input => {
        const nazwa = input.name;
        const nazwaArkana = nazwa.replace("punkty_mocy_", "");
        const wartosc = parseInt(input.value) || 0;

        arkana_nazwy.push(nazwaArkana);
        arkana_punkty.push(wartosc);
      });

    // Modyfikatory
      //Rozmiar
        const rozmiar = daneFormularza.get("npcforge-rozmiarRasa");
        const rozmiar_wytrzymalosc = daneFormularza.get("npcforge-rozmiarWytrzymaloscRasa");
        const modyfikator_skali = daneFormularza.get("npcforge-modyfikatorSkaliRasa");
        const zasieg_ataku = daneFormularza.get("npcforge-zasiegAtakuRasa");
        const maksymalne_rany = daneFormularza.get("npcforge-maksymalneRanyRasa");
        const zastosuj_maksymalne_rany = daneFormularza.has("npcforge-zastosujMaksymalneRany");
      //Tempo
        const tempo_na_ziemi = daneFormularza.get("npcforge-tempoNaZiemiRasa");
        const tempo_lot = daneFormularza.get("npcforge-tempoLotRasa");
        const tempo_plywanie = daneFormularza.get("npcforge-tempoPlywanieRasa");
        const tempo_pod_ziemia = daneFormularza.get("npcforge-tempoPodZiemiaRasa");
        const tempo_domyslne = daneFormularza.get("npcforge-tempoDomyslneRasa");
        const kosc_biegania = daneFormularza.get("npcforge-koscBieganiaRasa");
        const modyfikator_kosci_biegania = daneFormularza.get("npcforge-modyfikatorKosciBieganiaRasa");
      //Pozostałe modyfikatory
        const modyfikator_obrony = daneFormularza.get("modyfikator_obrony");
        const modyfikator_wytrzymalosci = daneFormularza.get("modyfikator_wytrzymalosci");
        const maksimum_ran = daneFormularza.get("maksimum_ran");
        const ignorowanie_ran = daneFormularza.get("ignorowanie_ran");
        const maksimum_zmeczenia = daneFormularza.get("maksimum_zmeczenia");
        const ignorowanie_zmeczenia = daneFormularza.get("ignorowanie_zmeczenia");
        const modyfikator_fuksow = daneFormularza.get("modyfikator_fuksow");
        const modyfikator_wyjscia_z_szoku = daneFormularza.get("modyfikator_wyjscia_z_szoku");
        const modyfikator_wyparowania = daneFormularza.get("modyfikator_wyparowania");
        const dodatkowe_przewagi = daneFormularza.get("dodatkowe_przewagi");
        const dodatkowe_zawady = daneFormularza.get("dodatkowe_zawady");

    // Broń naturalna

      const bronNaturalna_id = [];

      const bloki_broniNaturalnej = document.querySelectorAll(".npcforge-linia-bronNaturalna");

      bloki_broniNaturalnej.forEach(blok => {
        const id_bronNaturalna = blok.querySelector("select[name='npcforge-bronNaturalnaRasa[]']").value;

        if (id_bronNaturalna) {
          bronNaturalna_id.push(id_bronNaturalna);
        }
      });

      const grants = bronNaturalna_id.map(grant => ({
        uuid: grant,
        count: 1,
        optional: false,
        filter: ""
      }));


    // Tablice
      const tablice_id = [];

      const bloki_tablic = document.querySelectorAll(".npcforge-linia-tablice");

      bloki_tablic.forEach(blok => {
        const id_tablica = blok.querySelector("select[name='npcforge-tablicaRasa[]']").value;

        if (id_tablica) {
          tablice_id.push(id_tablica);
        }
      });        

  const daneRasy = {
    nazwa,
    atrybuty: { zrecznosc, spryt, duch, sila, wigor, zwierzecySpryt },
    umiejetnosci: { id: umiejetnosci_id, kosc: umiejetnosci_kosci, modyfikator: umiejetnosci_modyfikatory },
    przewagi: przewagi,
    zawady: zawady_id,
    moce: { moce_id, arkana_nazwy, arkana_punkty },
    modyfikatory: {
        rozmiar: {
          rozmiar,
          rozmiar_wytrzymalosc,
          modyfikator_skali,
          zasieg_ataku,
          maksymalne_rany,
          zastosuj_maksymalne_rany
        },
        tempo: {
          tempo_na_ziemi,
          tempo_lot,
          tempo_plywanie,
          tempo_pod_ziemia,
          tempo_domyslne,
          kosc_biegania,
          modyfikator_kosci_biegania,
        },
        modyfikator_obrony,
        modyfikator_wytrzymalosci,
        maksimum_ran,
        ignorowanie_ran,
        maksimum_zmeczenia,
        ignorowanie_zmeczenia,
        modyfikator_fuksow,
        modyfikator_wyjscia_z_szoku,
        modyfikator_wyparowania,
        dodatkowe_przewagi,
        dodatkowe_zawady
    },
    bronNaturalna: bronNaturalna_id,
    tablice: tablice_id
  };

  let opis = game.i18n.localize("NPCForge.InfoRasaKarta");

  
const RasaItem = CONFIG.Item.documentClass;
const item = new RasaItem({
  name: nazwa,
  type: "ancestry",
  img: "modules/swade-npc-forge-eph/icons/rasa.png",
  system: {
    grants,
    source: "NPC Forge",
    description: opis,
  }
});


 
// Zapisz do kompendium (zwraca nowy obiekt)
const stworzonyItem = await rasy.importDocument(item);

// Zapisz flagę z danymi
await stworzonyItem.setFlag("swade-npc-forge-eph", "rasaDane", daneRasy);

}