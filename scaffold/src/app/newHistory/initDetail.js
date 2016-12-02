
import { loading } from "../common/loading";
import * as constant from "../common/constant";
import * as historyDataService from "./initHistoryData";
import { resizeWidget } from "../theme/widget";
import { notify } from "../common/notify";

// init workflow
export function showSequenceView(currenceSequenceData){
	constant.sequencePipelineView.selectAll("image").remove();
	constant.sequencePipelineView.selectAll("image")
			.data(currenceSequenceData)
			.enter()
			.append("image")
			.attr("xlink:href", function(d, i){
				if (d.status == true) {

					if (d.type == constant.PIPELINE_END) {
							return "../../assets/svg/history-end-success.svg";
					}

					if (constant.currentSelectedItem != null && constant.currentSelectedItem.type == "stage" && constant.currentSelectedItem.data.id == d.id) {
							if (d.type == constant.PIPELINE_START) {
									return "../../assets/svg/history-start-selected-success.svg";
							} else if (d.type == constant.PIPELINE_STAGE) {
									return "../../assets/svg/history-stage-selected-success.svg";
							}
					} else {
							if (d.type == constant.PIPELINE_START) {
									return "../../assets/svg/history-start-success.svg";
							} else if (d.type == constant.PIPELINE_STAGE) {
									return "../../assets/svg/history-stage-success.svg";
							}
					}

				} else {

					if (d.type == constant.PIPELINE_END) {
							return "../../assets/svg/history-end-fail.svg";
					}

					if (constant.currentSelectedItem != null && constant.currentSelectedItem.type == "stage" && constant.currentSelectedItem.data.id == d.id) {
							if (d.type == constant.PIPELINE_START) {
									return "../../assets/svg/history-start-selected-fail.svg";
							} else if (d.type == constant.PIPELINE_STAGE) {
									return "../../assets/svg/history-stage-selected-fail.svg";
							}
					} else {
							if (d.type == constant.PIPELINE_START) {
									return "../../assets/svg/history-start-fail.svg";
							} else if (d.type == constant.PIPELINE_STAGE) {
									return "../../assets/svg/history-stage-fail.svg";
							}
					}
				}
			})

			.attr("id", function(d, i) {
					return d.id;
			})
			.attr("data-index", function(d, i) {
					return i;
			})
			.attr("width", function(d, i) {
					return constant.svgStageWidth;
			})
			.attr("height", function(d, i) {
					return constant.svgStageHeight;
			})
			.attr("transform", function(d, i) {
					d.width = constant.svgStageWidth;
					d.height = constant.svgStageHeight;
					d.translateX = i * constant.PipelineNodeSpaceSize + constant.workflowNodeStartX;
					d.translateY = constant.workflowNodeStartY;
					return "translate(" + d.translateX + "," + d.translateY + ")";
			})
			.attr("translateX", function(d, i) {
					return i * constant.PipelineNodeSpaceSize + constant.workflowNodeStartX;
			})
			.attr("translateY", constant.workflowNodeStartY)
			.on("click", function(d, i) {
				// constant.workflowView.selectAll("#workflow-element-popup").remove();
				// notify("click stage now");
				if (d.status == true) {

					if (d.type == constant.PIPELINE_STAGE) {
							// clickStage(d, i);
							historyChangeCurrentElement(constant.currentSelectedItem);
							constant.setCurrentSelectedItem({ "data": d, "type": "stage", "status": d.status });
							// initButton.updateButtonGroup("stage");
							d3.select("#" + d.id).attr("href", "../../assets/svg/history-stage-selected-success.svg");
					} else if (d.type == constant.PIPELINE_START) {
							// clickStart(d, i);
							historyChangeCurrentElement(constant.currentSelectedItem);
							constant.setCurrentSelectedItem({ "data": d, "type": "start", "status": d.status });
							// initButton.updateButtonGroup("start");
							d3.select("#" + d.id).attr("href", "../../assets/svg/history-start-selected-success.svg");
						}

				} else {

					if (d.type == constant.PIPELINE_STAGE) {
							// clickStage(d, i);
							historyChangeCurrentElement(constant.currentSelectedItem);
							constant.setCurrentSelectedItem({ "data": d, "type": "stage", "status": d.status });
							// initButton.updateButtonGroup("stage");
							d3.select("#" + d.id).attr("href", "../../assets/svg/history-stage-selected-fail.svg");
					} else if (d.type == constant.PIPELINE_START) {
							// clickStart(d, i);
							historyChangeCurrentElement(constant.currentSelectedItem);
							constant.setCurrentSelectedItem({ "data": d, "type": "start", "status": d.status });
							// initButton.updateButtonGroup("start");
							d3.select("#" + d.id).attr("href", "../../assets/svg/history-start-selected-fail.svg");
					}
				}
			});

			initSequenceStageLine();

}

