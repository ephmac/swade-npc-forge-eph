import { Kosci, losuj, wytnijZakres, modyfikatorKosci, sciankiKosci } from "./narzedzia.js";

export async function generujNPC(daneFormularza){

// Z MAINA
        const archetypId = daneFormularza.get("archetyp");
        const rasaId = daneFormularza.get("rasa");
        const poziomEngNazwa = daneFormularza.get("poziom");
        const typ = daneFormularza.get("typPostaci");
        const nazwa = daneFormularza.get("nazwa");

        let poziomNazwa;
        let poziomNr;
        switch (poziomEngNazwa) {
            case "novice":      poziomNr = 1; poziomNazwa = game.i18n.localize("NPCForge.Nowicjusz"); break;
            case "seasoned":    poziomNr = 2; poziomNazwa = game.i18n.localize("NPCForge.Doswiadczony"); break;
            case "veteran":     poziomNr = 3; poziomNazwa = game.i18n.localize("NPCForge.Weteran"); break;
            case "heroic":      poziomNr = 4; poziomNazwa = game.i18n.localize("NPCForge.Heros"); break;
            case "legendary":   poziomNr = 5; poziomNazwa = game.i18n.localize("NPCForge.Legenda"); break;
        }

// Z OPCJI

        const wagi = game.settings.get("swade-npc-forge-eph", "waga");
        const waga1 = wagi[0];
        const waga2 = wagi[1];
        const waga3 = wagi[2];

        let punkty;
        let limity;
        let opcje;

        let figura;
        let obrazek;

        switch (typ) {
            case "przeciwnik": 
                punkty = game.settings.get("swade-npc-forge-eph", "punkty-P");
                limity = game.settings.get("swade-npc-forge-eph", "limity-P");
                opcje = game.settings.get("swade-npc-forge-eph", "opcje-P");
                obrazek = "modules/swade-npc-forge-eph/icons/Iprzeciwnik.png"
                figura = false;
                break;
            case "boss":
                punkty = game.settings.get("swade-npc-forge-eph", "punkty-Bo");
                limity = game.settings.get("swade-npc-forge-eph", "limity-Bo");
                opcje = game.settings.get("swade-npc-forge-eph", "opcje-Bo");
                obrazek = "modules/swade-npc-forge-eph/icons/Iboss.png"
                figura = true;
                break;
            case "postac":
                punkty = game.settings.get("swade-npc-forge-eph", "punkty-B");
                limity = game.settings.get("swade-npc-forge-eph", "limity-B");
                opcje = game.settings.get("swade-npc-forge-eph", "opcje-B");
                obrazek = "modules/swade-npc-forge-eph/icons/Ipostac.png"
                figura = false;
                break;
            case "bohater":
                punkty = game.settings.get("swade-npc-forge-eph", "punkty-F");
                limity = game.settings.get("swade-npc-forge-eph", "limity-F");
                opcje = game.settings.get("swade-npc-forge-eph", "opcje-F");
                obrazek = "modules/swade-npc-forge-eph/icons/Ibohater.png"
                figura = true;
                break;
        }

        const punktyAtrybutow = punkty[poziomNr-1];
        const punktyUmiejetnosci = punkty[poziomNr+4];
        const punktyPrzewag = punkty[poziomNr+9];

        let limitAtrybut;
        let limitUmiejetnosc;
        if(limity[0] === true) limitAtrybut = limity[poziomNr];
        else limitAtrybut = "d12+11";
        if(limity[6] === true) limitUmiejetnosc = limity[poziomNr+6];
        else limitUmiejetnosc = "d12";

        let ZawadyOd;
        let ZawadyDo;
        if(opcje[0] === true) {
            ZawadyOd = Number(opcje[1]);
            ZawadyDo = Number(opcje[2]);
        } else {
            ZawadyOd = 0;
            ZawadyDo = 0;
        }

        const zasadyRozwoju = opcje[3];

        let anomalie;
        if(opcje[4] === true) anomalie = opcje[5];
        else anomalie = 0;

// Z RASY

        const kompRasa = game.settings.get("swade-npc-forge-eph", "kompendiumRasy");
        const packRasa = game.packs.get(kompRasa);
        const rasaItem = await packRasa.getDocument(rasaId);
        const rasaDane = rasaItem?.flags?.["swade-npc-forge-eph"]?.rasaDane;

// Z ARCHETYPU

        const kompArchetyp = game.settings.get("swade-npc-forge-eph", "kompendiumArchetypy");
        const packArchetyp = game.packs.get(kompArchetyp);
        const archetypItem = await packArchetyp.getDocument(archetypId);
        const archetypDane = archetypItem?.flags?.["swade-npc-forge-eph"]?.archetypDane;

// GENERATOR

    // ATRYBUTY

        const atrybutyRasa = rasaDane.atrybuty;
        let anomaliaZr, anomaliaSp, anomaliaDu, anomaliaSi, anomaliaWi;

        if (Number(atrybutyRasa.zrecznosc[2]) === 0 || !czyAnomalia(anomalie)) anomaliaZr = 0;
        else anomaliaZr = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * atrybutyRasa.zrecznosc[2]) + 1);
        if ( Number(atrybutyRasa.spryt[2]) === 0 || !czyAnomalia(anomalie)) anomaliaSp = 0;
        else anomaliaSp = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * atrybutyRasa.spryt[2]) + 1);
        if ( Number(atrybutyRasa.duch[2]) === 0 || !czyAnomalia(anomalie)) anomaliaDu = 0;
        else anomaliaDu = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * atrybutyRasa.duch[2]) + 1);
        if ( Number(atrybutyRasa.sila[2]) === 0 || !czyAnomalia(anomalie)) anomaliaSi = 0;
        else anomaliaSi = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * atrybutyRasa.sila[2]) + 1);
        if ( Number(atrybutyRasa.wigor[2]) === 0 || !czyAnomalia(anomalie)) anomaliaWi = 0;
        else anomaliaWi = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * atrybutyRasa.wigor[2]) + 1);

        let anomaliaInfoZr; if(anomaliaZr!==0) anomaliaInfoZr = `${game.i18n.localize("NPCForge.Zrecznosc")}: ${anomaliaZr} `; else anomaliaInfoZr = "";
        let anomaliaInfoSp; if(anomaliaSp!==0) anomaliaInfoSp = `${game.i18n.localize("NPCForge.Spryt")}: ${anomaliaSp} `; else anomaliaInfoSp = "";
        let anomaliaInfoDu; if(anomaliaDu!==0) anomaliaInfoDu = `${game.i18n.localize("NPCForge.Duch")}: ${anomaliaDu} `; else anomaliaInfoDu = "";
        let anomaliaInfoSi; if(anomaliaSi!==0) anomaliaInfoSi = `${game.i18n.localize("NPCForge.Sila")}: ${anomaliaSi} `; else anomaliaInfoSi = "";
        let anomaliaInfoWi; if(anomaliaWi!==0) anomaliaInfoWi = `${game.i18n.localize("NPCForge.Wigor")}: ${anomaliaWi} `; else anomaliaInfoWi = "";
        let anomaliaInfo = anomaliaInfoZr+anomaliaInfoSp+anomaliaInfoDu+anomaliaInfoSi+anomaliaInfoWi;
        if (anomaliaInfo !== "") anomaliaInfo = game.i18n.localize("NPCForge.Anomalie")+": "+anomaliaInfoZr+anomaliaInfoSp+anomaliaInfoDu+anomaliaInfoSi+anomaliaInfoWi+"<br><br>";

        let limAtrLicz = Kosci.Liczba(limitAtrybut, "D");

        let poczatkowaZr = Kosci.Liczba(atrybutyRasa.zrecznosc[0], "D")+anomaliaZr; if(poczatkowaZr < 0) poczatkowaZr = 0;
        let koncowaZr = Kosci.Liczba(atrybutyRasa.zrecznosc[1], "D")+anomaliaZr; if(koncowaZr > 18) koncowaZr = 18; if (koncowaZr > limAtrLicz) koncowaZr = limAtrLicz;
        let poczatkowySp = Kosci.Liczba(atrybutyRasa.spryt[0], "D")+anomaliaSp; if(poczatkowySp < 0) poczatkowySp = 0;
        let koncowySp = Kosci.Liczba(atrybutyRasa.spryt[1], "D")+anomaliaSp; if(koncowySp > 18) koncowySp = 18; if (koncowySp > limAtrLicz) koncowySp = limAtrLicz;
        let poczatkowyDu = Kosci.Liczba(atrybutyRasa.duch[0], "D")+anomaliaDu; if(poczatkowyDu < 0) poczatkowyDu = 0;
        let koncowyDu = Kosci.Liczba(atrybutyRasa.duch[1], "D")+anomaliaDu; if(koncowyDu > 18) koncowyDu = 18; if (koncowyDu > limAtrLicz) koncowyDu = limAtrLicz;
        let poczatkowaSi = Kosci.Liczba(atrybutyRasa.sila[0], "D")+anomaliaSi; if(poczatkowaSi < 0) poczatkowaSi = 0;
        let koncowaSi = Kosci.Liczba(atrybutyRasa.sila[1], "D")+anomaliaSi; if(koncowaSi > 18) koncowaSi = 18; if (koncowaSi > limAtrLicz) koncowaSi = limAtrLicz;
        let poczatkowyWi = Kosci.Liczba(atrybutyRasa.wigor[0], "D")+anomaliaWi; if(poczatkowyWi < 0) poczatkowyWi = 0;
        let koncowyWi = Kosci.Liczba(atrybutyRasa.wigor[1], "D")+anomaliaWi; if(koncowyWi > 18) koncowyWi = 18; if (koncowyWi > limAtrLicz) koncowyWi = limAtrLicz;

        let punktyAtr = punktyAtrybutow;

        let zrecznosc = poczatkowaZr;
        let spryt = poczatkowySp;
        let duch = poczatkowyDu;
        let sila = poczatkowaSi;
        let wigor = poczatkowyWi;

        const wagaZr = archetypDane.atrybuty.zrecznosc
        const wagaSp = archetypDane.atrybuty.spryt
        const wagaDu = archetypDane.atrybuty.duch
        const wagaSi = archetypDane.atrybuty.sila
        const wagaWi = archetypDane.atrybuty.wigor

        while (punktyAtr > 0) {
            let listaAtrybutow = [];
            if (wagaZr === 5 && zrecznosc < koncowaZr) listaAtrybutow.push("Zr");
            if (wagaSp === 5 && spryt < koncowaSp) listaAtrybutow.push("Sp");
            if (wagaDu === 5 && duch < koncowaDu) listaAtrybutow.push("Du");
            if (wagaSi === 5 && sila < koncowaSi) listaAtrybutow.push("Si");
            if (wagaWi === 5 && wigor < koncowaWi) listaAtrybutow.push("Wi");

            if (listaAtrybutow.length === 0) break;

            const losowy = listaAtrybutow[Math.floor(Math.random() * listaAtrybutow.length)];
            if (losowy === "Zr") zrecznosc++;
            if (losowy === "Sp") spryt++;
            if (losowy === "Du") duch++;
            if (losowy === "Si") sila++;
            if (losowy === "Wi") wigor++;
            punktyAtr--;
        }

        while (punktyAtr > 0) {
            let listaAtrybutow = [];
            const wagiMapa = {1: 0, 2: waga1, 3: waga2, 4: waga3};

            for (let i = 0; i < wagiMapa[wagaZr]; i++) {if (zrecznosc < koncowaZr) listaAtrybutow.push("Zr");}
            for (let i = 0; i < wagiMapa[wagaSp]; i++) {if (spryt < koncowySp) listaAtrybutow.push("Sp");}
            for (let i = 0; i < wagiMapa[wagaDu]; i++) {if (duch < koncowyDu) listaAtrybutow.push("Du");}
            for (let i = 0; i < wagiMapa[wagaSi]; i++) {if (sila < koncowaSi) listaAtrybutow.push("Si");}
            for (let i = 0; i < wagiMapa[wagaWi]; i++) {if (wigor < koncowyWi) listaAtrybutow.push("Wi");}

            if (listaAtrybutow.length === 0) break;

            const losowy = listaAtrybutow[Math.floor(Math.random() * listaAtrybutow.length)];
            if (losowy === "Zr") zrecznosc++;
            if (losowy === "Sp") spryt++;
            if (losowy === "Du") duch++;
            if (losowy === "Si") sila++;
            if (losowy === "Wi") wigor++;
            punktyAtr--;
        }

    // Umiejętności

        let umiejetnosci = [];
        let umiejetnosciNadprzyrodzone = [];
        let legalneUmiejetnosciNadprzyrodzone = [];
        const umiejetnosciArchetyp = archetypDane.umiejetnosci;
        const umiejetnosciRasa  = rasaDane.umiejetnosci;

        const daneMocy = game.settings.get("swade-npc-forge-eph", "przewagiMocy");
        const zdolnosci = daneMocy.zdolnosci || [];

        for (let i=0; i < zdolnosci.length; i++) {
            umiejetnosciNadprzyrodzone.push(zdolnosci[i].umiejetnosc);
        }

            // najpierw bierzemy wszystko z archetypu
            for (let i = 0; i < umiejetnosciArchetyp.length; i++) {
                const archetypUmi = umiejetnosciArchetyp[i];
                const id = archetypUmi.id;
                const waga = archetypUmi.waga;

                // Szukamy, czy ta umiejętność jest w rasie
                let znalezione = false;
                for (let j = 0; j < umiejetnosciRasa.id.length; j++) {
                
                    if (umiejetnosciRasa.id[j] === id) {
                    umiejetnosci.push({
                        id: id,
                        waga: waga,
                        kosc: umiejetnosciRasa.kosc[j],
                        modyfikator: umiejetnosciRasa.modyfikator[j],
                        pochodzenie: "archetyp"
                    });
                    znalezione = true;
                    if (umiejetnosciNadprzyrodzone.includes(id)) legalneUmiejetnosciNadprzyrodzone.push(id);
                    break;
                    }
                }

                // Jeśli nie znaleźliśmy – to nie ma kości ani modyfikatora
                if (!znalezione) {
                    umiejetnosci.push({
                        id: id,
                        waga: waga,
                        kosc: null,
                        modyfikator: 0,
                        pochodzenie: "archetyp"
                    });
                }
            }

            // teraz dodajemy umiejętności z rasy, których **nie ma** jeszcze na liście
            for (let i = 0; i < umiejetnosciRasa.id.length; i++) {
                const id = umiejetnosciRasa.id[i];

                let juzJest = false;
                for (let j = 0; j < umiejetnosci.length; j++) {
                    if (umiejetnosci[j].id === id) {
                    juzJest = true;
                    break;
                    }
                }

                if (!juzJest) {
                    umiejetnosci.push({
                        id: id,
                        waga: 1,
                        kosc: umiejetnosciRasa.kosc[i],
                        modyfikator: umiejetnosciRasa.modyfikator[i],
                        pochodzenie: "ras"
                    });
                }
            }

            const kompUmiejetnosci = game.settings.get("swade-npc-forge-eph", "kompendiumUmiejetnosci");
            const packUmiejetnosci = game.packs.get(kompUmiejetnosci);
            const umItems = await packUmiejetnosci.getDocuments();

            const mapujAtrybut = {
                agility: "Zr",
                smarts: "Sp",
                spirit: "Du",
                strength: "Si",
                vigor: "Wi"
            };

            for (let i = 0; i < umiejetnosci.length; i++) {
                const um = umiejetnosci[i];

                // Szukamy wpisu po ID lub nazwie
                let item = null;

                if (um.id) {
                    item = umItems.find(it => it.id === um.id);
                }

                if (!item) {
                    ui.notifications.error(`${game.i18n.localize("NPCForge.BladUmiejetnosciGenerator")}${um.pochodzenie}.`);
                    throw new Error(`${game.i18n.localize("NPCForge.BladUmiejetnosciGenerator")}${um.pochodzenie}.`);
                }

                const oryginalny = item.system.attribute;
                um.atrybut = mapujAtrybut[oryginalny];
                um.nazwa = item.name;
            }

            const limitUmIndex = Kosci.Liczba(limitUmiejetnosc, "K");

            let Zr_Umlimit = 4;
            let Sp_Umlimit = 4;
            let Du_Umlimit = 4;
            let Si_Umlimit = 4;
            let Wi_Umlimit = 4;

            if (zasadyRozwoju) {
                if (zrecznosc <= 3) Zr_Umlimit = 0;
                else if (zrecznosc >= 7) Zr_Umlimit = 4;
                else Zr_Umlimit = zrecznosc - 3;

                if (spryt <= 3) Sp_Umlimit = 0;
                else if (spryt >= 7) Sp_Umlimit = 4;
                else Sp_Umlimit = spryt - 3;

                if (duch <= 3) Du_Umlimit = 0;
                else if (duch >= 7) Du_Umlimit = 4;
                else Du_Umlimit = duch - 3;

                if (sila <= 3) Si_Umlimit = 0;
                else if (sila >= 7) Si_Umlimit = 4;
                else Si_Umlimit = sila - 3;

                if (wigor <= 3) Wi_Umlimit = 0;
                else if (wigor >= 7) Wi_Umlimit = 4;
                else Wi_Umlimit = wigor - 3;
            }

            if (Zr_Umlimit > limitUmIndex) Zr_Umlimit = limitUmIndex
            if (Sp_Umlimit > limitUmIndex) Sp_Umlimit = limitUmIndex
            if (Du_Umlimit > limitUmIndex) Du_Umlimit = limitUmIndex      
            if (Si_Umlimit > limitUmIndex) Si_Umlimit = limitUmIndex
            if (Wi_Umlimit > limitUmIndex) Wi_Umlimit = limitUmIndex

            // ustalanie limitów
            for (let i = 0; i < umiejetnosci.length; i++) {
                const um = umiejetnosci[i];
          
                    if (um.atrybut === "Zr") um.limit = Zr_Umlimit;
                    else if (um.atrybut === "Sp") um.limit = Sp_Umlimit;
                    else if (um.atrybut === "Du") um.limit = Du_Umlimit;
                    else if (um.atrybut === "Si") um.limit = Si_Umlimit;
                    else if (um.atrybut === "Wi") um.limit = Wi_Umlimit;
                }

            let punktyUm = 2 * (punktyUmiejetnosci+punktyAtr);

            // waga 5
            while (punktyUm > 0) {
            let lista = [];

            for (let i = 0; i < umiejetnosci.length; i++) {
                const um = umiejetnosci[i];
                const index = Kosci.Liczba(um.kosc, "K");

                if (um.waga === 5 && index < um.limit) {
                lista.push(i); // zapamiętujemy indeks
                }
            }

            if (lista.length === 0) break;

            const los = lista[Math.floor(Math.random() * lista.length)];
            const um = umiejetnosci[los];
            const index = Kosci.Liczba(um.kosc, "K");

            if (index === -1) {
                um.kosc = Kosci.K[0]; // brak kości → d4
            } else {
                um.kosc = Kosci.Plus(um.kosc, "K"); // zwiększamy o 1
            }

            punktyUm--;
            }

            // reszta wag
            while (punktyUm > 0) {
            let lista = [];
            const wagiMapa = { 1: 0, 2: waga1, 3: waga2, 4: waga3 };

            for (let i = 0; i < umiejetnosci.length; i++) {
                const um = umiejetnosci[i];
                const indeksAktualny = Kosci.Liczba(um.kosc || "", "K");

                // brak kości = można rozwinąć do d4
                const rozwijalne = (indeksAktualny === -1) || (indeksAktualny < um.limit);

                if (!rozwijalne) continue;

                for (let j = 0; j < wagiMapa[um.waga]; j++) {
                lista.push(i);
                }
            }

            if (lista.length === 0) break;

            const los = lista[Math.floor(Math.random() * lista.length)];
            const um = umiejetnosci[los];

            if (!um.kosc || um.kosc === "") {
                um.kosc = Kosci.K[0]; // d4
            } else {
                um.kosc = Kosci.Plus(um.kosc, "K");
            }

            punktyUm--;
            }

    // Przewagi

        const kompPrzewagi = game.settings.get("swade-npc-forge-eph", "kompendiumPrzewagi");
        const packPrzewagi = game.packs.get(kompPrzewagi);
        const wszystkiePrzewagi = await packPrzewagi.getDocuments();

        const archPrzewagi = archetypDane.przewagi;
        const rasaPrzewagi = rasaDane.przewagi;

        let przewagi = [];

        // Wszystkie przewagi z rasy – od razu wykupione
        for (let i = 0; i < rasaPrzewagi.length; i++) {
            const p = rasaPrzewagi[i];
            przewagi.push({
                id: p.id,
                nazwa: p.nazwa,
                wykupiono: true
            });
        }

        const przewagiMocy = game.settings.get("swade-npc-forge-eph", "przewagiMocy");
        const wielokrotneID = [...przewagiMocy.noweMoce, ...przewagiMocy.punktyMocy].map(p => p.przewaga);

        // Przewagi z archetypu – tylko jeśli nie są już w liście - oraz istnieją w kompendium. jak nie to wywalamy graczowi na mordę error
        for (let i = 0; i < archPrzewagi.length; i++) {
            const p = archPrzewagi[i];

            const item = wszystkiePrzewagi.find(doc => doc.id === p.id);
            if (!item) {
                ui.notifications.error(`${game.i18n.localize("NPCForge.BladPrzewagGenerator")}`);
                throw new Error(`${game.i18n.localize("NPCForge.BladPrzewagGenerator")}`);
            }

            const juzJest = przewagi.find(pr => pr.id === p.id);

            if (!juzJest) {
                przewagi.push({
                    id: p.id,
                    nazwa: item.name,
                    waga: p.waga,
                    wykupiono: false
                });
                continue;
            }

            // Dodaj dodatkowy klon tylko jeśli to nie jest Nowicjusz
            if (wielokrotneID.includes(p.id) && poziomNr > 1 && juzJest.wykupiono === true) {
                przewagi.push({
                    id: p.id,
                    nazwa: item.name,
                    waga: p.waga,
                    wykupiono: false
                });
            }
        }

        function warunekFigura(value) {
            if (figura === value) return true;
            else return false
        }

        function warunekRanga(value) {
            if (poziomNr >= value +1 ) return true;
            else{
            return false}
        }

        function warunekAtrybut(selector, value) {

            let atrybutPostaciWartosc;

            switch (selector) {
                case "agility":     atrybutPostaciWartosc = zrecznosc; break;
                case "smarts":      atrybutPostaciWartosc = spryt; break;
                case "spirit":      atrybutPostaciWartosc = duch; break;
                case "strength":    atrybutPostaciWartosc = sila; break;
                case "vigor":       atrybutPostaciWartosc = wigor; break;
            };

            let warunekWartosc
            switch (value) {
                case 4:     warunekWartosc = 3; break;
                case 6:     warunekWartosc = 4; break;
                case 8:     warunekWartosc = 5; break;
                case 10:    warunekWartosc = 6; break;
                case 12:    warunekWartosc = 7; break;
            }

        if (atrybutPostaciWartosc >= warunekWartosc) return true;
        else return false;
        }

        function warunekPrzewaga(label) {

            const nazwaZWarunku = label.trim();
            let nazwaZListy;
            let spelnione = false;

            for (let i = 0; i < przewagi.length; i++) {
                nazwaZListy = przewagi[i].nazwa.trim();
                if (nazwaZWarunku === nazwaZListy && przewagi[i].wykupiono === true) spelnione = true;
            }

            return spelnione
        }

        function warunekUmiejetnosc(label, value) {

            let warunekWartosc;
            let nazwaZWarunku = label.trim();
            let nazwaZListy;
            let spelnione = false;

            switch (value) {
            case 4:     warunekWartosc = 0; break;
            case 6:     warunekWartosc = 1; break;
            case 8:     warunekWartosc = 2; break;
            case 10:    warunekWartosc = 3; break;
            case 12:    warunekWartosc = 4; break;
            }

            for (let i = 0; i < umiejetnosci.length; i++) {
                nazwaZListy = umiejetnosci[i].nazwa.trim()

                if(nazwaZWarunku === nazwaZListy) {
                    let kosc = Kosci.Liczba(umiejetnosci[i].kosc, "K");
                    if (kosc >= warunekWartosc) spelnione = true; break;
                }
            }
            return spelnione
        }

        function warunekNadprzyrodzone(item) {

            // Czy przewaga wymaga zdolności nadprzyrodzonych?
            const jestNadprzyrodzona = item.getFlag("swade-npc-forge-eph", "przewagaNadprzyrodzona");

            if (!jestNadprzyrodzona) {
                return true;}

            // Pobierz wymagane ID przewagi dającej moce (albo "dowolna")
            const wymaganeId = item.getFlag("swade-npc-forge-eph", "wymaganaPrzewagaDajacaMoce") || "dowolna";

            // Pobierz z ustawień listę zdolności nadprzyrodzonych
            const daneMocy = game.settings.get("swade-npc-forge-eph", "przewagiMocy");
            const listaZdolnosci = daneMocy.zdolnosci || [];

            // Wyciągnij same ID przewag dających moce
            const listaIdZdolnosci = [];
            for (let i = 0; i < listaZdolnosci.length; i++) {
                listaIdZdolnosci.push(listaZdolnosci[i].przewaga);
            }

            // Jeśli warunkiem jest dowolna zdolność nadprzyrodzona
            if (wymaganeId === "dowolna") {
                for (let i = 0; i < przewagi.length; i++) {
                    if (przewagi[i].wykupiono && listaIdZdolnosci.includes(przewagi[i].id)) {
                        return true;
                    }
                }
               
                return false;
            }

            // Jeśli warunkiem jest konkretna przewaga
            for (let i = 0; i < przewagi.length; i++) {
                if (przewagi[i].wykupiono && przewagi[i].id === wymaganeId) {
                
                return true;
                }
            }

            // Warunek niespełniony           
            return false;
        }

       
        function sprawdzWarunkiPrzewagi(przewagaItem) {

            if (!warunekNadprzyrodzone(przewagaItem)) {
                return false;
            }

            const warunki = przewagaItem.system.requirements || [];
            if (warunki.length === 0) {
                return true;
            }

            const wyniki = [];

            for (let i = 0; i < warunki.length; i++) {
                const warunek = warunki[i];
                let wynik = false;

                switch (warunek.type) {
                    case "rank":
                        wynik = warunekRanga(warunek.value);
                        break;
                    case "attribute":
                        if(zasadyRozwoju) wynik = warunekAtrybut(warunek.selector, warunek.value);
                        else wynik = true;
                        break;
                    case "skill":
                        if(zasadyRozwoju) wynik = warunekUmiejetnosc(warunek.label, warunek.value);
                        else wynik = true;
                        break;
                    case "edge":
                        wynik = warunekPrzewaga(warunek.label);
                        break;
                    case "figure":
                        wynik = warunekFigura(warunek.value);
                        break;
                    default:
                        wynik = true;
                }
                wyniki.push({
                    wynik: wynik,
                    combinator: warunek.combinator || "and"
                });
            }

            const grupy = [];
            let aktualnaGrupa = [wyniki[0]];

            for (let i = 1; i < wyniki.length; i++) {
                const poprzedni = wyniki[i - 1];
                const biezacy = wyniki[i];

                if (poprzedni.combinator === "or") {
                    aktualnaGrupa.push(biezacy);
                } else {
                    grupy.push(aktualnaGrupa);
                    aktualnaGrupa = [biezacy];
                }
            }

            grupy.push(aktualnaGrupa);

            const ocenaGrup = [];

            for (let i = 0; i < grupy.length; i++) {
                const grupa = grupy[i];

                let czyGrupaSpelniona = false;

                for (let j = 0; j < grupa.length; j++) {
                    const val = grupa[j].wynik;
                    if (val === true) czyGrupaSpelniona = true;
                }

                ocenaGrup.push(czyGrupaSpelniona);
            }

            const wynikKoncowy = ocenaGrup.every(v => v);
            return wynikKoncowy;
        }

        function czyMoznaPowtorzycPrzewage(id, poziomNr) {
            const dane = game.settings.get("swade-npc-forge-eph", "przewagiMocy");
            const noweMoce = dane.noweMoce || [];
            const punktyMocy = dane.punktyMocy || [];

            for (let i = 0; i < noweMoce.length; i++) {
                if (noweMoce[i].przewaga === id) return poziomNr > liczbaPowtorzen(id);
            }
            for (let i = 0; i < punktyMocy.length; i++) {
                if (punktyMocy[i].przewaga === id) return poziomNr > liczbaPowtorzen(id);
            }

            return false;
        }

        function liczbaPowtorzen(id) {
            let licznik = 0;
            for (let i = 0; i < przewagi.length; i++) {
                if (przewagi[i].id === id && przewagi[i].wykupiono) {
                    licznik++;
                }
            }
            return licznik;
        }

        function aktualizujStanWarunkow(przewagi, wszystkiePrzewagi) {
            for (let i = 0; i < przewagi.length; i++) {
                const p = przewagi[i];

                if (p.wykupiono === true || p.warunkiSpelnione === true) {
                    continue;}

                const item = wszystkiePrzewagi.find(doc => doc.id === p.id);
                if (!item) {                  
                    continue;}
        if (sprawdzWarunkiPrzewagi(item)) {
            p.warunkiSpelnione = true;
        } else {
            p.warunkiSpelnione = false;
        }
            }
        }

        aktualizujStanWarunkow(przewagi, wszystkiePrzewagi);


        const punktyDodatkowe = Number(rasaDane.modyfikatory.dodatkowe_przewagi);
        let punktyRozwoju = punktyPrzewag + Math.floor(punktyUm/2);

        let punktyPrz = punktyRozwoju + punktyDodatkowe;

        while (punktyPrz > 0) {
            const listaLosowania = [];
            const wagiMapa = { 1: 0, 2: waga1, 3: waga2, 4: waga3 };

            for (let i = 0; i < przewagi.length; i++) {
                const p = przewagi[i];
              
                if (p.wykupiono === true) continue;
                if (p.warunkiSpelnione !== true) continue;

                for (let j = 0; j < wagiMapa[p.waga]; j++) {
                    listaLosowania.push(p);
                }
            }

            if (listaLosowania.length === 0) break;

            const los = listaLosowania[Math.floor(Math.random() * listaLosowania.length)];
            los.wykupiono = true;
            punktyPrz--;

            // Czy może być wykupiona wielokrotnie?
            if (czyMoznaPowtorzycPrzewage(los.id, poziomNr)) {
                // Tworzymy klona – nową "instancję"
                const klon = {
                    ...los,
                    wykupiono: false,
                };
                przewagi.push(klon);
            }

            aktualizujStanWarunkow(przewagi, wszystkiePrzewagi);
        }

        przewagi = przewagi.filter(p => p.wykupiono === true); // zostawiamy tylko wykupione


        //const daneMocy = game.settings.get("swade-npc-forge-eph", "przewagiMocy");
        //const zdolnosci = daneMocy.zdolnosci || [];
            /*Powyższe zostało już zadeklarowane przy okazji umiejętności ale zostawiam dla kontekstu*/
        const noweMoce = daneMocy.noweMoce || [];
        const punktyMocy = daneMocy.punktyMocy || [];

        let arkana = [];
        let LiczbaMocy = 0;
        
        const nazwyArkanow = rasaDane.moce.arkana_nazwy || [];
        const punktyArkanow = rasaDane.moce.arkana_punkty || [];

        for (let i = 0; i < nazwyArkanow.length; i++) {
        arkana.push({
            nazwa: nazwyArkanow[i],
            wartosc: Number(punktyArkanow[i]) || 0
        });
        }

        const ogolnePunktyMocy = game.i18n.localize("NPCForge.OgólnePunktyMocy")

        if (!arkana.some(a => a.nazwa === ogolnePunktyMocy)) {
            arkana.push({ nazwa: ogolnePunktyMocy, wartosc: 0 });
        }
        
        for (let i = 0; i < przewagi.length; i++) {
            const p = przewagi[i];
            if (!p.wykupiono) continue;

            const id = p.id;

            // 1. ZDOLNOŚCI
            for (let z = 0; z < zdolnosci.length; z++) {
            if (zdolnosci[z].przewaga === id) {

                const nazwa = zdolnosci[z].arkana;
                let a = arkana.find(x => x.nazwa === nazwa);
                if (!a) {
                    a = { nazwa, wartosc: 0 };
                    arkana.push(a);
                }

                LiczbaMocy += Number(zdolnosci[z].noweMoce) || 0;
                a.wartosc += Number(zdolnosci[z].punktyMocy) || 0;
                legalneUmiejetnosciNadprzyrodzone.push(zdolnosci[z].umiejetnosc);
            }
            }
        }

        for (let i = 0; i < przewagi.length; i++) {
            const p = przewagi[i];
            if (!p.wykupiono) continue;

            const id = p.id;
        
            // 2. NOWE MOCE
            for (let n = 0; n < noweMoce.length; n++) {
            if (noweMoce[n].przewaga === id) {
                LiczbaMocy += Number(noweMoce[n].noweMoce) || 0;
            }
            }

            // 3. PUNKTY MOCY
            for (let pm = 0; pm < punktyMocy.length; pm++) {
                if (punktyMocy[pm].przewaga === id) {
                    for(let j = 0; j<arkana.length; j++) {
                        arkana[j].wartosc += Number(punktyMocy[pm].punktyMocy) || 0;
                    }
                }
            }
        }

        for (let i = 0; i < umiejetnosci.length; i++) {
            if (umiejetnosciNadprzyrodzone.includes(umiejetnosci[i].id)) {
                if(!legalneUmiejetnosciNadprzyrodzone.includes(umiejetnosci[i].id)) {

                    switch (umiejetnosci[i].kosc) {
                        case "d4": punktyUm += 1; break;
                        case "d6": punktyUm += 2; break;
                        case "d8": punktyUm += 3; break;
                        case "d10": punktyUm += 4; break;
                        case "d12": punktyUm += 5; break;
                        default: break;
                    }
                    umiejetnosci.splice(i, 1);
                    i--;
                }
            }
        }

        const PunktyMocy = {};

        for (let i = 0; i < arkana.length; i++) {
            const nazwa = arkana[i].nazwa;
            const wartosc = arkana[i].wartosc;

            PunktyMocy[nazwa] = {
                max: wartosc,
                value: wartosc  // lub 0 jeśli wolisz, albo coś innego
            };
        }

        if (PunktyMocy[ogolnePunktyMocy]) {
            PunktyMocy.general = PunktyMocy[ogolnePunktyMocy];
            delete PunktyMocy[ogolnePunktyMocy];
        }


        const zwracane = Math.min(punktyPrz, punktyRozwoju);
        punktyUm += zwracane*2;

        //PONOWNE LOSOWANIE UMIEJĘTNOŚCI Z PUNKTÓW KTÓRE ZOSTAŁY
        // waga 5
            while (punktyUm > 0) {
            let lista = [];

            for (let i = 0; i < umiejetnosci.length; i++) {
                const um = umiejetnosci[i];
                const index = Kosci.Liczba(um.kosc, "K");

                if (um.waga === 5 && index < um.limit) {
                lista.push(i); // zapamiętujemy indeks
                }
            }

            if (lista.length === 0) break;

            const los = lista[Math.floor(Math.random() * lista.length)];
            const um = umiejetnosci[los];
            const index = Kosci.Liczba(um.kosc, "K");

            if (index === -1) {
                um.kosc = Kosci.K[0]; // brak kości → d4
            } else {
                um.kosc = Kosci.Plus(um.kosc, "K"); // zwiększamy o 1
            }

            punktyUm--;
            }

            // reszta wag
            while (punktyUm > 0) {
            let lista = [];
            const wagiMapa = { 1: 0, 2: waga1, 3: waga2, 4: waga3 };

            for (let i = 0; i < umiejetnosci.length; i++) {
                const um = umiejetnosci[i];
                const indeksAktualny = Kosci.Liczba(um.kosc || "", "K");

                // brak kości = można rozwinąć do d4
                const rozwijalne = (indeksAktualny === -1) || (indeksAktualny < um.limit);

                if (!rozwijalne) continue;

                for (let j = 0; j < wagiMapa[um.waga]; j++) {
                lista.push(i);
                }
            }

            if (lista.length === 0) break;

            const los = lista[Math.floor(Math.random() * lista.length)];
            const um = umiejetnosci[los];

            if (!um.kosc || um.kosc === "") {
                um.kosc = Kosci.K[0]; // d4
            } else {
                um.kosc = Kosci.Plus(um.kosc, "K");
            }

            punktyUm--;
            }


