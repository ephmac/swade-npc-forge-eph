import { PustaLiniaHelper, listaKosci_k12, listaKosciKrotka_k6 } from "./narzedzia.js";

let dialogOpcji = null;

export async function otworzOpcje() {

  if (dialogOpcji) { dialogOpcji.bringToFront(); return; } // Zapobiega wielokrotnemu otwieraniu
  
  // Helpery
  listaKosci_k12();
  PustaLiniaHelper();
  listaKosciKrotka_k6();

  // Dane do przekazania do szablonu
  const dane = {
  };  
  
  // Renderuje szablon
  const content = await foundry.applications.handlebars.renderTemplate("modules/swade-npc-forge-eph/templates/dialog_opcji.hbs", dane);

  // Tworzenie dialogu
  await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("NPCForge.TytulDialogOpcji") },
    content,
    buttons: [
      { label: game.i18n.localize("NPCForge.PrzyciskZamknij"), action: "close", default: true }
    ],
    render: async (event, dialog) => {
      dialogOpcji = dialog;
      const el = dialog.element;
      const html = $(el);

      queueMicrotask(() => dialog.setPosition({ width: 650 }));

      await wczytajWagi(html);
      await zapiszWagi(html);
      await resetWagi(html);

      const typy = ["P", "Bo", "B", "F"];
      for (let i=0; i<4; i++) {
        await wczytajPostac(html, typy[i]);
        await zapiszPostac(html, typy[i]);
        await resetPostac(html, typy[i]);
      }

      await selectory(html);
    }
  });
  dialogOpcji = null;
}

