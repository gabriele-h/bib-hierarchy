function buildHierarchy() {

    var acNum = document.getElementById("acnum").value;
    var instId = document.getElementById("alma_inst_id").value;
    var namespace = "http://www.loc.gov/MARC21/slim";

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
        sectionForCurrentAcNum.setAttribute("id", acNum);
        let headingForTableText = "Hierarchieanzeige ausgehend von " + acNum;
        let headingForTable = createElementByTagAndText("h2", headingForTableText);
        sectionForCurrentAcNum.append(headingForTable);

        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var xmlObject = xhr.responseXML;
            sectionForCurrentAcNum = createTable(xmlObject, sectionForCurrentAcNum);
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

    function createTableContents(table, recordsXml) {
        console.log("Creating table contents…");

        numRecords = recordsXml.childNodes[0].childNodes.length;

        for (let i = 0; i < numRecords; i ++) {

            let currentRecord = recordsXml.children[0].children[i];

            function nsResolver(prefix) {
                return namespace;
            }
            let xpath = "default:leader/text()";
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            console.log(xpathResult.iterateNext());

        }

    }    

    function createTable(recordsXml, sectionElement) {
        console.log("Creating table…");

        if (recordsXml) {

            let table = createTableHeading();
            createTableContents(table, recordsXml);

            sectionElement.append(table);
    
            return sectionElement;

        } else {
            console.log("No records found?");
        }
    }
}
