// selektori

const sidebarItem = document.querySelector(".sidebar-items");
const CPUClone = document.querySelector(".cpu-idle-clone");
const avgWaitingTime = document.querySelector(".waiting-time");
const avgCt = document.querySelector(".ct");
const avgTat = document.querySelector(".tat");
const dodajProcesBtn = document.querySelector(".table-btn.add");
const startujBtn = document.querySelector(".table-btn.start");
const obrisiBtn = document.querySelector(".table-btn.delete");
const modalBtn = document.querySelector(".modal-btn");
const modal = document.querySelector(".modal-wrapper");
const modalTitle = document.querySelector(".modal-title");
const selectedAlgorithm = document.querySelector(".selected-algorithm");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const sidebar = document.querySelector(".sidebar");
const homeBtn = document.querySelector(".home-btn");
const container = document.querySelector(".hero");
const mainTable = document.querySelector(".main-table");

// promenljive

let procesi = [],
  izabraniAlgoritam = "",
  vremeOdgovora,
  ukupnoVremeObrade,
  vremeZavrsetka,
  vremeCekanja,
  vremenaIzvrsenja,
  redIzvrsavanjaProcesa = [],
  menuOpen = false;
const brojCelija = 9;
const algoritmi = [
  "First Come First Serve",
  "Shortest Job Next",
  "Round Robin",
  "Priority Schedule",
];

// funkcije

// setuje boju za izabran algoritam
// i menja pojavu inputa za vremenski kvant
const checkClicked = (e) => {
  if (e.currentTarget.innerHTML !== izabraniAlgoritam) {
    const timeKvant = document.querySelector(".time-quant");
    if (e.currentTarget.innerHTML === "Round Robin")
      timeKvant.style.display = "flex";
    else timeKvant.style.display = "none";
    izabraniAlgoritam = e.currentTarget.innerHTML;
    const izabrani = document.querySelector(".sidebar-item-text.selected");
    selectedAlgorithm.innerHTML = izabraniAlgoritam;
    if (izabrani) izabrani.classList.remove("selected");
    e.currentTarget.classList.add("selected");
    openMenu();
  }
};

// popuna algoritama iz niza
algoritmi.forEach((algoritam) => {
  const sidebarItemText = document.createElement("div");
  sidebarItemText.classList.add("sidebar-item-text");
  sidebarItemText.addEventListener("click", checkClicked);
  sidebarItemText.innerHTML = algoritam;
  sidebarItem.appendChild(sidebarItemText);
});

const openMenu = () => {
  menuOpen = !menuOpen;
  checkIcon();
};

const checkIcon = () => {
  let img = document.createElement("img");
  if (hamburgerBtn.hasChildNodes())
    hamburgerBtn.removeChild(hamburgerBtn.lastChild);
  if (menuOpen) {
    img.src = "/slike/cancel-icon.png";
    sidebar.style.left = "0";
  } else {
    img.src = "/slike/hamburger-icon.png";
    sidebar.style.left = "-100%";
  }
  img.classList.add("icon-btn");
  hamburgerBtn.appendChild(img);
  if (izabraniAlgoritam === "") container.style.display = "flex";
  else container.style.display = "none";
};

const checkIsLandscape = () => {
  const isLandscape = innerWidth > innerHeight;
  if (isLandscape) hamburgerBtn.classList.add("not-visible");
  else hamburgerBtn.classList.remove("not-visible");
};

addEventListener("resize", checkIsLandscape);

addEventListener("load", checkIsLandscape);

checkIcon();

const checkNegative = (e) => {
  if (e.currentTarget.value < 0) e.currentTarget.value = 0;
  console.log(e.currentTarget);
};

// dodavanje procesa u tabeli procesa
const dodajProces = () => {
  const tbody = document.querySelector("tbody");
  const tr = document.createElement("tr");
  tbody.appendChild(tr);
  let td;
  for (let i = 0; i < brojCelija; i++) {
    td = document.createElement("td");
    if (i === 0)
      // ID Procesa
      td.innerHTML = `P${procesi.length}`;
    else if (i >= 4 && i < 8) {
      const span = document.createElement("span");
      span.classList.add("tdRacunica");
      span.innerHTML = 0;
      td.appendChild(span);
    } else if (i === 8) {
      let randomColor = Math.floor(Math.random() * 16777215).toString(16);
      td.style.backgroundColor = `#${randomColor}`;
    } else {
      const input = document.createElement("input");
      input.type = "number";
      input.addEventListener("change", checkNegative);
      td.appendChild(input);
    }
    tr.appendChild(td);
  }
  procesi.push({});
};