// MOCE

        const kompMoce = game.settings.get("swade-npc-forge-eph", "kompendiumMoce");
        const packMoce = game.packs.get(kompMoce);
        const wszystkieMoce = await packMoce.getDocuments();


        let moce = [];

        const moceArchetyp = archetypDane.moce;
        const moceRasa  = rasaDane.umiejetnosci;

        // czytamy flage rangi
        for (const mocArchetypu of moceArchetyp) {
            const moc = wszystkieMoce.find(m => m.id === mocArchetypu.id);
            if (!moc) continue;

            const ranga = parseInt(moc.getFlag("swade-npc-forge-eph", "ranga")) || 1;
            moc.ranga = ranga;

            mocArchetypu.ranga = ranga;
        }

        // waga 5
        while (LiczbaMocy > 0) {
            let lista = [];

            for (let i = 0; i < moceArchetyp.length; i++) {
                const moc = moceArchetyp[i];
                const ranga = parseInt(moc.ranga);
                let wykupiono = moc.wykupiono || false;

                if (moc.waga === 5 && poziomNr >= ranga && !wykupiono) lista.push(moc);
            }

            if (lista.length === 0) break;

            const los = lista[Math.floor(Math.random() * lista.length)];
            los.wykupiono = true;

            LiczbaMocy--;
        }

        // reszta wag
        while (LiczbaMocy > 0) {
            let lista = [];
            const wagiMapa = { 1: 0, 2: waga1, 3: waga2, 4: waga3 };

            for (let i = 0; i < moceArchetyp.length; i++) {
                const moc = moceArchetyp[i];
                const ranga = parseInt(moc.ranga);
                let wykupiono = moc.wykupiono || false;
                const waga = moc.waga;

                if (poziomNr >= ranga && !wykupiono) {
                    for (let j=0; j < wagiMapa[waga]; j++) lista.push(moc);
                }
            }

             if (lista.length === 0) break;
                
            const los = lista[Math.floor(Math.random() * lista.length)];
            los.wykupiono = true;
            moce.push(los);
            LiczbaMocy--;
        }

        for (let i = 0; i < moceRasa.length; i++) if (moceRasa[i].wykupiono === true) moce.push(moceRasa[i]);

