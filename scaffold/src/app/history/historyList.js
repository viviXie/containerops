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
import * as historyDataService from "./historyData";
import { notify } from "../common/notify";
import { loading } from "../common/loading";
import { getSequenceDetail } from "./main";

const sequenceWidth = 20;
const sequenceHeight = 20;
const sequencePad = 10;
const sequenceMargin = 3;

var currentPage = 1;
var workflowNum = 10;
var showSequenceNum = 10;

var historyList = '#historyList';
var historyPages = '#paginate';
var startedRecords = "#infos .record-info";
var workflowDialog = '#workflowDialog';
var breadcrumbs = '#infos .breadcrumbs';
var summaryWidth = $(historyList).width() - sequencePad * 3 *2;
var sequenceNum = Math.floor(summaryWidth / (sequenceWidth + sequenceMargin));

var resUrl = {
	"workflow":"/v2/demo/demo/workflow/v1/history/workflow/list",
	"version":"/v2/demo/demo/workflow/v1/history/workflow/{workflowName}/version/list?id={workflowID}",
	"sequence":"/v2/demo/demo/workflow/v1/history/workflow/{workflowName}/version/{versionName}/list?id={versionID}&sequenceNum={sequenceNum}",
	"startedWorkflow":"/v2/demo/demo/workflow/v1/history/workflow/{workflowName}/version/{versionName}/sequence/{sequence}/action/{actionName}/linkstart/list?workflowId={workflowID}&actionId={actionID}"
};

var stageColor = ["bg-waiting","bg-waiting","bg-running","bg-success","bg-fail"];
var successRunTime = ["bg-success-x","bg-success-s","bg-success-m","bg-success","bg-success-l"];
var failRunTime = ["bg-fail-x","bg-fail-s","bg-fail-m","bg-fail","bg-fail-l"];
var actionStartStatus = ["","","","assets/images/icon-neworkflow-succ.png","assets/images/icon-neworkflow-fail.png"];

var totalPages = '';
var totalWorkflows = '';
var isInitPages = true;
var workflows = [];
var versions = [];
var sequences = [];
var currentStartedWorkflows = [];

export function getHistoryList(){
	getWorkflows(currentPage,workflowNum,isInitPages)
}

function getWorkflows(page,workflowNum,isInitPages) {
	loading.show();
	var promise = historyDataService.getWorkflows(page,workflowNum,isInitPages);
	promise.done(function(data) {
    loading.hide();
		totalWorkflows = data.totalWorkflows;
		workflows = data.workflows;
		renderWorkflows(workflows,historyList);
		getVersions(workflows[0].workflowName,workflows[0].workflowId);
		if(isInitPages){
			getPages(totalWorkflows,historyPages);
		}
  });
  promise.fail(function(xhr, status, error) {
    loading.hide();
    if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
        notify(xhr.responseJSON.errMsg, "error");
    } else if(xhr.statusText != "abort") {
        notify("Server is unreachable", "error");
    }
  });
}

function getVersions(workflowName,workflowId) {
	loading.show();
	var promise = historyDataService.getVersions(workflowName,workflowId);
	promise.done(function(data) {
    loading.hide();
		versions = data;
		renderVersions(versions,'#'+workflowName);
		versions.map(function(vision,i){ getSequences(workflowName,workflowId,vision,sequenceNum) })
  });
  promise.fail(function(xhr, status, error) {
    loading.hide();
    if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
        notify(xhr.responseJSON.errMsg, "error");
    } else if(xhr.statusText != "abort") {
        notify("Server is unreachable", "error");
    }
  });
}

function getSequences(workflowName,workflowId,version,sequenceNum) {
	var versionName = version.versionName;
	var versionId = version.versionId;
	loading.show();
	var promise = historyDataService.getSequences(workflowName,workflowId,versionName,versionId,sequenceNum);
	promise.done(function(data) {
    loading.hide();
		sequences = data;
		renderSequences(workflowName,workflowId,version,sequences);
  });
  promise.fail(function(xhr, status, error) {
    loading.hide();
    if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
        notify(xhr.responseJSON.errMsg, "error");
    } else if(xhr.statusText != "abort") {
        notify("Server is unreachable", "error");
    }
  });
}

function renderWorkflows(workflows,selector) {
	clearOldData(selector);
	var workflow='';

	workflows.map(function(w,i){
		var hasWorkflow = i===0? ' hasWorkflow':'';
		var isIn = i===0? 'in':'';
		workflow += '<div class="item">'+
									'<div class="title">'+
								    '<img src="assets/images/icon-workflow.png"/>'+
								    '<span>'+w.workflowName+'</span>'+
								    '<a href="#'+w.workflowName+'" data-toggle="collapse" class="extend">'+
								      '<img src="assets/images/icon-collapse.png" class="extend-icon '+hasWorkflow+'" data-workflowname="'+w.workflowName+'" data-workflowid="'+w.workflowId+'" >'+
								    '</a>'+
								  '</div>'+
								  '<div id="'+w.workflowName+'" class="collapse version-tab '+isIn+'">'+
								  '</div>'+
								'</div>';			  	
	});
	
	$(selector).append(workflow);
	addWorkflowEvent()
}

