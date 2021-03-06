"use strict";
function buildHierarchy() {

    // get and manipulate values from form inputs
    const acNumInput = document.getElementById("acnum");
    let acNumInputValue = acNumInput.value;
    const acNum = acNumInputValue.replace(/\s/g, '').replace(/^([^aA])/, 'AC$1');
    acNumInput.value = acNum;
    const instId = document.getElementById("alma-inst-id").value;

    // make vars global where necessary
    let headingForTable;
    let numberOfRecords;
    let records;
    let titleForHeadAcNum;

    const params = new URLSearchParams({
        "ac_num": acNum
    });
    const requestUrl = "./fetchsru.php?" + params;
    const namespace = "http://www.loc.gov/MARC21/slim";
    const tableId = "bib-hierarchy-"+acNum;
    const csvLinkId = "download-csv";
    const main = document.getElementById("main");

    // change the current location in browser's location bar
    const acNumUri = encodeURI(acNum);
    const instIdUri = encodeURI(instId);
    history.replaceState(null, null, "?acnum="+acNumUri+"&alma_inst_id="+instIdUri);
    
    // disable input after submit
    const inputForm = document.getElementById("input-form");
    inputForm.setAttribute("disabled", "disabled");

    // remove data from previous function call
    const existingSection = document.getElementsByTagName("section");
    try {
        existingSection[0].remove();
    } catch {}

    // add loader icon and text
    const loaderString = "Bitte warten. Ladezeit kann Sekunden bis Minuten betragen.";
    const loaderText = createElementByTagAndText("p", loaderString);
    loaderText.setAttribute("id", "loader-text");
    const loaderIcon = document.createElement("div");
    loaderIcon.setAttribute("id", "loader");
    const loaderImage = document.createElement("img");
    loaderImage.setAttribute("src", "spinner.svg");
    loaderImage.setAttribute("alt", "Ladeanimation");

    loaderIcon.appendChild(loaderImage);
    main.appendChild(loaderText);
    main.appendChild(loaderIcon);
    const xlsLinkId = "download-xls";

    // call fetchsru.php and build table
    const xhr = new XMLHttpRequest;

    xhr.open('GET', requestUrl);
    xhr.responseType = 'document';
    xhr.overrideMimeType('text/xml');

    xhr.onload = function() {
        let modifiedSectionForCurrentAcNum;
        const sectionForCurrentAcNum = document.createElement("section");
        sectionForCurrentAcNum.setAttribute("id", acNum);
        const headingForTableText = "Ausgehend von " + acNum;
        headingForTable = createElementByTagAndText("h2", headingForTableText);
        headingForTable.setAttribute("id", "bib-hierarchy-table-heading");
        sectionForCurrentAcNum.append(headingForTable);

        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            const xmlObject = xhr.responseXML;
            numberOfRecords = checkNumberOfRecords(xmlObject);
            if ( numberOfRecords && numberOfRecords > 0 ) {
                modifiedSectionForCurrentAcNum = createTable(xmlObject, sectionForCurrentAcNum);
            } else {
                const errorP = createElementByTagAndText("p", "Für " + acNum + " wurden keine Datensätze gefunden.");
                sectionForCurrentAcNum.appendChild(errorP);
                loaderIcon.remove();
                loaderText.remove();
                inputForm.removeAttribute("disabled");
            }
        } else {
            console.log("Error encountered on call of fetchsru.php");
            const errorP = createElementByTagAndText("p", "SRU lieferte Fehler für " + acNum);
            sectionForCurrentAcNum.appendChild(errorP);
        }

        try {
            main.appendChild(modifiedSectionForCurrentAcNum);
        } catch (error) {
            //console.log(error);
            console.log("Could not create table.");
        } finally {
            main.appendChild(sectionForCurrentAcNum);
        }

        if (document.querySelector("tbody")) {
            makeTableSortable();
        }

        try {
            document.querySelector("thead").querySelector("th").click();
        } catch (error) {
            //console.log(error);
        }

        try {
            downloadTableAsCsv(tableId, csvLinkId);
        } catch(error) {
            console.log(error);
        }
    };

    xhr.send();

    function checkNumberOfRecords(recordsXml) {
        let numRecords;
        try {
            numRecords = recordsXml.childNodes[0].childNodes.length;
        } catch {
            numRecords = undefined;
        } finally {
            return numRecords;
        }
    }

    function createElementByTagAndText(elementTag, elementText) {
        const element = document.createElement(elementTag);
        const textElement = document.createTextNode(elementText);
        element.appendChild(textElement);
        return element;
    }

    function createTableHeading() {

        const table = document.createElement("table");
        table.setAttribute("id", tableId);
        const tableHead = document.createElement("thead");
        const tableHeadRow = document.createElement("tr");
        const tableHeadings = [
            "773$$q bzw. 830$$v",
            "Linktyp",
            "Titel des Teils",
            "Erscheinungsjahr",
            "Ausgabebezeichnung",
            "Netzwerk-ID",
            "Lokalbestand " + instId
        ]

        tableHeadings.forEach(item => {
            const thElement = createElementByTagAndText("th", item);
            tableHeadRow.appendChild(thElement);
        });

        tableHead.appendChild(tableHeadRow);
        table.appendChild(tableHead);

        return table;
    }

    function createTableContents(table, recordsXml) {

        const numDependentRecords = numberOfRecords-1;
        if (numDependentRecords > 0) {
            const sectionAddition = " mit " + numDependentRecords + " abhängigen Datensätzen";
            headingForTable.textContent += sectionAddition;
        } else {
            headingForTable.textContent = "Keine abhängigen Datensätze für " + acNum;
        }

        const tableBody = document.createElement("tbody");

        for (let i = 0; i < numberOfRecords; i ++) {

            //console.log(i);

            const currentRecord = recordsXml.children[0].children[i];
            const currentTr = document.createElement('tr');

            function nsResolver(prefix) {
                return namespace;
            }

            const partOrder = extractPartOrder(recordsXml, currentRecord, nsResolver);
            const linkType = extractLinkType(recordsXml, currentRecord, nsResolver);
            const partTitle = extractPartTitle(recordsXml, currentRecord, nsResolver);
            const partYear = extractPartYear(recordsXml, currentRecord, nsResolver);
            const partEdition = extractPartEdition(recordsXml, currentRecord, nsResolver);
            const partId = extractPartId(recordsXml, currentRecord, nsResolver);
            const partHoldings = extractPartHoldings(recordsXml, currentRecord, nsResolver);

            const isbdTitle = buildTitleFromSubfields(partTitle, linkType);

            if (partId.substring(2) == acNum.substring(2)) {
                titleForHeadAcNum = createElementByTagAndText("p", '"' + isbdTitle + '"');
                titleForHeadAcNum.setAttribute("id", "title-" + acNum);
                titleForHeadAcNum.setAttribute("class", "title");
                continue;
            }

            if (typeof partOrder === "undefined") {
                console.log("Skipping " + partId + ", because there is no valid $$w in either 773 or 830.");
                continue;
            }

            let hasInstHoldings;

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
            const td = createElementByTagAndText('td', tdText);
            tableRow.appendChild(td);
        }

        function extractPartOrder(recordsXml, currentRecord, nsResolver) {
            // extract order of parts from 773 q or 830 v
            let partOrder;
            let currentCategory;

            const xpath773Or830 = 'default:datafield[@tag="773" or @tag="830"]';
            const xpath773Or830Result = recordsXml.evaluate(xpath773Or830, currentRecord, nsResolver);

            if (xpath773Or830Result.resultType !== 4) {
                console.log("No 773 or 830 found.");
                return false;
            }

            while (currentCategory = xpath773Or830Result.iterateNext()) {

                let xpathSfWResult;
                let sfWText;

                const currentCategoryNumber = currentCategory.getAttribute("tag");
    
                const xpathSfW = 'default:subfield[@code="w"]/text()';
    
                try {
                    xpathSfWResult = recordsXml.evaluate(xpathSfW, currentCategory, nsResolver);
                    sfWText = xpathSfWResult.iterateNext().wholeText;
                } catch (error) {
                    continue;
                }
    
                if (typeof sfWText !== "undefined" && sfWText.indexOf(acNum) !== -1) {
                    let xpathSfOrder;
                    if (currentCategoryNumber == 773) {
                        xpathSfOrder = 'default:subfield[@code="q"]/text()';
                    } else if (currentCategoryNumber == 830) {
                        xpathSfOrder = 'default:subfield[@code="v"]/text()';
                    }
                    const partOrderResult = recordsXml.evaluate(xpathSfOrder, currentCategory, nsResolver);
                    try {
                        partOrder = partOrderResult.iterateNext().wholeText;
                    } catch (error) {
                        return "";
                    }
                } else {
                    continue;
                }
            }

            return partOrder;
        }

        function extractLinkType(recordsXml, currentRecord, nsResolver) {
            // extract link type from leader position 19
            const xpath = "default:leader/text()";
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            const leader = xpathResult.iterateNext().wholeText;
            const linkType = leader.substring(19, 20);

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

        function extractPartTitle(recordsXml, currentRecord, nsResolver) {
            // extract the title of the current record
            
            const xpathText = 'default:datafield[@tag="245"]/default:subfield/text()';
            const xpathResultText = recordsXml.evaluate(xpathText, currentRecord, nsResolver);
            const xpathSf = 'default:datafield[@tag="245"]/default:subfield';
            const xpathResultSf = recordsXml.evaluate(xpathSf, currentRecord, nsResolver);

            const subfields = [];
            let subfield, text;

            try {
                while (subfield = xpathResultSf.iterateNext().getAttribute('code'), text = xpathResultText.iterateNext().wholeText) {
                    const sfObject = {[subfield]: text};
                    subfields.push(sfObject);
                }
            } catch (error) {
                //console.log(error);
            }
            return subfields;
        }

        function buildTitleFromSubfields(subfields, linkType) {
            let title = "";
            for (let i = 0; i < subfields.length; i ++) {

                const subfield = subfields[i];
                const subfieldKey = Object.keys(subfield)[0];
                const subfieldValue = Object.values(subfield)[0];

                if (subfieldKey === "6") continue;

                if ( linkType === "TAT" && ["a", "b", "c"].indexOf(subfieldKey) >= 0 ) { 
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
                }
            }

            return title;
        }

        function extractPartYear(recordsXml, currentRecord, nsResolver) {
            // extract the publication year of the current record
            const xpath = 'default:controlfield[@tag="008"]/text()';
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            const marc008 = xpathResult.iterateNext().wholeText;
            const year = marc008.substring(7,11);
            return year;
        }

        function extractPartEdition(recordsXml, currentRecord, nsResolver) {
            // extract edition from MARC 250
            const xpath = 'default:datafield[@tag="250"]/default:subfield/text()';
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let marc250 = "";
            try {
                marc250 = xpathResult.iterateNext().wholeText;
            } catch {
            } finally {
                return marc250;
            }
        }

        function extractPartId(recordsXml, currentRecord, nsResolver) {
            // extract AC-Number of the current record
            const xpath = 'default:controlfield[@tag="009"]/text()';
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            const marc009 = xpathResult.iterateNext().wholeText;
            return marc009;
        }

        function extractPartHoldings(recordsXml, currentRecord, nsResolver) {
            // extract holdings info from marc 852
            let marc852a;
            const xpath = 'default:datafield[@tag="852"]/default:subfield[@code="a"]/text()';
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
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

            const table = createTableHeading();
            createTableContents(table, recordsXml);

            if (numberOfRecords > 1) {
                const csvDownloadLink = createElementByTagAndText("a", "CSV Download");
                csvDownloadLink.setAttribute("id", csvLinkId);
                sectionElement.append(csvDownloadLink);
            }

            sectionElement.append(titleForHeadAcNum);

            if (numberOfRecords > 1) {
                sectionElement.append(table);
            }

            loaderIcon.remove();
            loaderText.remove();
            inputForm.removeAttribute("disabled");
    
            return sectionElement;

        } else {
            console.log("Input for fetchsru.php did not lead to XML output.");
        }

    }

}