async function selectory(html) {

  const maxAtrybutCheckbox_P = html[0].querySelector('input[name="maxAtrybutCheckbox-P"]');
  const maxAtrybutCheckbox_Bo = html[0].querySelector('input[name="maxAtrybutCheckbox-Bo"]');
  const maxAtrybutCheckbox_B = html[0].querySelector('input[name="maxAtrybutCheckbox-B"]');
  const maxAtrybutCheckbox_F = html[0].querySelector('input[name="maxAtrybutCheckbox-F"]');

  const maxUmiejetnoscCheckbox_P = html[0].querySelector('input[name="maxUmiejetnoscCheckbox-P"]');
  const maxUmiejetnoscCheckbox_Bo = html[0].querySelector('input[name="maxUmiejetnoscCheckbox-Bo"]');
  const maxUmiejetnoscCheckbox_B = html[0].querySelector('input[name="maxUmiejetnoscCheckbox-B"]');
  const maxUmiejetnoscCheckbox_F = html[0].querySelector('input[name="maxUmiejetnoscCheckbox-F"]');

  const maxAtrybut_P1 = html[0].querySelector('select[name="maxAtrybut-P1"]');
  const maxAtrybut_P2 = html[0].querySelector('select[name="maxAtrybut-P2"]');
  const maxAtrybut_P3 = html[0].querySelector('select[name="maxAtrybut-P3"]');
  const maxAtrybut_P4 = html[0].querySelector('select[name="maxAtrybut-P4"]');
  const maxAtrybut_P5 = html[0].querySelector('select[name="maxAtrybut-P5"]');
  
  const maxAtrybut_Bo1 = html[0].querySelector('select[name="maxAtrybut-Bo1"]');
  const maxAtrybut_Bo2 = html[0].querySelector('select[name="maxAtrybut-Bo2"]');
  const maxAtrybut_Bo3 = html[0].querySelector('select[name="maxAtrybut-Bo3"]');
  const maxAtrybut_Bo4 = html[0].querySelector('select[name="maxAtrybut-Bo4"]');
  const maxAtrybut_Bo5 = html[0].querySelector('select[name="maxAtrybut-Bo5"]');

  const maxAtrybut_B1 = html[0].querySelector('select[name="maxAtrybut-B1"]');
  const maxAtrybut_B2 = html[0].querySelector('select[name="maxAtrybut-B2"]');
  const maxAtrybut_B3 = html[0].querySelector('select[name="maxAtrybut-B3"]');
  const maxAtrybut_B4 = html[0].querySelector('select[name="maxAtrybut-B4"]');
  const maxAtrybut_B5 = html[0].querySelector('select[name="maxAtrybut-B5"]');

  const maxAtrybut_F1 = html[0].querySelector('select[name="maxAtrybut-F1"]');
  const maxAtrybut_F2 = html[0].querySelector('select[name="maxAtrybut-F2"]');
  const maxAtrybut_F3 = html[0].querySelector('select[name="maxAtrybut-F3"]');
  const maxAtrybut_F4 = html[0].querySelector('select[name="maxAtrybut-F4"]');
  const maxAtrybut_F5 = html[0].querySelector('select[name="maxAtrybut-F5"]');

  const maxUmiejetnosc_P1 = html[0].querySelector('select[name="max-umiejetnosc-P1"]');
  const maxUmiejetnosc_P2 = html[0].querySelector('select[name="max-umiejetnosc-P2"]');
  const maxUmiejetnosc_P3 = html[0].querySelector('select[name="max-umiejetnosc-P3"]');
  const maxUmiejetnosc_P4 = html[0].querySelector('select[name="max-umiejetnosc-P4"]');
  const maxUmiejetnosc_P5 = html[0].querySelector('select[name="max-umiejetnosc-P5"]');

  const maxUmiejetnosc_Bo1 = html[0].querySelector('select[name="max-umiejetnosc-Bo1"]');
  const maxUmiejetnosc_Bo2 = html[0].querySelector('select[name="max-umiejetnosc-Bo2"]');
  const maxUmiejetnosc_Bo3 = html[0].querySelector('select[name="max-umiejetnosc-Bo3"]');
  const maxUmiejetnosc_Bo4 = html[0].querySelector('select[name="max-umiejetnosc-Bo4"]');
  const maxUmiejetnosc_Bo5 = html[0].querySelector('select[name="max-umiejetnosc-Bo5"]');

  const maxUmiejetnosc_B1 = html[0].querySelector('select[name="max-umiejetnosc-B1"]');
  const maxUmiejetnosc_B2 = html[0].querySelector('select[name="max-umiejetnosc-B2"]');
  const maxUmiejetnosc_B3 = html[0].querySelector('select[name="max-umiejetnosc-B3"]');
  const maxUmiejetnosc_B4 = html[0].querySelector('select[name="max-umiejetnosc-B4"]');
  const maxUmiejetnosc_B5 = html[0].querySelector('select[name="max-umiejetnosc-B5"]');

  const maxUmiejetnosc_F1 = html[0].querySelector('select[name="max-umiejetnosc-F1"]');
  const maxUmiejetnosc_F2 = html[0].querySelector('select[name="max-umiejetnosc-F2"]');
  const maxUmiejetnosc_F3 = html[0].querySelector('select[name="max-umiejetnosc-F3"]');
  const maxUmiejetnosc_F4 = html[0].querySelector('select[name="max-umiejetnosc-F4"]');
  const maxUmiejetnosc_F5 = html[0].querySelector('select[name="max-umiejetnosc-F5"]');

  async function checkboxy() {
    
    if (maxAtrybutCheckbox_P.checked) {
    maxAtrybut_P1.disabled = false;
    maxAtrybut_P2.disabled = false;
    maxAtrybut_P3.disabled = false;
    maxAtrybut_P4.disabled = false;
    maxAtrybut_P5.disabled = false;
    }
    else {
    maxAtrybut_P1.disabled = true;
    maxAtrybut_P2.disabled = true;
    maxAtrybut_P3.disabled = true;
    maxAtrybut_P4.disabled = true;
    maxAtrybut_P5.disabled = true;
    };
    if (maxAtrybutCheckbox_Bo.checked) {
    maxAtrybut_Bo1.disabled = false;
    maxAtrybut_Bo2.disabled = false;
    maxAtrybut_Bo3.disabled = false;
    maxAtrybut_Bo4.disabled = false;
    maxAtrybut_Bo5.disabled = false;
    }
    else {
    maxAtrybut_Bo1.disabled = true;
    maxAtrybut_Bo2.disabled = true;
    maxAtrybut_Bo3.disabled = true;
    maxAtrybut_Bo4.disabled = true;
    maxAtrybut_Bo5.disabled = true;
    };
    if (maxAtrybutCheckbox_B.checked) { 
    maxAtrybut_B1.disabled = false;
    maxAtrybut_B2.disabled = false;
    maxAtrybut_B3.disabled = false;
    maxAtrybut_B4.disabled = false;
    maxAtrybut_B5.disabled = false;
    }
    else {
    maxAtrybut_B1.disabled = true;
    maxAtrybut_B2.disabled = true;
    maxAtrybut_B3.disabled = true;
    maxAtrybut_B4.disabled = true;
    maxAtrybut_B5.disabled = true;
    };
    if (maxAtrybutCheckbox_F.checked) {
    maxAtrybut_F1.disabled = false;
    maxAtrybut_F2.disabled = false;
    maxAtrybut_F3.disabled = false;
    maxAtrybut_F4.disabled = false;
    maxAtrybut_F5.disabled = false;
    }
    else {
    maxAtrybut_F1.disabled = true;
    maxAtrybut_F2.disabled = true;
    maxAtrybut_F3.disabled = true;
    maxAtrybut_F4.disabled = true;
    maxAtrybut_F5.disabled = true;
    };

    if (maxUmiejetnoscCheckbox_P.checked) {
    maxUmiejetnosc_P1.disabled = false;
    maxUmiejetnosc_P2.disabled = false;
    maxUmiejetnosc_P3.disabled = false;
    maxUmiejetnosc_P4.disabled = false;
    maxUmiejetnosc_P5.disabled = false;
    }
    else {
    maxUmiejetnosc_P1.disabled = true;
    maxUmiejetnosc_P2.disabled = true;
    maxUmiejetnosc_P3.disabled = true;
    maxUmiejetnosc_P4.disabled = true;
    maxUmiejetnosc_P5.disabled = true;
    };
    if (maxUmiejetnoscCheckbox_Bo.checked) {
    maxUmiejetnosc_Bo1.disabled = false;
    maxUmiejetnosc_Bo2.disabled = false;
    maxUmiejetnosc_Bo3.disabled = false;
    maxUmiejetnosc_Bo4.disabled = false;
    maxUmiejetnosc_Bo5.disabled = false;
    }
    else {
    maxUmiejetnosc_Bo1.disabled = true;
    maxUmiejetnosc_Bo2.disabled = true;
    maxUmiejetnosc_Bo3.disabled = true;
    maxUmiejetnosc_Bo4.disabled = true;
    maxUmiejetnosc_Bo5.disabled = true;
    };
    if (maxUmiejetnoscCheckbox_B.checked) {
    maxUmiejetnosc_B1.disabled = false;
    maxUmiejetnosc_B2.disabled = false;
    maxUmiejetnosc_B3.disabled = false;
    maxUmiejetnosc_B4.disabled = false;
    maxUmiejetnosc_B5.disabled = false;
    }
    else {
    maxUmiejetnosc_B1.disabled = true;
    maxUmiejetnosc_B2.disabled = true;
    maxUmiejetnosc_B3.disabled = true;
    maxUmiejetnosc_B4.disabled = true;
    maxUmiejetnosc_B5.disabled = true;
    };
    if (maxUmiejetnoscCheckbox_F.checked) {
    maxUmiejetnosc_F1.disabled = false;
    maxUmiejetnosc_F2.disabled = false;
    maxUmiejetnosc_F3.disabled = false;
    maxUmiejetnosc_F4.disabled = false;
    maxUmiejetnosc_F5.disabled = false;
    }
    else {
    maxUmiejetnosc_F1.disabled = true;
    maxUmiejetnosc_F2.disabled = true;
    maxUmiejetnosc_F3.disabled = true;
    maxUmiejetnosc_F4.disabled = true;
    maxUmiejetnosc_F5.disabled = true;
    };
  }
  
  checkboxy();

  maxAtrybutCheckbox_P.addEventListener("change", checkboxy);
  maxAtrybutCheckbox_Bo.addEventListener("change", checkboxy);
  maxAtrybutCheckbox_B.addEventListener("change", checkboxy);
  maxAtrybutCheckbox_F.addEventListener("change", checkboxy);

  maxUmiejetnoscCheckbox_P.addEventListener("change", checkboxy);
  maxUmiejetnoscCheckbox_Bo.addEventListener("change", checkboxy);
  maxUmiejetnoscCheckbox_B.addEventListener("change", checkboxy);
  maxUmiejetnoscCheckbox_F.addEventListener("change", checkboxy);
}

