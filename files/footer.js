$(document).ready(function ()
{
    updateLocationLists(localStorage.getItem('location'));
    /* FOOTER CERTIFICATES CAROUSEL */
    $(document).on('window.loaded', function () {
        initializeSlider();        
    });

    function initializeSlider() {
        $('.footer__slider').owlCarousel({
            items: 3,
            nav: true,
            dots: false,
            loop: true,
            center: true,
	    lazyLoad: true
        });
    }

    // change locale lang on mobile
    $(document).on('change', '#mobile-lang', function () {
        console.log($(this).val());
        window.location.replace($("#"+$(this).val()).attr('href'));
    });

    /* OPEN MODAL FOR ADD TESTS TO CART */
    $(document).on('click touched', '.add_to_cart', function () {
        var code = $(this).attr('code');
        var nav_srch = $(this).attr('add_s');
        var modal = $('[data-remodal-id=cart-add]');

        $.post('/api/test/test-by-code', {'code': code}, function(data) {
            console.log(data);
            if(data == false){
                showWarning(true);
            } else if(data.test != null){
                data = data.test;
                var lang = getLang();

                var modalAdd = $('[data-remodal-id=cart-add]');
                    modalAdd.find("#modal_add_info").html(code + '. ' + data['name_'+lang] + ' <br> ' + data.price + ' грн.').attr('code',code);
                    modalAdd.find("#error_modal_add").hide();
                
                // Test additional messages block - SATRT
                if(data.messages == false){
                    modalAdd.find("#message").html('').hide();
                }
                else{
                    try{
                        var messages = JSON.parse(data.messages);
                    } catch(e){
                        modalAdd.find("#message").html('').hide();
                        
                        return false;
                    }

                    var message = '';

                    $.each(messages, function(i,e){
                        message += e[lang] + '<br>';
                    });

                    modalAdd.find("#message").html(message).show();
                }
                // Test additional messages block - END

                if(nav_srch)    localStorage.setItem('add_s', 'n');
                else            localStorage.setItem('add_s', '');

                var modalAdd = modalAdd.remodal();
                modalAdd.open();
            }
            
            
        });
    });

    /* OPEN MODAL FOR REMOVE TESTS FROM CART */
    $(document).on('click touched', '.remove_from_cart', function () {
        var code = $(this).attr('code');
        $.post('/api/test/test-by-code', {'code':code}, function(data) {
            if(data == false){
                showWarning(true);
            } else if(data.test != null){
                data = data.test;
                var lang = getLang();

                $("#modal_remove_info").html(code + '. ' + data['name_'+lang] + ' <br> ' + data.price + ' грн.');
                $("#modal_remove_info").attr('code',code);

                var modalRemove = $('[data-remodal-id=cart-remove]').remodal();
                modalRemove.open();
            }

            
        });
    });

    /* REWRITE LOCATION LISTS */
    rewriteLocationLists();

    /* ONLINE CHAT */
    webim = {
        accountName: "synevoua001",
        domain: "synevoua001.callrf.ru"
    };

    (function () {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = "https://synevoua001.callrf.ru/js/button.js";
      document.getElementsByTagName("head")[0].appendChild(s);
    })();    
});



/* rewrite location list in dropdown */
function rewriteLocationLists(){
    var location = (!localStorage.getItem('location')) ? 1 : localStorage.getItem('location');
    $(".location_list").val(location).trigger('change.select2');
}

/* set selected locaton to session */
function updateLocationLists(location){
    if(!location) location = 1;
    var location = parseInt(location, 10);
    localStorage.setItem('location', location);
    var cart = localStorage.getItem('cart');

    console.log('start');

    if(cart) cart = JSON.parse(cart);
    else              cart = [];
    
    var loc_with_allow = 0;
    var page = (window.location.pathname).substr(4, 5);
    if(page == 'order'){
        if($( "#cart_disable" ).length)
            page = 'promotion-ended';
        else
            loc_with_allow = 1;  
    }

    var number = 0;

    $.ajaxSetup({async:false});
    $.post('/api/cart/location-and-cart', {'location': location, 'cart': cart, 'loc_with_allow': loc_with_allow, 'page' : page}, function(data, textStatus, xhr) {
        console.log(data);
        $("#cart_number").html("<b>" + data.headerInfo.number + " </b>");
        $("#cart_sum").html("<b>" + data.headerInfo.sum + " </b>");
        localStorage.setItem('cart', JSON.stringify(data.cart));
        localStorage.setItem('location', data.location);
        rewriteLocationLists();
        if((window.location.pathname).substr(4, 5) == 'order' && !$( "#cart_disable" ).length){
            updateCartTable();
        }
        number = data.headerInfo.number;
    }.bind(number)); 
    $.ajaxSetup({async:true});

    return number;   
}

$(document).on('change', '.page_location', function (){
    console.log($(this).val());
    updateLocationLists($(this).val());
});

function updateCartHeader(){
    $.post('/api/cart/header-info', {'c':'c'},function(data) {
        $("#cart_number").html("<b>" + data.number + " </b>");
        $("#cart_sum").html("<b>" + data.sum + " </b>");
    });
}

