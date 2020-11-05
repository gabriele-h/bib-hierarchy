function buildHierarchy() {

    var inputForm = document.getElementById("input-form");
    inputForm.setAttribute("disabled", "disabled");

    let existingSection = document.getElementsByTagName("section");
    try {
        existingSection[0].remove();
    } catch {}

    // begin loader icon
    var loaderIcon = document.createElement("div");
    loaderIcon.setAttribute("id", "loader");
    let loaderImage = document.createElement("img");
    loaderImage.setAttribute("src", "spinner.svg");
    loaderImage.setAttribute("alt", "Daten werden geladen. Bitte warten.");

    loaderIcon.appendChild(loaderImage);
    document.body.appendChild(loaderIcon);
    // end loader icon

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
        var modifiedSectionForCurrentAcNum;
        let sectionForCurrentAcNum = document.createElement("section");
        sectionForCurrentAcNum.setAttribute("id", acNum);
        let headingForTableText = "Ausgehend von " + acNum;
        headingForTable = createElementByTagAndText("h2", headingForTableText);
        sectionForCurrentAcNum.append(headingForTable);

        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var xmlObject = xhr.responseXML;
            if ( checkNumberOfRecords(xmlObject) && checkNumberOfRecords(xmlObject) > 0 ) {
                modifiedSectionForCurrentAcNum = createTable(xmlObject, sectionForCurrentAcNum);
            } else {
                let errorP = createElementByTagAndText("p", "Für " + acNum + " wurden keine Datensätze gefunden.");
                sectionForCurrentAcNum.appendChild(errorP);
                loaderIcon.remove();
                inputForm.removeAttribute("disabled");
            }
        } else {
            console.log("Error encountered on call of fetchsru.php");
            let errorP = createElementByTagAndText("p", "SRU lieferte Fehler für " + acNum);
            sectionForCurrentAcNum.appendChild(errorP);
        }

        try {
            document.body.appendChild(modifiedSectionForCurrentAcNum);
        } catch (error) {
            console.log(error);
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

        numRecords = recordsXml.childNodes[0].childNodes.length;
        numDependentRecords = numRecords-1
        sectionAddition = " mit " + numDependentRecords + " abhängigen Datensätzen.";
        headingForTable.textContent += sectionAddition;

        for (let i = 0; i < numRecords; i ++) {

            //console.log(i);

            let currentRecord = recordsXml.children[0].children[i];
            let currentTr = document.createElement('tr');

            function nsResolver(prefix) {
                return namespace;
            }

            partOrder = extractPartOrder(recordsXml, currentRecord);
            linkType = extractLinkType(recordsXml, currentRecord);
            partTitle = extractPartTitle(recordsXml, currentRecord);
            partYear = extractPartYear(recordsXml, currentRecord);
            partEdition = extractPartEdition(recordsXml, currentRecord);
            partId = extractPartId(recordsXml, currentRecord);
            partHoldings = extractPartHoldings(recordsXml, currentRecord);

            if (partId.substring(2) == acNum.substring(2)) {
                continue
            }

            if (partHoldings) {
                hasInstHoldings = "Ja";
                currentTr.setAttribute("class", "has-holdings");
            } else {
                hasInstHoldings = "Nein";
                currentTr.setAttribute("class", "has-no-holdings");
            }

            appendTableDataToRow(partOrder, currentTr);
            appendTableDataToRow(linkType, currentTr);
            appendTableDataToRow(partTitle, currentTr);
            appendTableDataToRow(partYear, currentTr);
            appendTableDataToRow(partEdition, currentTr);
            appendTableDataToRow(partId, currentTr);
            appendTableDataToRow(hasInstHoldings, currentTr);

            table.appendChild(currentTr);
        }

        function appendTableDataToRow(tdText, tableRow) {
            td = createElementByTagAndText('td', tdText);
            tableRow.appendChild(td);
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
                partOrder = ''
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
                return "???";
            }
        }

        function extractPartTitle(recordsXml, currentRecord) {
            // extract the title of the current record
            let xpath = 'default:datafield[@tag="245"]/default:subfield/text()';
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            subfields = [];
            try {
                while (subfield = xpathResult.iterateNext().wholeText) {
                    subfields.push(subfield);
                }
            } catch {
            }
            return subfields.join(', ');
        }

        function extractPartYear(recordsXml, currentRecord) {
            // extract the publication year of the current record
            let xpath = 'default:controlfield[@tag="008"]/text()';
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let marc008 = xpathResult.iterateNext().wholeText;
            let year = marc008.substring(7,11);
            return year;
        }

        function extractPartEdition(recordsXml, currentRecord) {
            // extract edition from MARC 250
            let xpath = 'default:datafield[@tag="250"]/default:subfield/text()';
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let marc250 = "";
            try {
                marc250 = xpathResult.iterateNext().wholeText;
            } catch {
            } finally {
                return marc250;
            }
        }

        function extractPartId(recordsXml, currentRecord) {
            // extract AC-Number of the current record
            let xpath = 'default:controlfield[@tag="009"]/text()';
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let marc009 = xpathResult.iterateNext().wholeText;
            return marc009;
        }

        function extractPartHoldings(recordsXml, currentRecord) {
            // extract holdings info from marc 852
            let xpath = 'default:datafield[@tag="852"]/default:subfield[@code="a"]/text()';
            let xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let hasInstHoldings = false;
            try {
                while ( marc852a = xpathResult.iterateNext().wholeText ) {
                    if (marc852a == instId) {
                        hasInstHoldings = true;
                    }
                }
            } catch {
            }
            return hasInstHoldings;
        }
            
    }    

    function createTable(recordsXml, sectionElement) {
        console.log("Creating table…");

        if (recordsXml) {

            let table = createTableHeading();
            createTableContents(table, recordsXml);

            sectionElement.append(table);

            loaderIcon.remove();
            inputForm.removeAttribute("disabled");
    
            return sectionElement;

        } else {
            console.log("Input for fetchsru.php did not lead to XML output.");
        }

    }
}
