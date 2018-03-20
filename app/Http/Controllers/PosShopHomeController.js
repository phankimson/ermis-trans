'use strict'
const Shift = use('App/Model/Shift')
const Option = use('App/Model/Option')  // EDIT
const Type = use('App/Model/Type')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const User= use('App/Model/User')  // EDIT
const Menu = use('App/Model/Menu')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const HistoryGoods = use('App/Classes/HistoryGoods')  // EDIT
const City = use('App/Model/City')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const Payment = use('App/Model/Payment')  // EDIT
const SenderReceiver = use('App/Model/SenderReceiver')  // EDIT
const PaymentMethod = use('App/Model/PaymentMethod')  // EDIT
const Surcharge = use('App/Model/Surcharge')  // EDIT
const SalesStaff = use('App/Model/SalesStaff')  // EDIT
const PosDetail = use('App/Model/PosDetail')  // EDIT
const PosGeneral = use('App/Model/PosGeneral')  // EDIT
const Unit = use('App/Model/Unit')  // EDIT
const Antl = use('Antl')

var moment = require('moment')
class PosShopHomeController{
  constructor () {
      this.type = 1  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "store-post"  // EDIT
      this.menu = "store_post"
      this.voucher = 'BARCODE_SERVICE'
      this.room = "store"
      this.subject_key = "customer"
      this.voucher_inventory = 'INVENTORY_RECEIPT_%'
    }
    * show (request, response){
        const option = yield Option.query().where("code","MAX_ITEM_STORE").first()
        const inventory = yield request.session.get('inventory')
        const subject = yield Customer.query().where('active',1).fetch()
        const city = yield City.query().where('active',1).fetch()
        const stock = yield Inventory.query().whereNot('id',inventory).where('active',1).fetch()
        const payment_method = yield PaymentMethod.query().where('active',1).fetch()
        const sales_staff = yield SalesStaff.query().where('active',1).fetch()
        const surcharge = yield Surcharge.query().where('type',1).where('active',1).fetch()
        const unit = yield Unit.query().where('active',1).fetch()
        const voucher = yield Voucher.query().where('code',this.voucher).first()
        const index = yield response.view('pos-shop.pages.index', {key : this.key , unit : unit.toJSON() ,room : this.room, sales_staff:sales_staff.toJSON(),surcharge:surcharge.toJSON(), payment_method:payment_method.toJSON(), subject : subject.toJSON(), city : city.toJSON(),stock : stock.toJSON() , voucher : voucher })
        response.send(index)
    }
      * load (request, response){
          try {
           const data = JSON.parse(request.input('data'))
           var arr = yield Customer.find(data)
           var receiver = yield SenderReceiver.findBy('customer',arr.id)
           if(arr){
                response.json({ status: true  , data : arr , receiver :  receiver})
            }else{
                response.json({ status: false ,  message: Antl.formatMessage('messages.no_data') })
            }
         } catch (e) {
            response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
          }
      }

      * get (request, response){
          try {
           const data = JSON.parse(request.input('data'))
           var arr = ''
           if(!data.filter_field){
             arr = yield SenderReceiver.query().TypeWhere('type',data.filter_type).fetch()
           }else{
             arr = yield SenderReceiver.query().TypeWhere('type',data.filter_type).where(data.filter_field,"LIKE",'%'+data.filter_value+'%').fetch()
           }
           if(arr){
                response.json({ status: true  , data : arr })
            }else{
                response.json({ status: false ,  message: Antl.formatMessage('messages.no_data') })
            }
         } catch (e) {
            response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
          }
      }

