<?php
$_tj = new Timekeeper_JiraConnect();
if(isset($_POST['params'])){
	var_dump('params: '.$_POST['params']);
	$_tj->login($_POST['params']);
} else {
	$_tj->testLogin();
}

// TODO
// move this outside of htdocs
class Timekeeper_JiraConnect {
	private $_username = '';
	private $_password = '';
	
	public function login($params){	
		foreach(explode("&",(urldecode(base64_decode($params)))) as $_param){
			parse_str($_param);
		}
		var_dump($pw);
//		if(isset($params))
	}
	
	public function testLogin(){
		$_encoded = base64_encode('This is a text');
		//$this->login('W29iamVjdCBPYmplY3Rd'); // this is a text
		$this->login($_encoded);
	}
}
?>