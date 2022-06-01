<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');


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

$result = '';







if ($method == 'POST')
{
    // For posting, we are using cURL

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);
    

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $headers = array(
       "Content-Type: " . $contentType,
    );
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    
    $data = $pushContent;
    
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    
    //curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    // As we might use self-signed websites, we cannot use certification validation :-(
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    
    
    $result = curl_exec($curl);
    curl_close($curl);

} else
{
    // For getting, file_get_contents is sufficient

    if (trim($pushContent) != '')
    {
        $pushContent = json_decode($pushContent, true);
        $postdata = http_build_query($pushContent);
    } else {
        $postdata = http_build_query(array());
    }

    $opts = array('http' =>
        array(
            'method' => 'GET',
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
}




if (isset($_GET['gzip']))
{
    $result = gzdecode($result);
}
echo $result;

/**/
?>