      * payment  (request, response){
        try {
        const data = JSON.parse(request.input('data'))
        if(data){
        // Lưu số nhảy
        const voucher = yield Voucher.query().where('code',this.voucher).first()
        const inventory = yield request.session.get('inventory')
        const shift = yield request.session.get('shiftId')
        const user = request.currentUser
        // Load Phiếu tự động
        let vm = new VoucherMask()
        var v = vm.Convert(voucher)
        const number = voucher.value + 1
        const length_number = voucher.length_number
        if((number+"").length > voucher.length_number){
        voucher.value = 1
        voucher.length_number = length_number + 1
          }else{
        voucher.value = number
        }
        yield voucher.save()
        var num = Math.floor((Math.random() * 10000) + 1)
        // lưu khách lẻ
        if(data.subject == 0){
          var customer = yield Customer.query().where('name',data.sender_fullname).first()
          if(!customer){

            var cus = new SenderReceiver()
            cus.type = 1
            cus.code = 'R'+num
            cus.fullname = data.sender_fullname
            cus.phone = data.sender_phone
            cus.address = data.sender_address
            cus.email = data.sender_email
            cus.city = data.sender_city
            cus.active = 1
            yield cus.save()
          }
        }
        // Lưu người nhận
          var sede = yield SenderReceiver.query().where('fullname',data.receiver_fullname).first()
            if(!sede){
            var se = new SenderReceiver()
            se.type = 2
            se.code = 'D'+num
            se.fullname = data.receiver_fullname
            se.phone = data.receiver_phone
            se.address = data.receiver_address
            se.email = data.receiver_email
            se.city = data.receiver_city
            se.customer = data.subject
            se.active = 1
            yield se.save()
            }

        const goods = new Goods()
        goods.code = v
        goods.name = data.name
        goods.date_voucher = moment(data.date_voucher, 'DD-MM-YYYY').format('YYYY-MM-DD')
        goods.transport_station_send = inventory
        goods.transport_station_receive = data.transport_station_receive
        goods.parcel_volumes = data.parcel_volumes
        goods.size = data.size
        goods.lot_number = data.lot_number
        goods.unit = data.unit
        goods.surcharge = data.surcharge
        goods.price = data.price
        goods.surcharge_amount = data.surcharge_amount
        goods.total_amount = parseInt(data.price) + parseInt(data.surcharge_amount?data.surcharge_amount:0)
        goods.note = data.note
        goods.sender_fullname = data.sender_fullname
        goods.sender_phone = data.sender_phone
        goods.sender_email = data.sender_email
        goods.sender_address = data.sender_address
        goods.sender_city = data.sender_city
        goods.receiver_fullname = data.receiver_fullname
        goods.receiver_phone = data.receiver_phone
        goods.receiver_email = data.receiver_email
        goods.receiver_address = data.receiver_address
        goods.receiver_city = data.receiver_city
        goods.collect = data.collect
        goods.collect_amount = data.collect_amount
        goods.print = 0
        goods.status = 1
        goods.user = user.id
        goods.inventory = inventory
        goods.active = 1
        yield goods.save()

        // Lưu lịch sử nhận hàng gửi
        let hg = new HistoryGoods()
        var rg = hg.insertRecord(goods.id,0,0)
        yield rg.save()
        //

        // Lưu lịch sử nhập kho hàng gửi
        let hz = new HistoryGoods()
        var rz = hz.insertRecord(goods.id,inventory,1)
        yield rz.save()
        //

        const payment = new Payment()
        payment.inventory = inventory
        payment.goods = goods.id
        payment.type = data.payment_method
        payment.shift = shift
        payment.subject = data.subject
        payment.subject_key = this.subject_key
        payment.sales_staff = data.sales_staff
        payment.amount = data.total_amount
        payment.payment = data.payment
        payment.refund = data.refund
        payment.active = 1
        yield payment.save()

        // KHo
        var general = []
        //general = yield PosGeneral.query().where('inventory',inventory).where('date_voucher',moment().format('YYYY-MM-DD')).first()
        //if(!general){
                // Lưu số nhảy
                const voucher_i = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher_inventory).first()

                // Load Phiếu tự động
                  let va = new VoucherMask()
                  var c = vm.Convert(voucher_i)
                const number_i = voucher_i.value + 1
                const length_number_i = voucher_i.length_number
                if((number+"").length > voucher_i.length_number){
                  voucher_i.value = 1
                  voucher_i.length_number = length_number_i + 1
                }else{
                  voucher_i.value = number_i
                }
                yield voucher_i.save()

          // Nhập kho
          general = new PosGeneral()
          general.inventory = inventory
          general.type = this.type
          general.voucher = c
          general.description = 'Nhập kho ngày '+ data.date_voucher+'-'+v
          general.date_voucher = moment(data.date_voucher, 'DD-MM-YYYY').format('YYYY-MM-DD')
          general.traders = data.sender_fullname
          general.subject = data.subject
          general.subject_key = this.subject_key
          general.inventory_receipt = inventory
          general.total_number = 1
          general.total_amount = data.total_amount
          general.user = user.id
          general.status = 1
          general.active = 1
          yield general.save()
        //}else{
        //  general.total_number = general.total_number + 1
        //  yield general.save()
        //}
        // Phiếu chi tiết kho
        const detail = new PosDetail()
        detail.general = general.id
        detail.item_id = goods.id
        detail.code = goods.code
        detail.name = goods.name
        detail.unit = 1
        detail.quantity = 1
        detail.lot_number = goods.lot_number
        detail.status = 1
        detail.active = 1
        yield detail.save()


        var action = 2
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(data))
        yield rs.save()
        //
        response.json({ status: true  , message: Antl.formatMessage('messages.update_success') , voucher : v , dataId : goods.id  })
        }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
    }
      } catch (e) {
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }
  * prints (request, response){
    try {
    const data = JSON.parse(request.input('data'))
      if(data){
          const arr = yield Goods.query()
          .innerJoin('payment','payment.goods','goods.id')
          .leftJoin('customer','customer.id','payment.subject')
          .leftJoin('sales_staff','sales_staff.id','payment.sales_staff')
          .leftJoin('users','users.id','goods.user')
          .leftJoin('unit','unit.id','goods.unit')
          .leftJoin('payment_method','payment_method.id','payment.type')
          .where('goods.id',data)
          .select('goods.*','customer.name as company_name','customer.address as company_address','sales_staff.name as sale_staff','users.fullname as user_name','unit.name as unit','payment_method.name as payment_method')
          .first()
          arr.print = arr.print + 1
          yield arr.save()
          response.json({ status: true  , data : arr })
      }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.no_data')})
      }
    } catch (e) {
     response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
    }
  }
   * login (request, response){
        const session = request.currentUser
        if(!session){
        const shift = yield Shift.query().where('active',1).fetch()
        const index = yield response.view('pos-shop/pages/login',{ shift: shift.toJSON() })
        response.send(index)
        }else{
        response.redirect('index')
        }
    }

}
module.exports = PosShopHomeController
