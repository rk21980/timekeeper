<?php
$_tj = new Timekeeper_JiraConnect();
if(isset($_POST['params'])){
	$paramString = urldecode( base64_decode( $_POST['params'] ) );
	$_paramSets = explode( "&", $paramString );
	$_params = array();
	foreach( $_paramSets as $_paramSet ) {
		$_param = explode( "=", $_paramSet );
		$_params[$_param[0]] = $_param[1];
	}
var_dump( $_params );
	$_tj->login( $_params );
} else {
	$_tj->testLogin();
}

// TODO
// move this outside of htdocs
class Timekeeper_JiraConnect {
	private $_username = '';
	private $_password = '';
	
	public function login($params){	
		$this->_username = $params['username'];
		$this->_password = $params['password'];
		$this->_ticketCode = $params['ticket'];
		$this->testLogin();
	}
	
	public function testLogin(){

		//$username = 'Sanjay';
		//$password = 'a4ma4m!!';  
		
		$username = $this->_username;
		$password = $this->_password;
		
		$ticketCode = $this->_ticketCode;
		
		
		$url = "http://jira.thepixel.com/rest/api/2/issue/"+$ticketCode;
		//$url = "http://jira.thepixel.com/rest/api/2/project";
		//$url = "http://jira.thepixel.com/rest/api/2/project/10004";
		//$url = "http://jira.thepixel.com/rest/tempo-rest/2/timesheet-approval?period=0515";
		
		// /rest/tempo-rest/1.0/timesheet-approval?team=3&period=0613
		
		//$url = "http://jira.thepixel.com/rest/tempo-accounts/1/account";
		//http://jira.thepixel.com/rest/tempo-timesheets/3/worklogs?dateFrom=2015-05-01&dateTo=2015-05-31 // userwise timesheet report
		
		$headers = array(
		    'Accept: application/json', 
		    'Content-Type: application/json'
		);
		
		$ch = curl_init(); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); 
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		//curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
		
		$result = curl_exec($ch); 
		$ch_error = curl_error($ch);
		if ($ch_error) {
		    echo "cURL Error: $ch_error";
		} else {
			$accounts = json_decode($result);
			//echo "<pre>"; print_r($accounts); echo "</pre>";
		}
		curl_close($ch);
		
		ob_start();
		?>
		
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8" />
			<title>Jira Report Slider</title>
		</head>
		
		<body>
			<fieldset>
				<legend>Accounts</legend>
		
		<table cellpadding="5" cellspacing="5" width="90%" border="1">
			<tr>
		    	<th>ID</th>
		        <th>Name</th>
		        <th>Client</th>
		        <th>Monthly Budget</th>
		    </tr>
		    
		    <?php
			foreach( $accounts as $account) :
				if( isset( $account->monthlybudget ) && isset( $account->customer ) ) :
				?>
			    	<tr>
			            <td><?php echo $account->id; ?></td>
			            <td><?php echo $account->name ?></td>
			            <td><?php echo $account->customer->name ?></td>
			            <td><?php echo $account->monthlybudget ?></td>
			        </tr>
				<?php
				endif;
			endforeach;
			?>
		</table>
		
		</body>
		</html>
		<?php
		ob_flush();
	}
}