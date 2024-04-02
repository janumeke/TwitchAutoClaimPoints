// ==UserScript==
// @name         TwitchAutoClaimPoints
// @namespace    https://github.com/janumeke/TwitchAutoClaimPoints
// @version      0.4
// @description  Auto clicks point bonus on Twitch.
// @author       janumeke
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const log = true;
    const debug = false; //If debug is set to true, the value of log will be ignored

    const tryWatchPeriod = 3; //secs
    const tryWatchLimit = 10; //times

    function Claim(){
        const button = document.querySelector('.claimable-bonus__icon');
        if(button){
            button.closest('button').click();
            if(log || debug){
                let now = new Date();
                console.log(`TwitchAutoClaimPoints: Bonus points are claimed by the script. (${now.toLocaleTimeString()})`);
            }
        }
    }

    class Watcher{
        constructor(){
            this.observer = new MutationObserver(function(){
                if(debug){
                    console.log("TwitchAutoClaimPoints: Target change is detected.");
                }
                Claim();
            });
        }

        Watch(){
            this.Unwatch();

            this.tryWatchQuota = tryWatchLimit;
            this.tryWatch = setInterval(this.#WatchHelper.bind(this), tryWatchPeriod * 1000);
            //Invariant: At most one 'setInterval' of 'WatchHelper' is running
            //Invariant: observer observes exactly one target if it succeeds, or zero targets if it fails
        }

        #WatchHelper(){ //This function will be called repeatedly until itself decides it is successful or reaches the limit
            const target = document.querySelector('div.community-points-summary');
            if(target){
                clearInterval(this.tryWatch);
                Claim(); //Try claim in case the button has existed

                this.observer.observe(target.lastChild, {childList: true});
                if(debug){
                    console.log('TwitchAutoClaimPoints: Target is being watched.');
                }
            }
            else{
                if(--this.tryWatchQuota <= 0){
                    clearInterval(this.tryWatch);
                    if(debug){
                        console.log('TwitchAutoClaimPoints: Target cannot be found and watched. Targeting has stopped because it reached the limit.');
                    }
                }
            }
        }

        Unwatch(){
            clearInterval(this.tryWatch);
            this.observer.disconnect();
        }
    }

    const watcher = new Watcher();
    function Check(){ //This function will be called when the route is changed
        watcher.Unwatch();

        const regexReserved = new RegExp('^/(directory|videos|downloads|broadcast|p|creatorcamp|store|partner|jobs|bits|subs|prime|legal|turbo|products|redeem|search|settings|friends|subscriptions|inventory|drops|wallet|event|team)(/.*)?$');
        const regexChannel = new RegExp('^/[A-Za-z0-9_]+(/(about|schedule|videos|clips|collections|followers|following|squad)?)?$');
        if(location.hostname == 'www.twitch.tv' && //This script may still be triggerred on subdomains other than "www"
           !regexReserved.test(location.pathname) &&
           regexChannel.test(location.pathname)){
            watcher.Watch();
        }
        else{
            if(debug){
                console.log('TwitchAutoClaimPoints: The script determines this page is not a channel. The automatic point claim will not begin.');
            }
        }
    }

    const pushState = history.pushState;
    history.pushState = function(){ //When single page applications change routes
        pushState.apply(history, arguments);
        Check();
    };
    window.addEventListener('popstate', Check); //When navigating with the back/forward buttons
    Check(); //Always check when the whole page first loads
})();
