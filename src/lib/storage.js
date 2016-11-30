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

    /*
     * The Game class stores all game states for the user
     */
    function Game(session, data) {
        if (data) {
            this.data = updateData(data);
        } else {
            this.data = {
                hunger: 50,
                isNewPet: true,
                lastCheckin: new Date()
            };
        }
        this._session = session;
    }
    
    function updateData(data) {
        var ONE_HOUR = 60 * 60 * 1000; /* ms */
        
        if(((new Date) - data.lastCheckin) > ONE_HOUR) {
            data.hunger = data.hunger - 20; //TODO: Need a better algorithm based on actual time passed
        }
        
        data.lastCheckin = new Date();
        
        return data;
    }

    Game.prototype = {        
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