function initSequenceStageLine(){
	constant.sequenceLinesView.selectAll("g").remove();

	var diagonal = d3.svg.diagonal();

	var sequencePipelineLineViewId = "workflow-line-view";

	constant.sequenceLineView[sequencePipelineLineViewId] = constant.sequenceLinesView.append("g")
			.attr("width", constant.svgWidth)
			.attr("height", constant.svgHeight)
			.attr("id", sequencePipelineLineViewId);

	constant.sequencePipelineView.selectAll("image").each(function(d, i) {

		/* draw the main line of workflow */
		if (i != 0) {
			if (d.status == true) {
					constant.sequenceLineView[sequencePipelineLineViewId]
							.append("path")
							.attr("d", function() {
									return diagonal({
											source: { x: d.translateX - constant.PipelineNodeSpaceSize, y: constant.workflowNodeStartY + constant.svgStageHeight / 2 },
											target: { x: d.translateX + 2, y: constant.workflowNodeStartY + constant.svgStageHeight / 2 }
									});
							})
							.attr("fill", "none")
							.attr("stroke", "#00733B")
							.attr("stroke-width", 2);
			} else {
					constant.sequenceLineView[sequencePipelineLineViewId]
							.append("path")
							.attr("d", function() {
									return diagonal({
											source: { x: d.translateX - constant.PipelineNodeSpaceSize, y: constant.workflowNodeStartY + constant.svgStageHeight / 2 },
											target: { x: d.translateX + 2, y: constant.workflowNodeStartY + constant.svgStageHeight / 2 }
									});
							})
							.attr("fill", "none")
							.attr("stroke", "#7E1101")
							.attr("stroke-width", 2);
			}
		}

		if (d.type == constant.PIPELINE_START) {
			/* draw the vertical line and circle for start node  in lineView -> workflow-line-view */
			constant.sequenceLineView[sequencePipelineLineViewId]
					.append("path")
					.attr("d", function() {
							return diagonal({
									source: { x: d.translateX + constant.svgStageWidth / 2, y: constant.workflowNodeStartY + constant.svgStageHeight / 2 },
									target: { x: d.translateX + constant.svgStageWidth / 2, y: constant.workflowNodeStartY + constant.svgStageHeight + 10 }
							})
					})
					.attr("fill", "none")
					.attr("stroke", "#1F6D84")
					.attr("stroke-width", 1);

			constant.sequenceLineView[sequencePipelineLineViewId]
					.append("circle")
					.attr("cx", function(cd, ci) {
							return d.translateX + constant.svgStageWidth / 2;
					})
					.attr("cy", function(cd, ci) {
							return constant.workflowNodeStartY + constant.svgStageHeight + 19;
					})
					.attr("r", function(cd, ci) {
							return 8;
					})
					.attr("fill", "#fff")
					.attr("stroke", "#1F6D84")
					.attr("stroke-width", 2);
		}

	});

	initSequenceActionByStage();
	initSequenceAction2StageLine();
	initSequenceActionLinkBase();
	initSequenceActionLinkBasePoint();
	initSequencePath();

}

