// init apps page scripts
function InitApps(viewMode) {
    // set default view mode
    if (viewMode == null || viewMode == undefined) viewMode = "1";

    $(document).ready(function () {
        // write log
        console.log("running apps page scripts (appsPage.js)");

        modalValFill() //basic metadata val pulls
        $('.view-mode1').click(function () {
            $('.apps-view-mode1').hide();
            $('.apps-view-mode2').show();
        });
        $('.view-mode2').click(function () {
            $('.apps-view-mode2').hide();
            $('.apps-view-mode1').show();
        });
        $(".view-mode" + viewMode).trigger("click");
        /*
         * box open&close - bootstrap takes care of most of the functionality
         * this script only changes the text
         */
        $('.box-toggle-btn').click(function () {
            if ($(this).text() === 'Open' || $(this).text() === 'open' || $(this).text() === 'OPEN') {
                $(this).text('close');
            }
            else {
                $(this).text('open');
            }
        });
        // user-page boxes open up if you hover over them with a timeout to prevent unwanted box openning
        var timeout;
        $('.user-box').hover(
            function () { //onenter
                let hiddenEl = $(this).find('.bottom-wrap');
                let thisEl = $(this);
                timeout = setTimeout(function () {
                    thisEl.addClass('hovering');
                }, 700);
            },
            function () { //onleave
                let hiddenEl = $(this).find('.bottom-wrap');
                clearTimeout(timeout);
                $(this).removeClass('hovering')
            });
        function modalValFill() {//basic metadata val pulls
            $('.edit-app-name').val($('.exe').text());
            $('.edit-app-name').parent().addClass('selected-anim');
            $('.edit-app-name').parent().addClass('with-val');

            $('.edit-decription').val($('.right').children('.text-wrap').children('.main-text').text());
            $('.edit-decription').parent().addClass('selected-anim');
            $('.edit-decription').parent().addClass('with-val');
        }
    });
}
