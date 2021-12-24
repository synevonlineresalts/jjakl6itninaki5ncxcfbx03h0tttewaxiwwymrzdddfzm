
function isLocationConfirmed(scrollTo, removeConfirmation=false){
    var isLocationConfirmed = localStorage.getItem('isLocationConfirmed');
    var chosenLocation = localStorage.getItem('location');
    var locationPosition = $('#order_location').offset().top;
    var backToPosition = scrollTo.offset().top;

    if(!isLocationConfirmed || isLocationConfirmed != chosenLocation){
        localStorage.setItem('scrollLocationTo', locationPosition);
        scrollLocationTo();
        showLocationMessages(1);
        localStorage.setItem('scrollLocationTo', backToPosition);

        return false;
    }

    showLocationMessages();

    if(localStorage.getItem('scrollLocationTo'))
        localStorage.removeItem('scrollLocationTo');

    if(removeConfirmation)
        removeLocationConfirmation();

    return true;
}

function confirmLocation(){
    var chosenLocation = localStorage.getItem('location');

    if(!chosenLocation){
        removeLocationConfirmation();
        showLocationMessages(2);

        return false;
    }
    
    localStorage.setItem('isLocationConfirmed', chosenLocation);
    showLocationMessages();
    scrollLocationTo();
}

function removeLocationConfirmation(){
    localStorage.removeItem('isLocationConfirmed');
}

function scrollLocationTo(){
    if(!localStorage.getItem('scrollLocationTo'))
        return false;

    var scrollTo = localStorage.getItem('scrollLocationTo');
    var duration = 500;
    var correction = 200;
    var options = {
        scrollTop:(scrollTo - correction),
    };

    $([document.documentElement, document.body]).animate(options, duration);
}

function initLocationConfirmation(){
    var isLocationConfirmed = localStorage.getItem('isLocationConfirmed');
    var chosenLocation = localStorage.getItem('location');

    var show = (!isLocationConfirmed || isLocationConfirmed != chosenLocation) ? 3 : false;

    showLocationMessages(show);
}

function showLocationMessages(showMessages=false){
    if(!showMessages){
        $('.order__location__cell--confirm').hide();
        $('.order__location__messages').hide();
        $('.order__location__messages--confirm').hide();
        $('.order__location__messages--error').hide();
    }
    else if(showMessages == 1){
        $('.order__location__cell--confirm').show();
        $('.order__location__messages').show();
        $('.order__location__messages--confirm').show();
        $('.order__location__messages--error').hide();
    }
    else if(showMessages == 2){
        $('.order__location__cell--confirm').show();
        $('.order__location__messages').show();
        $('.order__location__messages--confirm').hide();
        $('.order__location__messages--error').show();
    }
    else if(showMessages == 3){
        $('.order__location__cell--confirm').show();
        $('.order__location__messages').hide();
        $('.order__location__messages--confirm').hide();
        $('.order__location__messages--error').hide();
    }
}
