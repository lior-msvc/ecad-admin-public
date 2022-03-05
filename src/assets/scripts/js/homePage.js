// init home page scripts
function InitHome (){
    $( document ).ready(function() {
        // write log
        console.log("running home page scripts (homePage.js)");

        // SimpleBar - enabling simple bar on specific elements
        new SimpleBar($('.my-app-boxes')[0], { autoHide: false });
        new SimpleBar($('.user-app-boxes')[0], { autoHide: false });
       
    });
}
