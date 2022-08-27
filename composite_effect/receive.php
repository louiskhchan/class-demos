<?php
$post_data = file_get_contents('php://input');
$json = json_decode($post_data, true);
$fn = "data/" . implode("_", array($json['exptcode'], $json['datetimestr'], $json['id'])) . ".json";
file_put_contents($fn, $post_data);
