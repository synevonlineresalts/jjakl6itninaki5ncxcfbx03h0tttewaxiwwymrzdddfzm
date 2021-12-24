$(document).ready(function ()
{
	// syncCart();
    updateCartTable();
    initLocationConfirmation();

    $(document).on('click touched', '.order__discount__form .order__discount__submit', function(){
        getDiscount();
    });

    $(document).on('click touched', '.order__discount__info .order__discount__cancel', function(){
        cancelDiscount();
    });

    $(document).on('click touched', '.order__discount__items__list .order__discount__choose__tests', function(){
        chooseDiscountTests();
    });

    $(document).on('click touched', '.order__discount__items__list .order__discount__choose__test', function(){
        chooseDiscountTest($(this).val());
    });

    $(document).on('click touched', '.order__form__buttons .clear_cart_button', function(){
        var modalClearCart = $('[data-remodal-id=cart-clear]').remodal();
            modalClearCart.open();
    });

    $(document).on('click touched', '.order__location__submit', function(){
        confirmLocation();
    });

    $(document).on('change', '#location', function(){
        initLocationConfirmation();
    });

    $(document).on('click touched', '.order__proposal .add_to_cart', function(){
        sendProposalLog($(this));
    });

});
