/*
Copyright 2014 Huawei Technologies Co., Ltd. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

function componentApiService($websocket,notifyService, apiService){

	var apiUrlConf = {
		host : "",

		rootUrl : "/v2",

		list : {
			"url" :	"/components?name={filterName}&version={filterVersion}&fuzzy={fuzzy}&page_num={pageNum}&version_num={versionNum}&offset={offset}",
			"type" : "GET"
		},

		detail : {
			"url" :	"/components/{componentID}",
			"type" : "GET"
		},

		add : {
			"url" :	"/components",
			"type" : "POST"
		},

		update : {
			"url" :	"/components/{componentID}",
			"type" : "PUT"
		},

		debug : {
			"url" :	"/components/{componentID}/debug",
			"type" : "GET"
		}
	}

	// abort
	function beforeApiInvocation(skipAbort){
		if(_.isEmpty(apiUrlConf.host)){
			$.ajax({
		        "url": "/host.json",
		        "async" : false,
		        "type": "GET",
		        "dataType": "json",
		        "cache": false,
		        "success" : function(obj) {
				    apiUrlConf.host = obj.host.component;
				},
				"error" : function(error){
					notifyService.notify("Can not find API host configuration file.","error");
				}
		    });
		}

		apiService.beforeApiInvocation(skipAbort);
	}

	function ajaxCall(target, params, reqbody){
		beforeApiInvocation(apiUrlConf[target].skipAbort);
		
		var urlext = getUrlExt(target,params);
		var type = apiUrlConf[target].type;

		var options;
		if(type == "GET"){
			options = {
		        "url": apiUrlConf.host + apiUrlConf.rootUrl + urlext,
		        "type": type,
		        "dataType": "json",
		        "cache": false
		    }
		}else if(type == "POST" || type == "PUT"){
			var data = JSON.stringify(reqbody);
			options = {
		        "url": apiUrlConf.host + apiUrlConf.rootUrl + urlext,
		        "type": type,
		        "dataType": "json",
		        "data": data
		    }
		}
		var promise = $.ajax(options);
		apiService.addPromise(promise);
		return promise;
	}

	function getUrlExt(target,params){
		var extensionUrl = apiUrlConf[target].url;
		var paramKeys = _.keys(params);
		_.each(paramKeys,function(key){
			if(extensionUrl.indexOf("{"+key+"}") >= 0){
				var regexp = new RegExp("{"+key+"}","g");
				extensionUrl = extensionUrl.replace(regexp, params[key]);
			}
		});
		return extensionUrl;
	}
	
	function websocketCall(target, params){
		// beforeApiInvocation(apiUrlConf[target].skipAbort);
		var urlext = getUrlExt(target,params);
		var url = apiUrlConf.host.replace(/http/g, "ws") + apiUrlConf.rootUrl + urlext;
		var dataStream = $websocket(url);
		return dataStream;
	}

	return {
		"ajaxCall" : ajaxCall,
		"websocketCall" : websocketCall
	}
}
   
devops.factory('componentApiService', ['$websocket', 'notifyService', 'apiService', componentApiService]);
