<?php
/* Fetch data via SRU */

$baseurl = 'https://eu02.alma.exlibrisgroup.com';
$srupath = '/view/sru/';

$instid = $_GET["inst_id"];
$acnum = $_GET["ac_num"];

$querystring = urlencode('other_system_number='.$acnum);

$params = array(
        'version' => '1.2',
        'operation' => 'searchRetrieve',
        'recordSchema' => 'marcxml',
        'maximumRecords' => '50',
        'query' => $querystring,
        'startRecord' => '1'
    );

$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Content-Type: text/xml'"
    ]
];

$context = stream_context_create($opts);

$url = $baseurl.$srupath.$instid."?".http_build_query($params);

$file = file_get_contents($url, false, $context);
echo $file;
?>
