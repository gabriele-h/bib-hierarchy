// Quick and simple export target #table_id into a tsv
// kudos: https://stackoverflow.com/questions/15547198/56370447#56370447

function download_table_as_tsv(table_id, separator = '\t') {
    // Select rows from table_id
    const rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct tsv
    const tsv = [];
    for (let i = 0; i < rows.length; i++) {
        row = [], cols = rows[i].querySelectorAll('td, th');
        for (let j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break tsv)
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-tsv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        tsv.push(row.join(separator));
    }
    const tsv_string = tsv.join('\n');
    // Download it
    const filename = 'export_' + table_id + '_' + new Date().toISOString().substring(0, 10) + '.tsv';
    const link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/tsv;charset=utf-8,' + encodeURIComponent(tsv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.remove(link);
}
