window.onload = () => {
    getData();
  };

let entries = {};

const getData = async () => {
    const response = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability');
    const data = await response.json();
    entries = data.items[0].carpark_data;
    let loaded_entries = entries.slice(0,10);
    let table_container = document.getElementById("table_container");
    let back_btn = document.getElementById("btn-back");
    back_btn.setAttribute("disabled", "");
    back_btn.setAttribute("class", "btn btn-secondary");

    let pg_count = document.getElementById("pg-count");
    let n = Math.ceil(entries.length / 10);
    pg_count.value = 1;
    pg_count.innerHTML = pg_count.value + "/" + n;
    
    let table = document.createElement("table");
    table.setAttribute("class", "table table-hover");
    table.setAttribute("id", 'table');

    let table_header = document.createElement("tr");
    ['Carpark Number','Timestamp','Lot Type','Total Lots','Lots Available','Utilisation'].forEach(element => {
        let header_col = document.createElement("th");
        header_col.setAttribute("scope", "col"); 
        header_col.innerHTML = element;
        table_header.appendChild(header_col);
    })
    table.appendChild(table_header);
    let tbody = fillTable(table, loaded_entries);
    table.appendChild(tbody);
    table_container.appendChild(table);
    
  }

const nextPage = () => {
    let pg_count = document.getElementById("pg-count");
    let n = Math.ceil(entries.length / 10);
    pg_count.value += 1;
    pg_count.innerHTML = pg_count.value + "/" + n;

    let loaded_entries = entries.slice((pg_count.value-1) * 10,(pg_count.value-1) * 10 + 10);

    if (pg_count.value >= Math.ceil(entries.length / 10)) {
        let next_btn = document.getElementById("btn-forward");
        next_btn.setAttribute("disabled", "");
        next_btn.setAttribute("class", "btn btn-secondary");
    }

    let back_btn = document.getElementById("btn-back");
    back_btn.removeAttribute("disabled");
    back_btn.setAttribute("class", "btn btn-primary");
    
    let table = document.getElementById("table");
    let tbody = fillTable(table, loaded_entries);
    table.replaceChild(tbody, table.getElementsByTagName('tbody')[0]);
}

const backPage = () => {
    let pg_count = document.getElementById("pg-count");
    let n = Math.ceil(entries.length / 10);
    pg_count.value -= 1;
    pg_count.innerHTML = pg_count.value + "/" + n;

    let loaded_entries = entries.slice((pg_count.value-1) * 10,(pg_count.value-1) * 10 + 10);

    if (pg_count.value <= 1) {
        let back_btn = document.getElementById("btn-back");
        back_btn.setAttribute("disabled", "");
        back_btn.setAttribute("class", "btn btn-secondary");
    }

    let next_btn = document.getElementById("btn-forward");
    next_btn.removeAttribute("disabled");
    next_btn.setAttribute("class", "btn btn-primary");

    let table = document.getElementById("table");
    let tbody = fillTable(table, loaded_entries);
    table.replaceChild(tbody, table.getElementsByTagName('tbody')[0]);
}

const fillTable = (table, data) => {
    console.log(data);
    let tbody = document.createElement("tbody");
    data.forEach(element => {
        let row = document.createElement("tr");
        let utilisation = Math.round(((element.carpark_info[0].total_lots - element.carpark_info[0].lots_available) / element.carpark_info[0].total_lots) * 100);
        utilisation = (element.carpark_info[0].total_lots > 0) ? utilisation : '-';

        [element.carpark_number,
            element.update_datetime,
            element.carpark_info[0].lot_type,
            element.carpark_info[0].total_lots,
            element.carpark_info[0].lots_available,
            utilisation.toString().concat("%")
        ].forEach(element => {
            let col = document.createElement("td");
            col.innerHTML = element;
            row.appendChild(col);
        })
        if (utilisation > 80 || utilisation === '-') {
            row.lastChild.setAttribute("style", "color: red;");
        };
        tbody.appendChild(row);
    });
    return tbody;
}