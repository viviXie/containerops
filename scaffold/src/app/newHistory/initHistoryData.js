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

import {workflowHistoryApi} from "../common/api"
import { loading } from "../common/loading";

export function getWorkflowHistories(){
	return workflowHistoryApi.workflowHistories();
}

export function getWorkflowHistory(workflowName,versionName,workflowRunSequence){
    return workflowHistoryApi.workflowHistory(workflowName,versionName,workflowRunSequence);
}

export function getActionRunSequence(workflowName,versionName,workflowRunSequence,stageName,actionName){
		return workflowHistoryApi.action(workflowName,versionName,workflowRunSequence,stageName,actionName);
}



export function getLineDataInfo(workflowName,versionName,workflowRunSequence,sequenceLineId){
    return workflowHistoryApi.relation(workflowName,versionName,workflowRunSequence,sequenceLineId);
}

// search time | search resource | search node(stage or action | status)

export function getSequenceResource(workflowName,versionName,workflowRunSequence,resourceName,runningStatus){
	return workflowHistoryApi.workflowResource(workflowName,workflowId,workflowResource);
}

export function getSequenceActionResource(workflowName,versionName,workflowRunSequence,stageName,actionName,resourceName,runningStatus){
	return workflowHistoryApi.actionResource(workflowName,versionName,workflowRunSequence,stageName,actionName,resourceName,runningStatus);
}


