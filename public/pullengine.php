<?php
// Use this line for testing only!
//header('Access-Control-Allow-Origin: *');


$url = "https://" . $_GET['url'];

$method = $_SERVER['REQUEST_METHOD'];
if (isset($_SERVER['CONTENT_TYPE']))
{
    $contentType = $_SERVER['CONTENT_TYPE'];
} else
{
    $contentType = "application/json";
}

$pushContent = file_get_contents('php://input');



if (trim($pushContent) != '')
{
    $pushContent = json_decode($pushContent, true);
    $postdata = http_build_query($pushContent);
} else {
    $postdata = http_build_query(array());
}

$opts = array('http' =>
    array(
        'method' => $method,
        'header' => 'Content-type: ' . $contentType,
        'content' => $postdata
    ),
    "ssl"=>array(
        "verify_peer"=>false,
        "verify_peer_name"=>false,
    )
);
$context = stream_context_create($opts);
$result = file_get_contents($url, false, $context);
echo $result;

/**/
?>