async function wczytajWagi(html) {
  const wagi = await game.settings.get("swade-npc-forge-eph", "waga");

  html.find("input[name='npcforge-waga1']").val(wagi[0]);
  html.find("input[name='npcforge-waga2']").val(wagi[1]);
  html.find("input[name='npcforge-waga3']").val(wagi[2]);

  wagiProcenty(html, wagi);
}

async function zapiszWagi(html) {
  html.find("input[name^='npcforge-waga']").on("input", () => {
    const wagi = [
      Number(html.find("input[name='npcforge-waga1']").val()) || 0,
      Number(html.find("input[name='npcforge-waga2']").val()) || 0,
      Number(html.find("input[name='npcforge-waga3']").val()) || 0
    ];

    game.settings.set("swade-npc-forge-eph", "waga", wagi);
    wagiProcenty(html, wagi);
  });

  html.find("input[name^='npcforge-waga']").each((_, el) => {
    zabezpieczPoleLiczbowe($(el), 1);
  });
}

async function resetWagi(html) {
  
  html.find("#resetujWagi").on("click", async () => {
    const domyslne = game.settings.settings.get("swade-npc-forge-eph.waga").default;

    html.find("input[name='npcforge-waga1']").val(domyslne[0]);
    html.find("input[name='npcforge-waga2']").val(domyslne[1]);
    html.find("input[name='npcforge-waga3']").val(domyslne[2]);

    await game.settings.set("swade-npc-forge-eph", "waga", domyslne);
    wagiProcenty(html, domyslne);
  });
}

