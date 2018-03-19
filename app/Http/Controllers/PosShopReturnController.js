'use strict'
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const PosDetail = use('App/Model/PosDetail')  // EDIT
const PosGeneral = use('App/Model/PosGeneral')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Menu = use('App/Model/Menu')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const HistoryGoods = use('App/Classes/HistoryGoods')  // EDIT
const Antl = use('Antl')

var moment = require('moment')
class PosShopReturnController{
  constructor () {
    this.type = 5  // EDIT Sale = 5
    this.return = 6  // EDIT Return = 6
    this.key = "store-return"  // EDIT
    this.menu = "store_return"
    this.print = "PTBK"
    this.voucher = 'RETURN_INVOICE_%'
    this.room = "store-return"
    this.subject_key = "customer"
  }

    * show (request, response){
      const inventory = yield request.session.get('inventory')
      const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()
      const index = yield response.view('pos-shop.pages.return',{key : this.key, room : this.room , voucher : voucher })
      response.send(index)
    }
    * scan (request, response){
    const data = JSON.parse(request.input('data'))
    var arr = []
    try{
     const inventory = yield request.session.get('inventory')
      if(inventory){
        arr = yield Goods.query()
        .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
        .innerJoin('inventory as in2','in2.id','goods.transport_station_receive')
        .leftJoin('city as city1','city1.id','goods.sender_city')
        .innerJoin('city as city2','city2.id','goods.receiver_city')
        .innerJoin('parcel_volumes','parcel_volumes.id','goods.parcel_volumes')
        .innerJoin('size','size.id','goods.size')
        .innerJoin('type','type.id','goods.type_goods')
        .innerJoin('type_service','type_service.id','goods.type_service')
        .where('goods.inventory', inventory)
        .where('goods.code',data.value)
        .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive','city1.name as sender_city','city2.name as receiver_city')
        .first()
        if(arr){
            response.json({ status: true  , data : arr })
        }else{
            response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
        }
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
      }
    } catch (e) {
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
    }
  }

  * load (request, response){
      try {
       const data = JSON.parse(request.input('data'))
       const inventory = yield request.session.get('inventory')
       if(data.filter_field){
        const arr = yield Goods.query()
         .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
         .innerJoin('inventory as in2','in2.id','goods.transport_station_receive')
         .innerJoin('city as city1','city1.id','goods.sender_city')
         .innerJoin('city as city2','city2.id','goods.receiver_city')
         .innerJoin('distric as distric1','distric1.id','goods.sender_distric')
         .innerJoin('distric as distric2','distric2.id','goods.receiver_distric')
         .innerJoin('parcel_volumes','parcel_volumes.id','goods.parcel_volumes')
         .innerJoin('size','size.id','goods.size')
         .innerJoin('type','type.id','goods.type_goods')
         .innerJoin('type_service','type_service.id','goods.type_service')
         .where('goods.inventory', inventory)
         .where('goods.'+data.filter_field,"LIKE",'%'+data.filter_value+'%')
         .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive','city1.name as sender_city','city2.name as receiver_city','distric1.name as sender_distric','distric2.name as receiver_distric','parcel_volumes.name as parcel_volumes','size.name as size','type.name as type_goods','type_service.name as type_service')
         .fetch()
         if(arr){
               response.json({ status: true  , data : arr })
          }else{
               response.json({ status: false , message: Antl.formatMessage('messages.no_data')  })
          }
       }else{
         response.json({ status: false , message: Antl.formatMessage('messages.no_data')  })
       }

     } catch (e) {
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }
  * payment  (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    if(data){
      // Lưu số nhảy
      const inventory = yield request.session.get('inventory')
      const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()
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

      // Xuất kho trả hàng
      const general = new PosGeneral()
      general.inventory = inventory
      general.type = this.return
      general.voucher = v
      general.description = data.description
      general.date_voucher = moment().format('YYYY-MM-DD')
      general.traders = data.receiver_fullname +' - '+ data.receiver_phone +' - '+ data.identity_card
      general.inventory_issue = inventory
      general.total_number = 1
      general.user = user.id
      general.status = 1
      general.active = 1
      yield general.save()

        for(let d of data.detail){
          const goods = yield Goods.find(d.id)
          goods.inventory = 0
          goods.status = 4
          goods.active = 0
          yield goods.save()

          // Lưu lịch sử hàng gửi
          let hg = new HistoryGoods()
          var rg = hg.insertRecord(goods.id,0,4)
          yield rg.save()
          //

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
        }
        var action = 2
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(data))
        yield rs.save()
        //
      response.json({ status: true  , message: Antl.formatMessage('messages.update_success') , voucher : v , dataId : general.id })
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
    const print = yield PrintTemplate.query().where('code', this.print ).first()
      const general = yield PosGeneral.find(data.id)
      const detail = yield PosDetail.query().where("pos_detail.general",data.id)
          .innerJoin('goods', 'goods.id', 'pos_detail.item_id')
          .select("pos_detail.*","pos_detail.id as detail","goods.note").orderBy('id', 'desc').fetch()
      const stock = yield request.session.get('inventory')
      const inventory = yield Inventory.query().where('id',stock).first()
      const company = yield Company.query().where('id',inventory.company).first()
      const signer = yield Option.query().where('code','SIGNER').first()
      var reps = {
          "{company}": company.name,
          "{company_address}": company.address,
          "{day}": moment(general.date_voucher , "YYYY-MM-DD").format('DD'),
          "{month}": moment(general.date_voucher , "YYYY-MM-DD").format('MM'),
          "{year}": moment(general.date_voucher , "YYYY-MM-DD").format('YYYY'),
          "{subject}" : general.traders,
          "{voucher}" : general.voucher,
          "{number}" : general.total_number,
          "{warehouse}" : inventory.name,
          "{warehouse_place}" : inventory.address,
          "{chief_accountant}" : signer.value1,
          "{storekeeper}" : signer.value3,
          "{writer}" : signer.value4,
          "{day_voucher}" : moment().format('DD'),
          "{month_voucher}" : moment().format('MM'),
          "{year_voucher}" : moment().format('YYYY'),
        };
        var template = print.text
        for (var val in reps) {
          template = template.split(val).join(reps[val]);
        }
      var detail_content = ''
      var l = 1
          for(let d of detail){
            detail_content += "<tr style = 'height:25%;'><td style = 'width:6.22837%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;'>" + l + "</td >";
            detail_content += "<td style = 'width:30.6805%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.note + "</span></td>";
            detail_content += "<td style = 'width:7.7278%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.code + "</span></td>";
            detail_content += "<td style = 'width:8.41984%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.name + "</span></td>";
            detail_content += "<td style = 'width:10.6113%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + Antl.formatNumber(d.quantity) + "</span></td>";
            detail_content += "</tr>";
            l++
          }
          response.json({ status: true , print_content: template , detail_content : detail_content})

      } catch (e) {
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }

}
module.exports = PosShopReturnController
