/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

var textHelper = (function () {  

    return {
        completeHelp: 'Here\'s some things you can say,'
        + ' is Dazzle happy?'
        + ' feed Dazzle.'
        + ' take Dazzle for a walk.'
        + ' play fetch with Dazzle.'
        + ' take Dazzle outside.'
        + ' Dazzle bad girl.'
        + ' put Dazzle down.'
        + ' and exit.',
        nextHelp: 'You can try feeding Dazzle, taking her for a walk or playing fetch. What would you like to do?',
        getHappinessText: function(currentGame) {
            var speechOutput = "";
            var happiness = currentGame.getHappiness();
            console.log("Happiness value: " + happiness);

            var extraMessages = ["Maybe try feeding her?", "Maybe take her out to pee?", "Maybe take her for a walk?", "Maybe try playing fetch?"];
            
            if (happiness > 80) {
                speechOutput = ["Dazzle is jumping up and down with excitement to see you!","Dazzle comes up to you and tries to lick your hands.","Dazzle has love for you in her eyes."].randomElement();
            } else if(happiness > 50) {
                speechOutput = ["Dazzle is lazying around on the floor.","Dazzle is chasing her tail","Dazzle is watching a squirrel outside."].randomElement();
            } else if(happiness > 20) {
                speechOutput = ["Dazzle is looking at you longingly.","Dazzle is pacing around.","Dazzle lets out a long, low howl."].randomElement() + " " + extraMessages.randomElement();
            } else {
                speechOutput = ["Dazzle is curled up in the corner crying. How could you? I'm not sure we're on speaking terms any more.","Dazzle looks near death. Pay more attention to her!","Dazzle growls and doesn't respond to you."].randomElement() + " " + extraMessages.randomElement();
            }
            
            return speechOutput;
        }
    };        
})();
module.exports = textHelper;
