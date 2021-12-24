
    function getProposal(){
        // DISABLED
        // return false;

        var proposal = $('#order__proposal');
        
        if(proposal.length==0)
            return false;

        $.ajax({
            url:'/api/preprod/get',
            dataType:'JSON',
            method:'POST',
            data:{
                lang: location.pathname.split('/')[1]
            },
            success: function(success){
                console.log(success);

                if(!success || typeof(success.data) === 'undefined' || !success.data){
                    console.log('Proposal: No proposals!');
                    proposal.hide();

                    return;
                }

                initProposalCarousel(success.data);
                proposal.show();
            },
            error: function(error){
                console.log('Proposal: Server Error!');
                proposal.hide();
            }
        });
    }

    function sendProposalLog(proposal){
        if(!proposal || typeof(proposal) === 'undefined'){
            console.log('Proposal: Logging object is incorrect!');

            return;
        }

        $.ajax({
            url:'/api/preprod/log',
            dataType:'JSON',
            method:'POST',
            data:{
                propose_id: proposal.attr('data-propose-id'),
                selected_code: proposal.attr('code')
            },
            success: function(success){
                console.log(success);

                if(!success || typeof(success.result) === 'undefined' || !success.result){
                    console.log('Proposal: Log hasn\'t been sent');

                    return;
                }

                console.log('Proposal: Log has been sent');
            },
            error: function(error){
                console.log('Proposal: Server Error!');
            }
        });
    }

	function prepareProposalData(data){
        var content = "";
        var item = $('#order__proposal__carousel').find('.item').first();

        for(var i in data){
        	if(data[i].code){
                item.find('.add_to_cart').attr('code', data[i].code);
            }

            if(data[i].propose_id){
                item.find('.add_to_cart').attr('data-propose-id', data[i].propose_id);
            }
            
            if(data[i].bonus){
                item.find('.order__proposal__title').text(data[i].code + ' - ' + data[i].bonus.substr(0, 18));
            }
            else{
                item.find('.order__proposal__title').text(data[i].code);
            }

            if(data[i].img_url){
                item.find('.order__proposal__image img').attr({src:data[i].img_url, alt:data[i].bonus});
            }
            else {
                item.find('.order__proposal__image img').attr({src:'/svg/logos/logo-icon.svg', alt:data[i].bonus});
            }

            if(data[i].description){
                item.find('.order__proposal__description').text(data[i].description);
            }

            if(data[i].bonus){
                item.find('.order__proposal__bonus').text(data[i].bonus);
            }
            
            if(data[i].price){
                item.find('.order__proposal__price span').text(
                    function(index, text){
                        return text.replace(/^\d+/g, data[i].price);
                    }
                );
            }

            content += item[0].outerHTML;
        }

        return content;
    }

    function initProposalCarousel(data){
        var owl = $('#order__proposal__carousel');

        owl.trigger('destroy.owl.carousel');
        owl.trigger('replace.owl.carousel', prepareProposalData(data));
        // owl.trigger('refresh.owl.carousel');

        owl.owlCarousel({
                responsive:{
                    0:{
                        items: 1
                    },
                    600:{
                        items: 1
                    }
                },
                margin: 10,
                loop: true,
                autoplay: true,
                autoplayTimeout: 10000,
                autoplaySpeed: 1000,
                autoHeight: true,
                dotsEach: true
            });
    }
