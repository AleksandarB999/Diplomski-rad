// selektori

const sidebarItem = document.querySelector(".sidebar-items");
const CPUClone = document.querySelector(".cpu-idle-clone");
const avgWaitingTime = document.querySelector(".waiting-time");
const avgCt = document.querySelector(".ct");
const avgTat = document.querySelector(".tat");
const dodajProcesBtn = document.querySelector(".table-btn.add");
const startujBtn = document.querySelector(".table-btn.start");
const tableCPU = document.querySelector(".cpu-idle");

// promenljive

let procesi = [],
  izabraniAlgoritam,
  vremeOdgovora,
  ukupnoVremeObrade,
  vremeZavrsetka,
  vremeCekanja;
const brojCelija = 8;
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
    else if (i >= 4) {
      const span = document.createElement("span");
      span.classList.add("tdRacunica");
      span.innerHTML = 0;
      td.appendChild(span);
    } else {
      const input = document.createElement("input");
      input.type = "number";
      td.appendChild(input);
    }
    tr.appendChild(td);
  }
  procesi.push({
    ime: "",
  });
};

// startovanje izabranog algoritma
const startAlg = () => {
  let tableData = document.querySelectorAll(".tdRacunica");
  const tds = document.querySelectorAll("td");
  let prethodnoVremeIzvrsenja = 0,
    prethodnoVremeOdgovora = 0,
    prethodnoVremeZavrsetka = 0,
    vremeDolaska,
    vremeIzvrsenja,
    sumaTat = 0,
    sumaCt = 0;
  for (let i = 0; i < procesi.length; i++) {
    vremeDolaska = parseInt(tds[i * 8 + 1].querySelector("input").value);
    vremeIzvrsenja = parseInt(tds[i * 8 + 2].querySelector("input").value);
    if (i === 0) {
      vremeOdgovora = vremeDolaska;
      vremeZavrsetka = vremeDolaska + vremeIzvrsenja;
    } else {
      vremeOdgovora = prethodnoVremeIzvrsenja + prethodnoVremeOdgovora;
      vremeZavrsetka = prethodnoVremeZavrsetka + vremeIzvrsenja;
    }
    ukupnoVremeObrade = vremeZavrsetka - vremeDolaska;
    sumaTat += ukupnoVremeObrade;
    sumaCt += vremeZavrsetka;
    vremeCekanja = ukupnoVremeObrade - vremeIzvrsenja;
    // azuriranje vrednosti za sledeci proces
    (prethodnoVremeIzvrsenja = vremeIzvrsenja),
      (prethodnoVremeOdgovora = vremeOdgovora),
      (prethodnoVremeZavrsetka = vremeZavrsetka);
    tableData[i * 4].innerHTML = vremeOdgovora;
    tableData[i * 4 + 1].innerHTML = ukupnoVremeObrade;
    tableData[i * 4 + 2].innerHTML = vremeZavrsetka;
    tableData[i * 4 + 3].innerHTML = vremeCekanja;
  }
  CPUClone.style.animation = "animacija";
  CPUClone.style.animationDuration = "5s";
  avgTat.innerHTML = parseFloat(sumaTat / procesi.length);
  avgCt.innerHTML = parseFloat(sumaCt / procesi.length);
};

// event listener-i
CPUClone.addEventListener("animationend", () => {
  CPUClone.style.display = "none";
});
dodajProcesBtn.addEventListener("click", dodajProces);
startujBtn.addEventListener("click", startAlg);
