function buildHierarchy() {
    
    // disable input after submit
    var inputForm = document.getElementById("input-form");
    inputForm.setAttribute("disabled", "disabled");

    // remove data from previous function call
    let existingSection = document.getElementsByTagName("section");
    try {
        existingSection[0].remove();
    } catch {}

    // add loader icon and text
    let loaderString = "Daten werden geladen. Bitte warten - 1000 Datensätze brauchen ca. 50 Sekunden.";
    var loaderText = createElementByTagAndText("p", loaderString);
    var loaderIcon = document.createElement("div");
    loaderIcon.setAttribute("id", "loader");
    let loaderImage = document.createElement("img");
    loaderImage.setAttribute("src", "spinner.svg");
    loaderImage.setAttribute("alt", "Ladeanimation");

    loaderIcon.appendChild(loaderImage);
    document.body.appendChild(loaderText);
    document.body.appendChild(loaderIcon);

    // get avlues from form inputs
    var acNum = document.getElementById("acnum").value;
    var instId = document.getElementById("alma_inst_id").value;
    var namespace = "http://www.loc.gov/MARC21/slim";

    // make vars global where necessary
    var headingForTable;
    var numberOfRecords;
    var records;
    var titleForHeadAcNum;

    var params = new URLSearchParams({
        "ac_num": acNum
    });
    var requestUrl = "./fetchsru.php?" + params;

    // make sru requests
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
            numberOfRecords = checkNumberOfRecords(xmlObject);
            if ( numberOfRecords && numberOfRecords > 0 ) {
                modifiedSectionForCurrentAcNum = createTable(xmlObject, sectionForCurrentAcNum);
            } else {
                let errorP = createElementByTagAndText("p", "Für " + acNum + " wurden keine Datensätze gefunden.");
                sectionForCurrentAcNum.appendChild(errorP);
                loaderIcon.remove();
                loaderText.remove();
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
            //console.log(error);
            console.log("Could not create table.");
        } finally {
            document.body.appendChild(sectionForCurrentAcNum);
        }

        makeTableSortable();
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
            "773$$q bzw. 830$$v",
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

        numDependentRecords = numberOfRecords-1;
        sectionAddition = " mit " + numDependentRecords + " abhängigen Datensätzen.";
        headingForTable.textContent += sectionAddition;

        var tableBody = document.createElement("tbody");

        for (let i = 0; i < numRecords; i ++) {

            //console.log(i);

            let currentRecord = recordsXml.children[0].children[i];
            let currentTr = document.createElement('tr');

            function nsResolver(prefix) {
                return namespace;
            }

            let partOrder = extractPartOrder(recordsXml, currentRecord);
            let linkType = extractLinkType(recordsXml, currentRecord);
            let partTitle = extractPartTitle(recordsXml, currentRecord);
            let partYear = extractPartYear(recordsXml, currentRecord);
            let partEdition = extractPartEdition(recordsXml, currentRecord);
            let partId = extractPartId(recordsXml, currentRecord);
            let partHoldings = extractPartHoldings(recordsXml, currentRecord);

            let isbdTitle = buildTitleFromSubfields(partTitle, linkType);

            if (partId.substring(2) == acNum.substring(2)) {
                titleForHeadAcNum = createElementByTagAndText("p", '"' + isbdTitle + '"');
                titleForHeadAcNum.setAttribute("id", "title-" + acNum);
                titleForHeadAcNum.setAttribute("class", "title");
                continue;
            }

            if (partHoldings) {
                hasInstHoldings = "Ja";
                currentTr.setAttribute("class", "has-holdings");
            } else if ( linkType == "MTM" ) {
                hasInstHoldings = "";
            } else {
                hasInstHoldings = "Nein";
                currentTr.setAttribute("class", "has-no-holdings");
            }

            appendTableDataToRow(partOrder, currentTr);
            appendTableDataToRow(linkType, currentTr);
            appendTableDataToRow(isbdTitle, currentTr);
            appendTableDataToRow(partYear, currentTr);
            appendTableDataToRow(partEdition, currentTr);
            appendTableDataToRow(partId, currentTr);
            appendTableDataToRow(hasInstHoldings, currentTr);

            tableBody.appendChild(currentTr);
            table.appendChild(tableBody);
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
            
            let xpathText = 'default:datafield[@tag="245"]/default:subfield/text()';
            let xpathResultText = recordsXml.evaluate(xpathText, currentRecord, nsResolver);
            let xpathSf = 'default:datafield[@tag="245"]/default:subfield';
            let xpathResultSf = recordsXml.evaluate(xpathSf, currentRecord, nsResolver);

            var subfields = [];
            var subfield, text;

            try {
                while (subfield = xpathResultSf.iterateNext().getAttribute('code'), text = xpathResultText.iterateNext().wholeText) {
                    let sfObject = {[subfield]: text};
                    subfields.push(sfObject);
                }
            } catch (error) {
                //console.log(error);
            }
            return subfields;
        }

        function buildTitleFromSubfields(subfields, linkType) {
            var title = "";
            for (let i = 0; i < subfields.length; i ++) {
                let subfield = subfields[i];
                let subfieldKey = Object.keys(subfield)[0];
                let subfieldValue = Object.values(subfield)[0];
                if ( linkType === "TAT" && ! ["a", "b", "c"].indexOf(subfieldKey) ) {
                    continue;
                } else {
                    if (title !== "") {
                        if (subfieldKey === "b") {
                            title += ' : ';
                        } else if (subfieldKey === "c") {
                            title += ' / ';
                        } else if (subfieldKey === "n") {
                            title += '. ';
                        } else if (subfieldKey === "p") {
                            title += ', ';
                        }
                    }
                    title += subfieldValue;
                    isFirstTitlePart = false;
                }
            }

            return title;
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

            sectionElement.append(titleForHeadAcNum);
            sectionElement.append(table);

            loaderIcon.remove();
            loaderText.remove();
            inputForm.removeAttribute("disabled");
    
            return sectionElement;

        } else {
            console.log("Input for fetchsru.php did not lead to XML output.");
        }

    }

    function makeTableSortable() {
         // kudos https://stackoverflow.com/questions/14267781
         const getCellValue = (tr, idx) => idx == 0 ? tr.children[idx].innerText.replace(',', '.').replace(/ .*$/, '') || tr.children[idx].textContent.replace(',', '.').replace(/ .*$/, '') : tr.children[idx].innerText || tr.children[idx].textContent;
         const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
             v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
             )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
         
         // do the work...
         document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
             const table = th.closest('table');
             const tbody = table.querySelector('tbody');
             Array.from(tbody.querySelectorAll('tr'))
                 .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
                 .forEach(tr => tbody.appendChild(tr) );
             // set class for asc/desc marker
             allTh = th.parentNode.children;
             for (let i = 0; i < allTh.length; i ++) { allTh[i].setAttribute("class", ""); }
             th.setAttribute("class", asc ? "ascending" : "descending");
         })));
    }

}
