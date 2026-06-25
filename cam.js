var nats = [];
var nations = [];
var notify = true;
var blackHTML = '';
var blacklist = [];
var originalTime2;
var originalTime;
var recips = 0;
var delNo = 0;
var request2;
var maxrs;
var tem;
var nat;
var fd;

function whitelist(victim){
	blacklist.splice(eval(victim), 1);
	blackHTML = '';
	for(var item = 0; item < blacklist.length; item++){
		blackHTML += '<TR><TD>' + blacklist[item] + '</TD><TD><BUTTON ONCLICK="whitelist(' + item + ')" CLASS="WHITELIST">X</BUTTON></TD></TR>';
	}
	document.querySelector('TBODY').innerHTML = blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR>';
}
function add2blacklist(){
	var victim = document.querySelector('#VICTIM').value;
	blackHTML = '';
	if(victim){
		blacklist[blacklist.length] = victim;
		for(var item = 0; item < blacklist.length; item++){
			blackHTML += '<TR><TD>' + blacklist[item] + '</TD><TD><BUTTON ONCLICK="whitelist(' + item + ')" CLASS="WHITELIST">X</BUTTON></TD></TR>';
		}
		var newDels = [];
		for(var item = 0; item < dels.length; item++){
			if(dels[item].toLowerCase().replaceAll(' ', '_') != victim.toLowerCase().replaceAll(' ', '_')){
				newDels[newDels.length] = dels[item];
			}
		}
		dels = newDels;
		document.querySelector('TBODY').innerHTML = blackHTML + '<TR><TD>Blacklist nation: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR>';
	}else{
		alert('No string entered to blacklist.')
	}
}
function login(){
	nat = document.querySelector('#NATION').value;
	tem = document.querySelector('#TEMPLATE').value.replaceAll('=', '%3D').replaceAll('#', '%23').replaceAll('&', '%26').replaceAll('?', '%3F').replaceAll('=', '%3D').replaceAll(';', '%3B').replaceAll('\n', '%0D%0A').replaceAll('’', '\'').replaceAll('“', '%22').replaceAll('”', '%22').replaceAll('"', '%22');
	verif = document.querySelector('#VERIF').value;
	maxrs = document.querySelector('#MAX').value;

	// Check verification code
	var request = new XMLHttpRequest();
	request.open('GET', 'https://www.nationstates.net/cgi-bin/api.cgi?a=verify&nation=' + nat + '&checksum=' + verif + '&user_agent=GDRecruit maintained by the Ice States GitHub https://github.com/CanineAnimal/GDRecruit user ' + nat, false);
	request.send();
	originalTime = (new Date()).getTime();
	
	if(request.responseText.indexOf('1') == -1){
		// If nation cannot be verified, print error to that effect
		document.body.innerHTML += '<BR/><BR/><SPAN CLASS="ERROR">Error: Verification code is incorrect. Please make sure that you have entered your nation name and verification code correctly. Regenerate a verification code using the same link.</SPAN>';
	}else{
		// Check founding date for timer otherwise
		request = new XMLHttpRequest();
		request.open('GET', 'https://www.nationstates.net/cgi-bin/api.cgi?nation=' + nat + '&q=foundedtime' + '&user_agent=GDRecruit maintained by the Ice States GitHub https://github.com/CanineAnimal/GDRecruit user ' + nat, false);
		while((new Date()).getTime() < originalTime + 600){};
		request.send();
		originalTime = (new Date()).getTime();
		fd = eval(request.responseXML.querySelector('FOUNDEDTIME').innerHTML);

		// Get Delegates if needed
		if(document.querySelector('#USEDELS').checked){
			var delRequest = new XMLHttpRequest();
			delRequest.open('GET', 'https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=delegates&user_agent=GDRecruit maintained by the Ice States GitHub https://github.com/CanineAnimal/GDRecruit user ' + nat, false);
			while((new Date()).getTime() < originalTime + 600){};
			delRequest.send();
			dels = delRequest.responseXML.querySelector('DELEGATES').innerHTML.split(',');
			delNo = dels.indexOf(prompt('Enter last nation telegrammed if resuming manual campaign (you can view this on your telegram template, as the bottommost sent telegram). If starting campaign, leave the prompt blank and press OK.').toLowerCase().replaceAll(' ', '_')) + 1;
		}else{
			// If not, use manual input
			dels = document.querySelector('#MANINP').value.replaceAll(', ', ',');
			if(dels[dels.length - 1] == ','){
				dels = dels.substr(0, dels.length - 1); // Remove trailing comma
			}
			dels = dels.split(',');
			delNo = 0;
		}

		// Print loading text
		document.body.innerHTML ='Loading...<BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND" CHECKED/> Notify <BR/><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
		
		// Set rate limiters
		originalTime = (new Date()).getTime();
		originalTime2 = (new Date()).getTime() - 107000;
		
		// Start scanning Delegates and generating links etc; interval is used so that the loading text shows quickly.
		setTimeout(start, 500);
	}
}
function start(){
	link = 'https://www.nationstates.net/page=compose_telegram?generated_by=GDRecruit maintained by the Ice States GitHub https://github.com/CanineAnimal/GDRecruit user ' + nat + '&tgto=';
	var delsGotten = [];
	while(delsGotten.length < maxrs){
		// Check that Delgate can receive campaign telegrams
		request2 = new XMLHttpRequest();
		request2.open('GET', 'https://www.nationstates.net/cgi-bin/api.cgi?nation=' + dels[delNo] + '&q=tgcancampaign&user_agent=GDRecruit maintained by the Ice States GitHub https://github.com/CanineAnimal/GDRecruit user ' + nat, false);
		while((new Date()).getTime() < originalTime + 600){};
		request2.send();
		originalTime = (new Date()).getTime();
		
		// If so, check that Delegate is not blacklisted
		if(request2.responseXML.querySelector('TGCANCAMPAIGN').innerHTML == '1'){
			var blacklisted = false;
			for(var jtem = 0; jtem < blacklist.length; jtem++){
				if(dels[delNo].toLowerCase().replaceAll(' ', '_') == blacklist[jtem].toLowerCase().replaceAll(' ', '_')){
					blacklisted = true;
				}
			}

			// If Delegate is not blacklisted, add to list and link etc
			if(!blacklisted){
				delsGotten[delsGotten.length] = dels[delNo];
				link += dels[delNo] + ',';
			}
		}
		delNo++;
		
		// If we have reached the last Delegate, break out of loop
		if(delNo >= dels.length){
			break;
		}
	}
	if(tem.indexOf('%TEMPLATE-') != 0){ // Mark as campaign if not using template
		link += '&is_recruitment_tg=true&recruittype=campaign&recruitregion=region'
	}
	setTimeout(function(){
		// Post link
		if(delsGotten.length > 0){
			if(document.querySelector('#SOUND').checked){
				document.body.innerHTML = '<A CLASS="TG" TARGET="_BLANK" HREF="' + link + '&message=' + tem + '" ONCLICK="recBut()">Campaign</A><BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND" CHECKED/> Notify<BR/><AUDIO AUTOPLAY><SOURCE SRC="https://canineanimal.github.io/GDRecruit/ring.mp3" TYPE="audio/mpeg"></AUDIO><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
			}else{
				document.body.innerHTML = '<A CLASS="TG" TARGET="_BLANK" HREF="' + link + '&message=' + tem + '" ONCLICK="recBut()">Campaign</A><BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND"/> Notify<BR/><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
			}
		}else{
			alert('All Delegates telegrammed! You may now close this tab.');
		}
	},
	// Wait for telegram cooldown to finish before actually posting recruits
	(function(){
		if(fd + 47336400 > originalTime2/1000){
			var tgwait = (107000 + (fd - originalTime2/1000) * 0.001376) * maxrs/8;
		}else{
			var tgwait = 41000 * maxrs/8;
		}
		if(tgwait <= ((new Date()).getTime() - originalTime2)){
			// Don't bother waiting if it took that long to get Delegates to telegram
			return 0;
		}else{
			// If we still need to wait, wait for the length of time we need to minus what we already have
			return tgwait - ((new Date()).getTime() - originalTime2);
		}
	})());
}

