<?php
/* 
 * Fetch data by "other_system_number" from Alma IZ or NZ via SRU
 *
 * Data returned is extremely simple with a sructure like so:
 * <records><record>...</record></records>
 * Where record is the same element as retrieved via SRU (e. g.
 * has the same namespace) and is repeatable.
 */

include('config.php');

$bibid = $_GET["bib_id"] ?? $_GET["ac_num"];

if (!preg_match($bibidregex,$bibid))
    exit("Please provide a correct ".$bibidname.".");

$querystring = urlencode('other_system_number='.$bibid);

$maximum_records = "50";
$start_record = "1";

$urlparams = array(
        'version' => '1.2',
        'operation' => 'searchRetrieve',
        'recordSchema' => 'marcxml',
        'maximumRecords' => $maximum_records,
        'query' => $querystring,
        'startRecord' => $start_record
    );

$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Content-Type: text/xml'"
    ]
];

$context = stream_context_create($opts);

$records = new DOMDocument();
$root = $records->createElement('records');
$records->appendChild($root);

function call_sru($page_start) {

    global $baseurl, $context, $almazoneid, $urlparams, $urlpath;

    $urlparams['startRecord'] = $page_start;
    $url = $baseurl.$urlpath.$almazoneid."?".http_build_query($urlparams);

    $sru_xml = new DomDocument();
    $sru_xml->preserveWhiteSpace = false;
    $xml_string = file_get_contents($url, false, $context);

    $sru_xml->loadXML($xml_string);

    /* basic error handling */
    $error = $sru_xml->getElementsByTagName('diagnostics');
    if ($error->length > 0)
        throw new Exception("SRU ERROR");

    return $sru_xml;
}

function append_to_records($xml) {

    global $records;

    $append_records = $xml->getElementsByTagNameNS('http://www.loc.gov/MARC21/slim', 'record');

    foreach($append_records as $record) {
        $import_record = $records->importNode($record, true);
        $records->documentElement->appendChild($import_record);
    }
}

function get_next_start_record($xml) {

    $next_start_record = $xml->getElementsByTagName('nextRecordPosition')->item(0)->nodeValue;

    if (strlen($next_start_record) > 0)
       return (int)$next_start_record;

}

function get_num_records($xml) {

    $num_records = $xml->getElementsByTagName('numberOfRecords')->item(0)->nodeValue;

    if (strlen($num_records) > 0)
        return (int)$num_records;
}

$current_xml = call_sru($start_record);

$num_records = get_num_records($current_xml);
if ($num_records > $maximum_records) {
    for ( $next_start_record = $GLOBALS["start_record"]; $next_start_record && $next_start_record + $maxmimum_records < $num_records; $next_start_record = get_next_start_record($current_xml) ) {
        global $current_xml;
        $current_xml = call_sru($next_start_record);
        append_to_records($current_xml);
    }
} else {
    global $current_xml;
    append_to_records($current_xml);
}

echo $records->saveXML();

?>
