$(document).ready(function ()
{
    function navSearchRequest(search_item, search_field){
        //$.ajaxSetup({async:true});
        $.post('/api/search', {'needle': search_item}, function(data, textStatus, xhr) {
            var res_block = search_field.closest('.search').find('.search__results');
            console.log(data);                
            if(data.res != null && localStorage.getItem('srch_n_m') == 1) {
                res_block.empty();
                var results = '';
                
                $.each(data.res, function(index, val) {
                    results += '<li class="large_search__result">';

                    var str = '<p>' + val.code + ' ' + val['name_'+getLang()];
                    
                    if((window.location.pathname).substr(4, 5) != 'order'){
                        var f_line = str.substr(0,39);
                        var s_line = str.substr(39);
                        str = '<p>' + f_line;
                        if(s_line && s_line.length > 0){
                            str += '</p><p>' + s_line;
                        } 
                    }

                    str += '</p>';

                    if(val.allow_buy == 1 && data.allow_to_add == 1){
                        results += '<a class="search__result__link add_to_cart" add_s=1 href="#" code="'+ val.code +'">'+ str +'</a>';
                    } else {
                        results += '<a class="search__result__link__empty">' + str + '</a>';
                    }
                    results += '</li>';
                }.bind(results));
                if(results == ''){
                    results = '<li class="large_search__result"><a class="search__result__link__empty"><center>&mdash;</center></a></li>';
                }
                res_block.append(results);
                res_block.addClass('active');
            } else {
                res_block.removeClass('active');
            }                
        });
    }

    $(document).on('click touched', function (event)
    {
 	if(event.target.id != 'cancel_add' && event.target.className != 'remodal-close'){
	    if (!$(event.target).closest('.search').length)
            	$('.search__results').removeClass('active'); 

            if(!$(event.target).closest('.large_search').length)
            	$('.large_search__results').removeClass('active');
	}
    });

    $(document).on('input', '.small_search', function ()
    {
        
        var search_item = $(this).val();
        var search_field = $(this);
        console.log(search_item);
        

        if(search_item.length >= 2) {
            console.log('search for '+search_item);
            localStorage.setItem('srch_n_m', 1);
            setTimeout(
                function (search_item){
                    if(search_item == search_field.val())
                        navSearchRequest(search_item, search_field);
                }
            , 400, search_item);
        } else {
            //setTimeout(function () { drawTestsTable('show'); }, 0);
            localStorage.setItem('srch_n_m', 0);
            var res_block = $("#small_search").closest('.search').find('.search__results');
            res_block.empty();
            res_block.removeClass('active');
        }
    });

    $(document).on('click touched', '.search__form__submit', function (event)
    {
        event.preventDefault();

        return false;
    });
});
