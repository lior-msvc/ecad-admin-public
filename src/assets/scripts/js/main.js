// init common scripts
function InitCommon() {
    $(document).ready(function () {
        // write log
        console.log("running common scripts (main.js)");

        // make all modal dialogs  draggable
        $('.modal-dialog').draggable();

        // Bootstrap tooltip
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        /**  
         * Input animation
        */
       /*
       alert('adding event');
        $('.focused-input').on({
            focus: function () {
                $(this).removeClass('with-val');
                alert(1);
            },
            blur: function () {
                $(this).addClass('with-val');
                alert(2);
            }
        }, '.focused-input');
        */
        $('.filters-left .filter-input, .modal-body .filter-input, .filter-bar .filter-input, .config-edit-box .filter-input').each(function () {
            // Iteration over specific inputs checking if they have a value to prepare athe animation classes
            if ($(this).val()) {
                $(this).parent().addClass('selected-anim');
                $(this).parent().addClass('with-val');
            }
        });
        $('.filter-input').focus(function () {
            $(this).parent().addClass('selected-anim');
        });
        $('.filter-input').click(function (e) {
            $(this).parent().find('.date-input').addClass('show-date');
        });
        $('.filter-input').blur(function (e) {
            if (!$(this).val()) {
                $(this).parent().removeClass('selected-anim');
                $(this).parent().removeClass('with-val');
                $(this).parent().find('.date-input').removeClass('show-date');
            } else {
                $(this).parent().addClass('with-val');
            }
        });
        $('.date-wrap').focusin(function () {
            $(this).addClass('selected-anim');
        });
        $('.date-wrap').focusout(function () {
            if (!$(this).children("input").val()) {
                $(this).removeClass('selected-anim');
                $(this).removeClass('with-val');
            } else {
                $(this).addClass('with-val');
            }
        });
    });
}

// open loading modal window
function OpenLoadingModal() {
    if (window.jQuery) {
        $('#loader-modal').modal('show');
        //setTimeout(function(){ $('#loader-modal').modal('show'); }, 50);
    }
    else {
        $(document).ready(function () {
            $('#loader-modal').modal('show');
            //setTimeout(function(){ $('#loader-modal').modal('show'); }, 50);
        });
    }
}

// close loading modal window
function CloseLoadingModal() {
    if (window.jQuery) {
        //$('#loader-modal').modal('hide');
        setTimeout(function () { $('#loader-modal').modal('hide'); }, 750);
    }
    else {
        $(document).ready(function () {
            //$('#loader-modal').modal('hide');
            setTimeout(function () { $('#loader-modal').modal('hide'); }, 750);
        });
    }
}