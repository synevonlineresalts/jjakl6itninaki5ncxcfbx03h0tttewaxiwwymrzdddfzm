$(document).ready(function ()
{
    var resizeTimeout = -1;

    $(window).on('load', function ()
    {
        $(document).trigger('window.loaded');
    });

    $(window).on('resize', function ()
    {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(function ()
        {
            $(document).trigger('window.resized');
        }, 50);
    });

    $(window).on('scroll', function ()
    {
        $(document).trigger('window.scrolled');
    });

    $(document).on('click touched', 'a', function (event)
    {
        var href = $(this).attr('href');

        if (!href || href === '#')
        {
            event.preventDefault();

            return false;
        }
    });

    $(document).on('change', '#header_location, #location', function(){
        var location = $(this).val();

        updateLocationLists(location);

    });


});

$(document).on('click touched', 'a.region_title', function(){
    var r_id = $(this).attr('r');
    $(".r_"+r_id).slideToggle(300);
});

/*function syncCart(){
    var cart = localStorage.getItem('cart');

    console.log(cart);

    cart = (!cart) ? [] : JSON.parse(cart);

    $.post('/api/cart/sync', {'cart': cart}, function(data) {
        console.log('sync');
        //console.log(data);
        var cart = [];
        if(data.cart){
            $.each(data.cart, function(index, val) {
                cart.push(val);
            }.bind(cart));
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        rewriteLocationLists();

        var location = localStorage.getItem('location');
        if(!location){
            localStorage.setItem('location',1);
            location = 1;
        };
        updateLocationLists(location);
    });
}*/

function updateCartTable(){
    $.post('/api/cart/info', {'code':'code'}, function(data, textStatus, xhr) {
        //console.log(data);

        localStorage.setItem('cart', JSON.stringify(data.cart_codes));

        var res = '';

        if(data.warning_covid_check)
            $("#covid_aboard_alert").show();
        else
            $("#covid_aboard_alert").hide();

        if(data.passport_number)
            $("#international-passport-block").show();
        else
            $("#international-passport-block").hide();

        var lang = getLang();

        if(data.service_additional_alert !== undefined && data.service_additional_alert[lang]){
            $("#service_additional_alert div.alert__text").html(data.service_additional_alert[lang]);
            $("#service_additional_alert").show();
        } else {
            $("#service_additional_alert").hide();
            $("#service_additional_alert div.alert__text").html();
        }

        if(data.cart && (data.cart).length > 0){

            localStorage.setItem('location', data.location_id);
            $("#location").val(data.location_id);

            $.each(data.cart, function(index, test) {
                res += '<tr class="order__item">';
                res += '<td>' + test.code + '</td><td>';

                var lang = getLang();

                var components = '';
                if(test.components_ua && (test.components_ua).length > 0)
                    components = '<br><span>(' + (test['components_' + lang]).join("; ") + ')</span>';

                var remark = '';
                if(test['remark_'+lang])
                    remark = '<br><span><b>* ' + test['remark_'+lang] + '</b></span>';

                var test_label = test['name_' + lang] + components + remark;

                console.log(test_label);

                if(test.sp_link !== null && lang == 'ru'){
                    test_label = '<a target="_blank" href="https://spravochnik.synevo.ua/ru/'+test.sp_link+'">'+test_label+'</a>';
                }

                res += test_label + '</td><td>' + test.price + '</td>';
                res += '<td><center><button class="remove_from_cart order__item__remove code_' + test.code + '" code="' + test.code + '">&times;</button></center></td>';
                res += '</tr>';
            }.bind(res));
        } else {
            $("#covid_aboard_alert").hide();
        }

        if(data.intake && (data.intake).length > 0){
            $.each(data.intake, function(index, test) {
                res += '<tr class="order__item">'; // res += '<tr class="order__item unavailable">';
                res += '<td>' + test.code + '</td><td>' + test['name_' + getLang()] +'</td><td>' + test.price + '</td>';
                res +=  '<td></td>';
                res += '</tr>';
            }.bind(res));
        }

        var lang = getLang();
        var empty_msg = {"ua":"Кошик пустий", "ru":"Корзина пуста", "en":"The cart is empty"};
        if(res.length == 0) res = '<tr class="order__item"><td colspan="4"><center>'+empty_msg[lang]+'</center></td></tr>';

        var sum = (data.sum) ? Math.round(data.sum * 100) / 100 : 0;
        var paySum = (data.discountSum) ? Math.round(data.discountSum * 100) / 100 : 0;
        var discount = Math.round((sum - paySum) * 100) / 100;

        $('#tests_info > tbody').html(res);

        $('.order_sum').text(sum);
        $('.order_pay_sum').text(paySum);
        $('.order_pay_sum_original').text(sum);
        $('.order_discount_sum').text(discount);

        if(discount != 0)
            $('#order__pay .cross_out').addClass('active');
        else
            $('#order__pay .cross_out').removeClass('active');

        setDiscountParams(data.discountParams);
        getProposal();
        getFields();
    });
}

