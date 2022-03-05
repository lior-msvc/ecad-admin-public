$( document ).ready(function() {
    /**  
     * animation and calculation of fluid box
     * */
    let itemCount = 0;
    $('.app-tab-box').each(function() {
        itemCount += 1;
    });
    $('.app-tab-box').click(function() {
        $('.none-selected-box').hide();
        $('.responsive-info-box').show();
        $('.app-tab-box').each(function() {
            $(this).removeClass('current');
        });
        $(this).addClass('current');
        let boxPos = $(this).position();
        let bottomDiff = $(this).outerHeight(true) * 5;
        let boxHeight = $('.app-tab-box').height();
        if ( $(this).index() > 4 ) {
            $('.arrow-indicator').css('bottom', '10px');
            $('.arrow-indicator').css('top', 'unset');
            $('.arrow-indicator').css('transform', 'rotate(-45deg) translateY(-50%)');
            $('.responsive-info-box').css('top', boxPos.top - bottomDiff);
        } 
        else {
            $('.arrow-indicator').css('bottom','unset');
            $('.arrow-indicator').css('top', boxHeight/2);;
            $('.responsive-info-box').css('top', boxPos.top);
        }
    });
});

