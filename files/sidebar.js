$(document).ready(function ()
{
    $(document).on('click touched', function (event)
    {
        if (!$(event.target).closest('.sidebar__menu').length)
        {
            $('.sidebar__menu__item--has-submenu').removeClass('active');
        }
   });

    $(document).on('click touched', '.sidebar__menu__link', function (event)
    {
        var $parent = $(this).parent();

        $parent.siblings('.sidebar__menu__item--has-submenu').removeClass('active');

        if ($parent.hasClass('sidebar__menu__item--has-submenu'))
        {
            event.preventDefault();

            $parent.toggleClass('active');

            return false;
        }
    });

    $(document).on('click touched', '.sidebar__support__toggle', function ()
    {
        $(this).closest('.sidebar__support').toggleClass('active');
    });
});