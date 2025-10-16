export function ustawienia() {
  game.settings.registerMenu("swade-npc-forge-eph", "menuUstawien", {
    name: game.i18n.localize("NPCForge.UstawieniaNazwa"),
    label: game.i18n.localize("NPCForge.PrzyciskOtworzUstawienia"),
    hint: game.i18n.localize("NPCForge.UstawieniaPodpowiedz"),
    type: oknoUstawien,
    restricted: true
  });

  const pola = ["Archetypy", "Rasy", "Umiejetnosci", "Przewagi", "Zawady", "Moce", "Sprzet", "BronNaturalna"];
  for (const pole of pola) {
    game.settings.register("swade-npc-forge-eph", `kompendium${pole}`, {
      name: "",
      scope: "world",
      config: false,
      type: String,
      default: ""
    });
  }

  // TAGI
  game.settings.register("swade-npc-forge-eph", "listaTagow", {
    name: "",
    scope: "world",
    config: false,
    type: String,
    default: "[]"
  });

  game.settings.register("swade-npc-forge-eph", "ostatniaKategoriaBroniNaturalnej", {
    name: "",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("swade-npc-forge-eph", "przewagiMocy", {
  name: "Zdolności nadprzyrodzone archetypu",
  scope: "world",  // lub "client", jeśli chcesz żeby każdy miał własne
  config: false,   // bo nie wyświetlamy tego w menu
  type: Object,
  default: {
    zdolnosci: [],
    noweMoce: [],
    punktyMocy: []
  }
});

game.settings.register("swade-npc-forge-eph", "waga", {
  name: "Wagi kowadel",
  scope: "world",
  config: false,
  default: [1, 4, 10],
  type: Array
});

// przeciwnik
game.settings.register("swade-npc-forge-eph", "punkty-P", {
  name: "Punkty dla Przeciwnika",
  scope: "world",
  config: false,
  default: [4,5,7,9,11,  8,12,15,18,22,  1,2,4,6,8], // 5 rang × 3 kategorie
  type: Array
});

game.settings.register("swade-npc-forge-eph", "limity-P", {
  name: "Limity kości Przeciwnika",
  scope: "world",
  config: false,
  default: [true, "d8","d10","d12","d12","d12", true, "d8","d10","d12","d12","d12"], // checkbox, 5×Atrybut, checkbox, 5×Umiejętność
  type: Array
});

game.settings.register("swade-npc-forge-eph", "opcje-P", {
  name: "Checkboxy Przeciwnika",
  scope: "world",
  config: false,
  default: [false,1,3,  true,  true,3], // losuj zawady, zawady od, zawady do, zasady rozwoju, anamanie, szansa na anomalie
  type: Array
});

// boss
game.settings.register("swade-npc-forge-eph", "punkty-Bo", {
  name: "Punkty dla Bossa",
  scope: "world",
  config: false,
  default: [6,8,10,12,14,  11,15,17,22,26,  2,4,6,8,10], // 5 rang × 3 kategorie
  type: Array
});

game.settings.register("swade-npc-forge-eph", "limity-Bo", {
  name: "Limity kości Bossa",
  scope: "world",
  config: false,
  default: [true, "d10","d12","d12","d12","d12", true, "d10","d12","d12","d12","d12"], // checkbox, 5×Atrybut, checkbox, 5×Umiejętność
  type: Array
});

game.settings.register("swade-npc-forge-eph", "opcje-Bo", {
  name: "Checkboxy Bossa",
  scope: "world",
  config: false,
  default: [true,1,3,  true,  true,3], // losuj zawady, zawady od, zawady do, zasady rozwoju, anamanie, szansa na anomalie
  type: Array
});

// blotka
game.settings.register("swade-npc-forge-eph", "punkty-B", {
  name: "Punkty dla Blotki",
  scope: "world",
  config: false,
  default: [4,5,7,9,11,  8,12,15,18,22,  1,2,4,6,8], // 5 rang × 3 kategorie
  type: Array
});

game.settings.register("swade-npc-forge-eph", "limity-B", {
  name: "Limity kości Blotki",
  scope: "world",
  config: false,
  default: [true, "d8","d10","d12","d12","d12", true, "d8","d10","d12","d12","d12"], // checkbox, 5×Atrybut, checkbox, 5×Umiejętność
  type: Array
});

game.settings.register("swade-npc-forge-eph", "opcje-B", {
  name: "Checkboxy Blotki",
  scope: "world",
  config: false,
  default: [true,1,3,  true,  true,3], // losuj zawady, zawady od, zawady do, zasady rozwoju, anamanie, szansa na anomalie
  type: Array
});

// figura
game.settings.register("swade-npc-forge-eph", "punkty-F", {
  name: "Punkty dla Figury",
  scope: "world",
  config: false,
  default: [6,8,10,12,14,  11,15,17,22,26,  2,4,6,8,10], // 5 rang × 3 kategorie
  type: Array
});

game.settings.register("swade-npc-forge-eph", "limity-F", {
  name: "Limity kości Figury",
  scope: "world",
  config: false,
  default: [true, "d10","d12","d12","d12","d12", true, "d10","d12","d12","d12","d12"], // checkbox, 5×Atrybut, checkbox, 5×Umiejętność
  type: Array
});

game.settings.register("swade-npc-forge-eph", "opcje-F", {
  name: "Checkboxy Figury",
  scope: "world",
  config: false,
  default: [true,1,3,  true,  true,3], // losuj zawady, zawady od, zawady do, zasady rozwoju, anamanie, szansa na anomalie
  type: Array
});

game.settings.register("swade-npc-forge-eph", "wiadomoscPokazana", {
    name: "NPC Forge: Welcome message",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

game.settings.register("swade-npc-forge-eph", "rasySpozaGeneratora", {
    name: "NPC Forge: Rasy spoza generatora",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

}

class oknoUstawien extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "npc-forge-ustawienia",
      title: game.i18n.localize("NPCForge.UstawieniaTytulOkna"),
      template: "modules/swade-npc-forge-eph/templates/ustawienia.hbs",
      width: 500,
      closeOnSubmit: true
    });
  }

  getData() {
    const kompendia = game.packs.filter(p => p.documentName === "Item");
    const dane = {
      kompendia: kompendia.map(p => ({
        klucz: p.collection,
        nazwa: p.metadata.label
      })),
      wybrane: {
        archetypy: game.settings.get("swade-npc-forge-eph", "kompendiumArchetypy"),
        rasy: game.settings.get("swade-npc-forge-eph", "kompendiumRasy"),
        umiejetnosci: game.settings.get("swade-npc-forge-eph", "kompendiumUmiejetnosci"),
        przewagi: game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi"),
        zawady: game.settings.get("swade-npc-forge-eph", "kompendiumZawady"),
        moce: game.settings.get("swade-npc-forge-eph", "kompendiumMoce"),
        sprzet: game.settings.get("swade-npc-forge-eph", "kompendiumSprzet"),
        bronNaturalna: game.settings.get("swade-npc-forge-eph", "kompendiumBronNaturalna")

      }
    };
    return dane;
  }
  
  async _updateObject(event, formData) {
    for (const [klucz, wartosc] of Object.entries(formData)) {
      await game.settings.set("swade-npc-forge-eph", `kompendium${klucz.charAt(0).toUpperCase() + klucz.slice(1)}`, wartosc);
    }
    ui.notifications.info(game.i18n.localize("NPCForge.UstawieniaPomyslnieZapisano"));
  }
}