function initSequenceActionByStage() {
  constant.sequenceActionsView.selectAll("g").remove();
  /* draw actions in actionView , data source is stage.actions */
  constant.sequencePipelineView.selectAll("image").each(function(d, i) {
    if (d.type == constant.PIPELINE_STAGE && d.actions != null && d.actions.length > 0) {
      var actionViewId = "action" + "-" + d.id;
      constant.sequenceActionView[actionViewId] = constant.sequenceActionsView.append("g")
          .attr("width", constant.svgWidth)
          .attr("height", constant.svgHeight)
          .attr("id", actionViewId);

      var actionStartX = d.translateX + (constant.svgStageWidth - constant.svgActionWidth) / 2;
      var actionStartY = d.translateY;

      constant.sequenceActionView[actionViewId].selectAll("image")
          .data(d.actions).enter()
          .append("image")
          .attr("xlink:href", function(ad, ai) {

              if (ad.status == true) {
                  if (constant.currentSelectedItem != null && constant.currentSelectedItem.type == "action" && constant.currentSelectedItem.data.id == ad.id) {
                      return "../../assets/svg/history-action-selected-success.svg";
                  } else {
                      return "../../assets/svg/history-action-success.svg";
                  }

              } else {
                  if (constant.currentSelectedItem != null && constant.currentSelectedItem.type == "action" && constant.currentSelectedItem.data.id == ad.id) {
                      return "../../assets/svg/history-action-selected-fail.svg";
                  } else {
                      return "../../assets/svg/history-action-fail.svg";
                  }

              }
          })
          .attr("id", function(ad, ai) {
              return ad.id;
          })
          .attr("data-index", function(ad, ai) {
              return ai;
          })
          .attr("data-parent", i)
          .attr("width", function(ad, ai) {
              return constant.svgActionWidth;
          })
          .attr("height", function(ad, ai) {
              return constant.svgActionHeight;
          })
          .attr("translateX", actionStartX)
          .attr("translateY", function(ad, ai) {
              /* draw difference distance between action and stage grouped by stage index */
              if (i % 2 == 0) {
                  ad.translateY = actionStartY + constant.svgStageHeight - 55 + constant.ActionNodeSpaceSize * (ai + 1);
              } else {
                  ad.translateY = actionStartY + constant.svgStageHeight - 10 + constant.ActionNodeSpaceSize * (ai + 1);
              }
              return ad.translateY;
          })
          .attr("transform", function(ad, ai) {
              ad.width = constant.svgActionWidth;
              ad.height = constant.svgActionHeight;
              if (i % 2 == 0) {
                  ad.translateX = actionStartX;
                  ad.translateY = actionStartY + constant.svgStageHeight - 55 + constant.ActionNodeSpaceSize * (ai + 1);
              } else {
                  ad.translateX = actionStartX;
                  ad.translateY = actionStartY + constant.svgStageHeight - 10 + constant.ActionNodeSpaceSize * (ai + 1);
              }

              return "translate(" + ad.translateX + "," + ad.translateY + ")";
          })
          .style("cursor", "pointer")
          .on("click", function(ad, ai) {
              getActionHistory(historyAbout.workflowName, d.setupData.name, ad.setupData.name, ad.id);
              if (ad.status == true) {
                  historyChangeCurrentElement(constant.currentSelectedItem);
                  constant.setCurrentSelectedItem({ "data": ad, "parentData": d, "type": "action", "status": ad.status });
                  d3.select("#" + ad.id).attr("href", "../../assets/svg/history-action-selected-success.svg");
              } else {
                  historyChangeCurrentElement(constant.currentSelectedItem);
                  constant.setCurrentSelectedItem({ "data": ad, "parentData": d, "type": "action", "status": ad.status });
                  d3.select("#" + ad.id).attr("href", "../../assets/svg/history-action-selected-fail.svg");

              }
          })
          .on("mouseout", function(ad, ai) {
              constant.sequencePipelineView.selectAll("#workflow-element-popup").remove();
          })
          .on("mouseover", function(ad, ai) {
              var x = ad.translateX;
              var y = ad.translateY + constant.svgActionHeight;
              let text = "";
              let width = null;
              let options = {};
              if (ad.setupData && ad.setupData.name && ad.setupData.name != "") {
                  text = ad.setupData.name;
                  width = text.length * 7 + 20;
                  options = {
                      "x": x,
                      "y": y,
                      "text": text,
                      "popupId": "workflow-element-popup",
                      "parentView": constant.sequencePipelineView,
                      "width": width
                  };
                  util.showToolTip(options);
              }

          })
      }

  });

}