/* FUNCTION FOR GET DISCOUNT */
function getDiscount() {
    var targetButton = $('.order__discount__form button.order__discount__submit');
        showHideSpinner(targetButton);

    $.ajax({
        url:'/api/discount/get-discount',
        dataType:'JSON',
        method:'POST',
        data:{
            _token: $('.order__discount__form input[name="_token"]').val(),
            coupon: $('.order__discount__form input[name="coupon"]').val()
        },
        success: function(success){
            // console.log(success);

            if(success.modal){
                if(success.redirect){
                    showDiscountModal(success);
                    //window.location.replace(success.redirect);
                }
            }

            updateCartTable();
            showHideSpinner(targetButton);

            if(success.result == false)
                showWarning(false);
        },
        error: function(error){
            console.log('Server Error!');
            showHideSpinner(targetButton);
        }
    });
}

function showDiscountModal(data){
    var lang = getLang();

    var modalInfo = $("#discount_individual_modal_info");
    modalInfo.text(data.info);

    var modal = $('[data-remodal-id=discount-individual-modal]');
    var modalBtnConfirm = modal.find('a.remodal-confirm');
    modalBtnConfirm.prop('href', data.redirect);

    prepareVitagrammTestsTable(data.order_data);

    var modalObject = modal.remodal();
    modalObject.open();
}

function prepareVitagrammTestsTable(order_data){

    $("#v_order_sum").html(order_data.sum);
    $("#v_order_pay_sum_original").html(order_data.sum);

    $("#v_order_discount_sum").html(order_data.discount);
    $("#v_order_pay_sum").html(order_data.pay_sum);

    var tests = order_data.tests;

    var res = '';

    if(tests && (tests.cart).length > 0){

        $.each(tests.cart, function(index, test) {
            res += '<tr class="order__item">';
            res += '<td>' + test.code + '</td><td>';

            var lang = getLang();

            var components = '';
            if(test.components_ua && (test.components_ua).length > 0)
                components = '<br><span>(' + (test['components_' + lang]).join("; ") + ')</span>';

            var remark = '';
            if(test['remark_'+lang])
                remark = '<br><span><b>* ' + test['remark_'+lang] + '</b></span>';

            var test_label = test['name_' + lang] + components + remark;

            console.log(test_label);

            if(test.sp_link !== null && lang == 'ru'){
                test_label = '<a target="_blank" href="https://spravochnik.synevo.ua/ru/'+test.sp_link+'">'+test_label+'</a>';
            }

            res += test_label + '</td><td>' + test.price + '</td>';
            res += '</tr>';
        }.bind(res));

        if(tests.intakes && (tests.intakes).length > 0){
            $.each(tests.intakes, function(index, test) {
                res += '<tr class="order__item">'; // res += '<tr class="order__item unavailable">';
                res += '<td>' + test.code + '</td><td>' + test['name_' + getLang()] +'</td><td>' + test.price + '</td>';
                res += '</tr>';
            }.bind(res));
        }

    }

    $('#vitagramm_tests_info > tbody').html(res);
}

/* FUNCTION FOR SET DISCOUNT PARAMETERS */
function setDiscountParams(discountParams) {
    var discountInfoBlock = $('.order__discount__info');
    var orderDiscount = $('.order__discount');
    var discountListSingle = $('#discount__tests__list__single');
    var discountListMultiple = $('#discount__tests__list__multiple');

    discountInfoBlock.hide();
    discountListSingle.parent().hide();
    discountListMultiple.parent().hide();
    orderDiscount.show();

    if(discountParams) {
        discountInfoBlock.find('.info__discount__name span').text(discountParams.name);
        discountInfoBlock.find('.info__discount__size span').text(
            function(index, text){
                return text.replace(/^\d+\.?\d*/g, discountParams.size);
            }
        );

        if(discountParams.code) {
            discountInfoBlock.find('.info__discount__code span').text(discountParams.code).parent().show();
        } else {
            discountInfoBlock.find('.info__discount__code span').text('').parent().hide();
        }

        discountInfoBlock.show();
        orderDiscount.hide();

        if(discountParams.test_select_mode != 1) {
            discountInfoBlock.find('.info__discount__message').show();

            if(discountParams.test_select_mode == 2) {
                getDiscountTestsList(discountListSingle, discountParams.test_select_mode);
            }

            if(discountParams.test_select_mode == 3) {
                getDiscountTestsList(discountListMultiple, discountParams.test_select_mode);
            }

            return false;
        }
    }

    discountInfoBlock.find('.info__discount__message').hide();
}

