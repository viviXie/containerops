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

import {workflowHistoryApi} from "../common/api";


export function getWorkflowHistories( ){
    return workflowHistoryApi.workflowHistories( );
}

export function getWorkflowHistory(workflowName,versionName,workflowRunSequence){
    return workflowHistoryApi.workflowHistory(workflowName,versionName,workflowRunSequence);
}

export function getActionRunHistory(workflowName,versionName,workflowRunSequence,stageName,actionName){
    return workflowHistoryApi.action(workflowName,versionName,workflowRunSequence,stageName,actionName);
}

export function getLineDataInfo(workflowName,versionName,workflowRunSequence,sequenceLineId){
    return workflowHistoryApi.relation(workflowName,versionName,workflowRunSequence,sequenceLineId);
}



// export function sequenceData(workflowName,versionID,workflowRunSequenceID){
//     return workflowHistoryApi.sequenceData(workflowName,versionID,workflowRunSequenceID);
// }

// export function sequenceList( ){
//     return workflowHistoryApi.sequenceList( );
//}
