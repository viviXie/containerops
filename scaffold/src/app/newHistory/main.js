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

import { loading } from "../common/loading";
import * as constant from "../common/constant";
import * as historyDataService from "./initHistoryData";
import { showSequenceView } from "./initDetail";


// history all
export function initWorkflowHistoryPage() {
	loading.show();
	var promise = historyDataService.historyList();
	promist.done(function(data){
		loading.hide();
		constant.historyList = data.pipelineList;
		constant.workflowResource = data.historyResouce(workflowName,workflowId,workflowResource);
		getHistoryPartition();
		getHistoryList();


	});
	promist.fail(function(xhr,status,error){
		loading.hide();
		if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
				notify(xhr.responseJSON.errMsg, "error");
		} else {
				notify("Server is unreachable", "error");
		} 
	});
}

// history d3
function getHistoryPartition(){
	$.ajax({
		url : "../../templates/newHistory/history.html",
		type : "GET",
		cache : false,
		success : function (data){
			$("#main").html($(data));
			$("#workflowHistoryDesign").show("slow");

			$("#workflowHistory-d3").empty();

			let svgHeight = $("#workflowHistory-d3").height($("#main").height() * 1/3);

			constant.setSvgWidth("100%");
			constant.setSvgHeight(svgHeight.height());
			constant.setworkflowNodeStartX(50);
			constant.setworkflowNodeStartY(svgHeight.height()*0.2);

			let svg = d3.select("#workflowHistory-d3")
								  .append("svg")
								  .attr("width", constant.svgWidth)
								  .attr("height", constant,svgHeight)
								  .style("fill","white");

		  let g = svg.append("g")
		  		.call(zoom);

		}
	})
}

// history list
function getHistoryList(){
	$.ajax({
		url : "../../templates/newHistory/historyDetail.html",
		type : "GET",
		cache : false,
		success : function (data){
			$(data).show("slow");

			var workflowItem = $(".workflow-list");

			$(".workflow-list").empty();

			// 判断是否有workflow 有进行渲染
			if(constant.historyList != null && constant.historyList.length > 0){
				_.each(constant.historyList, function (wd) {
					var hwfRow = `<tr data-id=`+ wd.id +` class="pp-row">
									<td class="pptd"><span class="glyphicon glyphicon-menu-down treeclose pp-controller" data-name=` 
									+ wd.name + `></span>&nbsp;&nbsp;&nbsp;&nbsp;` 
									+ wd.name + `</td><td></td><td></td><td></td></tr>`;

					workflowItem.append(hwfRow);

					_.each(wd.versionList, function (vd) {
						var hvRow = `<tr data-wfname=`+ wd.name +`data-version=`+ vd.version +`data-versionid=`+ vd.id +`class="ppversion-row"><td></td>`;

						if(_.isUndefined(vc.status) && vd.sequenceList.length == 0){

							hvRow += `<td class="">`+vd.name+`</td><td><div class="state-list"><div class="state-icon-list state-norun"></div></div></td><td></td></tr>`;

							workflowItem.append(hvRow); 

						} else {

							hvRow += `<td class="pptd"><span class="glyphicon glyphicon-menu-down treeclose pp-v-controller"></span>&nbsp;&nbsp;&nbsp;&nbsp;` + vd.name + `</td>`;

							hvRow += `<td class="pptd">`+ vd.info +`</td><td></td></tr>`;

							workflowItem.append(hvRow);

							if(vd.sequenceList.length > 0){
								_.each(vd.sequenceList, function(sd){
									var hsRow =`<tr data-id=`+ sd.pipelineSequenceID + ` data-pname=` + wd.name + ` data-version=` + vd.name + ` data-versionid=` + vd.id + ` class="sequence-row"><td></td><td></td>`;

									if(sd.status == true){
										hsRow += `<td><div class="state-list">
													<div class="state-icon-list state-success"></div><span class="state-label-list">` + sd.time + `</span></div></td>`;
									} else {
											hsRow += `<td><div class="state-list">
															<div class="state-icon-list state-fail"></div><span class="state-label-list">` + sd.time + `</span></div></td>`
									}
									
									hsRow += `<td><button type="button" class="btn btn-success sequence-detail"><i class="glyphicon glyphicon-list-alt" style="font-size:16px"></i>&nbsp;&nbsp;Detail</button></td></tr> `;

									workflowItem.append(hsRow);

								}); 
							}
						}
					})
				})

				$(".pp-controller").on('click',function(event){
					var target = $(event.currentTarget);
					if(target.hasClass("treeclose")){
                        target.addClass("glyphicon-menu-right treeopen");
						target.removeClass("glyphicon-menu-down treeclose");

                        var name = target.data("name");
                        $('tr[data-pname="'+ name +'"]').hide();

					} else {
                        target.addClass("glyphicon-menu-right treeclose");
                        target.removeClass("glyphicon-menu-down treeopen");

                        var name = target.data("name");
                        $('tr[data-pname="'+ name +'"]').hide();

                        if($('tr[data-pname="'+ name +'"]').find('.pp-v-controller').hasClass('treeopen')){

                        	$('tr[data-pname="'+ name +'"]').find('.pp-v-controller').trigger("click");
                        }

					}


				})

				$(".sequence-detail").on("click",function(event){
					var pname = $(event.currentTarget).parent().parent().data("pname");
					var vid = $(event.currentTarget).parent().parent().data("versionid");
					var vname = $(event.currentTarget).parent().parent().data("version");
					var sid = $(event.currentTarget).parent().parent().data("id");

					var selected_history = {
						"workflowName" : pname,
						"workflowVersionId" : vid, 
						"workflowVersion" : vname,
						"sequenceID" : sid
					};

					//获取 detail 详情页面
					//getDetailPage(selected_history);


				})

			} else {
				var noDataRow = `<tr><td colspan="4" style="text-align:center">No histories found.</td></tr>`;
                workflowItem.append(noDataRow);
			}
		}
	})  
}



