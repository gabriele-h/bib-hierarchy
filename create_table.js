"use strict";
function buildHierarchy() {

    // get and manipulate values from form inputs
    const bibIdInput = document.getElementById("bibid");
    let bibIdInputValue = bibIdInput.value;
    // we allow inputs without the prefix and with whitespaces
    // the following does some cleanup and prefixing for that
    const noPrefixRegex = new RegExp('^(?!' + bibIdPrefix + ')(\d+)')
    const bibId = bibIdInputValue.replace(/\s/g, '').replace(noPrefixRegex, bibIdPrefix + '$2').toUpperCase();
    bibIdInput.value = bibId;
    const instId = document.getElementById("alma-inst-id").value;

    // make vars global where necessary
    let headingForTable;
    let numberOfRecords;
    let records;
    let titleForHeadBibId;

    const params = new URLSearchParams({
        "bib_id": bibId
    });
    const requestUrl = "./fetchsru.php?" + params;
    const namespace = "http://www.loc.gov/MARC21/slim";
    const tableId = "bib-hierarchy-"+bibId;
    const csvLinkId = "download-csv";
    const main = document.getElementById("main");

    // change the current location in browser's location bar
    const bibIdUri = encodeURI(bibId);
    const instIdUri = encodeURI(instId);
    history.replaceState(null, null, "?bibid="+bibIdUri+"&alma_inst_id="+instIdUri);
    
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
        let modifiedSectionForCurrentBibId;
        const sectionForCurrentBibId = document.createElement("section");
        sectionForCurrentBibId.setAttribute("id", bibId);
        const headingForTableText = "Ausgehend von " + bibId;
        headingForTable = createElementByTagAndText("h2", headingForTableText);
        headingForTable.setAttribute("id", "bib-hierarchy-table-heading");
        sectionForCurrentBibId.append(headingForTable);

        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            const xmlObject = xhr.responseXML;
            numberOfRecords = checkNumberOfRecords(xmlObject);
            if ( numberOfRecords && numberOfRecords > 0 ) {
                modifiedSectionForCurrentBibId = createTable(xmlObject, sectionForCurrentBibId);
            } else {
                const errorP = createElementByTagAndText("p", "Für " + bibId + " wurden keine Datensätze gefunden.");
                sectionForCurrentBibId.appendChild(errorP);
                loaderIcon.remove();
                loaderText.remove();
                inputForm.removeAttribute("disabled");
            }
        } else {
            console.log("Error encountered on call of fetchsru.php");
            const errorP = createElementByTagAndText("p", "SRU lieferte Fehler für " + bibId);
            loaderIcon.remove();
            loaderText.remove();
            sectionForCurrentBibId.appendChild(errorP);
        }

        try {
            main.appendChild(modifiedSectionForCurrentBibId);
        } catch (error) {
            //console.log(error);
            console.log("Could not create table.");
        } finally {
            main.appendChild(sectionForCurrentBibId);
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
            networkIdName,
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
            headingForTable.textContent = "Keine abhängigen Datensätze für " + bibId;
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
            const isDublette = extractDublette(recordsXml, currentRecord, nsResolver);

            const isbdTitle = buildTitleFromSubfields(partTitle, linkType);

            if (partId.substring(2) == bibId.substring(2)) {
                titleForHeadBibId = createElementByTagAndText("p", '"' + isbdTitle + '"');
                titleForHeadBibId.setAttribute("id", "title-" + bibId);
                titleForHeadBibId.setAttribute("class", "title");
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

            appendTableDataToRow(partOrder, currentTr, false);
            appendTableDataToRow(linkType, currentTr, false);
            appendTableDataToRow(isbdTitle, currentTr, isDublette);
            appendTableDataToRow(partYear, currentTr, false);
            appendTableDataToRow(partEdition, currentTr, false);
            appendTableDataToRow(partId, currentTr, false);
            appendTableDataToRow(hasInstHoldings, currentTr, false);

            tableBody.appendChild(currentTr);
            table.appendChild(tableBody);
        }

        function appendTableDataToRow(tdText, tableRow, cssClass) {
            const td = createElementByTagAndText('td', tdText);
            if (cssClass) {
                td.setAttribute("class", cssClass);
            }
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
    
                if (typeof sfWText !== "undefined" && sfWText.indexOf(bibId) !== -1) {
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
            // extract holdings info from marc datafield
            let marcPartInstId;
            const xpath = 'default:datafield[@tag="' + marcPartTag + '"]/default:subfield[@code="' + marcPartSf + '"]/text()';
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            let hasInstHoldings = false;
            try {
                while ( marcPartInstId = xpathResult.iterateNext().wholeText ) {
                    if (marcPartInstId == instId) {
                        hasInstHoldings = true;
                    }
                }
            } catch {
            }
            return hasInstHoldings;
        }

        function extractDublette(recordsXml, currentRecord, nsResolver) {
            // extract info on whether record is a "Dublette"
            let datafield970;
            let dublettenCheck = new RegExp('.*dublette.*', 'i');
            const xpath = 'default:datafield[@tag="970"]/default:subfield[@ind1="0"][@ind2=" "]/text()';
            const xpathResult = recordsXml.evaluate(xpath, currentRecord, nsResolver);
            try {
                while ( datafield970 = xpathResult.iterateNext().wholeText ) {
                    if ( dublettenCheck.test(datafield970) == true ) {
                        console.log("Dublette found.");
                        return "dublette";
                    }
                }
            } catch {
            }
            return false;
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

            sectionElement.append(titleForHeadBibId);

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
