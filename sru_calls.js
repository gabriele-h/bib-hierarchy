function buildHierarchy() {

    var acNum = document.getElementById("acnum").value;
    var instId = document.getElementById("alma_inst_id").value;

    var params = new URLSearchParams({
        "inst_id": instId,
        "ac_num": acNum
    });

    var requestUrl = "./fetchsru.php?" + params;


    var xhr = new XMLHttpRequest;

    xhr.open('GET', requestUrl);
    xhr.responseType = 'document';
    xhr.overrideMimeType('text/xml');

    xhr.onload = function() {
        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var xmlObject = xhr.responseXML;
            console.log(xmlObject.getElementsByTagName("record"));
        } else {
            console.log("SRU Request failed for ". acNum);
        };
    };

    xhr.send();

}