const sortirajFcfs = () => {
  procesi = procesi.sort((a, b) => {
    return a.vremeDolaska - b.vremeDolaska;
  });
};

const sortirajSjn = () => {
  let noviProcesi = [];
  let najmanjeVremeDolaska = 9999,
    indeksNajmanjeVremeDolaska;
  procesi.forEach((proces, i) => {
    if (proces.vremeIzvrsenja < najmanjeVremeDolaska) {
      najmanjeVremeDolaska = proces.vremeDolaska;
      indeksNajmanjeVremeDolaska = i;
    }
  });
  trenutniProces = procesi[indeksNajmanjeVremeDolaska];
  noviProcesi.push(procesi[indeksNajmanjeVremeDolaska]);
  procesi = procesi.filter((_, i) => i !== indeksNajmanjeVremeDolaska);
};

const sortirajPriority = () => {
  procesi = procesi.sort((a, b) => {
    return a.prioritet - b.prioritet;
  });
};

const sjn = () => {
  const tableData = document.querySelectorAll(".tdRacunica");

  let vremeZavrsetka = 0,
    sumaTat = 0,
    sumaCt = 0;

  // Procesi moraju biti sortirani prema vremenu dolaska
  procesi.sort((a, b) => a.vremeDolaska - b.vremeDolaska);

  let zavrseniProcesi = [];

  while (zavrseniProcesi.length < procesi.length) {
    // Filtriramo procese koji su stigli do trenutnog vremena završetka
    let dostupniProcesi = procesi.filter(
      (proces) =>
        proces.vremeDolaska <= vremeZavrsetka &&
        !zavrseniProcesi.includes(proces)
    );

    // Ako nema dostupnih procesa, CPU mora da čeka na dolazak sledećeg
    if (dostupniProcesi.length === 0) {
      vremeZavrsetka = Math.min(
        ...procesi
          .filter((proces) => !zavrseniProcesi.includes(proces))
          .map((proces) => proces.vremeDolaska)
      );
      continue;
    }

    // Odabir procesa sa najkraćim vremenom izvršenja
    let najkraciProces = dostupniProcesi.reduce((minProces, proces) =>
      proces.vremeIzvrsenja < minProces.vremeIzvrsenja ? proces : minProces
    );

    // Računanje vremena čekanja, završetka, TAT, i vremena odgovora
    najkraciProces.vremeCekanja = vremeZavrsetka - najkraciProces.vremeDolaska;

    // Ako je vreme čekanja negativno, znači da CPU čeka proces
    if (najkraciProces.vremeCekanja < 0) {
      najkraciProces.vremeCekanja = 0;
      vremeZavrsetka = najkraciProces.vremeDolaska;
    }

    vremeZavrsetka += najkraciProces.vremeIzvrsenja;

    najkraciProces.vremeZavrsetka = vremeZavrsetka;
    najkraciProces.tat =
      najkraciProces.vremeZavrsetka - najkraciProces.vremeDolaska;
    najkraciProces.vremeOdgovora = najkraciProces.vremeCekanja;

    redIzvrsavanjaProcesa.push({
      id: najkraciProces.id,
      executionTime: najkraciProces.vremeIzvrsenja,
      vremeDolaska: najkraciProces.vremeDolaska,
    });

    // Ažuriranje HTML tabele
    let procesIndex = parseInt(najkraciProces.id.slice(1)); // P0, P1... uzmemo broj
    tableData[procesIndex * 4].innerHTML = najkraciProces.vremeOdgovora;
    tableData[procesIndex * 4 + 1].innerHTML = najkraciProces.tat;
    tableData[procesIndex * 4 + 2].innerHTML = najkraciProces.vremeZavrsetka;
    tableData[procesIndex * 4 + 3].innerHTML = najkraciProces.vremeCekanja;

    // Dodajemo proces u zavrsene procese
    zavrseniProcesi.push(najkraciProces);

    // Sabiramo za prosečne vrednosti
    sumaTat += najkraciProces.tat;
    sumaCt += najkraciProces.vremeZavrsetka;
  }

  // Prikaz prosečnih vrednosti
  avgTat.innerHTML = (sumaTat / procesi.length).toFixed(2);
  avgCt.innerHTML = (sumaCt / procesi.length).toFixed(2);

  // Animacija CPU-a
  CPUClone.classList.add("animation");
};