function renderVersions(versions,selector) {

	var versionTab = '<ul class="nav nav-tabs pad-lr-ten">';
	var versionInfo = '<div class="tab-content version-info">';
	
	versions.map(function(v,i){
		var isActive = i===0 ? ' active': '';
		versionTab += '<li class="nav-item version-nav">'+
						        '<a href="#'+v.versionId+'" class="'+isActive+'" data-toggle="tab">'+v.versionName+'</a>'+
						      '</li>';

		versionInfo += '<div class="tab-pane pad-lr-ten'+isActive+'" id="'+v.versionId+'"></div>'
	})

	versionTab+='</ul>';
	versionInfo+='</div>';
	var versionNav = versionTab + versionInfo;
	$(selector).html(versionNav);
}

function renderSequences(workflowName,workflowId,version,sequences) {
	var summary = '<div class="pad-lr-ten summary">';
	var sumarySpace = '';
	var recordItem = '';
	var records = '<div class="records">';
	var sequence = '';

	if(sequences.length>0){
		sequences.map(function(s,i){
			var isShow = i<showSequenceNum ? 'dispB':'dispN';
			var isStagesBg = i%2===0?'bg-stage':'';
			var isBorder = i%2===0? '':'border-record ';

			var sequenceResult = stageColor[s.runResult];

			sumarySpace +='<span class="space '+sequenceResult+'"></span>';

			recordItem += '<div class="item-record pad-lt-ten '+isBorder+' '+isShow+'">';

			var time='<div class="time">'+
						      '<span class="date">'+s.date+'</span>'+
						      '<span class="hour">'+s.time+'</span>'+
						    '</div>';

			var stages = '<div class="stages '+isStagesBg+'">';

			s.stages.map(function(st,i){
				var stageResult = '';
				if(st.isTimeout){
					stageResult = getRunStatus(st);
				}else{
					stageResult = stageColor[st.runResult];
				}

				var stagesItem = '<div class="item-stage">'+
	            						'<h5 class="stage-name '+stageResult+'"></h5>';
				var actions = '';

				if(st.actions.length>0){
					actions += '<p class="actions">';
					st.actions.map(function(at,i){
						var isStartWorkflow = 'no-start';
						var isExtraAction = at.isTimeout? '':' extra-action ';
						var isBorderAction = 'bord-action';
						var actionToWorkflow = '';
						var actionResult = '';
						var startStatus = '';
						var extraResult = '';
						var dataset = 'data-workflowname="'+workflowName+'" data-workflowid="'+workflowId+'" data-versionname="'+version.versionName+'" data-versionid="'+version.versionId+'" data-sequence="'+s.sequence+'" data-sequenceid="'+s.sequenceId+'" data-stagename="'+st.stageName+'" data-stageid="'+st.stageId+'" data-status="'+s.runResult+'" data-actionid="'+at.actionId+'" data-actionname="'+at.actionName+'"';

						if(at.isTimeout){
							isBorderAction = '';
							actionResult = getRunStatus(at);
						}else{
							extraResult = stageColor[at.runResult];
						}

						if(at.isStartWorkflow){
							startStatus = actionStartStatus[at.startWorkflowResult];
							isStartWorkflow = 'start';
							actionToWorkflow = '<img class="start-status" src="'+startStatus+'" >';
						}
						
						actions+='<span class="action-name '+isStartWorkflow+' '+isExtraAction+' '+isBorderAction+' '+extraResult+' '+actionResult+'" '+dataset+'>'+
										 		actionToWorkflow +
										 '</span>';
					})
				}else{
					actions += '<p class="actions no-start">';
				}
				

				actions+='</p>';
				stagesItem=stagesItem+actions+'</div>';
				stages+=stagesItem;
			})

			stages+='</div>';

			recordItem=recordItem+time+stages;
			recordItem+='</div>';
		})

		summary=summary+sumarySpace+'</div>';
		records=records+recordItem+'</div>';

		var addMore = '';

		if(sequences.length>showSequenceNum){
			addMore = '<div class="over-hidden">'+
										'<div class="addRecords bg-stage extend">...more...</div>'+
									'</div>'
		}
		
		sequence = summary + records + addMore;
	}else{
		sequence = '<p class="text-center">no records</p>';
	}

	$('#'+version.versionId).append(sequence);

	addMoreEvent();
	addStartWorkflowEvent(version);
	addActionDetailEvent('#historyList .action-name');
}