function initSequenceAction2StageLine() {
  var diagonal = d3.svg.diagonal();

  constant.sequencePipelineView.selectAll("image").each(function(d, i) {
    /* draw line from action 2 stage and circle of action self to accept and emit lines  */
    if (d.type == constant.PIPELINE_STAGE && d.actions != null && d.actions.length > 0) {

      var actionLineViewId = "action-line" + "-" + d.id;
      var action2StageLineViewId = "action-2-stage-line" + "-" + d.id;
      var actionSelfLine = "action-self-line" + "-" + d.id
          /* Action 2 Stage */
      constant.sequenceLineView[action2StageLineViewId] = constant.sequenceLinesView.append("g")
          .attr("width", constant.svgWidth)
          .attr("height", constant.svgHeight)
          .attr("id", action2StageLineViewId);

      constant.sequenceLineView[action2StageLineViewId].selectAll("path")
          .data(d.actions).enter()
          .append("path")
          .attr("d", function(ad, ai) {
              /* draw the tail line of action */
              constant.sequenceLineView[action2StageLineViewId]
                  .append("path")
                  .attr("d", function(fd, fi) {
                      return diagonal({
                          source: { x: ad.translateX + constant.svgActionWidth / 2, y: ad.translateY + constant.svgActionHeight },
                          target: { x: ad.translateX + constant.svgActionWidth / 2, y: ad.translateY + constant.svgActionHeight + 8 }
                      });
                  })
                  .attr("fill", "none")
                  .attr("stroke", "#1F6D84")
                  .attr("stroke-width", 1)
                  .attr("stroke-dasharray", "2,2");
              /* draw different length line group by stage index */
              if (i % 2 == 0) {
                  return diagonal({
                      source: { x: ad.translateX + constant.svgActionWidth / 2, y: ad.translateY },
                      target: { x: ad.translateX + constant.svgActionWidth / 2, y: ad.translateY - 44 }
                  });
              } else {
                  return diagonal({
                      source: { x: ad.translateX + constant.svgActionWidth / 2, y: ad.translateY },
                      target: { x: ad.translateX + constant.svgActionWidth / 2, y: ad.translateY - 68 }
                  });
              }
          })
          .attr("fill", "none")
          .attr("stroke", "#1F6D84")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2,2");
      }
    });
}

function initSequenceActionLinkBase() {
    var diagonal = d3.svg.diagonal();

    constant.sequencePipelineView.selectAll("image").each(function(d, i) {
        if (d.type == constant.PIPELINE_STAGE && d.actions != null && d.actions.length > 0) {

            var actionSelfLine = "action-self-line" + "-" + d.id

            /* line across action to connect two circles */
            constant.sequenceLineView[actionSelfLine] = constant.sequenceLinesView.append("g")
                .attr("width", constant.svgWidth)
                .attr("height", constant.svgHeight)
                .attr("id", actionSelfLine);

            constant.sequenceLineView[actionSelfLine].selectAll("path")
                .data(d.actions).enter()
                .append("path")
                .attr("d", function(ad, ai) {
                    return diagonal({
                        source: { x: ad.translateX - 8, y: ad.translateY + constant.svgActionHeight / 2 },
                        target: { x: ad.translateX + constant.svgActionWidth + 8, y: ad.translateY + constant.svgActionHeight / 2 }
                    })
                })
                .attr("id", function(ad, ai) {
                    return "action-self-line-path-" + ad.id;
                })
                .attr("fill", "none")
                .attr("stroke", "#1F6D84")
                .attr("stroke-width", 1);
      }
  });
}

function initSequenceActionLinkBasePoint() {
  var diagonal = d3.svg.diagonal();

  constant.sequencePipelineView.selectAll("image").each(function(d, i) {
    if (d.type == constant.PIPELINE_STAGE && d.actions != null && d.actions.length > 0) {

      var actionSelfLine = "action-self-line" + "-" + d.id

      /* circle on the left */
      constant.sequenceLineView[actionSelfLine].selectAll(".action-self-line-input")
          .data(d.actions).enter()
          .append("circle")
          .attr("class", "action-self-line-input")
          .attr("cx", function(ad, ai) {
              return ad.translateX - 16;
          })
          .attr("cy", function(ad, ai) {
              return ad.translateY + constant.svgActionHeight / 2;
          })
          .attr("r", function(ad, ai) {
              return 8;
          })
          .attr("id", function(ad, ai) {
              return "action-self-line-input-" + ad.id;
          })
          .attr("fill", "#fff")
          .attr("stroke", "#84C1BC")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")

      /* circle on the right */
      constant.sequenceLineView[actionSelfLine].selectAll(".action-self-line-output")
          .data(d.actions).enter()
          .append("circle")
          .attr("class", "action-self-line-output")
          .attr("cx", function(ad, ai) {
              return ad.translateX + constant.svgActionWidth + 16;
          })
          .attr("cy", function(ad, ai) {
              return ad.translateY + constant.svgActionHeight / 2;
          })
          .attr("r", function(ad, ai) {
              return 8;
          })
          .attr("id", function(ad, ai) {
              return "action-self-line-output-" + ad.id
          })
          .attr("fill", "#fff")
          .attr("stroke", "#84C1BC")
          .attr("stroke-width", 2)
          .style("cursor", "pointer");
      }
  });
}

