// Kudos to Calumah
// All of the following content is licensed under CC BY-SA 4.0
// https://creativecommons.org/licenses/by-sa/4.0/
// original source https://stackoverflow.com/a/56370447

// Quick and simple export target #tableId into a csv

function downloadTableAsCsv(tableId, linkId, separator = ';') {
    // Select rows from tableId
    const rows = document.querySelectorAll('table#' + tableId + ' tr');
    // Construct csv
    const csv = [];
    for (let i = 0; i < rows.length; i++) {
        row = [], cols = rows[i].querySelectorAll('td, th');
        for (let j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    const csvString = csv.join('\n');
    // Download it
    const filename = 'export_' + tableId + '_' + new Date().toISOString().substring(0, 10) + '.csv';
    const link = document.getElementById(linkId);
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csvString));
    link.setAttribute('download', filename);
}