function gtagUpdate(data, source, coupon = null){
    if(data) {

        if(localStorage.getItem('add_s') == 'n' && source != '/order') source = 'navbar';

        if(data.hasOwnProperty('add') && data.add)
            gtagUpdateInner('add_to_cart', data.add, source, coupon);

        if(data.hasOwnProperty('rmv') && data.rmv)
            gtagUpdateInner('remove_from_cart', data.rmv, source, coupon);  

        if(data.hasOwnProperty('begin_checkout') && data.begin_checkout)
            gtagUpdateInner('begin_checkout', data.begin_checkout, source, coupon);      
    }    
}

function gtagUpdateInner(key, data, source, coupon){
    var items = [];
    $.each(data, function(index, val) {
        items.push({  
          "id": val.code,
          "name": val.name_ua,
          "list_name": source,
          "category": val.g_name_ua,
	  "quantity": 1,
          "price": val.price
        });
    });
    var gtagData = {"items": items};
    if(coupon) gtagData.coupon = coupon;

    console.log(['event',key, gtagData]);
    gtag('event',key, gtagData);
}

/* FUNC FOR ADD TEST TO CART */
var addTestToCart = function(){
    var page = (window.location.pathname).substr(4, 5);
    var code = parseInt($("#modal_add_info").attr('code')); 

    var replace = ($("#add_error").is(':visible') && $("#add_error").hasClass('replace')) ? 1 : 0;

    console.log(replace); 

    $.post('/api/cart/add', {'code' : code, 'replace' : replace}, function(data, textStatus, xhr) {
        
        if(!data)
            return false;

        localStorage.setItem('cart', JSON.stringify(data.cart));
        //console.log(typeof data.conflict);

        if((typeof data.conflict === 'object' && data.conflict) || replace == 1){
            if($("p.msg__error").is(':visible')){
                gtagUpdate(data.gtag, '/'+page);
                $("#confirm_add").click();
                $("#error_modal_add").html('');
                $("#error_modal_add").hide();
                //gtagUpdate(data.gtag, '/'+page);
            } else {
                if(data.conflict.status == 0){
                    $("#error_modal_add").html('<p id="add_error" class="msg__error" style="font-style: italic;line-height: 1.5em; color: #dc332a;">Дана послуга вже є в кошику</p><br>');
                } else if(data.conflict.status == 1){
                    $("#error_modal_add").html('<p id="add_error" class="msg__error" style="font-style: italic;line-height: 1.5em; color: #dc332a;">Даний аналіз входить до складу обраного раніше пакету (код пакету: '+ data.conflict.code +')</p><br>');                    
                } else if(data.conflict.status == 2){
                    $("#error_modal_add").html('<p id="add_error" class="msg__error replace" style="font-style: italic;line-height: 1.5em; color: #dc332a;">Даний пакет містить в собі тест з кошика (код тесту: '+ data.conflict.code +')<br>Додати пакет та видалити окремий тест?</p><br>');
                }
                $("#error_modal_add").show();                
            }          
        } else {
            gtagUpdate(data.gtag, '/'+page);
            $("#confirm_add").click();
            ($("button.add_to_cart.code_"+code).parents("td")).html('<center><button class="remove_from_cart code_'+code+'" code="'+code+'" style="width:17px"><img src="/png/delete_cart.png"></button></center>');
            //gtagUpdate(data.gtag, '/'+page);
        }        
        
        if(page == 'order'){
            updateCartTable();
        } else {
            updateCartHeader();
        }                
    });    
}

/* FUNC FOR REMOVE TEST FROM CART */
var removeTestFromCart = function(){
    var code = parseInt($("#modal_remove_info").attr('code'));

    $.post('/api/cart/remove', {'code' : code}, function(data, textStatus, xhr) {

        if(!data)
            return false;

        var page = (window.location.pathname).substr(4, 5);

        localStorage.setItem('cart', JSON.stringify(data.cart));

        $("#confirm_remove").click();
        ($("button.remove_from_cart.code_"+code).parents("td")).html('<center><button class="add_to_cart code_'+code+'" code="'+code+'" style="width:30px"><img src="/png/synevo_site_fin.png"></button></center>');
        
        gtagUpdate(data.gtag, '/'+page);

        if(page == 'order'){
            updateCartTable();
        } else {
            updateCartHeader();
        }
    });
}

function showWarning(showCancelDiscountBtn = false, additionalEvent = false){
    var lang = getLang();
    var modal = $('[data-remodal-id=cart-warnings]');
    var modalInfo = $("#modal_warnings_info");
    var modalBtnCancel = modal.find('.remodal-cancel');

    $.post('/api/warnings/get-warning', {'locale' : lang}, function(data) {

        modalInfo.text(data);

        (showCancelDiscountBtn == false) ? (modalBtnCancel.hide()) : (modalBtnCancel.show());
        (additionalEvent == false) ? modal.removeAttr('data-trigger', null) : modal.attr('data-trigger', additionalEvent);

        var modalWarning = modal.remodal();
            modalWarning.open();
    });
}

function cancelCartDiscount(){
    var modalWarning = $('[data-remodal-id=cart-warnings]').remodal();
        
        cancelDiscount();
        modalWarning.close();
}
