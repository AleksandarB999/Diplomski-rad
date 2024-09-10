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
  /*let najmanjeVremeIzvrsenja = 999;
  procesi.forEach((proces) => {
    if (proces.vremeIzvrsenja < najmanjeVremeIzvrsenja)
      najmanjeVremeIzvrsenja = proces.vremeIzvrsenja;
  });*/
  let najmanjeVremeDolaska = 9999,
    indeksNajmanjeVremeDolaska,
    sumaAtBt = 0;
  procesi.forEach((proces, i) => {
    if (proces.vremeIzvrsenja < najmanjeVremeDolaska) {
      najmanjeVremeDolaska = proces.vremeDolaska;
      indeksNajmanjeVremeDolaska = i;
    }
  });
  noviProcesi.push(procesi[indeksNajmanjeVremeDolaska]);
  procesi = procesi.filter((_, i) => i !== indeksNajmanjeVremeDolaska);
  console.log(noviProcesi);
  console.log(procesi);
};

const sortirajPriority = () => {
  procesi = procesi.sort((a, b) => {
    return a.prioritet - b.prioritet;
  });
};

// implementacija fcfs
const fcfs = () => {
  const tds = document.querySelectorAll("td");
  const tableData = document.querySelectorAll(".tdRacunica");
  let vremeCekanja = 0,
    vremeZavrsetka = 0,
    tat = 0,
    sumaTat = 0,
    sumaCt = 0;
  procesi.forEach((proces, i) => {
    // vreme cekanja
    if (i === 0) vremeCekanja = 0;
    else {
      vremeCekanja =
        procesi[i - 1].vremeDolaska +
        procesi[i - 1].vremeIzvrsenja +
        procesi[i - 1].vremeCekanja -
        proces.vremeDolaska;
    }
    proces.vremeCekanja = vremeCekanja;
    // vreme zavrsetka
    vremeZavrsetka =
      proces.vremeDolaska + proces.vremeIzvrsenja + proces.vremeCekanja;
    proces.vremeZavrsetka = vremeZavrsetka;
    // ukupno vreme obrade (tat)
    tat = proces.vremeZavrsetka - proces.vremeDolaska;
    proces.tat = tat;
    // vreme odgovora
    proces.vremeOdgovora = vremeCekanja;
    tableData[parseInt(proces.id[1]) * 4].innerHTML = proces.vremeOdgovora;
    tableData[parseInt(proces.id[1]) * 4 + 1].innerHTML = proces.tat;
    tableData[parseInt(proces.id[1]) * 4 + 2].innerHTML = proces.vremeZavrsetka;
    tableData[parseInt(proces.id[1]) * 4 + 3].innerHTML = proces.vremeCekanja;
    sumaTat += proces.tat;
    sumaCt += proces.vremeZavrsetka;
  });
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
  avgTat.innerHTML = parseFloat(sumaTat / procesi.length);
  avgCt.innerHTML = parseFloat(sumaCt / procesi.length);
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
      sortirajSjn();
      break;
    case "Priority Schedule":
      sortirajPriority();
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
