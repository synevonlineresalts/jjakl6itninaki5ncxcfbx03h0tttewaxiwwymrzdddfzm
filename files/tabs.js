$(document).ready(function ()
{
    $(document).on('click touched', '.tabs__item:not(.active)', function (event)
    {
        event.preventDefault();

        var $parent = $(this).closest('.tabs');

        $parent.find('.tabs__item')
            .removeClass('active')
            .filter(this)
            .addClass('active');

        $parent.find('.tabs__content')
            .removeClass('active')
            .filter('[data-id="' + $(this).attr('data-id') + '"]')
            .addClass('active');

        return false;
    });
});