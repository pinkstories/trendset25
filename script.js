
let kunden = [];
let artikel = [];
let warenkorb = [];
let ausgewaehlterKunde = null;

// Daten laden
fetch('kunden.json')
  .then(r => r.json())
  .then(data => kunden = data);

fetch('artikel.json')
  .then(r => r.json())
  .then(data => artikel = data);

// Kundensuche
const kundensuche = document.getElementById('kundensuche');
const kundenliste = document.getElementById('kundenliste');
kundensuche.addEventListener('input', () => {
  const suchbegriff = kundensuche.value.toLowerCase();
  kundenliste.innerHTML = '';
  kunden.filter(k => k.firma.toLowerCase().includes(suchbegriff))
        .forEach(k => {
          const div = document.createElement('div');
          div.textContent = `${k.firma} (${k.kundennummer})`;
          if (k.gesperrt) div.style.color = 'red';
          div.onclick = () => ausgewaehlterKunde = k;
          kundenliste.appendChild(div);
        });
});

// Artikelsuche
const artikelsuche = document.getElementById('artikelsuche');
const artikelliste = document.getElementById('artikelliste');
artikelsuche.addEventListener('input', () => {
  const such = artikelsuche.value.toLowerCase();
  artikelliste.innerHTML = '';
  artikel.filter(a => a.name.toLowerCase().includes(such) || a.artikelnummer.includes(such))
         .forEach(a => {
           const row = document.createElement('div');
           row.innerHTML = `
             <strong>${a.name}</strong> (${a.artikelnummer})<br>
             <button onclick='updateMenge("${a.artikelnummer}", -${a.einheit})' style="background:red">-</button>
             <button onclick='updateMenge("${a.artikelnummer}", ${a.einheit})' style="background:green">+</button>
           `;
           artikelliste.appendChild(row);
         });
});

// Menge im Warenkorb
function updateMenge(artikelnummer, delta) {
  const art = artikel.find(a => a.artikelnummer === artikelnummer);
  if (!art) return;
  let pos = warenkorb.find(p => p.artikelnummer === artikelnummer);
  if (!pos) {
    if (delta > 0) {
      warenkorb.push({ ...art, menge: delta });
    }
  } else {
    pos.menge += delta;
    if (pos.menge <= 0) {
      warenkorb = warenkorb.filter(p => p.artikelnummer !== artikelnummer);
    }
  }
  renderWarenkorb();
}

function renderWarenkorb() {
  const tbody = document.querySelector('#warenkorb tbody');
  tbody.innerHTML = '';
  let gesamt = 0;
  warenkorb.forEach(p => {
    const row = document.createElement('tr');
    const summe = p.menge * p.preis;
    gesamt += summe;
    row.innerHTML = `
      <td>${p.artikelnummer}</td>
      <td>${p.name}</td>
      <td>${p.menge}</td>
      <td>${p.preis.toFixed(2)}€</td>
      <td>${summe.toFixed(2)}€</td>
      <td><button onclick='updateMenge("${p.artikelnummer}", -${p.einheit})'>X</button></td>
    `;
    tbody.appendChild(row);
  });
  document.getElementById('gesamtbetrag').textContent = `Gesamt: ${gesamt.toFixed(2)}€`;
}

// Export als CSV
function exportCSV() {
  if (!ausgewaehlterKunde) return alert("Bitte zuerst einen Kunden wählen.");
  const zeilen = warenkorb.map(p => [
    ausgewaehlterKunde.kundennummer,
    ausgewaehlterKunde.firma,
    p.artikelnummer,
    p.menge,
    p.preis.toFixed(2),
    (p.menge * p.preis).toFixed(2)
  ]);
  const header = ['Kundennummer', 'Kundenname', 'Artikelnummer', 'Menge', 'Einzelpreis', 'Gesamtpreis'];
  const csv = [header, ...zeilen].map(e => e.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'bestellung.csv';
  link.click();
}
document.getElementById('export-btn').addEventListener('click', exportCSV);