const fcfs = () => {
  const tableData = document.querySelectorAll(".tdRacunica");
  let sumaTat = 0,
    sumaCt = 0;
  procesi.forEach((proces, i) => {
    // vreme čekanja
    if (i === 0) {
      // Prvi proces nema čekanja, stiže odmah
      proces.vremeCekanja = 0;
    } else {
      // Vreme čekanja = vreme završetka prethodnog procesa - vreme dolaska trenutnog procesa
      proces.vremeCekanja = procesi[i - 1].vremeZavrsetka - proces.vremeDolaska;

      // Ako proces stiže kasnije nego što je CPU slobodan, nema čekanja
      if (proces.vremeCekanja < 0) proces.vremeCekanja = 0;
    }

    // vreme završetka = vreme dolaska + vreme čekanja + vreme izvršenja
    proces.vremeZavrsetka =
      proces.vremeDolaska + proces.vremeCekanja + proces.vremeIzvrsenja;

    // TAT (Turnaround Time) = vreme završetka - vreme dolaska
    proces.tat = proces.vremeZavrsetka - proces.vremeDolaska;

    // Vreme odgovora = vreme čekanja (isto kao vreme čekanja za FCFS)
    proces.vremeOdgovora = proces.vremeCekanja;
    redIzvrsavanjaProcesa.push({
      id: proces.id,
      executionTime: proces.vremeIzvrsenja,
      vremeDolaska: proces.vremeDolaska,
    });
    // Ažuriraj rezultate u tabeli
    tableData[parseInt(proces.id[1]) * 4].innerHTML = proces.vremeOdgovora;
    tableData[parseInt(proces.id[1]) * 4 + 1].innerHTML = proces.tat;
    tableData[parseInt(proces.id[1]) * 4 + 2].innerHTML = proces.vremeZavrsetka;
    tableData[parseInt(proces.id[1]) * 4 + 3].innerHTML = proces.vremeCekanja;

    // Sabrati za prosek
    sumaTat += proces.tat;
    sumaCt += proces.vremeZavrsetka;
  });

  // Prikaz prosečnih vrednosti
  avgTat.innerHTML = (sumaTat / procesi.length).toFixed(2);
  avgCt.innerHTML = (sumaCt / procesi.length).toFixed(2);

  // Animacija CPU-a
  CPUClone.classList.add("animation");
};

const priorityScheduling = () => {
  const tableData = document.querySelectorAll(".tdRacunica");

  let sumaTat = 0,
    sumaCt = 0;

  // Kopiramo procese i sortiramo ih prema prioritetu (manji broj = veći prioritet)
  let preostaliProcesi = [...procesi];

  // Sortiramo po prioritetu i po vremenu dolaska u slučaju da procesi imaju isti prioritet
  preostaliProcesi.sort((a, b) => {
    if (a.prioritet === b.prioritet) return a.vremeDolaska - b.vremeDolaska;

    return a.prioritet - b.prioritet;
  });

  let trenutnoVreme = 0;
  let zavrseniProcesi = [];

  // Dok ne završimo sve procese
  while (zavrseniProcesi.length < procesi.length) {
    // Pronalazimo proces sa najvišim prioritetom koji je stigao do trenutnog vremena
    let sledeciProces = preostaliProcesi.find(
      (proces) => proces.vremeDolaska <= trenutnoVreme
    );

    // Ako nema procesa koji su stigli do trenutnog vremena, povećavamo trenutno vreme
    if (!sledeciProces) {
      trenutnoVreme++;
      continue;
    }

    // Računamo vremena za trenutni proces
    sledeciProces.vremeZavrsetka = trenutnoVreme + sledeciProces.vremeIzvrsenja;
    sledeciProces.tat =
      sledeciProces.vremeZavrsetka - sledeciProces.vremeDolaska;
    sledeciProces.vremeCekanja =
      sledeciProces.tat - sledeciProces.vremeIzvrsenja;
    sledeciProces.vremeOdgovora = trenutnoVreme - sledeciProces.vremeDolaska;

    redIzvrsavanjaProcesa.push({
      id: sledeciProces.id,
      vremeDolaska: sledeciProces.vremeDolaska,
      executionTime: sledeciProces.vremeIzvrsenja,
    });

    // Ažuriramo trenutno vreme
    trenutnoVreme = sledeciProces.vremeZavrsetka;

    // Dodajemo proces u zavrsene procese
    zavrseniProcesi.push(sledeciProces);
    preostaliProcesi = preostaliProcesi.filter((p) => p !== sledeciProces);

    // Ažuriranje HTML tabele
    let procesIndex = parseInt(sledeciProces.id.slice(1));
    tableData[procesIndex * 4].innerHTML = sledeciProces.vremeOdgovora;
    tableData[procesIndex * 4 + 1].innerHTML = sledeciProces.tat;
    tableData[procesIndex * 4 + 2].innerHTML = sledeciProces.vremeZavrsetka;
    tableData[procesIndex * 4 + 3].innerHTML = sledeciProces.vremeCekanja;

    // Sabiramo TAT i vreme završetka za prosečne vrednosti
    sumaTat += sledeciProces.tat;
    sumaCt += sledeciProces.vremeZavrsetka;
  }

  // Prikaz prosečnih vrednosti
  avgTat.innerHTML = (sumaTat / procesi.length).toFixed(2);
  avgCt.innerHTML = (sumaCt / procesi.length).toFixed(2);

  // Animacija CPU-a
  CPUClone.classList.add("animation");
};

