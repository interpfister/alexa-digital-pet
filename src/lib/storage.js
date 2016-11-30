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
                needToPlay: 50,
                needToExercise: 50,
                //sleepiness: 0, //increase this after being fed -- TODO: For future
                needToPee: 0,
                discipline: 0, //while discipline is low, random chance Dazzle will pee without being let outside
                isNewPet: true,
                lastCheckin: new Date()
            };
        }
        this._session = session;
    }
    
    function updateData(data) {
        var timeElapsed = (new Date) - data.lastCheckin; //in ms          
                
        data.hunger = data.hunger - Math.floor(Math.random() * timeElapsed) ; //TODO: Need a better algorithm based on actual time passed
        
        data.lastCheckin = new Date();
        
        
        
        return data;
        
        
   /*      def updateData(pet)
    today = DateTime.now

    ### UPDATE MOOD

    # find last time pet was played with
    minsSince = ((today - pet.lastPlayedWith) * 24 *60).to_i

    # Mood is 50% cleanliness and hunger
    # And 50% based on the last time the pet was played with

    hungerCleanMood = (pet.cleanliness/4)+(pet.hunger/4)

    moodReduce = ((minsSince / 30) * (pet.level * 2)) # subtract level for every 30 mins

    if moodReduce > 100 then
      pet.mood = 0
    else
      pet.mood = hungerCleanMood + (50 - moodReduce)
    end


    ### UPDATE HUNGER

    # find last time pet was fed
    minsSince = ((today - pet.lastFed) * 24 *60).to_i

    hungerReduce = ((minsSince / 20) * (pet.level*2)) # subtract level for every 20 mins

    pet.hunger = pet.hunger - hungerReduce

    if pet.hunger < 0 then
      pet.hunger = 0
    end

    ### UPDATE CLEANLINESS

    # find last time pet was cleaned
    minsSince = ((today - pet.lastCleaned) * 24 *60).to_i

    cleanReduce = ((minsSince / 25) * (pet.level * 2)) # subtract level for every 25 mins

    pet.cleanliness = pet.cleanliness - cleanReduce

    if pet.cleanliness < 0 then
      pet.cleanliness = 0
    end

    if pet.cleanliness == 0 and pet.hunger == 0 and pet.mood == 0 then
      # pet is dead :-(
      pet.alive = false
    end

    # since we just reduced attributes... update time stamps so that
    # they are not reduced again if updateData is called.
    pet.lastFed = DateTime.now()
    pet.lastCleaned = DateTime.now()

    pet.save

  end

end
*/
    }

    Game.prototype = {
        getHappiness: function() {
            var happinessFactors = ["hunger", "needToPlay", "needToExercise", "needToPee"];
            /*happinessFactors.each(function (factor) {
                              
                if(this.data[factor] < 20) {
                    //TODO: Determine max, then to 100 - max
                }
            });*/
            return 10;
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
