// ==UserScript==
// @name         TwitchAutoClaimPoints
// @namespace    https://github.com/janumeke/TwitchAutoClaimPoints
// @version      0.1
// @description  Auto click point bonus on Twitch.
// @author       janumeke
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const log = true;
    const debug = false; //If debug is set to true, the value of log will be ignored

    const tryWatchPeriod = 5; //secs
    const tryWatchLimit = 10; //times

    function Claim(){
        const button = document.getElementsByClassName('claimable-bonus__icon')[0];
        if(button){
            button.click();
            if(log || debug){
                let now = new Date();
                console.log(`TwitchAutoClaimPoints: (${now.toLocaleTimeString()}) Bonus points are claimed by the script.`);
            }
        }
    }

    const observer = new MutationObserver(function(){
        if(debug){
            console.log("TwitchAutoClaimPoints: Target change is detected.");
        }
        Claim();
    });

    var tryWatch;
    var tryWatchQuota; //This should be set when 'Watch' starts being repeatedly called
    function Watch(){ //This function will be called repeatedly until itself decides it's successful
        observer.disconnect();

        const target = document.querySelector('div.community-points-summary');
        if(target){
            clearInterval(tryWatch);
            Claim(); //Try claim in case the button has existed

            target = target.lastChild;
            observer.observe(target, {childList: true});
            if(debug){
                console.log('TwitchAutoClaimPoints: Target is being watched.');
            }
        }
        else{
            if(--tryWatchQuota <= 0){
                clearInterval(tryWatch);
                if(debug){
                    console.log('TwitchAutoClaimPoints: Target cannot be found and watched. Targeting has stopped because it reached the limit.');
                }
            }
        }
        //Invariant: observer observes exactly one target if it succeeds, or zero targets if it fails
    }

    function Check(){ //This function will be called when the route is changed
        clearInterval(tryWatch);

        const regexReserved = new RegExp('^/(directory|videos|downloads|broadcast|p|creatorcamp|store|partner|jobs|bits|subs|prime|legal|turbo|products|redeem|search|settings|friends|subscriptions|inventory|drops|wallet)(/.*)?$');
        const regexChannel = new RegExp('^/[A-Za-z0-9_]+(/(about|schedule|videos|clips|collections)?)?$');
        if(location.hostname == 'www.twitch.tv' && //This script may still be triggerred on subdomains other than "www"
           !regexReserved.test(location.pathname) &&
           regexChannel.test(location.pathname)){
            tryWatchQuota = tryWatchLimit;
            tryWatch = setInterval(Watch, tryWatchPeriod * 1000);
        }
        else{
            if(debug){
                console.log('TwitchAutoClaimPoints: The script determines this page is not a channel. The automatic point claim will not begin.');
            }
        }
        //Invariant: At most one 'setInterval' of 'Watch' is running
    }
    Check(); //Always check when the whole page first loads

    const pushState = history.pushState;
    history.pushState = function(){ //When single page applications change routes
        pushState.apply(history, arguments);
        Check();
    };
    window.addEventListener('popstate', Check); //When navigating with the back/forward buttons
})();