async function wagiProcenty(html, wagi) {

  let suma = wagi[0]+wagi[1]+wagi[2];
  let box1 = (wagi[0]/suma)*100;
  let box2 = (wagi[1]/suma)*100;
  let box3 = 100 - box1 - box2;

  html.find("input[name='npcforge-wagaProc1']").val(`${Math.round(box1)}%`);
  html.find("input[name='npcforge-wagaProc2']").val(`${Math.round(box2)}%`);
  html.find("input[name='npcforge-wagaProc3']").val(`${Math.round(box3)}%`);
}

async function wczytajPostac(html, typ) {
  const punkty = await game.settings.get("swade-npc-forge-eph", `punkty-${typ}`);
  const limity = await game.settings.get("swade-npc-forge-eph", `limity-${typ}`);
  const opcje  = await game.settings.get("swade-npc-forge-eph", `opcje-${typ}`);

  // Punkty
  html.find(`input[name='punkty-atrybutow-${typ}1']`).val(punkty[0]);
  html.find(`input[name='punkty-atrybutow-${typ}2']`).val(punkty[1]);
  html.find(`input[name='punkty-atrybutow-${typ}3']`).val(punkty[2]);
  html.find(`input[name='punkty-atrybutow-${typ}4']`).val(punkty[3]);
  html.find(`input[name='punkty-atrybutow-${typ}5']`).val(punkty[4]);

  html.find(`input[name='punkty-umiejetnosci-${typ}1']`).val(punkty[5]);
  html.find(`input[name='punkty-umiejetnosci-${typ}2']`).val(punkty[6]);
  html.find(`input[name='punkty-umiejetnosci-${typ}3']`).val(punkty[7]);
  html.find(`input[name='punkty-umiejetnosci-${typ}4']`).val(punkty[8]);
  html.find(`input[name='punkty-umiejetnosci-${typ}5']`).val(punkty[9]);

  html.find(`input[name='punkty-przewag-${typ}1']`).val(punkty[10]);
  html.find(`input[name='punkty-przewag-${typ}2']`).val(punkty[11]);
  html.find(`input[name='punkty-przewag-${typ}3']`).val(punkty[12]);
  html.find(`input[name='punkty-przewag-${typ}4']`).val(punkty[13]);
  html.find(`input[name='punkty-przewag-${typ}5']`).val(punkty[14]);

  // Limity
  html.find(`input[name='maxAtrybutCheckbox-${typ}']`).prop("checked", limity[0]);
  html.find(`select[name='maxAtrybut-${typ}1']`).val(limity[1]);
  html.find(`select[name='maxAtrybut-${typ}2']`).val(limity[2]);
  html.find(`select[name='maxAtrybut-${typ}3']`).val(limity[3]);
  html.find(`select[name='maxAtrybut-${typ}4']`).val(limity[4]);
  html.find(`select[name='maxAtrybut-${typ}5']`).val(limity[5]);

  html.find(`input[name='maxUmiejetnoscCheckbox-${typ}']`).prop("checked", limity[6]);
  html.find(`select[name='max-umiejetnosc-${typ}1']`).val(limity[7]);
  html.find(`select[name='max-umiejetnosc-${typ}2']`).val(limity[8]);
  html.find(`select[name='max-umiejetnosc-${typ}3']`).val(limity[9]);
  html.find(`select[name='max-umiejetnosc-${typ}4']`).val(limity[10]);
  html.find(`select[name='max-umiejetnosc-${typ}5']`).val(limity[11]);

  // Opcje
  html.find(`input[name='losujZawady-${typ}']`).prop("checked", opcje[0]);
  html.find(`input[name='zawadyOd-${typ}']`).val(opcje[1]);
  html.find(`input[name='zawadyDo-${typ}']`).val(opcje[2]);
  html.find(`input[name='przestrzegajZasad-${typ}']`).prop("checked", opcje[3]);
  html.find(`input[name='zezwolNaAnomalie-${typ}']`).prop("checked", opcje[4]);
  html.find(`input[name='anomalieSzansa-${typ}']`).val(opcje[5]);

  sumaPunktow(html, typ, punkty);
}


