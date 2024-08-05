
let rowCount = 0;

let rowLimit = 10000; // שנה של משמרות 365*8

document.addEventListener('input', saveTable);

// מאזין לשינויים בטקסטאראה ושומר אותם ב-LocalStorage
document.getElementById('txtID').addEventListener('input', () => {
    localStorage.setItem('text', JSON.stringify(document.getElementById('txtID').value));
});

document.addEventListener("DOMContentLoaded", function () {
    loadTable();
    setTimeout(scrollToBottom, 100); // גלול לתחתית הדף כאשר הדף נטען
    // טוען את הטקסט השמור בעת טעינת הדף
    const savedText = localStorage.getItem('text');
    if (savedText) {
        document.getElementById('txtID').value = JSON.parse(savedText);
    }
});

function commanderView() {

    let password = "446162616B61726F76";
    let userInput = prompt("הכנס סיסמא לתצוגת המפקד");
    if (userInput === fromHex(password)) {
        document.getElementById('table-body').innerHTML = '';
        document.getElementById("div_buttons").style.display = "none";
        document.getElementById("commanderBtnDiv").style.display = "block";

        const data = JSON.parse(localStorage.getItem('tableData'));
        if (data) {
            populateTable(data);
        } else {
            console.error('No data found in local storage');
        }
    } else {
        alert("הסיסמא שגויה, נסה שוב");
    }

}

function RegularView() {
    document.getElementById('table-body').innerHTML = '';
    document.getElementById("div_buttons").style.display = "block";
    document.getElementById("commanderBtnDiv").style.display = "none";
    rowCount = 0;
    loadTable();
    setTimeout(scrollToBottom, 100);
}

function populateTable(data) {
    const tableBody = document.getElementById('table-body');
    let prevDateTime = null;
    let Disparity_Count = 0;
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        const currentDateTime = new Date(`${row["date"]}T${row["time"]}`);

        if (prevDateTime) {
            const timeDiff = Math.abs(currentDateTime - prevDateTime) / (1000 * 60 * 60);
            if (timeDiff > 4) {
                tr.classList.add('red');
                Disparity_Count++;
            }
        }
        if (!row["provider"]) {
            tr.classList.add('red');
            Disparity_Count++;
        }


        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        const tdName = document.createElement('td');
        tdName.textContent = row["name"];
        tr.appendChild(tdName);

        const tdDate = document.createElement('td');
        tdDate.textContent = row["date"];
        tr.appendChild(tdDate);

        const tdTime = document.createElement('td');
        tdTime.textContent = row["time"];
        tr.appendChild(tdTime);

        const tdFindings = document.createElement('td');
        tdFindings.textContent = row["findings"];
        tr.appendChild(tdFindings);

        const tdProvider = document.createElement('td');
        tdProvider.textContent = row["provider"];
        tr.appendChild(tdProvider);

        tableBody.appendChild(tr);
        prevDateTime = currentDateTime;
    });
    if (Disparity_Count === 0) {
        document.getElementById('labelDisparity').innerText = 'ללא פערים';
    } else {
        document.getElementById('labelDisparity').innerText = "פערים: " + Disparity_Count;
    }
}

function downloadData() {
    const data = localStorage.getItem('tableData');
    if (!data) {
        console.error('No data found in local storage');
        return;
    }

    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tableData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function addRow() {
    rowCount++;
    const tableBody = document.getElementById('table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
                <td>${rowCount}</td>
                <td><input type="text" name="name${rowCount}" oninput="saveTable()"></td>
                <td><input type="date" name="date${rowCount}"oninput="saveTable()"></td>
                <td><input type="time" name="time${rowCount}"oninput="saveTable()"></td>
                <td><textarea name="findings${rowCount}"oninput="saveTable()"></textarea></td>
                <td><input type="text" name="provider${rowCount}" oninput="saveTable()"></td>
            `;

    tableBody.appendChild(newRow);
    saveTable();
}

function saveTable() {
    const rows = document.querySelectorAll('#table-body tr');


    const tableData = [];

    rows.forEach((row, index) => {
        const name = row.querySelector(`input[name="name${index + 1}"]`).value;
        const date = row.querySelector(`input[name="date${index + 1}"]`).value;
        const time = row.querySelector(`input[name="time${index + 1}"]`).value;
        const findings = row.querySelector(`textarea[name="findings${index + 1}"]`).value;
        const provider = row.querySelector(`input[name="provider${index + 1}"]`).value;

        tableData.push({name, date, time, findings, provider});
    });

    localStorage.setItem('tableData', JSON.stringify(tableData));
}

function loadTable() {
    let tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    checkRowLimitAndDeleteFirst(tableData.length);
    tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    tableData.forEach((rowData) => {
        rowCount++;
        const tableBody = document.getElementById('table-body');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
                    <td>${rowCount}</td>
                    <td><input type="text" name="name${rowCount}" value="${rowData.name}"></td>
                    <td><input type="date" name="date${rowCount}" value="${rowData.date}"></td>
                    <td><input type="time" name="time${rowCount}" value="${rowData.time}"></td>
                    <td><textarea name="findings${rowCount}">${rowData.findings}</textarea></td>
                    <td><input type="text" name="provider${rowCount}" value="${rowData.provider}"></td>
                `;

        tableBody.appendChild(newRow);
    });
}

function checkRowLimitAndDeleteFirst(tableDataLen) {
    while (tableDataLen > rowLimit) {
        // עדכון ה-Local Storage לאחר מחיקת השורה הראשונה
        const tableData = JSON.parse(localStorage.getItem('tableData')) || [];
        tableData.shift(); // מחיקת השורה הראשונה מהזיכרון
        localStorage.setItem('tableData', JSON.stringify(tableData));
        tableDataLen--;
    }
}

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

function tableReset() {
    let userInput = prompt("למחיקת הטבלה הקלד \"אישור\" ");
    if (userInput === "אישור") {
        document.getElementById('table-body').innerHTML = '';
        localStorage.removeItem('tableData');
        alert("הטבלה אופסה בהצלחה");
    } else {
        alert("שגיאה באישור, נסה שוב");
    }
}

function toHex(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}

function fromHex(hex) {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return result;
}
