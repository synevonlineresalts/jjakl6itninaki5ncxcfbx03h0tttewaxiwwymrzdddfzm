$(document).ready(function ()
{
    $(document).on('click touched', '.accordion__header', function (event)
    {
        event.preventDefault();

        $(this).closest('.accordion').toggleClass('active');
        $(this).next('.accordion__content').stop().slideToggle(300);

        return false;
    });

    $(document).on('click touched', '.accordion_seminar__header', function (event)
    {
        event.preventDefault();

        $(this).closest('.accordion_seminar').toggleClass('active');
        $(this).next('.accordion_seminar__content').stop().slideToggle(300);

        return false;
    });
});