const roundRobinScheduling = () => {
  const tableData = document.querySelectorAll(".tdRacunica");
  const timeQuantum = parseInt(document.querySelector(".rr-quant").value);

  let trenutnoVreme = 0; // Trenutno vreme u simulaciji
  let queue = []; // Red za procese
  let zavrseniProcesi = 0;
  let procesiCopy = JSON.parse(JSON.stringify(procesi)); // Duboka kopija procesa
  let sumaTat = 0,
    sumaCt = 0;

  // Inicijalizujemo sve procese
  procesiCopy.forEach((proces) => {
    proces.preostaloVreme = proces.vremeIzvrsenja;
    proces.vremeOdgovora = -1; // -1 znači da još nije procesiran
  });

  // Sortiramo procese po vremenu dolaska
  procesiCopy.sort((a, b) => a.vremeDolaska - b.vremeDolaska);
  let i = 0;

  // Prvo, dodamo sve procese koji su stigli do trenutnog vremena u red
  while (
    i < procesiCopy.length &&
    procesiCopy[i].vremeDolaska <= trenutnoVreme
  ) {
    queue.push(procesiCopy[i]);
    i++;
  }

  // Glavna petlja za Round Robin
  while (zavrseniProcesi < procesiCopy.length) {
    if (queue.length === 0) {
      trenutnoVreme = procesiCopy[i].vremeDolaska;
      queue.push(procesiCopy[i]);
      i++;
    }
    let proces = queue.shift();

    // Postavljamo vreme odgovora prvi put kada proces uđe u CPU
    if (proces.vremeOdgovora === -1) {
      proces.vremeOdgovora = trenutnoVreme - proces.vremeDolaska;
    }

    // Dodeljujemo CPU na kvant ili preostalo vreme procesa
    let executionTime = Math.min(timeQuantum, proces.preostaloVreme);
    trenutnoVreme += executionTime;
    proces.preostaloVreme -= executionTime;
    redIzvrsavanjaProcesa.push({
      id: proces.id,
      executionTime,
      vremeDolaska: proces.vremeDolaska,
    });
    // Dodajemo nove procese u red koji su stigli tokom trenutnog vremena
    while (
      i < procesiCopy.length &&
      procesiCopy[i].vremeDolaska <= trenutnoVreme
    ) {
      queue.push(procesiCopy[i]);
      i++;
    }

    // Ako je proces završen
    if (proces.preostaloVreme === 0) {
      proces.vremeZavrsetka = trenutnoVreme;
      proces.tat = proces.vremeZavrsetka - proces.vremeDolaska;
      proces.vremeCekanja = proces.tat - proces.vremeIzvrsenja;
      zavrseniProcesi++;

      // Ažuriramo HTML tabelu sa izračunatim vrednostima
      let procesIndex = parseInt(proces.id.slice(1));
      tableData[procesIndex * 4].innerHTML = proces.vremeOdgovora;
      tableData[procesIndex * 4 + 1].innerHTML = proces.tat;
      tableData[procesIndex * 4 + 2].innerHTML = proces.vremeZavrsetka;
      tableData[procesIndex * 4 + 3].innerHTML = proces.vremeCekanja;

      sumaTat += proces.tat;
      sumaCt += proces.vremeZavrsetka;
    } else {
      // Ako proces nije završen, vraćamo ga u red
      queue.push(proces);
    }
  }

  // Prikaz prosečnih vrednosti
  avgTat.innerHTML = (sumaTat / procesi.length).toFixed(2);
  avgCt.innerHTML = (sumaCt / procesi.length).toFixed(2);

  // Animacija CPU-a
  CPUClone.classList.add("animation");
};

