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

package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

//Timer is user setting definition unit.
type Timer struct {
	ID         int64      `json:"id" gorm:"primary_key"`                       //
	Namespace  string     `json:"namespace" sql:"not null;type:varchar(255)"`  //
	Repository string     `json:"repository" sql:"not null;type:varchar(255)"` //
	Workflow   int64      `json:"workflow"`                                    //
	Available  bool       `json:"available"`                                   //
	Cron       string     `json:"crom"`                                        //
	EventType  string     `json:"eventType"`                                   //
	EventName  string     `json:"eventName"`                                   //
	StartJson  string     `json:"startJson" sql:"type:longtext"`               //
	CreatedAt  time.Time  `json:"created" sql:""`                              //
	UpdatedAt  time.Time  `json:"updated" sql:""`                              //
	DeletedAt  *time.Time `json:"deleted" sql:"index"`                         //
}

//TableName is return the table name of Timer in MySQL database.
func (p *Timer) TableName() string {
	return "timer"
}

func (p *Timer) GetTimer() *gorm.DB {
	return db.Model(&Timer{})
}