function addMoreEvent(){
	$('.addRecords').on('click',function(){
		addMore($(this));	
	})
}

function addMore($this){
	var extend = $this.hasClass('extend');
	var $selector = $this.parent().prev().find('.item-record')
	if(extend) {
		$selector.removeClass('dispN');
		$this.removeClass('extend').html('...fold...');
	}else{
		$selector.each(function(i, element) {
			if(i>=showSequenceNum){
				$(element).addClass('dispN');
			}
		});
		$this.addClass('extend').html('...more...');
	}
}

function addStartWorkflowEvent(version){
	$('.start-status').on('click',function(event){
		event.stopPropagation();
		window.event.cancelBubble = true;
		var dataset = $(this).parent()[0].dataset;
		var workflowName = dataset.workflowname;
		var workflowId = dataset.workflowid;
		var sequence = dataset.sequence;
		var sequenceId = dataset.sequenceid;
		var stageName = dataset.stagename;
		var stageId = dataset.stageid;
		var actionId = dataset.actionid;
		var actionName = dataset.actionname;
		getStartedWorkflows(workflowName,workflowId,version,sequence,sequenceId,stageName,actionId,actionName);
	})
}

function addActionDetailEvent(selector){
	$(selector).on('click',function(){
		event.stopPropagation();
		window.event.cancelBubble = true;
		var dataset = $(this)[0].dataset;
		var params = {
			workflowName:dataset.workflowname,
			versionId:dataset.versionid,
			versionName:dataset.versionname,
			stageId:dataset.stageid,
			stageName:dataset.stagename,
			actionId:dataset.actionid,
			actionName:dataset.actionname,
			sequence:dataset.sequence,
			sequenceStatus:dataset.status
		};
		getSequenceDetail(params);
	})
}

function getRunStatus(st){
	var runStatus = 'bg-stage';
	if(st.runResult === 2){
		runStatus = stageColor[st.runResult];
	}else if(st.runResult !== 0||st.runResult !== 1){
		if(!isNaN(st.timeout)){
			var range = getRunTimeRange(st.timeout,st.runTime);
			runStatus = getRunTimeColor(st,range);
		}else{
			runStatus = stageColor[st.runResult];
		}
	}
	return runStatus;
}

function getRunTimeRange(timeout,runTime){
	var range = parseInt(runTime)/parseInt(timeout);
	if(range<=0.2){
		return 0;
	}else if(range<=0.4){
		return 1;
	}else if(range<=0.6){
		return 2;
	}else if(range<=0.8){
		return 3;
	}else if(range<=1||range>1){
		return 4;
	}
}

function getRunTimeColor(stage,range){
	if(stage.runResult === 3) {
		return successRunTime[range];
	}else if(stage.runResult === 4) {
		return failRunTime[range];
	};
	return
}

function addWorkflowEvent(){
	$('.extend>img').on('click',function(){
		var extended = $(this).hasClass('extended');
		if(extended){
			$(this).removeClass('extended');
			$(this).attr('src','assets/images/icon-collapse.png');
		}else{
			$(this).addClass('extended');
			$(this).attr('src','assets/images/icon-extend.png');
		}
		var dataset = $(this)[0].dataset;
		var workflowName = dataset.workflowname;
		var workflowId = dataset.workflowid;
		isGetVersions(workflowName,workflowId,$(this));
	})
}

function isGetVersions (workflowName,workflowId,selector){
	var hasWorkflow = $(selector).hasClass('hasWorkflow');
	if(!hasWorkflow){
		$(selector).addClass('hasWorkflow');
		getVersions(workflowName,workflowId)
	}
}

function getStartedWorkflows(workflowName,workflowId,version,sequence,sequenceId,stageName,actionId,actionName){
	// var params = {
	// 	url:resUrl.startedWorkflow.replace(/{workflowName}/g,workflowName).replace(/{versionName}/g,version.versionName).replace(/{sequence}/g,sequence).replace(/{actionName}/g,actionName).replace(/{workflowID}/g,sequenceId).replace(/{actionID}/g,actionId),
	// 	type:'GET',
	// 	callback:function(data){
	// 		currentStartedWorkflows = data;
	// 		isShowBounced(workflowDialog,true);
	// 		addCloseEvent(workflowDialog);
	// 		rendStartedActionInfo(workflowName,version.versionName,stageName,actionName,breadcrumbs);
	// 		renderStartedWorkflows(currentStartedWorkflows,startedRecords);
	// 	}
	// };
	var promise = historyDataService.getStartedWorkflows(workflowName,workflowId,version,sequence,sequenceId,stageName,actionId,actionName);
	promise.done(function(data) {
    loading.hide();
		currentStartedWorkflows = data;
		isShowBounced(workflowDialog,true);
		addCloseEvent(workflowDialog);
		rendStartedActionInfo(workflowName,version.versionName,stageName,actionName,breadcrumbs);
		renderStartedWorkflows(currentStartedWorkflows,startedRecords);
  });
  promise.fail(function(xhr, status, error) {
    loading.hide();
    if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
        notify(xhr.responseJSON.errMsg, "error");
    } else if(xhr.statusText != "abort") {
        notify("Server is unreachable", "error");
    }
  });
}

