var ErmisAdd = function () {
    initUpperCaseCode= function(){

      jQuery('input[name=code]').on('blur',function(){
          this.value = this.value.toUpperCase();
      })

    }
    return {

        init: function () {
            initUpperCaseCode();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd.init();
});
