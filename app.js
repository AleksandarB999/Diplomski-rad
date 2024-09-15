// selektori

const sidebarItem = document.querySelector(".sidebar-items");
const CPUClone = document.querySelector(".cpu-idle-clone");
const avgWaitingTime = document.querySelector(".waiting-time");
const avgCt = document.querySelector(".ct");
const avgTat = document.querySelector(".tat");
const dodajProcesBtn = document.querySelector(".table-btn.add");
const startujBtn = document.querySelector(".table-btn.start");

// promenljive

let procesi = [],
  izabraniAlgoritam,
  vremeOdgovora,
  ukupnoVremeObrade,
  vremeZavrsetka,
  vremeCekanja,
  vremenaIzvrsenja;
const brojCelija = 9;
const algoritmi = [
  "First Come First Serve",
  "Shortest Job Next",
  "Round Robin",
  "Priority Schedule",
  "Multilevel Queue Scheduling",
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
    if (izabrani) izabrani.classList.remove("selected");
    e.currentTarget.classList.add("selected");
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
    indeksNajmanjeVremeDolaska,
    sumaAtBt = 0,
    trenutniProces;
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
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
};

const fcfs = () => {
  const tableData = document.querySelectorAll(".tdRacunica");
  let vremeCekanja = 0,
    vremeZavrsetka = 0,
    tat = 0,
    sumaTat = 0,
    sumaCt = 0;
  procesi.forEach((proces, i) => {
    console.log(proces);
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
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
};

const roundRobinScheduling = () => {
  const tableData = document.querySelectorAll(".tdRacunica");
  const timeQuantum = parseInt(document.querySelector(".rr-quant").value);

  let trenutnoVreme = 0;
  let queue = [];
  let zavrseniProcesi = 0;
  let procesiCopy = JSON.parse(JSON.stringify(procesi)); // Kopiramo procese
  let sumaTat = 0,
    sumaCt = 0;

  procesiCopy.sort((a, b) => a.vremeDolaska - b.vremeDolaska);
  let i = 0;

  // Dodajemo procese koji dolaze u red na početku
  while (
    i < procesiCopy.length &&
    procesiCopy[i].vremeDolaska <= trenutnoVreme
  ) {
    queue.push(procesiCopy[i]);
    i++;
  }

  while (zavrseniProcesi < procesiCopy.length) {
    if (queue.length === 0) {
      trenutnoVreme = procesiCopy[i].vremeDolaska;
      queue.push(procesiCopy[i]);
      i++;
    }

    let proces = queue.shift();

    if (proces.preostaloVreme === undefined) {
      proces.preostaloVreme = proces.vremeIzvrsenja; // Postavljamo preostalo vreme
    }

    // Računamo vreme odgovora samo kada proces prvi put uđe u CPU
    if (proces.vremeOdgovora === undefined) {
      proces.vremeOdgovora = trenutnoVreme - proces.vremeDolaska;
    }

    let executionTime = Math.min(timeQuantum, proces.preostaloVreme);
    trenutnoVreme += executionTime;
    proces.preostaloVreme -= executionTime;

    // Dodajemo nove procese u red koji dolaze tokom trenutnog vremenskog kvanta
    while (
      i < procesiCopy.length &&
      procesiCopy[i].vremeDolaska <= trenutnoVreme
    ) {
      queue.push(procesiCopy[i]);
      i++;
    }

    if (proces.preostaloVreme === 0) {
      proces.vremeZavrsetka = trenutnoVreme;
      proces.tat = proces.vremeZavrsetka - proces.vremeDolaska;
      proces.vremeCekanja = proces.tat - proces.vremeIzvrsenja;

      zavrseniProcesi++;

      // Ažuriranje HTML tabele
      let procesIndex = parseInt(proces.id.slice(1));
      tableData[procesIndex * 4].innerHTML = proces.vremeOdgovora;
      tableData[procesIndex * 4 + 1].innerHTML = proces.tat;
      tableData[procesIndex * 4 + 2].innerHTML = proces.vremeZavrsetka;
      tableData[procesIndex * 4 + 3].innerHTML = proces.vremeCekanja;

      sumaTat += proces.tat;
      sumaCt += proces.vremeZavrsetka;
    } else {
      queue.push(proces); // Ako proces nije završen, vraćamo ga u red
    }
  }

  // Prikaz prosečnih vrednosti
  avgTat.innerHTML = (sumaTat / procesi.length).toFixed(2);
  avgCt.innerHTML = (sumaCt / procesi.length).toFixed(2);

  // Animacija CPU-a
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
};

const priorityScheduling = () => {
  const tableData = document.querySelectorAll(".tdRacunica");

  let vremeZavrsetka = 0,
    sumaTat = 0,
    sumaCt = 0;

  // Kopiramo procese i sortiramo ih prema prioritetu (manji broj = veći prioritet)
  let preostaliProcesi = [...procesi];

  // Sortiramo po prioritetu i po vremenu dolaska u slučaju da procesi imaju isti prioritet
  preostaliProcesi.sort((a, b) => {
    if (a.prioritet === b.prioritet) return a.vremeDolaska - b.vremeDolaska;

    return a.prioritet - b.prioritet;
  });
  console.log(preostaliProcesi);

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
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
};

const multilevelScheduling = () => {
  const tableData = document.querySelectorAll(".tdRacunica");
  const timeQuantum = parseInt(document.querySelector(".rr-quant").value);

  let vremeZavrsetka = 0,
    sumaTat = 0,
    sumaCt = 0;

  // Podela procesa u visoko i nisko prioritetne redove
  let highPriorityQueue = procesi.filter((p) => p.prioritet <= 3); // Visok prioritet (FCFS)
  let lowPriorityQueue = procesi.filter((p) => p.prioritet > 3); // Nizak prioritet (Round Robin)

  let trenutnoVreme = 0;
  let zavrseniProcesi = [];

  // FCFS za visoko prioritetne procese
  highPriorityQueue.sort((a, b) => a.vremeDolaska - b.vremeDolaska);

  highPriorityQueue.forEach((proces) => {
    if (trenutnoVreme < proces.vremeDolaska) {
      trenutnoVreme = proces.vremeDolaska;
    }
    proces.vremeZavrsetka = trenutnoVreme + proces.vremeIzvrsenja;
    proces.tat = proces.vremeZavrsetka - proces.vremeDolaska;
    proces.vremeCekanja = proces.tat - proces.vremeIzvrsenja;
    proces.vremeOdgovora = trenutnoVreme - proces.vremeDolaska;
    trenutnoVreme = proces.vremeZavrsetka;

    zavrseniProcesi.push(proces);

    // Ažuriranje HTML tabele
    let procesIndex = parseInt(proces.id.slice(1));
    tableData[procesIndex * 4].innerHTML = proces.vremeOdgovora;
    tableData[procesIndex * 4 + 1].innerHTML = proces.tat;
    tableData[procesIndex * 4 + 2].innerHTML = proces.vremeZavrsetka;
    tableData[procesIndex * 4 + 3].innerHTML = proces.vremeCekanja;

    sumaTat += proces.tat;
    sumaCt += proces.vremeZavrsetka;
  });

  // Round Robin za nisko prioritetne procese
  let queue = [...lowPriorityQueue];
  while (queue.length > 0) {
    let proces = queue.shift();

    if (trenutnoVreme < proces.vremeDolaska) {
      trenutnoVreme = proces.vremeDolaska;
    }

    if (proces.preostaloVreme === undefined) {
      proces.preostaloVreme = proces.vremeIzvrsenja;
    }

    let executionTime = Math.min(timeQuantum, proces.preostaloVreme);
    proces.preostaloVreme -= executionTime;
    trenutnoVreme += executionTime;

    if (proces.preostaloVreme === 0) {
      proces.vremeZavrsetka = trenutnoVreme;
      proces.tat = proces.vremeZavrsetka - proces.vremeDolaska;
      proces.vremeCekanja = proces.tat - proces.vremeIzvrsenja;
      proces.vremeOdgovora =
        proces.vremeOdgovora !== undefined
          ? proces.vremeOdgovora
          : trenutnoVreme - proces.vremeDolaska - proces.vremeIzvrsenja;
      zavrseniProcesi.push(proces);

      // Ažuriranje HTML tabele
      let procesIndex = parseInt(proces.id.slice(1));
      tableData[procesIndex * 4].innerHTML = proces.vremeOdgovora;
      tableData[procesIndex * 4 + 1].innerHTML = proces.tat;
      tableData[procesIndex * 4 + 2].innerHTML = proces.vremeZavrsetka;
      tableData[procesIndex * 4 + 3].innerHTML = proces.vremeCekanja;

      sumaTat += proces.tat;
      sumaCt += proces.vremeZavrsetka;
    } else {
      queue.push(proces); // Ako proces nije završio, vratimo ga u red
    }
  }

  // Prikaz prosečnih vrednosti
  avgTat.innerHTML = (sumaTat / procesi.length).toFixed(2);
  avgCt.innerHTML = (sumaCt / procesi.length).toFixed(2);

  // Animacija CPU-a
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
};

// tabela za cpu idle i vreme rada svakog procesa
// za sad samo za fcfs !!!
const napraviDruguTabelu = () => {
  const container = document.querySelector(".container");
  const tds = document.querySelectorAll("td");
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
  procesi.forEach((_, i) => {
    th = document.createElement("th");
    th.innerHTML = `P${i}`;
    th.style.backgroundColor = tds[i * brojCelija + 8].style.backgroundColor;
    tr.appendChild(th);
  });

  let vremeDolaska = parseInt(tds[1].querySelector("input").value);
  let tbody = document.createElement("tbody");
  tableCpu.appendChild(tbody);
  tr = document.createElement("tr");
  thead.appendChild(tr);
  td = document.createElement("td");
  td.innerHTML = vremeDolaska;
  tr.appendChild(td);
  let vremeIzvrsenja, boja;
  for (let i = 0; i < procesi.length; i++) {
    vremeIzvrsenja = parseInt(
      tds[i * brojCelija + 2].querySelector("input").value
    );
    td = document.createElement("td");
    td.innerHTML = vremeIzvrsenja;
    tr.appendChild(td);
  }
};

const kreirajProcese = () => {
  const rows = document.querySelectorAll("tr");
  const tds = document.querySelectorAll("td");
  const brojProcesa = rows.length - 1; // prvi red header se oduzima
  let noviProces;
  procesi = [];
  for (let i = 0; i < brojProcesa; i++) {
    console.log(i);
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
    };
    procesi.push(noviProces);
  }
};

// startovanje izabranog algoritma
const startAlg = () => {
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
    case "Multilevel Queue Scheduling":
      multilevelScheduling();
      break;
  }
  napraviDruguTabelu();
};

// event listener-i
CPUClone.addEventListener("animationend", () => {
  CPUClone.style.display = "none";
});
dodajProcesBtn.addEventListener("click", dodajProces);
startujBtn.addEventListener("click", startAlg);
