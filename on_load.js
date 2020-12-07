document.addEventListener('DOMContentLoaded', function () {

    createInstCodesDropdown();
    loadFormWithUrlParams();
    contact();

    function createInstCodesDropdown() {
        var instCodes = {
            "43ACC_UBW": "Universitätsbibliothek Wien",
            "43ACC_ABP": "Anton Bruckner Privatuniversität",
            "43ACC_AKW": "Arbeiterkammerbibliothek Wien",
            "43ACC_GDFS": "Campusbibliotheken St. Pölten",
            "43ACC_DLI": "Diözesanbibliothek Linz",
            "43ACC_FHB": "Fachhochschule Burgenland",
            "43ACC_BFI": "Fachhochschule des BFI Wien",
            "43ACC_C02": "FH Campus 02",
            "43ACC_FHJ": "FH Joanneum",
            "43ACC_KLK": "Kärntner Landesbibliothek",
            "43ACC_UGL": "Kunstuniversität Linz",
            "43ACC_OOELB": "Landesbibliotheken Oberösterreich",
            "43ACC_OEAW": "Österreichische Akademie der Wissenschaften",
            "43ACC_ONB": "Österreichische Nationalbibliothek",
            "43ACC_TUG": "Technische Universität Graz",
            "43ACC_TUW": "TU Wien",
            "43ACC_UBBW": "Universitätsbibliothek Bodenkultur Wien",
            "43ACC_UBG": "Universitätsbibliothek Graz",
            "43ACC_UBI": "Universitätsbibliothek Innsbruck",
            "43ACC_UBK": "Universitätsbibliothek Klagenfurt",
            "43ACC_UBL": "Universitätsbibliothek Linz",
            "43ACC_UBMS": "Universitätsbibliothek Mozarteum Salzburg",
            "43ACC_UBS": "Universitätsbibliothek Salzburg",
            "43ACC_VBK": "Verbund für Bildung und Kultur",
            "43ACC_VUW": "Veterinärmedizinische Universität Wien",
            "43ACC_WIENB": "Wienbibliothek im Rathaus",
            "43ACC_WUW": "Wirtschaftsuniversität Wien"
        };
        
        for (inst in instCodes) {
            var option = document.createElement("option");
            var optionText = document.createTextNode(instCodes[inst]);
            option.appendChild(optionText);
            option.setAttribute("value", inst);
            var select = document.getElementById("alma-inst-id");
            select.appendChild(option);
        }
    }

    function loadFormWithUrlParams() {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        
        const acnumInput = document.getElementById('acnum');
        const institutionInput = document.getElementById('alma-inst-id');
        const submitButton = document.getElementById('submit');
    
        try {
            const acnum = params.get('acnum');
            const instId = params.get('alma_inst_id');
            if (acnum && instId) {
                console.log("Setting form input from URL params.");
                acnumInput.value = acnum;
                institutionInput.value = instId;
                submitButton.click();
            }
        } catch (error) {
            // console.log(error)
        }
    }

    function contact() {
        contactNode = document.getElementById("contact");
        contactNodeText = contactNode.getAttribute("href");
        contactNodeTextNew = atob(contactNodeText);
        contactNode.setAttribute("href", contactNodeTextNew);
    }

});