function initSequencePath() {
    constant.sequenceLinePathArray.forEach(function(i) {
        setSequencePath(i)
    });
}

function setSequencePath(options) {
  var fromDom = $("#" + options.startData.id)[0].__data__;
  var toDom = $("#" + options.endData.id)[0].__data__;
  /* line start point(x,y) is the circle(x,y) */
  var startPoint = {},
      endPoint = {};
  if (fromDom.type == constant.PIPELINE_START) {
      startPoint = { x: fromDom.translateX + 1, y: fromDom.translateY + 57 };
  } else if (fromDom.type == constant.PIPELINE_ACTION) {
      startPoint = { x: fromDom.translateX + 19, y: fromDom.translateY + 4 };
  }

  endPoint = { x: toDom.translateX - 12, y: toDom.translateY + 4 };

  constant.sequenceLineView[options.workflowLineViewId]
      .append("path")
      .attr("d", getPathData(startPoint, endPoint))
      .attr("fill", "none")
      .attr("stroke-opacity", "1")
      .attr("stroke", function(d, i) {

          if (constant.currentSelectedItem != null && constant.currentSelectedItem.type == "line" && constant.currentSelectedItem.data.attr("id") == options.id) {
              return "#81D9EC";
          } else {
              return "#E6F3E9";
          }
      })
      .attr("stroke-width", 10)
      .attr("data-index", options.index)
      .attr("id", options.id)
      .style("cursor", "pointer")
      .on("click", function(d) {
          getLineHistory(historyAbout.workflowName, historyAbout.workflowVersion, options.startData.id, options.endData.id);
          var self = $(this);
          historyChangeCurrentElement(constant.currentSelectedItem);
          constant.setCurrentSelectedItem({ "data": self, "type": "line" });
          d3.select(this).attr("stroke", "#81D9EC");
  		});
}
function getPathData(startPoint, endPoint) {
    var curvature = .5;
    var x0 = startPoint.x + 30,
        x1 = endPoint.x + 2,
        xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature),
        y0 = startPoint.y + 30 / 2,
        y1 = endPoint.y + 30 / 2;

    return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
}

function historyChangeCurrentElement(previousData) {
    if (previousData != null) {

        if (previousData.status == true || previousData.type == "line") {

            switch (previousData.type) {
                case "stage":
                    d3.select("#" + previousData.data.id).attr("href", "../../assets/svg/history-stage-success.svg");
                    break;
                case "start":
                    d3.select("#" + previousData.data.id).attr("href", "../../assets/svg/history-start-success.svg");
                    break;
                case "action":
                    d3.select("#" + previousData.data.id).attr("href", "../../assets/svg/history-action-success.svg");
                    break;
                case "line":
                    d3.select("#" + previousData.data.attr("id")).attr("stroke", "#E6F3E9");
                    break;


            }
        }
    }

    if (previousData != null) {

        if (previousData.status == false || previousData.type == "line") {

            switch (previousData.type) {
                case "stage":
                    d3.select("#" + previousData.data.id).attr("href", "../../assets/svg/history-stage-fail.svg");
                    break;
                case "start":
                    d3.select("#" + previousData.data.id).attr("href", "../../assets/svg/history-start-fail.svg");
                    break;
                case "action":
                    d3.select("#" + previousData.data.id).attr("href", "../../assets/svg/history-action-fail.svg");
                    break;
                case "line":
                    d3.select("#" + previousData.data.attr("id")).attr("stroke", "#E6F3E9");
                    break;
            }
        }
    }
}

function zoomed() {
    constant.sequencePipelineView.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    constant.sequenceActionsView.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    // buttonView.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    constant.sequenceLinesView.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")")
        .attr("translateX", d3.event.translate[0])
        .attr("translateY", d3.event.translate[1])
        .attr("scale", d3.event.scale);
}


