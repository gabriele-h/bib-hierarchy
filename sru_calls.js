function buildHierarchy() {

    var acNum = document.getElementById("acnum").value;
    var instId = document.getElementById("alma_inst_id").value;
    var namespace = "http://www.loc.gov/MARC21/slim";

    var records;
    var headingForTable;

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
        let headingForTableText = "Ausgehend von " + acNum;
        headingForTable = createElementByTagAndText("h2", headingForTableText);
        sectionForCurrentAcNum.append(headingForTable);

        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var xmlObject = xhr.responseXML;
            if ( checkNumberOfRecords(xmlObject) && checkNumberOfRecords(xmlObject) > 0 ) {
                var modifiedSectionForCurrentAcNum = createTable(xmlObject, sectionForCurrentAcNum);
            } else {
                let errorP = createElementByTagAndText("p", "Für " + acNum + " wurden keine Datensätze gefunden.");
                modifiedSectionForCurrentAcNum = sectionForCurrentAcNum.appendChild(errorP);
            }
        } else {
            console.log("Error encountered on call of fetchsru.php");
            let errorP = createElementByTagAndText("p", "SRU lieferte Fehler für " + acNum);
            sectionForCurrentAcNum.appendChild(errorP);
        }

        try {
            document.body.appendChild(modifedSectionForCurrentAcNum);
        } catch {
            console.log("Could not create table.");
        } finally {
            document.body.appendChild(sectionForCurrentAcNum);
        }
    };

    xhr.send();

    function checkNumberOfRecords(recordsXml) {
        try {
            numRecords = recordsXml.childNodes[0].childNodes.length;
        } catch {
            numRecords = undefined;
        } finally {
            return numRecords;
        }
    }

    function createElementByTagAndText(elementTag, elementText) {
        let element = document.createElement(elementTag);
        let textElement = document.createTextNode(elementText);
        element.appendChild(textElement);
        return element;
    }

    function createTableHeading() {
        console.log("Creating table heading…");

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
        numDependentRecords = numRecords-1
        sectionAddition = " mit " + numDependentRecords + " abhängigen Datensätzen.";
        headingForTable.textContent += sectionAddition;

        for (let i = 0; i < numRecords; i ++) {

            console.log(i);

            let currentRecord = recordsXml.children[0].children[i];

            function nsResolver(prefix) {
                return namespace;
            }

            partOrder = extractPartOrder(recordsXml, currentRecord);
            linkType = extractLinkType(recordsXml, currentRecord);
            console.log(partOrder + ", " + linkType);

        }

        function extractPartOrder(recordsXml, currentRecord) {
            // extract order of parts from 773 q or 830 v
            let partOrder;
            let xpath773 = 'default:datafield[@tag="773"]/default:subfield[@code="q"]/text()'
            let xpath830 = 'default:datafield[@tag="830"]/default:subfield[@code="v"]/text()'
            let xpath773Result = recordsXml.evaluate(xpath773, currentRecord, nsResolver);
            let xpath830Result = recordsXml.evaluate(xpath830, currentRecord, nsResolver);

            try {
                partOrder = xpath773Result.iterateNext().wholeText;
            } catch (error) {
                // console.log(error);
            }

            try {
                partOrder = xpath830Result.iterateNext().wholeText;
            } catch (error) {
                // console.log(error);
            }

            if (!partOrder) {
                partOrder = '???';
            }

            return partOrder;

        }

        function extractLinkType(recordsXml, currentRecord) {
            // extract link type from leader position 19
            let xpath = "default:leader/text()";
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let leader = xpathResult.iterateNext().wholeText;
            let linkType = leader.substring(19, 20);

            if (linkType == "c") {
                return "TAT";
            } else if (linkType == "b") {
                return "TUT";
            } else if (linkType == "a") {
                return "MTM";
            } else {
                return "-";
            }
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
            console.log("Input for fetchsru.php did not lead to XML output.");
        }
    }
}
