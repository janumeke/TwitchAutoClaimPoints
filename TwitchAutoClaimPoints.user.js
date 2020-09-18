// ==UserScript==
// @name         TwitchAutoClaimPoints
// @namespace    https://github.com/janumeke/TwitchAutoClaimPoints
// @version      0.1
// @description  auto click point bonus on Twitch
// @author       janumeke
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var log = true;

    /*
     It seems that if you claimed the bonus not too late than the time it had popped up,
     Twitch would use the time it had popped up to calculate the time it should next pop up,
     instead of the time you claimed the bonus.
     This script will first try to find the time it just popped up, and then go back to the
     normal interval.
    */
    var delayProbe = 15; //secs
    var delayBonus = 900; //secs
    var delayRsrv = (1 / 2) * delayBonus; //secs, assumed

    var firstClaim = true;
    var now;
    (function Claim(){
        var button = document.getElementsByClassName('claimable-bonus__icon')[0];
        if(button){ //Bonus has popped up.
            button.click();
            if(firstClaim){
                firstClaim = false;
                /*
                 Suppose Twitch will only reserve delayRsrv seconds before forgetting the time it popped up.
                 It means the time used for calculation (the time it popped up or you claimed) will be at most
                 delayRsrv seconds ahead of the first successful claim. Therefore the time it should next pop up
                 will be at least delayBonus - delayRsrv seconds later. If this starts probing before the next time
                 it pops up, it will know the exact time it pops up (with at most delayProbe seconds positive offset)
                 at the second claim.
                */
                if(log){
                    now = new Date();
                    console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points are claimed by the script. Next try is after ${delayBonus - delayRsrv - delayProbe} seconds.`);
                }
                setTimeout(Claim, (delayBonus - delayRsrv - delayProbe) * 1000);
            }
            else{
                if(log){
                    now = new Date();
                    console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points are claimed by the script. Next try is after ${delayBonus - delayProbe} seconds.`);
                }
                setTimeout(Claim, (delayBonus - delayProbe) * 1000);
            }
        }
        else{ //Bonus is not available. Start probing.
            if(log){
                now = new Date();
                console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points cannot be found by the script. Next try is after ${delayProbe} seconds.`);
            }
            setTimeout(Claim, delayProbe * 1000);
        }
    })();
})();