// sequence on action detail
function getActionHistory(workflowName,stageName,actionName,actionLogID) {
    loading.show();
    var promise = historyDataService.getActionRunHistory(workflowName,stageName,actionName,actionLogID);
    promise.done(function(data) {
        loading.hide();
        showActionHistoryView(data.result,actionName);
    });
    promise.fail(function(xhr, status, error) {
        loading.hide();
        if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
            notify(xhr.responseJSON.errMsg, "error");
        } else {
            notify("Server is unreachable", "error");
        }
    });
}

function showActionHistoryView(history,actionname) {
    $.ajax({
        url: "../../templates/history/sequenceAction.html",
        type: "GET",
        cache: false,
        success: function(data) {
					$("#history-workflow-detail").html($(data));

					$("#actionHistoryTitle").text("Action history -- " + actionname);

					var inputStream = JSON.stringify(history.data.input,undefined,2);
					$("#action-input-stream").val(inputStream);

					var outputStream = JSON.stringify(history.data.output,undefined,2);
					$("#action-output-stream").val(outputStream);

					_.each(history.logList,function(log,index){

					    let allLogs = log.substr(23);
					    let logJson = JSON.parse(allLogs);
					    let num = index + 1;


					    if( !logJson.data && !logJson.resp){
					        sequenceLogDetail[index] = logJson.INFO.output;
					        let logTime = log.substr(0,19);

					        var row = `<tr class="log-item"><td>`
					                + num +`</td><td>`
					                + logTime +`</td><td>`
					                + logJson.EVENT +`</td><td>`
					                + logJson.EVENTID +`</td><td>`
					                + logJson.RUN_ID +`</td><td>`
					                + logJson.INFO.status +`</td><td>`
					                + logJson.INFO.result +`</td><td></td><td></td><td><button data-logid="`
					                + index + `" type="button" class="btn btn-success sequencelog-detail"><i class="glyphicon glyphicon-list-alt" style="font-size:14px"></i>&nbsp;&nbsp;Detail</button></td></tr>`;
					        $("#logs-tr").append(row);

					    } else {
					        var row = `<tr class="log-item"><td>`
					                        + num + `</td><td></td><td></td><td></td><td></td><td></td><td></td><td>`
					                        + logJson.data +`</td><td>`
					                        + logJson.resp +`</td><td></td></tr>`;
					        $("#logs-tr").append(row);    
					    }

					});


					$(".sequencelog-detail").on("click",function(e){
					  let target = $(e.target);

				    _.each(sequenceLogDetail,function(d,i){
				        if(target.data("logid") == i){
				            let detailData = "";
				            for( let prop in d){
				                detailData += prop + ":" + d[prop].replace(/\n/g, "<br />");
				                detailData += "<br />";
				            }

				            $(".dialogContant").html(detailData);
				        }
				    })

				    $(".dialogWindon").css("height","auto");
				    $("#dialog").show();

				    if( $(".dialogWindon").height() < $("#dialog").height() * 0.75 ){
				        
				        $(".dialogWindon").css("height","auto");

				    } else {
				        
				        $(".dialogWindon").css("height","80%");
				        $(".dialogContant").css("height","100%");
				    }

				    $("#detailClose").on("click", function(){
				       $("#dialog").hide(); 
				    })
					})
        }
  	});
}

function getLogDetails (logOutputData){
	window.href= "";
	$("#logOutputInfo").html(logOutputData)

}
// sequence on actionLink  detail
function getLineHistory(workflowName,workflowSequenceID,startActionId,endActionId) {
    loading.show();
    var promise = historyDataService.getLineDataInfo(workflowName,workflowSequenceID,startActionId,endActionId);
    promise.done(function(data) {
        loading.hide();
        showLineHistoryView(data.define);
    });
    promise.fail(function(xhr, status, error) {
        loading.hide();
        if (!_.isUndefined(xhr.responseJSON) && xhr.responseJSON.errMsg) {
            notify(xhr.responseJSON.errMsg, "error");
        } else {
            notify("Server is unreachable", "error");
        }
    });
}

function showLineHistoryView(history) {
    $.ajax({
        url: "../../templates/history/sequenceActionLink.html",
        type: "GET",
        cache: false,
        success: function(data) {
            $("#history-workflow-detail").html($(data));

            var inputStream = JSON.stringify(history.input,undefined,2);
            $("#action-input-stream").val(inputStream);

            var outputStream = JSON.stringify(history.output,undefined,2);
            $("#action-output-stream").val(outputStream);

            resizeWidget();
        }
    });
}




// init Sequence Resource ViewworkflowVersion