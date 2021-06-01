document.addEventListener('DOMContentLoaded', function () {

    createInstCodesDropdown();
    loadFormWithUrlParams();
    contact();

    function createInstCodesDropdown() {
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
        
        const bibidInput = document.getElementById('bibid');
        const institutionInput = document.getElementById('alma-inst-id');
        const submitButton = document.getElementById('submit');
    
        try {
            const bibid = params.get('bibid') || params.get('acnum');
            const instId = params.get('alma_inst_id');
            if (bibid && instId) {
                console.log("Setting form input from URL params.");
                bibidInput.value = bibid;
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