function rendStartedActionInfo(workflowName,versionName,stageName,actionName,selector){
	var nav = workflowName+' >> '+ versionName+' > '+ stageName+' > '+actionName;
	$(selector).html(nav);
}

function renderStartedWorkflows(workflows,selector){
	var recordItem = '';
	var records = '<div class="record-info">';
	workflows.map(function(s,i){
		var isStagesBg = i%2===0?'bg-stage':'';
		var isBorder = i%2===0? '':'border-record ';
		recordItem += '<div class="item-record '+isBorder+'">';
		var workflowName = '<div class="workflow-name">'+s.workflowName+'：</div>';

		var time='<div class="time">'+
					      '<span class="date">'+s.date+'</span>'+
					      '<span class="hour">'+s.time+'</span>'+
					    '</div>';

		var stages = '<div class="stages '+isStagesBg+'">';

		s.stages.map(function(st,i){
			var stageResult = '';
			if(st.isTimeout){
				stageResult = getRunStatus(st);
			}else{
				stageResult = stageColor[st.runResult];
			}

			var stagesItem = '<div class="item-stage">'+
            						'<h5 class="stage-name '+stageResult+'"></h5>';
			var actions = '';

			if(st.actions.length>0){
				actions += '<p class="actions">';
				st.actions.map(function(at,i){
					var isStartWorkflow = 'no-start';
					var isExtraAction = at.isTimeout? '':' extra-action ';
					var isBorderAction = 'bord-action';
					var actionToWorkflow = '';
					var actionResult = '';
					var startStatus = '';
					var extraResult = '';
					var dataset = 'data-workflowname="'+s.workflowName+'" data-workflowid="'+s.workflowId+'" data-versionname="'+s.versionName+'" data-versionid="'+s.versionId+'" data-sequence="'+s.sequence+'" data-sequenceid="'+s.sequenceId+'" data-stagename="'+st.stageName+'" data-stageid="'+st.stageId+'" data-status="'+s.runResult+'" data-actionid="'+at.actionId+'" data-actionname="'+at.actionName+'"';

					if(at.isTimeout){
						isBorderAction = '';
						actionResult = getRunStatus(at);
					}else{
						extraResult = stageColor[at.runResult];
					}

					if(at.isStartWorkflow){
						startStatus = actionStartStatus[at.startWorkflowResult];
						isStartWorkflow = 'start';
						actionToWorkflow = '<img class="start-status" src="'+startStatus+'" >';
					}
					
					actions+='<span class="action-name '+isStartWorkflow+' '+isExtraAction+' '+isBorderAction+' '+extraResult+' '+actionResult+'" '+dataset+'>'+
									 		actionToWorkflow +
									 '</span>';
				})
			}else{
				actions += '<p class="actions no-start">';
			}
			

			actions+='</p>';
			stagesItem=stagesItem+actions+'</div>';
			stages+=stagesItem;
		})

		stages+='</div>';

		recordItem=recordItem+workflowName+time+stages;
		recordItem+='</div>';
	});

	records=records+recordItem+'</div>';
	$(selector).html(records);

	addActionDetailEvent('#workflowDialog .action-name');
}

function getPages(totalNum,selector){
	totalPages = Math.ceil(totalNum/workflowNum);
	var display = totalPages>10?10:totalPages;
	if(totalPages>1){
		$(selector).paginate({
			count: totalPages,
			start: currentPage,
			display: display,
			border: false,
			text_color: '#000',
			background_color: '#d7d7d7',	
			text_hover_color: '#fff',
			background_hover_color: '#217ca6', 
			images: false,
			mouse: 'press',
			onChange: function(currentPage){
				currentPage = currentPage;
				isInitPages = false;
				getWorkflows(currentPage,workflowNum)
			}
		})
	}
}

function clearOldData(selector){
	$(selector).empty();
}

function isShowBounced(selector,boolean){
	if(boolean){
		$(selector).removeClass('dispN');
	}else{
		$(selector).addClass('dispN');
	}
};

function addCloseEvent(selector){
	$('.close').on('click',function(){
		isShowBounced(selector,false)
	})
}