async function zapiszPostac(html, typ) {
  html.find("input, select").on("input change", () => {
    const punkty = [
      Number(html.find(`input[name='punkty-atrybutow-${typ}1']`).val()) || 0,
      Number(html.find(`input[name='punkty-atrybutow-${typ}2']`).val()) || 0,
      Number(html.find(`input[name='punkty-atrybutow-${typ}3']`).val()) || 0,
      Number(html.find(`input[name='punkty-atrybutow-${typ}4']`).val()) || 0,
      Number(html.find(`input[name='punkty-atrybutow-${typ}5']`).val()) || 0,
      Number(html.find(`input[name='punkty-umiejetnosci-${typ}1']`).val()) || 0,
      Number(html.find(`input[name='punkty-umiejetnosci-${typ}2']`).val()) || 0,
      Number(html.find(`input[name='punkty-umiejetnosci-${typ}3']`).val()) || 0,
      Number(html.find(`input[name='punkty-umiejetnosci-${typ}4']`).val()) || 0,
      Number(html.find(`input[name='punkty-umiejetnosci-${typ}5']`).val()) || 0,
      Number(html.find(`input[name='punkty-przewag-${typ}1']`).val()) || 0,
      Number(html.find(`input[name='punkty-przewag-${typ}2']`).val()) || 0,
      Number(html.find(`input[name='punkty-przewag-${typ}3']`).val()) || 0,
      Number(html.find(`input[name='punkty-przewag-${typ}4']`).val()) || 0,
      Number(html.find(`input[name='punkty-przewag-${typ}5']`).val()) || 0
    ];

    const limity = [
      html.find(`input[name='maxAtrybutCheckbox-${typ}']`).prop("checked"),
      html.find(`select[name='maxAtrybut-${typ}1']`).val(),
      html.find(`select[name='maxAtrybut-${typ}2']`).val(),
      html.find(`select[name='maxAtrybut-${typ}3']`).val(),
      html.find(`select[name='maxAtrybut-${typ}4']`).val(),
      html.find(`select[name='maxAtrybut-${typ}5']`).val(),
      html.find(`input[name='maxUmiejetnoscCheckbox-${typ}']`).prop("checked"),
      html.find(`select[name='max-umiejetnosc-${typ}1']`).val(),
      html.find(`select[name='max-umiejetnosc-${typ}2']`).val(),
      html.find(`select[name='max-umiejetnosc-${typ}3']`).val(),
      html.find(`select[name='max-umiejetnosc-${typ}4']`).val(),
      html.find(`select[name='max-umiejetnosc-${typ}5']`).val()
    ];

    const opcje = [
      html.find(`input[name='losujZawady-${typ}']`).prop("checked"),
      html.find(`input[name='zawadyOd-${typ}']`).val(),
      html.find(`input[name='zawadyDo-${typ}']`).val(),
      html.find(`input[name='przestrzegajZasad-${typ}']`).prop("checked"),
      html.find(`input[name='zezwolNaAnomalie-${typ}']`).prop("checked"),
      html.find(`input[name='anomalieSzansa-${typ}']`).val()
    ];

    game.settings.set("swade-npc-forge-eph", `punkty-${typ}`, punkty);
    game.settings.set("swade-npc-forge-eph", `limity-${typ}`, limity);
    game.settings.set("swade-npc-forge-eph", `opcje-${typ}`, opcje);

    sumaPunktow(html, typ, punkty);
  });

  // Zabezpieczenie pól liczbowych przez poprawkę na blur
  html.find(`input[name^='punkty-']`).each((_, el) => {
    zabezpieczPoleLiczbowe($(el), 0);
  });

  html.find(`input[name^='zawady']`).each((_, el) => {
    zabezpieczPoleLiczbowe($(el), 0);
  });

  html.find(`input[name^='anomalieSzansa']`).each((_, el) => {
    zabezpieczPoleLiczbowe($(el), 0, 100);
  });

  zabezpieczZakresZawad(html, typ);
}


