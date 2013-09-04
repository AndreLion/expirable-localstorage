(function(S,ls){
	if(!ls){
		return true;
	}
	var EXP_DATA = '_EXPIRES_DATA_';
	var EXP_LAST_CHECK = '_EXPIRES_LAST_CHECK_';
	S.prototype._setItem = S.prototype.setItem;
	var delimiter1st = 'ˆ';
	var delimiter2nd = '☈';
	var now = +new Date;
	var ms= {
		s:1000,
		min:60000,
		h:3600000, //60*60*1000
		d:86400000, //24*60*60*1000
		week:604800000, //7*24*60*60*1000
		mon:2592000000, //30*24*60*60*1000
		year:31536000000 //365*24*60*60*1000
	};
	var decode = function(str){
		str = str || '';
		var result = {};
		var arr = str.split(delimiter1st);
		var kv = [];
		for(var i=0,l=arr.length;i<l;i++){
			if(arr[i] !== ''){
				kv = arr[i].split(delimiter2nd);
				result[kv[0]] = kv[1];
			}
		}
		return result;
	};
	var encode = function(obj){
		var result = [];
		for(var p in obj){ 
			var value = obj[p];
			if(typeof(value) === "string"){
				result.push(p+delimiter2nd+value);
			}
		}
		return result.join(delimiter1st);
	};
	var check = function(){
		var expires = decode(ls.getItem(EXP_DATA));
		var newExpires = {};
		var removedData;
		for(var p in expires){
			if(expires[p] < now){
				removedData = ls.getItem(p);
				ls.removeItem(p);
				console.log('[Expired! Removed!]'+p+' : '+removedData); 
			}else{
				newExpires[p] = expires[p];
			}
		}
		for(var i=0,l=ls.len;i<l;i++){
			var key = ls.key(i);
			if(key !== EXP_DATA || key !== EXP_LAST_CHECK){
				if(!newExpires[key]){
					newExpires[key] = now + ms.mon;
				}
			}
		}
		ls._setItem(EXP_LAST_CHECK,now);
		ls._setItem(EXP_DATA,encode(newExpires));
	};
	var isIE8 = function(){
		return false;
	}
	S.prototype.setItem = function(k,v,conf){
		conf = conf || {};
		var exp = conf.expires;
		if(exp && exp instanceof Date && exp.getTime() > now){
			// valid  Date arguments
		}else if(/^\d{1,5}(s|min|h|d|week|mon|year)$/.test(exp)){
			var num = +exp.match(/\d+/)[0];
			var unit = exp.match(/s|min|h|d|week|mon|year/)[0];
			//valid shortcut arguments
			var delta = num * ms[unit];
			exp = new Date((+new Date) + delta);
		}else{
			console.log('Invalid expire data argument.');
			exp = new Date();
			exp.setTime(now + ms.mon);
		}
		var expires = decode(ls.getItem(EXP_DATA));
		expires[k] = exp.getTime()+'';
		this._setItem(EXP_DATA,encode(expires));
		return this._setItem.apply(this,arguments);
	}
	var lastCheckTime = +ls.getItem(EXP_LAST_CHECK);
	if(1 || now - lastCheckTime > ms.day){
		check();
	}
	if(isIE8()){
		var thread = setInterval(function(){
			for(var i=0,l=ls.length;i<l;i++){
				var key = ls.key(i);
				var value = ls.getItem(key);
				obj[key] = value;
			}
		},60000);
	}
})(window.Storage,window.localStorage);
