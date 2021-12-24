function getFields(){

    /*
        Target block for form with additional fields.
    */
    var target = $('#additional_fields');

    /*
        Checking for the existence of the target block.
        Stops the function and return false if the block does not exist.
    */
    if(target.length == 0)
        return false;

    /*
        Getting data from the API.
    */
    $.ajax({
        url:'/api/test/tests-fields',
        dataType:'JSON',
        method:'POST',
        success: function(success){
            drawFields(target, success.data);
        },
        error: function(error){
            console.log('Fields Error!');
        }
    });
}

function drawFields(target, dataJson){
    /*
        Get current language.
    */
    var lang = location.pathname.split('/')[1];

    /*
        Object with Templates for form construction.
    */
    var template = {
        form:               $('<form>'),
        row:                $('<div>', {'class':'order__form__row'}),
        cell:               $('<div>', {'class':'order__form__cell'}),
        wrapper:            $('<div>', {'class':'control-wrapper'}),
        title:              $('<div>', {'class':'order__form__title'}),
        caption:            $('<div>', {'class':'order__form__caption'}),
        input:              $('<input>', {'class':'control control--input', 'type':'text'}),
        select:             $('<select>', {'class':'control control--select'}),
        option:             $('<option>', {'value':''}),
        error:              $('<div>', {'class':'control-error', 'style':'display:none;'}),
        checkbox:           $('<input>', {'class':'control control--checkbox', 'type':'checkbox'}),
        wrapper_checkbox:   $('<div>', {'class':'control-wrapper control-wrapper--checkbox'}),
        phone:              $('<input>', {'class':'control control--input phone', 'type':'tel', 'maxlength':10}),
        label_checkbox:     $('<label>', {'class':'control-label'}),
        label_phone:        $('<label>', {'class':'control phone_prefix', 'text':'+38'}),
    };

    /*
        Hide form and return false if data does not exist.
    */
    if(!dataJson){
        template.form.replaceAll(target.children('form'));
        target.hide();

        return false;
    }
    
    /*
        Collecting additional form fields data before creating new form.
    */
    var collected = collectFormData(target.children('form').serializeArray());

    var form = template.form.clone();

    $.each(dataJson, function(i, data){

        form.append(template.row.clone().append(template.title.clone().text(data[lang])));

        $.each(data.fields, function(n, field){
            var element = '';

            if(field.type == 'text'){
                element = template.input.clone().attr(
                        {
                            id:field.name,
                            name:field.name,
                            autocomplete:field.autocomplete,
                            placeholder:field['placeholder_' + lang],
                            'data-combine':data.combine,
                            'data-alias':data.alias,
                            'data-disabled': field.disabled
                        });

                if(field.name in collected){
                        element.attr({value:collected[field.name]});
                }
            }

            if(field.type == 'phone'){
                element = template.phone.clone().attr(
                                {
                                    id:field.name,
                                    name:field.name,
                                    autocomplete:field.autocomplete,
                                    placeholder:field['placeholder_' + lang],
                                    'data-combine':data.combine,
                                    'data-alias':data.alias,
                                    'data-disabled': field.disabled
                                });

                if(field.name in collected){
                        element.attr({value:collected[field.name]});
                }
            }

            if(field.type == 'select'){
                element = template.select.clone().attr(
                        {
                            id:field.name,
                            name:field.name,
                            'data-placeholder':field['placeholder_' + lang],
                            'data-combine':data.combine,
                            'data-alias':data.alias,
                            'data-disabled': field.disabled
                        })
                        .append(template.option.clone());

                try{
                    var options = JSON.parse(field.options);
                } catch(e){
                    var options = false;
                }

                if(options != false){
                    $.each(options, function(z, option){
                        element.append(template.option.clone().attr(
                            {
                                value:option.value[lang],
                                fill:option.fill,
                            }
                        )
                        .text(option.text[lang]));
                    });

                    if(field.name in collected){
                        element.val(collected[field.name]);
                    }
                }
            }

            if(field.type == 'checkbox'){
                element = $('<div>').append(
                    template.checkbox.clone()
                        .attr({
                                id:field.name,
                                name:field.name,
                                'data-combine':data.combine,
                                'data-alias':data.alias,
                            }),
                    template.label_checkbox.clone()
                        .attr({
                                for:field.name
                            })
                        .text(field['placeholder_' + lang])
                );

                try{
                    var options = JSON.parse(field.options);
                } catch(e) {
                    var options = false;
                }

                if(options != false){
                    if(typeof options.fill !== 'undefined'){
                        element.find('input[type="checkbox"]').attr({fill:options.fill}).addClass('trigger');
                    }

                    // if(field.name in collected){
                    //         element.attr({value:collected[field.name]});
                    // }
                }
            }

            if(field.type == 'date'){
                element = template.input.clone().attr({
                            id:field.name,
                            name:field.name,
                            autocomplete:field.autocomplete,
                            placeholder:field['placeholder_' + lang],
                            'data-combine':data.combine,
                            'data-alias':data.alias,
                            'data-disabled': field.disabled
                        });

                element.addClass('datepicker');

                if(field.name in collected){
                        element.attr({value:collected[field.name]});
                }
            }

            
            var rulesAttr = getRulesAttributes(field.rules);

            if(rulesAttr != false){
                element.attr(rulesAttr);

                if('data-rules-important' in rulesAttr && rulesAttr['data-rules-important'] == 'true'){
                    if(field.type == 'text' || field.type == 'phone' || field.type == 'date')
                        element.attr({placeholder:field['placeholder_' + lang] + ' *'});
                    if(field.type == 'select')
                        element.attr({'data-placeholder':field['placeholder_' + lang]  + ' *'});
                }
            }

            if(field.type == 'checkbox')
                element = template.wrapper_checkbox.clone().append(element);
            else if(field.type == 'phone')
                element = template.wrapper.clone().append(template.label_phone.clone(), element);
            else
                element = template.wrapper.clone().append(element);

            form.append(
                template.row.clone().append(
                    element,
                    template.error.clone().addClass('error-' + field.name).text(field['error_' + lang])
                )
            );

        });
    });

    form.replaceAll(target.children('form'));

    $(document).trigger('reloadSelects');

    disableFields();

    target.show();
};

