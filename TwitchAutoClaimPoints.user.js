// ==UserScript==
// @name         TwitchAutoClaimPoints
// @namespace    https://github.com/janumeke/TwitchAutoClaimPoints
// @version      0.2
// @description  Auto click point bonus on Twitch.
// @author       janumeke
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const log = true;

    /*
     It seems that if you claimed the bonus not too late than the time it had popped up,
     Twitch would use the time it had popped up to calculate the time it should next pop up,
     instead of the time you claimed the bonus.
     This script will first try to find the time it just popped up, and then go back to the
     normal interval.
    */
    const delayProbe = 15; //secs
    const delayBonus = 900; //secs
    const delayRsrv = (1 / 2) * delayBonus; //secs, assumed

    var firstClaim; //This is set to true by 'Check' before calling 'Claim'
    var autoclaim;
    function Claim(){
        const button = document.getElementsByClassName('claimable-bonus__icon')[0];
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
                 at the time of the second claim.
                */
                if(log){
                    let now = new Date();
                    console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points are claimed by the script. Next try is after ${delayBonus - delayRsrv - delayProbe} seconds.`);
                }
                autoclaim = setTimeout(Claim, (delayBonus - delayRsrv - delayProbe) * 1000);
            }
            else{
                if(log){
                    let now = new Date();
                    console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points are claimed by the script. Next try is after ${delayBonus - delayProbe} seconds.`);
                }
                autoclaim = setTimeout(Claim, (delayBonus - delayProbe) * 1000);
            }
        }
        else{ //Bonus is not available. Start probing.
            if(log){
                let now = new Date();
                console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points cannot be found by the script. Next try is after ${delayProbe} seconds.`);
            }
            autoclaim = setTimeout(Claim, delayProbe * 1000);
        }
        //Invariant: Exact one 'setTimeout' that will call this function is waiting.
    }

    function Check(){ //This function will be called when the route is changed
        /*
         Since Javascript is single-threaded, this function is called only if 'Claim' hasn't executed or has finished execution.
         Therfore, autoclaim points to the only timed execution that was invoked by the last 'Claim', if 'Claim' had been first invoked by 'Check'.
        */
        clearTimeout(autoclaim);

        const regexReserved = new RegExp('/(directory|videos|downloads|broadcast|p|creatorcamp|store|partner|jobs|bits|subs|prime|legal|turbo|products|redeem|search|settings|friends|subscriptions|inventory|drops|wallet)(/.*)?');
        const regexChannel = new RegExp('/[A-Za-z0-9_]+/?');
        if(location.hostname == 'www.twitch.tv' && //This script may still be triggerred on subdomains other than "www"
           !regexReserved.test(location.pathname) &&
           regexChannel.test(location.pathname)){
            firstClaim = true;
            Claim();
        }
        else{
            if(log){
                console.log('TwitchAutoClaimPoints: The script determines this page is not a channel. The automatic point claim will not begin.');
            }
        }
    }
    Check(); //Always check when the whole page first loads

    const pushState = history.pushState;
    history.pushState = function(){ //When single page applications change routes
        pushState.apply(history, arguments);
        Check();
    };
    window.addEventListener('popstate', Check); //When navigating with the back/forward buttons
})();
