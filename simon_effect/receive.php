<?php
$post_data = file_get_contents('php://input');
$json = json_decode($post_data, true);
$trials = $json['trials'];
$summary = $json['summary'];

//save trials table
if (count($trials)){
    $fn = "data/" . implode("_",array($json['expt'],$json['datetimestr'],$json['id'],"trials.csv"));

    $fp = fopen($fn, 'w');
    fputcsv($fp, array_keys($trials[0]));
    foreach($trials as $trial){
        fputcsv($fp, $trial);
    }
    fclose($fp);
}

//save summary
$dvs = array("accuracy", "rt","correctn","debug");
foreach ($dvs as $dv) {
    $fn = "data/".implode("_",array($json['expt'],$dv)).".csv";
    $firsttime=!file_exists($fn);
    $fp = fopen($fn, 'a');
    if ($firsttime){
        fputcsv($fp, array_keys($summary[$dv]));
    }
    fputcsv($fp, $summary[$dv]);
    fclose($fp);
}


