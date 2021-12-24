$(document).ready(function ()
{
    $(document).on('window.loaded', function (event)
    {
        $('.control--select:not(.control--loaded)').map(function ()
        {
            var $field = $(this);

            $field.select2({
                width: 'auto',
                dropdownAutoWidth: true,
                dropdownPosition: 'below',
                dropdownParent: $(this).parent(),
                placeholder: $(this).attr('data-placeholder'),
                closeOnSelect: $(this).attr('multiple') ? false : true,
                minimumResultsForSearch: ($(this).attr('data-search') === 'true') ? Infinity : -1,
                templateResult: function (data)
                {
                    var output = data.text,
                        object = $(data.element);

                    if (object.attr('data-content'))
                    {
                        output = $(object.attr('data-content'));
                    }

                    if (object.attr('data-region'))
                    {
                        output = $('<div>' + output + '<br><span>(' + object.attr('data-region') + ')</span></div>');
                    }

                    return output;
                },
                templateSelection: function (data)
                {
                    var output = data.title || data.text,
                        object = $(data.element);

                    if (object.attr('data-content'))
                    {
                        output = $(object.attr('data-content'));
                    }

                    return output;
                }
            });

            $field.on('reset', function ()
            {
                $(this).val(null).trigger('change.select2');
            });

            $field.addClass('control--loaded');
        });
    });
});