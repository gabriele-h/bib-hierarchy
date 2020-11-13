// kudos https://stackoverflow.com/questions/22213611/22213973#22213973
"use: strict";
function downloadTableAsXls(tableId, linkId) {
    const filename = 'export_' + tableId + '_' + new Date().toISOString().substring(0, 10);
    const uri = 'data:application/vnd.ms-excel;base64,';
    const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    const base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        };
    const format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        };
    const tableNode = document.getElementById(tableId);
    const ctx = {
        worksheet: 'bib-hierarchy Output',
        table: tableNode.innerHTML
    };
    document.getElementById(linkId).href = uri + base64(format(template, ctx));
    document.getElementById(linkId).download = filename;
}
