
$( document ).ready(function() {
    /* 
    *   Toggle switch and animation
    *   - we are targeting the checked/unchecked because the toggle is built off of radio btns
    */
    $('input:checked').each(function () {
        $(this).parent().addClass('active-tab');
    });
    $('.left-tab').click(function(e) {
        $(this).parent().parent().find('.active-tab').removeClass('active-tab');
        $(this).parent().addClass('active-tab');
    });
    $('.right-tab').click(function(e) {
        $(this).parent().parent().find('.active-tab').removeClass('active-tab');
        $(this).parent().addClass('active-tab');
     });
});