function getRulesAttributes(rulesJson){

    try{
        var rules = JSON.parse(rulesJson);
    } catch(e){
        return false;
    }

    if($.isEmptyObject(rules)){
        return false;
    }

    var rulesAttr = {};

    $.each(rules, function(i,e){
        rulesAttr['data-rules-' + i] = e;
    });

    return rulesAttr;
}

function getFieldsRules(){
    var collection = $('#additional_fields *');
    var searchAttr = 'data-rules-';
    var rules = {};

    if(collection.length == 0)
        return false;

    $.each(collection, function(i, e){
        var attributes = e.attributes;
        var rule = {};

        $.each(attributes, function(z, attribute){
            if(attribute.name.indexOf(searchAttr) == 0){
                if(!isNaN(parseInt(attribute.value, 10)))
                    rule[attribute.name.substr(searchAttr.length)] = parseInt(attribute.value, 10);
                else if(attribute.value == 'true' || attribute.value == 'false')
                    rule[attribute.name.substr(searchAttr.length)] = attribute.value == 'true' ? true : false;
                else
                    rule[attribute.name.substr(searchAttr.length)] = attribute.value;
            }
        });

        if(!$.isEmptyObject(rule))
            rules[e.name] = rule;
    });

    if($.isEmptyObject(rules))
        return false;

    return rules;
}

function prepareFieldsData(data, unsetOrigin = false){
    var collection = $('#additional_fields [data-combine="1"]');
    var combined = {};
    var separator = ', ';

    if(collection.length == 0)
        return data;

    $.each(collection, function(){
        if($(this).attr('data-alias') in combined){
            combined[$(this).attr('data-alias')] += (data[$(this).attr('name')] != '') ? separator + data[$(this).attr('name')] : '';
        }
        else{
            combined[$(this).attr('data-alias')] = (data[$(this).attr('name')] != '') ? data[$(this).attr('name')] : '';
        }

        if(unsetOrigin == true)
            delete data[$(this).attr('name')];
    });

    return Object.assign(data, combined);
}

/**
 * Fills the dependent fields of the form.
 * 
 * @param {object} obj Depends on fields
 * @returns {void}
 * 
 */
function fillFields(obj){
    var selected = obj.find(":selected");
    var toFill = selected.attr('fill');
    var filled = obj.attr('data-filled');
    var val = selected.val();

    if(typeof toFill !== 'undefined'){
        $.each(toFill.split(','), function(i, e){
            $('#' + e).val(val);
        });

        obj.attr({'data-filled':toFill});
    }
    else{
        if(typeof filled !== 'undefined'){
            $.each(filled.split(','), function(i, e){
                $('#' + e).val('');
            });

            obj.removeAttr('data-filled');
        }
    }
}

/**
 * Returns prepared data collected by jquery serializeArray() method
 * 
 * @param {Array} serializeArray Form data collection.
 * @returns {Object} Returns aggregate or empty object.
 * @example 
 * 
 * [{name:'foo', value:'bar'}];
 * // => {'foo':'bar'}
 * 
 * [];
 * // => {}
 * 
 */
function collectFormData(serializeArray){
    var prepared = {};

    if(serializeArray.length > 0){
        $.each(serializeArray, function(i, field){
            prepared[field.name] = field.value;
        });
    }
    
    return prepared;
}

