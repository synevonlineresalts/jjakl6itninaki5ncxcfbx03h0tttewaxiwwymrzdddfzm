$(document).ready(function ()
{
    var hasScrolled = false;
    var scrollTop = 0;
    var scrollDelta = 15;
    var headerHeight = 0;
    var previousScrollTop = 0;
    var isHeaderFixed = $('.header').attr('data-fixed');

    $(document).on('window.loaded', function () {
        var $header = $('.header');
        headerHeight = $header.outerHeight();

        setInterval(function () {
            if (hasScrolled) {

                scrollTop = $(window).scrollTop();
                
                if (scrollTop >= 150){
                    if (!$header.hasClass('unfixed')) {
                        $header.addClass('unfixed');
                        hideGeaderMenu(event);
                        //$(document).trigger('click');
                        $('.widget--up').show();
                    }
                } else {
                    if ($header.hasClass('unfixed'))
                        $header.removeClass('unfixed');
                    $('.widget--up').hide();
                }                        

                hasScrolled = false;
                previousScrollTop = scrollTop;
            }
        }, 200);
    });

    $(window).on('window.scrolled', function () {
        if ( isHeaderFixed != 1 )
            hasScrolled = true;
    });

    $(document).on('window.resized', function () {
        headerHeight = $('.header').outerHeight();

        if (!$('.header__toggle:visible').length) {
            $('.wrapper').removeClass('no-scroll');
            $('.header__menu').removeClass('active');
            $('.header__toggle').removeClass('active');
        }
    });

    $(document).on('click touched', function (event) {
        hideGeaderMenu(event);
    });

    function hideGeaderMenu(event){        
        $('.header__menu__item--has-submenu').removeClass('active');
    }

    $(document).on('click touched', '.header__toggle', function () {
        /*$('.wrapper').toggleClass('no-scroll');*/
        $('.sidebar__menu').toggle();
        $('.sidebar__support').toggle();
        $('.sidebar__info').toggle();
        $('.sidebar__help').toggle();
/*        $('.header__menu').toggleClass('active');*/
        $('.header__toggle').toggleClass('active');
    });

    $(document).on('click touched', '.header__menu__link', function (event) {
        var $parent = $(this).parent();
        if (!$parent.hasClass('active')) {
            $parent.find('.header__menu__item--has-submenu').removeClass('active');
            $parent.siblings('.header__menu__item--has-submenu').removeClass('active');
        }

        if ($parent.hasClass('header__menu__item--has-submenu')) {
            event.preventDefault();
            $parent.toggleClass('active');
            return false;
        }
    });

    // $('.covid_marquee').marquee({
    //     duration: 50000
    // });

    if($('.covid_marquee').is(":visible")){
        var marqueeWidth = $('.header__marquee').outerHeight();
        $('.content').css('padding-top', (40 + marqueeWidth) + 'px');
    }

    $(document).on('click touched', '.covid_marquee_close', function () {
        $('.covid_marquee').hide();
        $('.content').css('padding-top', '40px');
    });

});

/* GET CURRENT PAGE LANG */
var getLang = function() {
    var lang = (location.pathname).split('/')[1];
    return lang;
}