async function resetPostac(html, typ) {

  function reset(html) {
    const punkty = game.settings.settings.get(`swade-npc-forge-eph.punkty-${typ}`).default;
    const limity = game.settings.settings.get(`swade-npc-forge-eph.limity-${typ}`).default;
    const opcje = game.settings.settings.get(`swade-npc-forge-eph.opcje-${typ}`).default;

    html.find(`input[name='punkty-atrybutow-${typ}1']`).val(punkty[0]);
    html.find(`input[name='punkty-atrybutow-${typ}2']`).val(punkty[1]);
    html.find(`input[name='punkty-atrybutow-${typ}3']`).val(punkty[2]);
    html.find(`input[name='punkty-atrybutow-${typ}4']`).val(punkty[3]);
    html.find(`input[name='punkty-atrybutow-${typ}5']`).val(punkty[4]);

    html.find(`input[name='punkty-umiejetnosci-${typ}1']`).val(punkty[5]);
    html.find(`input[name='punkty-umiejetnosci-${typ}2']`).val(punkty[6]);
    html.find(`input[name='punkty-umiejetnosci-${typ}3']`).val(punkty[7]);
    html.find(`input[name='punkty-umiejetnosci-${typ}4']`).val(punkty[8]);
    html.find(`input[name='punkty-umiejetnosci-${typ}5']`).val(punkty[9]);

    html.find(`input[name='punkty-przewag-${typ}1']`).val(punkty[10]);
    html.find(`input[name='punkty-przewag-${typ}2']`).val(punkty[11]);
    html.find(`input[name='punkty-przewag-${typ}3']`).val(punkty[12]);
    html.find(`input[name='punkty-przewag-${typ}4']`).val(punkty[13]);
    html.find(`input[name='punkty-przewag-${typ}5']`).val(punkty[14]);

    html.find(`input[name='maxAtrybutCheckbox-${typ}']`).prop("checked", limity[0]);
    html.find(`select[name='maxAtrybut-${typ}1']`).val(limity[1]);
    html.find(`select[name='maxAtrybut-${typ}2']`).val(limity[2]);
    html.find(`select[name='maxAtrybut-${typ}3']`).val(limity[3]);
    html.find(`select[name='maxAtrybut-${typ}4']`).val(limity[4]);
    html.find(`select[name='maxAtrybut-${typ}5']`).val(limity[5]);

    html.find(`input[name='maxUmiejetnoscCheckbox-${typ}']`).prop("checked", limity[6]);
    html.find(`select[name='max-umiejetnosc-${typ}1']`).val(limity[7]);
    html.find(`select[name='max-umiejetnosc-${typ}2']`).val(limity[8]);
    html.find(`select[name='max-umiejetnosc-${typ}3']`).val(limity[9]);
    html.find(`select[name='max-umiejetnosc-${typ}4']`).val(limity[10]);
    html.find(`select[name='max-umiejetnosc-${typ}5']`).val(limity[11]);

    html.find(`input[name='losujZawady-${typ}']`).prop("checked", opcje[0]);
    html.find(`input[name='zawadyOd-${typ}']`).val(opcje[1]);
    html.find(`input[name='zawadyDo-${typ}']`).val(opcje[2]);
    html.find(`input[name='przestrzegajZasad-${typ}']`).prop("checked", opcje[3]);
    html.find(`input[name='zezwolNaAnomalie-${typ}']`).prop("checked", opcje[4]);
    html.find(`input[name='anomalieSzansa-${typ}']`).val(opcje[5]);

    game.settings.set("swade-npc-forge-eph", `punkty-${typ}`, punkty);
    game.settings.set("swade-npc-forge-eph", `limity-${typ}`, limity);
    game.settings.set("swade-npc-forge-eph", `opcje-${typ}`, opcje);

    sumaPunktow(html, typ, punkty);
  }

  html.find(`.npcforge-resetBloku${typ}`).on("click", () => { reset(html); selectory(html) });
}