//sequence detail

function getDetailPage(sequencehistoryData) {
	loading.show();
	$.ajax({
		url : "../../templates/newHistory/historyDetail.html",
		type : "GET",
		cache : false,
		success : function (data){
			loading.hide();

			constant.sequenceRunData = data.define.stageList;
      constant.sequenceLinePathArray = data.define.lineList;

			// draw workflow line 
			getDrawSequenceWorkflow (sequencehistoryData,constant.sequenceRunData);
			// draw Sequence resource include pritition and lineChart
			getDrawSequenceResource (data.resourceData),
			// show sequence Env information and logs
			getSequenceDetail ();

			$(data).fadeIn("slow");
			$("#closeDetail").on("click", function(){
				$(data).fadeOut()
			})

			var detailContant = $("#detailContant");

			//获取 d3 currentSequenceWorkflow;
			//获取 d3 currentSequenceResouce (include pritition and )
		}
	})	

}

// draw workflow line 
function getDrawSequenceWorkflow (sequencehistoryData){
	let zoom = d3.behavior.zoom().on("zoom", zoomed);
	$("#workflowTitle").empty();
	$("#workflowTitle").text(selected_history.workflowName + " / " + selected_history.workflowVersionId);

	let svgHeight = $("#draw-d3-workflow").height($("#main").height() * 1/3); 	    

  constant.setSvgWidth("100%");
	constant.setSvgHeight(svgHeight.height());
	constant.setworkflowNodeStartX(50);
	constant.setworkflowNodeStartY(svgHeight.height()*0.2);

	let svg = d3.select("#draw-d3-workflow")
						  .append("svg")
						  .attr("width", constant.svgWidth)
						  .attr("height", constant,svgHeight)
						  .style("fill","white");

  let g = svg.append("g")
  		.call(zoom);

  let svgMainRect = g.append("rect")
  		.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight);

  constant.sequenceLinesView = g.append("g")
  		.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequenceLinesView");
 	
 	constant.sqeunceActionsView = g.append("g")
 			.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequenceActionsView");

	constant.sqeuncePipelinesView = g.append("g")
 			.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequencePipelinesView");

  constant.sequenceActionsLinkview = g.append("g")		
  		.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequenceActionsLinkView");

  showSequenceView(constant.sequenceRunData);		

}

// draw Sequence resource include pritition and lineChart
function getDrawSequenceResource (){

	let svgHeight = $("#draw-d3-sequenceResouce").height($("#main").height() * 1/3); 	    

  constant.setSvgWidth("100%");
	constant.setSvgHeight(svgHeight.height());
	constant.setworkflowNodeStartX(50);
	constant.setworkflowNodeStartY(svgHeight.height()*0.2);

	let svg = d3.select("#draw-d3-workflow")
						  .append("svg")
						  .attr("width", constant.svgWidth)
						  .attr("height", constant,svgHeight)
						  .style("fill","white");

  let g = svg.append("g")
  		.call(zoom);

  let svgMainRect = g.append("rect")
  		.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight);

  constant.sequenceLinesView = g.append("g")
  		.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequenceLinesView");
 	
 	constant.sqeunceActionsView = g.append("g")
 			.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequenceActionsView");

	constant.sqeuncePipelinesView = g.append("g")
 			.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequencePipelinesView");

  constant.sequenceActionsLinkview = g.append("g")		
  		.attr("width",constant.svgWidth)
  		.attr("height",constant,svgHeight)
  		.attr("id","sequenceActionsLinkView");

  showSequenceView(constant.sequenceRunData);		

}


// show sequence Env information and logs
function getSequenceDetail (){}

// historyDetail page 滚动监听事件
function detailPageScrollspy (){}