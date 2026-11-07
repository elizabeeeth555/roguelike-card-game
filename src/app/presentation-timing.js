'use strict';
// Presentation budgets only. They never enter the reducer or planner.
const PresentationTiming=Object.freeze({
 normal:Object.freeze({declaration:2000,openingGap:180,enemyLead:700,enemyAction:900,finishPause:700,resultFade:400}),
 fast:Object.freeze({declaration:1000,openingGap:100,enemyLead:350,enemyAction:550,finishPause:350,resultFade:240})
});
function presentationTiming(){return app.fastFx?PresentationTiming.fast:PresentationTiming.normal;}