async function sumaPunktow(html, typ, punkty) {

  let suma1 = punkty[0]+punkty[5]+punkty[10];
  let suma2 = punkty[1]+punkty[6]+punkty[11];
  let suma3 = punkty[2]+punkty[7]+punkty[12];
  let suma4 = punkty[3]+punkty[8]+punkty[13];
  let suma5 = punkty[4]+punkty[9]+punkty[14];

  html.find(`input[name='punkty-suma-${typ}1']`).val(suma1);
  html.find(`input[name='punkty-suma-${typ}2']`).val(suma2);
  html.find(`input[name='punkty-suma-${typ}3']`).val(suma3);
  html.find(`input[name='punkty-suma-${typ}4']`).val(suma4);
  html.find(`input[name='punkty-suma-${typ}5']`).val(suma5);
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

function zabezpieczZakresZawad(html, typ) {
  const poleOd = html.find(`input[name='zawadyOd-${typ}']`);
  const poleDo = html.find(`input[name='zawadyDo-${typ}']`);

  function popraw(val) {
    val = Number(val);
    if (isNaN(val) || val < 0) return 0;
    return Math.round(val);
  }

  function aktualizujOd() {
    const od = popraw(poleOd.val());
    const doVal = popraw(poleDo.val());

    poleOd.val(od);
    if (od > doVal) {
      poleDo.val(od);
      poleDo[0].dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function aktualizujDo() {
    const od = popraw(poleOd.val());
    let doVal = popraw(poleDo.val());

    if (doVal < od) {
      doVal = od;
      poleDo.val(doVal);
    }

    poleDo.val(doVal);
  }

  // zabezpieczenia na blur
  poleOd.on("blur", () => {
    aktualizujOd();
    poleOd[0].dispatchEvent(new Event("input", { bubbles: true }));
  });

  poleDo.on("blur", () => {
    aktualizujDo();
    poleDo[0].dispatchEvent(new Event("input", { bubbles: true }));
  });
}