// PANCERZ

        const pancerzeTryb = archetypDane.pancerzSzczegolowy;
        let wstepnaListaPancerz = [];
        let pancerze = [];
        const wagiMapa = { 1: 0, 2: waga1, 3: waga2, 4: waga3 };

        if (pancerzeTryb) {
            switch (poziomNr) {
                case 1: wstepnaListaPancerz = archetypDane.pancerze["1"]; break;
                case 2: wstepnaListaPancerz = archetypDane.pancerze["2"]; break;
                case 3: wstepnaListaPancerz = archetypDane.pancerze["3"]; break;
                case 4: wstepnaListaPancerz = archetypDane.pancerze["4"]; break;
                case 5: wstepnaListaPancerz = archetypDane.pancerze["5"]; break;
            }
        }
        else wstepnaListaPancerz = archetypDane.pancerze.P;

        let korpus = false;
        let glowa = false;
        let rece = false;
        let nogi = false;

        let listaKorpus = wstepnaListaPancerz.K;
        let listaGlowa = wstepnaListaPancerz.G;
        let listaRece = wstepnaListaPancerz.R;
        let listaNogi = wstepnaListaPancerz.N;

        const kompSprzet = game.settings.get("swade-npc-forge-eph", "kompendiumSprzet");
        const sprzetPack = game.packs.get(kompSprzet);
        const sprzet = await sprzetPack.getDocuments();

        for (let i=0; i<listaKorpus.length; i++) {
            const pancId = listaKorpus[i].id;
            const item = sprzet.find(i => i.id === pancId);

            let K = false, G = false, R = false, N = false;

            if (item) {
                K = item.system.locations.torso;
                G = item.system.locations.head;
                R = item.system.locations.arms;
                N = item.system.locations.legs;
            }
            listaKorpus[i].K = K;
            listaKorpus[i].G = G;
            listaKorpus[i].R = R;
            listaKorpus[i].N = N;
        }

        for (let i=0; i<listaGlowa.length; i++) {
            const pancId = listaGlowa[i].id;
            const item = sprzet.find(i => i.id === pancId);

            let K = false, G = false, R = false, N = false;

            if (item) {
                K = item.system.locations.torso;
                G = item.system.locations.head;
                R = item.system.locations.arms;
                N = item.system.locations.legs;
            }
            listaGlowa[i].K = K;
            listaGlowa[i].G = G;
            listaGlowa[i].R = R;
            listaGlowa[i].N = N;
        }

        for (let i=0; i<listaRece.length; i++) {
            const pancId = listaRece[i].id;
            const item = sprzet.find(i => i.id === pancId);

            let K = false, G = false, R = false, N = false;

            if (item) {
                K = item.system.locations.torso;
                G = item.system.locations.head;
                R = item.system.locations.arms;
                N = item.system.locations.legs;
            }
            listaRece[i].K = K;
            listaRece[i].G = G;
            listaRece[i].R = R;
            listaRece[i].N = N;
        }

        for (let i=0; i<listaNogi.length; i++) {
            const pancId = listaNogi[i].id;
            const item = sprzet.find(i => i.id === pancId);

            let K = false, G = false, R = false, N = false;

            if (item) {
                K = item.system.locations.torso;
                G = item.system.locations.head;
                R = item.system.locations.arms;
                N = item.system.locations.legs;
            }
            listaNogi[i].K = K;
            listaNogi[i].G = G;
            listaNogi[i].R = R;
            listaNogi[i].N = N;
        }

        let listaPanc = [];
        let los;
        
        //KORPUS
        //waga 5
        for (let i = 0; i < listaKorpus.length; i++) {
            const panc = listaKorpus[i];
            const waga = panc.waga

            if (waga === 5) listaPanc.push(panc);
        }
        if (listaPanc.length !== 0) {
            los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

            if (!korpus) korpus = los.K;
            if (!glowa) glowa = los.G;
            if (!rece) rece = los.R;
            if (!nogi) nogi = los.N;

            pancerze.push(los);
        }

        //zerujemy
        listaPanc = [];
        los = null;
        
        //reszta wag
        if(!korpus) {
            for (let i = 0; i < listaKorpus.length; i++) {
                const panc = listaKorpus[i];
                const waga = panc.waga

                for (let j=0; j<wagiMapa[waga]; j++) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }

        //zerujemy
        listaPanc = [];
        los = null;

        //GŁOWA
        //czyszczenie z zajętych lokacji
        let listaCzysta = []
        if (korpus) {
            for (let i=0; i<listaGlowa.length; i++) if (!listaGlowa[i].K) listaCzysta.push(listaGlowa[i])  
            listaGlowa = listaCzysta;
            listaCzysta = []
        }
        if (glowa) {
            for (let i=0; i<listaGlowa.length; i++) if (!listaGlowa[i].G) listaCzysta.push(listaGlowa[i])  
            listaGlowa = listaCzysta;
            listaCzysta = []
        }
        if (rece) {
            for (let i=0; i<listaGlowa.length; i++) if (!listaGlowa[i].R) listaCzysta.push(listaGlowa[i])  
            listaGlowa = listaCzysta;
            listaCzysta = []
        }       
        if (nogi) {
            for (let i=0; i<listaGlowa.length; i++) if (!listaGlowa[i].N) listaCzysta.push(listaGlowa[i])  
            listaGlowa = listaCzysta;
            listaCzysta = []    
        }
  
        //waga 5
        if(!glowa) {
            for (let i = 0; i < listaGlowa.length; i++) {
                const panc = listaGlowa[i];
                const waga = panc.waga

                if (waga === 5) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }
        //zerujemy
        listaPanc = [];
        los = null;
        
        //reszta wag
        if(!glowa) {
            for (let i = 0; i < listaGlowa.length; i++) {
                const panc = listaGlowa[i];
                const waga = panc.waga

                for (let j=0; j<wagiMapa[waga]; j++) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }        

        //zerujemy
        listaPanc = [];
        los = null;

        //RĘCE
        //czyszczenie z zajętych lokacji
        if (korpus) {
            for (let i=0; i<listaRece.length; i++) if (!listaRece[i].K) listaCzysta.push(listaRece[i])  
            listaRece = listaCzysta;
            listaCzysta = []
        }
        if (glowa) {
            for (let i=0; i<listaRece.length; i++) if (!listaRece[i].G) listaCzysta.push(listaRece[i])  
            listaRece = listaCzysta;
            listaCzysta = []
        }
        if (rece) {
            for (let i=0; i<listaRece.length; i++) if (!listaRece[i].R) listaCzysta.push(listaRece[i])  
            listaRece = listaCzysta;
            listaCzysta = []
        }    
        if (nogi) {
            for (let i=0; i<listaRece.length; i++) if (!listaRece[i].N) listaCzysta.push(listaRece[i])  
            listaRece = listaCzysta;
            listaCzysta = []
        }

        //waga 5
        if(!rece) {
            for (let i = 0; i < listaRece.length; i++) {
                const panc = listaRece[i];
                const waga = panc.waga

                if (waga === 5) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }
        //zerujemy
        listaPanc = [];
        los = null;
        
        //reszta wag
        if(!rece) {
            for (let i = 0; i < listaRece.length; i++) {
                const panc = listaRece[i];
                const waga = panc.waga

                for (let j=0; j<wagiMapa[waga]; j++) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }        

        //zerujemy
        listaPanc = [];
        los = null;

        //NOGI
        //czyszczenie z zajętych lokacji
        if (korpus) {
            for (let i=0; i<listaNogi.length; i++) if (!listaNogi[i].K) listaCzysta.push(listaNogi[i])  
            listaNogi = listaCzysta;
            listaCzysta = []
        }
        if (glowa) {
            for (let i=0; i<listaNogi.length; i++) if (!listaNogi[i].G) listaCzysta.push(listaNogi[i])  
            listaNogi = listaCzysta;
            listaCzysta = []
        }
        if (rece) {
            for (let i=0; i<listaNogi.length; i++) if (!listaNogi[i].R) listaCzysta.push(listaNogi[i])  
            listaNogi = listaCzysta;
            listaCzysta = []
        }    
        if (nogi) {
            for (let i=0; i<listaNogi.length; i++) if (!listaNogi[i].N) listaCzysta.push(listaNogi[i])  
            listaNogi = listaCzysta;
            listaCzysta = []
        }

        //waga 5
        if(!nogi) {
            for (let i = 0; i < listaNogi.length; i++) {
                const panc = listaNogi[i];
                const waga = panc.waga

                if (waga === 5) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }
        //zerujemy
        listaPanc = [];
        los = null;
        
        //reszta wag
        if(!nogi) {
            for (let i = 0; i < listaNogi.length; i++) {
                const panc = listaNogi[i];
                const waga = panc.waga

                for (let j=0; j<wagiMapa[waga]; j++) listaPanc.push(panc);
            }
            if (listaPanc.length !== 0) {
                los = listaPanc[Math.floor(Math.random() * listaPanc.length)];

                if (!korpus) korpus = los.K;
                if (!glowa) glowa = los.G;
                if (!rece) rece = los.R;
                if (!nogi) nogi = los.N;

                pancerze.push(los);
            }
        }        

        //zerujemy
        listaPanc = [];
        los = null;

// BROŃ

        const bronTryb = archetypDane.bronSzczegolowa;
        let wstepnaListaBron = [];
        let bronie = [];
        
        //const wagiMapa = { 1: 0, 2: waga1, 3: waga2, 4: waga3 }; to tylko dla kontekstu, jest już wyzej

        if (bronTryb) {
            switch (poziomNr) {
                case 1: wstepnaListaBron = archetypDane.bron["1"]; break;
                case 2: wstepnaListaBron = archetypDane.bron["2"]; break;
                case 3: wstepnaListaBron = archetypDane.bron["3"]; break;
                case 4: wstepnaListaBron = archetypDane.bron["4"]; break;
                case 5: wstepnaListaBron = archetypDane.bron["5"]; break;
            }
        }
        else wstepnaListaBron = archetypDane.bron.P;

        const zestawyBron = wstepnaListaBron?.zestawy || [];

        // dla każdego zestawu
        for (let i=0; i<zestawyBron.length; i++) {

            //najpierw trzeba wylosować wariant
            const warianty = zestawyBron[i].warianty
            let listaDoLosowania = [];

            for (let j=0; j<warianty.length; j++) {
                const wariant = warianty[j];
                const waga = wariant.waga;

                if (waga === 5) listaDoLosowania.push(wariant);
            }

            if (listaDoLosowania.length === 0) {
                for (let j=0; j<warianty.length; j++) {
                    const wariant = warianty[j];
                    const waga = wariant.waga;

                    for (let j=0; j<wagiMapa[waga]; j++) listaDoLosowania.push(wariant);
                }
            }

            const wylosowanyWariant = listaDoLosowania[Math.floor(Math.random() * listaDoLosowania.length)];

            //teraz w wariancie trzeba wylosować po jednym elemencie w slocie 1 i 2. 2 może nie istnieć.
            const sloty = wylosowanyWariant.sloty;

            for (const key in sloty) {
                const slot = Array.isArray(sloty[key]) ? sloty[key] : [sloty[key]];
                listaDoLosowania = [];

                for (let k=0; k<slot.length; k++) {
                    const element = slot[k];
                    const waga = element.waga;

                    if (waga === 5) listaDoLosowania.push(element);
                }

                if (listaDoLosowania.length === 0) {
                    for (let k=0; k<slot.length; k++) {
                        const element = slot[k];
                        const waga = element.waga;

                        for (let l=0; l<wagiMapa[waga]; l++) listaDoLosowania.push(element);
                    }
                }

                const wylosowanyElement = listaDoLosowania[Math.floor(Math.random() * listaDoLosowania.length)];
                bronie.push(wylosowanyElement);
            }
        }

        // Zamieniamy UUID z kompendium na ID
        const idBroni = bronie.map(e => {
        if (typeof e === "string") {
            if (e.includes(".")) {
            const [modul, packName, entryId] = e.split(".");
            if (`${modul}.${packName}` === kompendiumId) return entryId;
            return null;
            }
            return e;
        } else if (typeof e === "object" && e?.id) {
            return e.id;
        }
        return null;
        }).filter(Boolean);


        // Pobieramy broń
        const bronieZKompendium = sprzet.filter(i => idBroni.includes(i.id));

        // Lista amunicji do dodania
        const doDodaniaAmunicja = [];

        for (const bron of bronieZKompendium) {
            const ilosc = await bron.getFlag("swade-npc-forge-eph", "amunicjaIlosc");

            if (!ilosc || ilosc <= 0) continue;

            const nazwaAmunicji = bron.system?.ammo?.trim();
            if (!nazwaAmunicji) continue;

            // Szukamy dowolnego itemu o tej nazwie
            const pasujacy = sprzet.find(item => item.name === nazwaAmunicji);
            if (!pasujacy) continue;

            // Klon + ustawienie quantity
            const kopia = await pasujacy.clone({ system: { quantity: ilosc } });
            doDodaniaAmunicja.push(kopia);
        }


// TABLICE

        const tablice = rasaDane.tablice;
        let wynikTablic = "";

        for (let i = 0; i < tablice.length; i++) {
            const uuid = tablice[i];
            const tabela = await fromUuid(uuid);

            if (tabela instanceof RollTable) {
                const wynik = await tabela.draw({ displayChat: false });
                const name = wynik.results[0]?.name || "";
                const tekst = wynik.results[0]?.text || "";
                const desc = wynik.results[0]?.description || "";
                let ostatecznyWynik = "ERROR";

                if(name !== "") ostatecznyWynik = name;
                else if (tekst !== "") ostatecznyWynik = tekst;
                else if (desc !== "") ostatecznyWynik = desc;

                wynikTablic += `${tabela.name}: "${ostatecznyWynik}"<br><br>`;
            } else {
                wynikTablic += `Nie znaleziono tablicy dla ${uuid}<br>`;
            }
        }

// ZAWADY

        const zawadyZRasy = Number(rasaDane.modyfikatory.dodatkowe_zawady);   
        let liczbaZawad = (Math.floor(Math.random() * (ZawadyDo - ZawadyOd + 1)) + ZawadyOd) + zawadyZRasy;

        const kompZawady = game.settings.get("swade-npc-forge-eph", "kompendiumZawady");
        const packZawady = game.packs.get(kompZawady);
        const wszystkieZawady = await packZawady.getDocuments();

        let zawady = [];

        while (liczbaZawad > 0) {

            let lista = [];

            for (let i=0; i < wszystkieZawady.length; i++) if (!zawady.includes(wszystkieZawady[i])) lista.push(wszystkieZawady[i]);

            if (lista.length === 0) break;

            const los = lista[Math.floor(Math.random() * lista.length)];

            zawady.push(los);

            liczbaZawad--;
        }

///////////////////

        zrecznosc = Kosci.Tekst(zrecznosc, "D");
        spryt = Kosci.Tekst(spryt, "D");
        duch = Kosci.Tekst(duch, "D");
        sila = Kosci.Tekst(sila, "D");
        wigor = Kosci.Tekst(wigor, "D");

        const zwierzecySpryt = rasaDane.atrybuty.zwierzecySpryt;
        const rozmiar = rasaDane.modyfikatory.rozmiar.rozmiar;
        let zasiegAtaku = rasaDane.modyfikatory.rozmiar.zasieg_ataku || "";
        if (zasiegAtaku === "-") zasiegAtaku = "";
        let zasiegOpis = ""
        if(zasiegAtaku!=="") zasiegOpis = `${game.i18n.localize("NPCForge.ZasiegAtaku")}: ${zasiegAtaku}<br><br>`

        let maxRanyRozmiar = rasaDane.modyfikatory.rozmiar.maksymalne_rany;
        if( maxRanyRozmiar === "-") maxRanyRozmiar = 0;
        const zastosujRany = rasaDane.modyfikatory.rozmiar.zastosuj_maksymalne_rany;
        if (zastosujRany) maxRanyRozmiar = Number(maxRanyRozmiar);
        else maxRanyRozmiar = 0;

        let tempoNaZiemi = Number(rasaDane.modyfikatory.tempo.tempo_na_ziemi);
            if (tempoNaZiemi === 0) tempoNaZiemi = null;
        let tempoLot = Number(rasaDane.modyfikatory.tempo.tempo_lot);
            if (tempoLot === 0) tempoLot = null;
        let tempoPlywanie = Number(rasaDane.modyfikatory.tempo.tempo_plywanie);
            if (tempoPlywanie === 0) tempoPlywanie = null;
        let tempoPodZiemia = Number(rasaDane.modyfikatory.tempo.tempo_pod_ziemia);
            if (tempoPodZiemia === 0) tempoPodZiemia = null;
        let tempoDomyslneRasa = rasaDane.modyfikatory.tempo.tempo_domyslne;
        let koscBiegania = Number(rasaDane.modyfikatory.tempo.kosc_biegania.slice(1));
        let modyfikatorKosciBiegania = Number(rasaDane.modyfikatory.tempo.modyfikator_kosci_biegania);
            if (modyfikatorKosciBiegania === 0) modyfikatorKosciBiegania = null;

        let tempoDomyslne;
        switch (tempoDomyslneRasa) {
            case "na_ziemi": tempoDomyslne = "ground"; break;
            case "lot": tempoDomyslne = "fly"; break;
            case "plywanie": tempoDomyslne = "swim"; break;
            case "pod_ziemia": tempoDomyslne = "burrow"; break;
        }

        let opis;
        opis = anomaliaInfo+wynikTablic+zasiegOpis;

        const obrona = Number(rasaDane.modyfikatory.modyfikator_obrony);
        const wytrzymalosc = Number(rasaDane.modyfikatory.modyfikator_wytrzymalosci);

        let ranyFigura = 0;
        let fuksyFigura = 0
        if (figura) {ranyFigura = 3; fuksyFigura = 2;}
        let maxRany = Number(rasaDane.modyfikatory.maksimum_ran) + maxRanyRozmiar + ranyFigura;
        if (maxRany < 0) maxRany = 0;
        const ingnorowanieRan = Number(rasaDane.modyfikatory.ignorowanie_ran);

        let maxZmeczenie = Number(rasaDane.modyfikatory.maksimum_zmeczenia) + 2;
        if (maxZmeczenie < 0) maxZmeczenie = 0;
        const ingnorowanieZmeczenia = Number(rasaDane.modyfikatory.ignorowanie_zmeczenia);
        
        const fuksy = Number(rasaDane.modyfikatory.modyfikator_fuksow) + fuksyFigura;

        const modSzok = Number(rasaDane.modyfikatory.modyfikator_wyjscia_z_szoku);
        const modWyparowanie = Number(rasaDane.modyfikatory.modyfikator_wyparowania);

// poziom poziomEngNazwa 

// TWORZENIE AKTORA

const aktor = await Actor.create({
  name: nazwa,
  type: "npc",
  img: obrazek,
  system: {
    advances: {
        mode: "legacy",
        rank: poziomNazwa,
        value: 0,
    },
    attributes: {
        agility: {
            die: {
                modifier: modyfikatorKosci(zrecznosc),
                sides: sciankiKosci(zrecznosc),
            }
        },
        smarts: {
            animal: zwierzecySpryt,
            die: {
                modifier: modyfikatorKosci(spryt),
                sides: sciankiKosci(spryt),
            }
        },
        spirit: {
            die: {
                modifier: modyfikatorKosci(duch),
                sides: sciankiKosci(duch),
            },
            unShakeBonus: modSzok,
        },
        strength: {
            die: {
                modifier: modyfikatorKosci(sila),
                sides: sciankiKosci(sila),
            }
        },
        vigor: {
            die: {
                modifier: modyfikatorKosci(wigor),
                sides: sciankiKosci(wigor),
            },
            soakBonus: modWyparowanie,
        }
    },
    bennies: {
        max: fuksy,
        value: fuksy,
    },
    details: {
        biography:{
            value: opis,
        }
    },
    fatigue: {
        ignored: ingnorowanieZmeczenia,
        max: maxZmeczenie,
    },
    pace: {
        base: tempoDomyslne,
        burrow: tempoPodZiemia,
        fly: tempoLot,
        ground: tempoNaZiemi,
        running: {
            die: koscBiegania,
            mod: modyfikatorKosciBiegania,
        },
        swim: tempoPlywanie,
    },
    powerPoints: PunktyMocy,
    stats: {
        size: rozmiar,
    },
    wildcard: figura,
    wounds: {
        ignored: ingnorowanieRan,
        max: maxRany,
    },
  }
});


// rasa i archetyp
    await aktor.createEmbeddedDocuments("Item", [rasaItem.toObject()]);
    await aktor.createEmbeddedDocuments("Item", [archetypItem.toObject()]);

    /**
     * Wyszukuje Item SWADE z dowolnego źródła (uuid lub id z kompendium/świata).
     * @param {string} identyfikator - UUID lub ID itemu
     * @param {string} typ - Jeden z: "przewagi", "moce", "zawady", "bron", "pancerz"
     * @returns {Promise<Item|null>} - Znaleziony item lub null
     */
    async function znajdzItemSwade(identyfikator, typ) {
    if (typeof identyfikator !== "string") return null;

    // Jeśli wygląda jak UUID → próbuj przez fromUuid
    if (identyfikator.includes(".")) {
        try {
        const item = await fromUuid(identyfikator);
        if (item && item.documentName === "Item") return item;
        } catch (e) {}
    }

    // Mapa typów do ustawień kompendium
    const mapaTypow = {
        przewagi: "kompendiumPrzewagi",
        moce: "kompendiumMoce",
        zawady: "kompendiumZawady",
        bron: "kompendiumSprzet",
        pancerz: "kompendiumSprzet"
    };

    const ustawienie = mapaTypow[typ];
    if (!ustawienie) {
        console.warn(`Nieznany typ itemu: ${typ}`);
        return null;
    }

    const kompId = game.settings.get("swade-npc-forge-eph", ustawienie);
    const pack = game.packs.get(kompId);
    if (pack) {
        try {
        const item = await pack.getDocument(identyfikator);
        if (item && item.documentName === "Item") return item;
        } catch (e) {}
    }

    // Próba w świecie (tylko jeśli to nie było uuid)
    const lokalny = game.items.get(identyfikator);
    if (lokalny) return lokalny;

    return null;
    }

// przewagi
    const przewagiDoDodania = [];

    for (const p of przewagi) {
    const item = await znajdzItemSwade(p.id, "przewagi");
    if (item) przewagiDoDodania.push(item.toObject());
    else ui.notifications.warn(`Nie znaleziono przewagi: ${p.nazwa || p.id}`);
    }

    await aktor.createEmbeddedDocuments("Item", przewagiDoDodania);

// moce
    const moceDoDodania = [];

    for (const m of moce) {
    const item = await znajdzItemSwade(m.id, "moce");
    if (item) moceDoDodania.push(item.toObject());
    else ui.notifications.warn(`Nie znaleziono mocy: ${m.nazwa || m.id}`);
    }

    await aktor.createEmbeddedDocuments("Item", moceDoDodania);


// zawady
    const zawadyDoDodania = [];

    for (const z of zawady) {
    const item = await znajdzItemSwade(z.id, "zawady");
    if (item) zawadyDoDodania.push(item.toObject());
    else ui.notifications.warn(`Nie znaleziono zawady: ${z.nazwa || z.id}`);
    }

    await aktor.createEmbeddedDocuments("Item", zawadyDoDodania);


// bron
    const bronDoDodania = [];

    for (const b of bronie) {
    const item = await znajdzItemSwade(b.id, "bron");
    if (item) bronDoDodania.push(item.toObject());
    else ui.notifications.warn(`Nie znaleziono broni: ${b.nazwa || b.id}`);
    }

    await aktor.createEmbeddedDocuments("Item", bronDoDodania);

    await aktor.createEmbeddedDocuments("Item", doDodaniaAmunicja.map(a => a.toObject()));

// pancerz
    const pancerzDoDodania = [];

    for (const p of pancerze) {
    if (p.id === "BRAK") continue;
    const item = await znajdzItemSwade(p.id, "pancerz");
    if (item) pancerzDoDodania.push(item.toObject());
    else ui.notifications.warn(`Nie znaleziono pancerza: ${p.nazwa || p.id}`);
    }

    await aktor.createEmbeddedDocuments("Item", pancerzDoDodania);

// umiejetnosci
    const umiejetnosciDoWrzucenia = umiejetnosci.filter(u => u.kosc !== null);

    const umiej = await Promise.all( umiejetnosciDoWrzucenia.map(u => packUmiejetnosci.getDocument(u.id)));

    const umiejetnosciNaKarte = umiej.map((item, index) => {
    const dane = umiejetnosciDoWrzucenia[index];
    const kopia = item.toObject();

    const liczba = parseInt(dane.kosc.slice(1)); // np. "d8" → 8
    kopia.system.die = { sides: liczba, modifier: dane.modyfikator };

    return kopia;
    });

    await aktor.createEmbeddedDocuments("Item", umiejetnosciNaKarte);

    // Modyfikator obrony
    if (obrona && parseInt(obrona) > 0) {
    await aktor.createEmbeddedDocuments("ActiveEffect", [{
        name: rasaDane.nazwa,
        label: rasaDane.nazwa,
        icon: "modules/swade-npc-forge-eph/icons/obrona.png",
        description: game.i18n.localize("NPCForge.OpisModyfikator"),
        changes: [{
        key: "system.stats.parry.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: parseInt(obrona),
        priority: 20
        }],
        origin: aktor.uuid,
        disabled: false,
        duration: {},
        flags: { "swade-npc-forge-eph": { typ: "mod_obrona" } }
    }]);
    }

    // Modyfikator wytrzymałości
    if (wytrzymalosc && parseInt(wytrzymalosc) > 0) {
    await aktor.createEmbeddedDocuments("ActiveEffect", [{
        name: rasaDane.nazwa,
        label: rasaDane.nazwa,
        icon: "modules/swade-npc-forge-eph/icons/wytrzymalosc.png",
        description: game.i18n.localize("NPCForge.OpisModyfikator"),
        changes: [{
        key: "system.stats.toughness.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: parseInt(wytrzymalosc),
        priority: 20
        }],
        origin: aktor.uuid,
        disabled: false,
        duration: {},
        flags: { "swade-npc-forge-eph": { typ: "mod_wytrzymalosc" } }
    }]);
    }

}

function czyAnomalia(anomalieProcent) {
  const rzut = Math.floor(Math.random() * 100) + 1; // 1–100
  return rzut <= anomalieProcent;
}