// ==UserScript==
// @name         TwitchAutoClaimPoints
// @namespace    https://github.com/janumeke/TwitchAutoClaimPoints
// @downloadURL  https://github.com/janumeke/TwitchAutoClaimPoints/blob/master/TwitchAutoClaimPoints.user.js
// @version      0.1
// @description  auto click point bonus on Twitch
// @author       janumeke
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var delayAfterSuccess = 900; //secs
    var delayAfterFailure = 30; //secs

    (function Claim(){
        var button = document.getElementsByClassName('claimable-bonus__icon')[0];
        if(button){
            button.click();
            console.log(`Bonus points are claimed by the script. Next try is after ${delayAfterSuccess} seconds.`);
            setTimeout(Claim, delayAfterSuccess * 1000);
        }
        else{
            console.log(`Bonus points cannot be found by the script. Next try is after ${delayAfterFailure} seconds.`);
            setTimeout(Claim, delayAfterFailure * 1000);
        }
    })();
})();