/* FUNCTION FOR CANCEL DISCOUNT PARAMETERS */
function cancelDiscount() {
    var targetButton = $('.order__discount__info .order__discount__cancel');
        showHideSpinner(targetButton);

    $.ajax({
        url:'/api/discount/cancel-discount',
        dataType:'JSON',
        method:'POST',
        success: function(success){
            console.log(success);

            updateCartTable();
            showHideSpinner(targetButton);
        },
        error: function(error){
            console.log('Error Cancel discount!');

            showHideSpinner(targetButton);
        }
    });
}

/* FUNCTION FOR CLEAR CART */
function clearCart(){
    var targetButton = $('.order__form__buttons .clear_cart_button');
        showHideSpinner(targetButton);

    $.ajax({
        url:'/api/cart/drop',
        dataType:'JSON',
        method:'POST',
        success: function(success){
            console.log(success);

            if(success == false){
                showWarning(true);
            }
            else{
                localStorage.setItem('cart', JSON.stringify(success.cart));

                updateCartTable();
            }

            showHideSpinner(targetButton);
        },
        error: function(error){
            console.log('Error Clear Cart!');

            showHideSpinner(targetButton);
        }
    });
}

/* FUNCTION FOR SHOWING MODAL MESSAGE AND CALL TO CLEAR CART FUNCTION */
function clearTestsInCart(){
    var modalClearCart = $('[data-remodal-id=cart-clear]').remodal();

        clearCart();
        modalClearCart.close();
}

/* FUNCTION FOR SHOWING SPINNER ON THE TARGET BUTTON */
function showHideSpinner(object){
    var textHolder = object.find('>span');
    var spinner = object.find('.spinner-border');

    textHolder.toggle();
    spinner.toggle();
}

/* FUNCTION FOR CHOOSING MULTIPLE TESTS FROM DISCOUNT LIST */
function chooseDiscountTests(){
    var targetButton = $('.order__discount__items__list .order__discount__choose__tests');
        showHideSpinner(targetButton);

    var list = $('#discount__tests__list__multiple');
    var choosen = list.find('input:checked');
    var tests = {};

    choosen.each(function(i){
        tests[i] = $(this).attr('value');
    });

    $.ajax({
        url:'/api/discount/choose-tests',
        dataType:'JSON',
        method:'POST',
        data: {tests: tests},
        success: function(success){
            console.log(success + " - List Multiple");

            if(success == false){
                showWarning(false);
            }
            else{
                updateCartTable();
            }

            showHideSpinner(targetButton);
        },
        error: function(error){
            console.log('Server error - Error in the choice of discount tests - Multiple!');

            showHideSpinner(targetButton);
        }
    });

}

/* FUNCTION FOR CHOOSING SINGLE TEST FROM DISCOUNT LIST */
function chooseDiscountTest(testCode){
    console.log('Single tests list choise - ' + testCode);

    $.ajax({
        url:'/api/discount/choose-tests',
        dataType:'JSON',
        method:'POST',
        data: {tests: [testCode]},
        success: function(success){
            console.log(success + " - List Single");

            if(success == false){
                showWarning(false);
            }
            else{
                updateCartTable();
            }
        },
        error: function(error){
            console.log('Server error - Error in the choice of discount tests - Single!');
        }
    });
}

/* FUNCTION FOR DRAWING DISCOUNT TESTS LIST */
function getDiscountTestsList(discountTestsList, listType){
    var code, name, price, item;
    var parent = discountTestsList.find('tbody');
    var target = discountTestsList.find('tbody tr:first-child');

    target.find('~ tr').remove();

    $.ajax({
        url:'/api/discount/get-discount-tests-list',
        dataType:'JSON',
        method:'POST',
        success: function(success){
            console.log(success + ' - List Drawing');

            if(success == false){
                discountTestsList.parent().hide();

                return false;
            }

            if(listType == 2){ // List Single

                $.each(success, function(key, value){
                    item = target.clone();

                    code = value.code;
                    name = value.name_ua;
                    price = value.price;

                    item.find('.order__discount__test__code').text(code);
                    item.find('.order__discount__test__name').text(name);
                    item.find('.order__discount__test__price').text(price);
                    item.find('.order__discount__choose__test').val(code);

                    item.show().appendTo(parent);

                });

            }

            if(listType == 3){ // List Multiple

                $.each(success, function(key, value){
                    item = target.clone();

                    code = value.code;
                    name = value.name_ua;
                    price = value.price;

                    item.find('.order__discount__test__code').text(code);
                    item.find('.order__discount__test__name').text(name);
                    item.find('.order__discount__test__price').text(price);
                    item.find('.order__discount__test__action input').attr({id:code, name:code, value:code, checked:false});
                    item.find('.order__discount__test__action label').attr({for:code});

                    item.show().appendTo(parent);

                });
            }

            discountTestsList.parent().show();
        },
        error: function(error){
            console.log('Server error - List Drawing!');
        }
    });

}
