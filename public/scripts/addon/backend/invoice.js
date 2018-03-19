var Ermis = function () {
    var data = [];

    var initLoadData = function(){
      data = Ermis.data.data;
      return data;
    }

    var initInvoiceActive = function(){
      var id = parseInt(jQuery('.md-list-item-active').children('a').attr('data-invoice-id'))
      var current = data.filter(x => x.id == id);
      bindData(current[0])
    }


    var bindData = function(v){
      jQuery('.invoice_name').text(v.voucher);
      jQuery('.date_voucher').text(FormatDate(v.date_voucher));
      jQuery('.shop').text(v.inventory_name);
      jQuery('.shop_phone').text(v.inventory_phone);
      jQuery('.address').text(v.inventory_address);
      jQuery('.customer').text(v.customer_name);
      jQuery('.customer_phone').text(v.customer_phone);
      jQuery('.customer_address').text(v.customer_address);
      jQuery('.payment_method').text(v.payment_method);
      //jQuery('.total_number').text(v.total_number);
      jQuery('.total_amount').text(FormatNumber(v.total_amount));
      jQuery('.uk-table .item_load').not('.hidden').remove();
      jQuery.each(v.detail, function (k, d) {
          var item = jQuery('.item_load:eq(0)').clone();
              item.removeClass('hidden');
              item.find('td').eq(0).html('<span class="uk-text-large">'+d.item_name+'</span><br><span class="uk-text-muted uk-text-small">'+d.barcode+' - '+d.size+'</span>');
              item.find('td').eq(1).text(d.unit);
              item.find('td').eq(2).text(d.quantity);
              item.find('td').eq(3).text(FormatNumber(d.price));
              item.find('td').eq(4).text(FormatNumber(d.amount));
              jQuery('.uk-table').find('tbody').append(item);
        })

    }
    var initShowInvoice = function(e){
        jQuery('.md-list-content').on('click', function(){
          var id = parseInt(jQuery(this).attr('data-invoice-id'));
          var current = data.filter(x => x.id == id);
          bindData(current[0])
        })
    }


    var initStatus = function(){

    }

    return {
        //main function to initiate the module
        init: function () {
          initStatus();
          initShowInvoice();
          initLoadData();
          initInvoiceActive();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