// tabela za cpu idle i vreme rada svakog procesa
const napraviDruguTabelu = () => {
  const container = document.querySelector(".container");
  const tableCpu = document.createElement("table");
  tableCpu.classList.add("cpu-idle");
  container.appendChild(tableCpu);

  const thead = document.createElement("thead");
  tableCpu.appendChild(thead);
  let tr = document.createElement("tr");
  thead.appendChild(tr);
  let th = document.createElement("th");
  th.innerHTML = "CPU u cekanju";
  tr.appendChild(th);
  redIzvrsavanjaProcesa.forEach((p) => {
    th = document.createElement("th");
    th.innerHTML = p.id;
    th.style.backgroundColor = procesi.find(
      (proces) => proces.id === p.id
    ).boja;
    tr.appendChild(th);
  });

  let vremeDolaska = redIzvrsavanjaProcesa[0].vremeDolaska;
  let tbody = document.createElement("tbody");
  tableCpu.appendChild(tbody);
  tr = document.createElement("tr");
  thead.appendChild(tr);
  td = document.createElement("td");
  td.innerHTML = vremeDolaska;
  tr.appendChild(td);
  for (let i = 0; i < redIzvrsavanjaProcesa.length; i++) {
    td = document.createElement("td");
    td.innerHTML = redIzvrsavanjaProcesa[i].executionTime;
    tr.appendChild(td);
  }
};

const kreirajProcese = () => {
  const rows = mainTable.querySelectorAll("tr");
  const tds = mainTable.querySelectorAll("td");
  console.log(tds);
  const brojProcesa = rows.length - 1; // prvi red header se oduzima
  let noviProces;
  procesi = [];
  for (let i = 0; i < brojProcesa; i++) {
    noviProces = {
      id: `P${i}`,
      vremeDolaska: parseInt(
        tds[i * brojCelija + 1].querySelector("input").value
      ),
      vremeIzvrsenja: parseInt(
        tds[i * brojCelija + 2].querySelector("input").value
      ),
      vremeCekanja: 0,
      vremeZavrsetka: 0,
      vremeOdgovora: 0,
      tat: 0,
      prioritet: tds[i * brojCelija + 3].querySelector("input").value,
      boja: tds[i * brojCelija + 8].style.backgroundColor,
    };
    procesi.push(noviProces);
  }
};

const clearInner = (node) => {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
};

const clear = (node) => {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
  node.parentNode.removeChild(node);
};

// startovanje izabranog algoritma
const startAlg = () => {
  CPUClone.style.display = "block";
  redIzvrsavanjaProcesa = [];
  const otherTable = document.querySelector(".cpu-idle");
  if (izabraniAlgoritam === "") {
    const message = "Izaberite algoritam!";
    modal.style.display = "flex";
    modalTitle.innerHTML = message;
    return;
  }
  if (procesi.length < 1) {
    const message = "Unesite minimum jedan proces!";
    modal.style.display = "flex";
    modalTitle.innerHTML = message;
    return;
  }
  kreirajProcese();
  switch (izabraniAlgoritam) {
    case "First Come First Serve":
      sortirajFcfs();
      fcfs();
      break;
    case "Shortest Job Next":
      sjn();
      break;
    case "Round Robin":
      roundRobinScheduling();
      break;
    case "Priority Schedule":
      priorityScheduling();
      break;
  }
  if (otherTable) {
    otherTable.innerHTML = "";
    otherTable.remove();
  }
  napraviDruguTabelu();
};

const cancelModal = () => (modal.style.display = "none");

// brisanje zadnjeg procesa
const obrisiProces = () => {
  const trs = document.querySelectorAll("tr");
  // ne sme da obrise headere
  if (trs.length === 1) return;
  trs[trs.length - 1].remove();
  procesi.pop();
};

const goHome = () => {
  izabraniAlgoritam = "";
  container.style.display = "flex";
  const izabrani = document.querySelector(".sidebar-item-text.selected");
  selectedAlgorithm.innerHTML = izabraniAlgoritam;
  if (izabrani) izabrani.classList.remove("selected");
  menuOpen = false;
  checkIcon();
};

// event listener-i
CPUClone.addEventListener("animationend", () => {
  CPUClone.style.display = "none";
  CPUClone.classList.remove("animation");
});
dodajProcesBtn.addEventListener("click", dodajProces);
obrisiBtn.addEventListener("click", obrisiProces);
startujBtn.addEventListener("click", startAlg);
modalBtn.addEventListener("click", cancelModal);
hamburgerBtn.addEventListener("click", openMenu);
homeBtn.addEventListener("click", goHome);
