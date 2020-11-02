function buildHierarchy() {

    var acNum = document.getElementById("acnum").value;
    var instId = document.getElementById("alma_inst_id").value;

    var records;

    var params = new URLSearchParams({
        "ac_num": acNum
    });
    var requestUrl = "./fetchsru.php?" + params;

    var xhr = new XMLHttpRequest;

    xhr.open('GET', requestUrl);
    xhr.responseType = 'document';
    xhr.overrideMimeType('text/xml');

    xhr.onload = function() {
        let sectionForCurrentAcNum = document.createElement("section");
        sectionForCurrentAcNum.setAttribute("acnum", acNum);
        let headingForTableText = "Hierarchie für " + acNum;
        let headingForTable = createElementByTagAndText("h2", headingForTableText);
        sectionForCurrentAcNum.append(headingForTable);

        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var xmlObject = xhr.responseXML;
            records = xmlObject.getElementsByTagNameNS("http://www.loc.gov/MARC21/slim", "record");
            sectionForCurrentAcNum = createTable(records, sectionForCurrentAcNum);
        } else {
            errorP = createElementByTagAndText("p", "SRU call failed for " + acNum);
            sectionForCurrentAcNum.appendChild(errorP);
        }

        document.body.appendChild(sectionForCurrentAcNum);
    };

    xhr.send();

    function createElementByTagAndText(elementTag, elementText) {
        let element = document.createElement(elementTag);
        let textElement = document.createTextNode(elementText);
        element.appendChild(textElement);
        return element;
    }

    function getSorting(record) {
        
    }

    function createTableHeading() {
        let table = document.createElement("table");
        let tableHead = document.createElement("thead");
        let tableHeadRow = document.createElement("tr");
        let tableHeadings = [
            "773 q bzw. 830 v",
            "Linktyp",
            "Titel des Teils",
            "Erscheinungsjahr",
            "Ausgabebezeichnung",
            "Netzwerk-ID",
            "Lokalbestand " + instId
        ]

        tableHeadings.forEach(item => {
            let thElement = createElementByTagAndText("th", item);
            tableHeadRow.appendChild(thElement);
        });

        tableHead.appendChild(tableHeadRow);
        table.appendChild(tableHead);

        return table;
    }

    function createTable(recordList, sectionElement) {
        console.log("Creating table…");

        if (recordList) {

            let table = createTableHeading();

            console.log(RecordList);

            for (record in recordList) {
                numPart = getSorting(record);
            }

            sectionElement.append(table);
    
            return sectionElement;

        } else {
            console.log("No records found?");
        }
    }
}