/**
 * Reloads styles of from "select" fields.
 * 
 */
function reloadSelects(){
    $('#additional_fields .control--select:not(.control--loaded)').map(function ()
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
}

/**
 * Disable loaded fields with status data-disabled="1"
 * 
 */
function disableFields(){

    $('[data-disabled="1"]').each(function(i, element){
        var element = $(this);

        element.attr({
            disabled:true,
        });

        if(element.is('select')){
            element.attr({
                'data-placeholder':element.attr('data-placeholder').replace('*',''),
                'data-rules-important': false
            });
            element.val(null).trigger('change');
            element.siblings().css({'background-color':'#d8d8d8'});
        }
        else{
            element.closest('div').css({'background-color':'#d8d8d8'});
            element.css({'background-color':'inherit'});
            element.val('');
            element.attr({
                placeholder: element.attr('placeholder').replace('*', ''),
                'data-rules-important': false
            });
        }
    });
}

function disableEnableFields(status, fields){

    if(typeof fields !== 'undefined'){

        fields = fields.split(',');

        $.each(fields, function(i, e){
            var element = $('#' + e);

            if(element.length == 0)
                return true;

            if(!status){
                element.attr({
                    disabled:true,
                    'data-disabled':1,
                    'data-rules-important': false
                });

                if(element.is('select')){
                    element.attr({
                        'data-placeholder':element.attr('data-placeholder').replace(' *',''),
                    });
                    element.data({placeholder:element.attr('data-placeholder'), minimumResultsForSearch: -1}).select2();
                    element.val(null).trigger('change');
                    element.siblings().css({'background-color':'#d8d8d8'});
                }
                else{
                    element.closest('div').css({'background-color':'#d8d8d8'});
                    element.css({'background-color':'inherit'});
                    element.val('');
                    element.attr({
                        placeholder: element.attr('placeholder').replace(' *', ''),
                    });
                }
            }
            else{
                element.attr({
                    disabled:false,
                    'data-disabled':0,
                    'data-rules-important': true
                });

                if(element.is('select')){
                    element.attr({
                        'data-placeholder':element.attr('data-placeholder') + ' *',
                    });
                    element.data({placeholder:element.attr('data-placeholder'), minimumResultsForSearch: -1}).select2();
                    element.siblings().css({'background-color':'#ffffff'});
                }
                else{
                    element.closest('div').css({'background-color':'#ffffff'});
                    element.css({'background-color':'inherit'});
                    element.attr({
                        placeholder: element.attr('placeholder') + ' *',
                    });
                }
            }
        });
    }
}

function initDatepicker(target){

    var limited = target.attr('data-rules-limited');

    $.datepicker.setDefaults($.datepicker.regional[location.pathname.split('/')[1]]);

    target.datepicker({
        dateFormat: 'yy-mm-dd',
        beforeShow: function(){
            return {
                minDate: limited == 'true' ? '-1M' : "",
                maxDate: limited == 'true' ? new Date() : "",
            };
        }
    });
}

function initDatepickerLocalizations() {

    $.datepicker.regional['ua'] = {
        closeText: "Закрити",
        prevText: "&#x3C;",
        nextText: "&#x3E;",
        currentText: "Сьогодні",
        monthNames: [ "Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень" ],
        monthNamesShort: [ "Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру" ],
        dayNames: [ "неділя","понеділок","вівторок","середа","четвер","п’ятниця","субота" ],
        dayNamesShort: [ "нед","пнд","вів","срд","чтв","птн","сбт" ],
        dayNamesMin: [ "Нд","Пн","Вт","Ср","Чт","Пт","Сб" ],
        weekHeader: "Тиж",
        dateFormat: "dd.mm.yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };

    $.datepicker.regional['ru'] = {
        closeText: "Закрыть",
        prevText: "&#x3C;Пред",
        nextText: "След&#x3E;",
        currentText: "Сегодня",
        monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
        "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
        monthNamesShort: [ "Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек" ],
        dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
        dayNamesShort: [ "вск","пнд","втр","срд","чтв","птн","сбт" ],
        dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
        weekHeader: "Нед",
        dateFormat: "dd.mm.yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: "" };
}

$(function(){

    $(document).on('window.loaded', function() {
        // 
    });

    $(document).on('change', '#additional_fields select', function(){
        fillFields($(this));
    });

    $(document).on('reloadSelects', function(){
        reloadSelects();
    });

    $(document).on('change', '#additional_fields input[type="checkbox"].trigger', function(){
        disableEnableFields($(this).prop('checked'), $(this).attr('fill'));
    });

    $(document).on('focus', '.datepicker', function(){
        initDatepickerLocalizations();
        initDatepicker($(this));
    });
});
