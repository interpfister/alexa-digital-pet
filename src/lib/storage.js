/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var defaultValues = {
        hunger: 50,
        needToPlay: 50,
        needToExercise: 50,
        //sleepiness: 0, //increase this after being fed -- TODO: For future
        needToPee: 0,
        discipline: 0 //while discipline is low, random chance Dazzle will pee without being let outside
    }
    /*
     * The Game class stores all game states for the user
     */
    function Game(session, data) {
        if (data) {
            this.data = updateData(data);
        } else {
            this.data = {                
                hunger: defaultValues.hunger,
                needToPlay: defaultValues.needToPlay,
                needToExercise: defaultValues.needToExercise,
                needToPee: defaultValues.needToPee,
                discipline: defaultValues.discipline,
                isNewPet: true,
                lastCheckin: new Date()
            };
        }
        this._session = session;
    }
    
    function updateData(data) {
        //console.log("ORIG DATA: " + JSON.stringify(data));
        
        var timeElapsed = (new Date()) - new Date(data.lastCheckin); //in ms
        console.log("MS SINCE CHECKIN: " + timeElapsed);
        var fieldsToAdjust = ["hunger", "needToPlay", "needToExercise", "needToPee", "discipline"];
        fieldsToAdjust.forEach(function(field) {
            if(data[field] === null || data[field] === undefined){
                data[field] = defaultValues[field];
            }
        });

        //console.log("AFTER DEFAULTS: " + JSON.stringify(data));
                
        
        //hunger should increment by 10 points an hour = 10 points per 3600000 ms
        data.hunger = data.hunger + Math.floor((timeElapsed * 10 / 3600000));
        
        //play goes 25 points per hour -- likes to play a lot //TODO: for future could make the pace of increase vary for each pet
        data.needToPlay = data.needToPlay + Math.floor((timeElapsed * 25 / 3600000));
        
        data.needToExercise = data.needToExercise + Math.floor((timeElapsed * 15 / 3600000));
        
        data.needToPee = data.needToPee + Math.floor((timeElapsed * 10 / 3600000));
        
        //only one point per hour discipline drop
        data.discipline = data.discipline - Math.floor((timeElapsed * 1 / 3600000));
                  
        //reset max and min
        fieldsToAdjust.forEach(function(field) {
            if(data[field] > 100) {
                data[field] = 100;
            } else if(data[field] < 0) {
                data[field] = 0;
            }
        });
        
        data.lastCheckin = new Date();
        
        //console.log("UPDATED DATA: " + JSON.stringify(data));
        
        return data;      
    }

    Game.prototype = {
        getHappiness: function() {
            var obj = this;
            var happinessFactors = ["hunger", "needToPlay", "needToExercise", "needToPee"];
            var values = happinessFactors.map(function (factor) {
                return obj.data[factor];
            });            
            var maxUnhappiness = Math.max.apply(null, values);
            var happiness = 100 - maxUnhappiness;
            console.log("Happiness: " + happiness);
            return happiness;
        },
    
        save: function (callback) {
            //save the game states in the session,
            //so next time we can save a read from dynamoDB
            this._session.attributes.currentGame = this.data;
            dynamodb.putItem({
                TableName: 'ScoreKeeperUserData',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadGame: function (session, callback) {
            if (session.attributes.currentGame) {
                console.log('get game from session=' + session.attributes.currentGame);
                callback(new Game(session, session.attributes.currentGame));
                return;
            }
            dynamodb.getItem({
                TableName: 'ScoreKeeperUserData',
                Key: {
                    CustomerId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var currentGame;
                if (err) {
                    console.log(err, err.stack);
                    currentGame = new Game(session);
                    session.attributes.currentGame = currentGame.data;
                    callback(currentGame);
                } else if (data.Item === undefined) {
                    currentGame = new Game(session);
                    session.attributes.currentGame = currentGame.data;
                    callback(currentGame);
                } else {
                    console.log('get game from dynamodb=' + data.Item.Data.S);
                    currentGame = new Game(session, JSON.parse(data.Item.Data.S));
                    session.attributes.currentGame = currentGame.data;
                    console.log("CURRENT GAME: " + JSON.stringify(currentGame));
                    callback(currentGame);
                }
            });
        },
        newGame: function (session) {
            return new Game(session);
        }
    };
})();
module.exports = storage;