function recBut(){
	if(document.querySelector('#SOUND').checked){
		document.body.innerHTML = '<BUTTON CLASS="TG" ONCLICK="initiateDelGeneration()">Acknowledge</BUTTON><BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND" CHECKED/> Notify<BR/><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
	}else{
		document.body.innerHTML = '<BUTTON CLASS="TG" ONCLICK="initiateDelGeneration()">Acknowledge</BUTTON><BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND"/> Notify<BR/><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
	}
}

function initiateDelGeneration(){
	originalTime2 = (new Date()).getTime();
	if(delNo >= dels.length){
		// All Delegates have been telegrammed
		alert('All Delegates telegrammed! You may now close this tab.');
	}else{
		// Post Loading screen
		if(document.querySelector('#SOUND').checked){
			document.body.innerHTML = 'Loading...<BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND" CHECKED/> Notify<BR/><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
		}else{
			document.body.innerHTML = 'Loading...<BR/><BR/><INPUT TYPE="CHECKBOX" ID="SOUND"/> Notify<BR/><BR/><TABLE><THEAD><TH>Blacklisted string</TH><TH>Remove</TH></THEAD><TBODY>' + blackHTML + '<TR><TD>Blacklist string: <INPUT ID="VICTIM"></INPUT></TD><TD><BUTTON ONCLICK="add2blacklist()" CLASS="BLACKLIST">Add</BUTTON></TD></TR></TBODY></TABLE>';
		}
		
		// Get new set of Delegates to telegram; timeout is so that loading text shows
		setTimeout(start, 500);
	}
}
