'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
    Route.group('my-group', function () {
      Route.on('/').render('index')
    }).domain('pos')
    pos.mydomain.dev
*/

const Route = use('Route')
const Antl = use('Antl')



Route.get('/', 'HomeController.index')
Route.get('/logout', 'HomeController.logout')
Route.get('/block', 'HomeController.block')
Route.group('manage-group', function () {
  Route.get('/index', 'HomeController.show')
  Route.get('/', 'HomeController.show')
  Route.get('/register', 'HomeController.register')
  Route.get('/profile', 'HomeController.profile')
  Route.get('/login', 'HomeController.login')
  Route.get('/block', 'HomeController.block')
  Route.post('/login', 'UserController.login')
  //Route.post('/login', 'UserController.login').middleware('recaptcha')
  Route.post('/profile', 'UserController.updateProfile')
  Route.post('/avatar-profile', 'UserController.updateAvatar')
  Route.post('/register', 'UserController.doRegister')
  Route.post('/changepassword', 'UserController.changePassword')
  Route.post('/timeline', 'ChatTimelineController.timeline')
  Route.post('/chat', 'ChatTimelineController.chat')
  Route.post('/view-more-timeline', 'ChatTimelineController.viewMore')
  Route.post('/load-chat-user', 'ChatTimelineController.loadChatUser')
  // permission
  Route.get('/permission', 'PermissionController.show')
  Route.post('/permission-get', 'PermissionController.get')
  Route.post('/permission-save', 'PermissionController.save')
  //Option
  Route.get('/option', 'OptionController.show')
  Route.post('/option-get', 'OptionController.get')
  Route.post('/option-save', 'OptionController.save')
  Route.post('/option-delete', 'OptionController.delete')
  Route.get('/option-downloadExcel', 'OptionController.downloadExcel')
  Route.post('/option-import', 'OptionController.import')
  // HistoryAction
  Route.get('/history-action', 'HistoryActionController.show')
  Route.post('/history-action-get', 'HistoryActionController.get')
  Route.post('/history-action-save', 'HistoryActionController.save')
  Route.post('/history-action-delete', 'HistoryActionController.delete')
  Route.get('/history-action-downloadExcel', 'HistoryActionController.downloadExcel')
  Route.post('/history-action-import', 'HistoryActionController.import')
  // Menu
  Route.get('/menu', 'MenuController.show')
  Route.post('/menu-get', 'MenuController.get')
  Route.post('/menu-save', 'MenuController.save')
  Route.post('/menu-delete', 'MenuController.delete')
  Route.get('/menu-downloadExcel', 'MenuController.downloadExcel')
  Route.post('/menu-import', 'MenuController.import')
  // Stock
  Route.get('/inventory', 'InventoryController.show')
  Route.post('/inventory-save', 'InventoryController.save')
  Route.post('/inventory-delete', 'InventoryController.delete')
  Route.get('/inventory-downloadExcel', 'InventoryController.downloadExcel')
  Route.post('/inventory-import', 'InventoryController.import')
  // User
  Route.get('/user', 'UserManagerController.show')
  Route.post('/user-get', 'UserManagerController.get')
  Route.post('/user-save', 'UserManagerController.save')
  Route.post('/user-delete', 'UserManagerController.delete')
  Route.get('/user-downloadExcel', 'UserManagerController.downloadExcel')
  Route.post('/user-import', 'UserManagerController.import')
  // Company
  Route.get('/company', 'CompanyController.show')
  Route.post('/company-save', 'CompanyController.save')
  Route.post('/company-delete', 'CompanyController.delete')
  Route.get('/company-downloadExcel', 'CompanyController.downloadExcel')
  Route.post('/company-import', 'CompanyController.import')
  // Company
  Route.get('/company-group', 'CompanyGroupController.show')
  Route.post('/company-group-save', 'CompanyGroupController.save')
  Route.post('/company-group-delete', 'CompanyGroupController.delete')
  Route.get('/company-group-downloadExcel', 'CompanyGroupController.downloadExcel')
  Route.post('/company-group-import', 'CompanyGroupController.import')
  // Location
  Route.get('/location', 'LocationController.show')
  Route.post('/location-get', 'LocationController.get')
  Route.post('/location-save', 'LocationController.save')
  Route.post('/location-delete', 'LocationController.delete')
  Route.get('/location-downloadExcel', 'LocationController.downloadExcel')
  Route.post('/location-import', 'LocationController.import')
  // Barcode
  Route.get('/barcode', 'BarcodeController.show')
  Route.post('/barcode-save', 'BarcodeController.save')
  Route.post('/barcode-delete', 'BarcodeController.delete')
  Route.get('/barcode-downloadExcel', 'BarcodeController.downloadExcel')
  Route.post('/barcode-import', 'BarcodeController.import')

  // Number increases
  Route.get('/number-increases', 'NumberIncreasesController.show')
  Route.post('/number-increases-save', 'NumberIncreasesController.save')
  Route.post('/number-increases-delete', 'NumberIncreasesController.delete')
  Route.get('/number-increases-downloadExcel', 'NumberIncreasesController.downloadExcel')
  Route.post('/number-increases-import', 'NumberIncreasesController.import')

  // PrintTemplate
  Route.get('/print-template', 'PrintTemplateController.show')
  Route.post('/print-template-save', 'PrintTemplateController.save')
  Route.post('/print-template-delete', 'PrintTemplateController.delete')
  Route.get('/print-template-downloadExcel', 'PrintTemplateController.downloadExcel')
  Route.post('/print-template-import', 'PrintTemplateController.import')

  Route.get('/config', 'ConfigController.show')
  Route.post('/config-save', 'ConfigController.save')
  Route.post('/config-cancel', 'ConfigController.cancel')

}).prefix('manage').middleware('auth_manage')

Route.group('trans-group', function () {
  Route.get('/index', 'PosHomeController.show')
  Route.get('/', 'PosHomeController.show')
  Route.get('/profile', 'HomeController.profile')
  Route.get('/login', 'PosHomeController.login')
  Route.get('/block', 'HomeController.block')
  Route.post('/login', 'PosUserController.login')
  Route.post('/charts-get', 'PosHomeController.get')
  //Route.post('/login', 'PosUserController.login').middleware('recaptcha')
  Route.post('/profile', 'UserController.updateProfile')
  Route.post('/avatar-profile', 'UserController.updateAvatar')
  Route.post('/changepassword', 'UserController.changePassword')
  Route.post('/timeline', 'ChatTimelineController.timeline')
  Route.post('/chat', 'ChatTimelineController.chat')
  Route.post('/view-more-timeline', 'ChatTimelineController.viewMore')
  Route.post('/load-chat-user', 'ChatTimelineController.loadChatUser')
  // permission
  Route.get('/permission', 'PosPermissionController.show')
  Route.post('/permission-get', 'PosPermissionController.get')
  Route.post('/permission-save', 'PosPermissionController.save')
  // User
  Route.get('/user', 'PosUserManagerController.show')
  Route.post('/user-save', 'PosUserManagerController.save')
  Route.post('/user-delete', 'PosUserManagerController.delete')
  Route.get('/user-downloadExcel', 'PosUserManagerController.downloadExcel')
  Route.post('/user-import', 'PosUserManagerController.import')

  // Object Group
  Route.get('/object-group', 'ObjectGroupController.show')
  Route.post('/object-group-get', 'ObjectGroupController.get')
  Route.post('/object-group-save', 'ObjectGroupController.save')
  Route.post('/object-group-delete', 'ObjectGroupController.delete')
  Route.get('/object-group-downloadExcel', 'ObjectGroupController.downloadExcel')
  Route.post('/object-group-import', 'ObjectGroupController.import')

  // Suplier
  Route.get('/suplier', 'SuplierController.show')
  Route.post('/suplier-save', 'SuplierController.save')
  Route.post('/suplier-delete', 'SuplierController.delete')
  Route.get('/suplier-downloadExcel', 'SuplierController.downloadExcel')
  Route.post('/suplier-import', 'SuplierController.import')

  // Customer
  Route.get('/customer', 'CustomerController.show')
  Route.post('/customer-save', 'CustomerController.save')
  Route.post('/customer-delete', 'CustomerController.delete')
  Route.get('/customer-downloadExcel', 'CustomerController.downloadExcel')
  Route.post('/customer-import', 'CustomerController.import')

  // File
  Route.get('/attach-file', 'AttachFileController.show')
  Route.post('/attach-file-save', 'AttachFileController.save')
  Route.post('/attach-file-delete', 'AttachFileController.delete')
  Route.get('/attach-file-downloadExcel', 'AttachFileController.downloadExcel')
  Route.post('/attach-file-import', 'AttachFileController.import')

  // Driver
  Route.get('/driver', 'DriverController.show')
  Route.post('/driver-save', 'DriverController.save')
  Route.post('/driver-delete', 'DriverController.delete')
  Route.get('/driver-downloadExcel', 'DriverController.downloadExcel')
  Route.post('/driver-import', 'DriverController.import')

  // Driver
  Route.get('/reasons', 'ReasonsController.show')
  Route.post('/reasons-save', 'ReasonsController.save')
  Route.post('/reasons-delete', 'ReasonsController.delete')
  Route.get('/reasons-downloadExcel', 'ReasonsController.downloadExcel')
  Route.post('/reasons-import', 'ReasonsController.import')

  // Sales Staff
  Route.get('/sales-staff', 'SalesStaffController.show')
  Route.post('/sales-staff-save', 'SalesStaffController.save')
  Route.post('/sales-staff-delete', 'SalesStaffController.delete')
  Route.get('/sales-staff-downloadExcel', 'SalesStaffController.downloadExcel')
  Route.post('/sales-staff-import', 'SalesStaffController.import')

  // Unit
  Route.get('/unit', 'UnitController.show')
  Route.post('/unit-save', 'UnitController.save')
  Route.post('/unit-delete', 'UnitController.delete')
  Route.get('/unit-downloadExcel', 'UnitController.downloadExcel')
  Route.post('/unit-import', 'UnitController.import')
  Route.post('/unit-get', 'UnitController.get')

    // Type
  //Route.get('/type', 'TypeController.show')
  //Route.post('/type-save', 'TypeController.save')
  //Route.post('/type-delete', 'TypeController.delete')
  //Route.get('/type-downloadExcel', 'TypeController.downloadExcel')
  //Route.post('/type-import', 'TypeController.import')
  //Route.post('/type-load', 'TypeController.load')

  // City
  Route.get('/city', 'CityController.show')
  Route.post('/city-save', 'CityController.save')
  Route.post('/city-delete', 'CityController.delete')
  Route.get('/city-downloadExcel', 'CityController.downloadExcel')
  Route.post('/city-import', 'CityController.import')
  Route.post('/city-load', 'CityController.load')

  // City
  Route.get('/surcharge', 'SurchargeController.show')
  Route.post('/surcharge-save', 'SurchargeController.save')
  Route.post('/surcharge-delete', 'SurchargeController.delete')
  Route.get('/surcharge-downloadExcel', 'SurchargeController.downloadExcel')
  Route.post('/surcharge-import', 'SurchargeController.import')
  Route.post('/surcharge-load', 'SurchargeController.load')
  Route.post('/surcharge-get', 'SurchargeController.get')

  // Size
  //Route.get('/size', 'SizeController.show')
  //Route.post('/size-save', 'SizeController.save')
  //Route.post('/size-delete', 'SizeController.delete')
  //Route.get('/size-downloadExcel', 'SizeController.downloadExcel')
  //Route.post('/size-import', 'SizeController.import')
  //Route.post('/size-load', 'SizeController.load')

  //Sender Receiver
  Route.get('/sender-receiver', 'SenderReceiverController.show')
  Route.post('/sender-receiver-get', 'SenderReceiverController.get')
  Route.post('/sender-receiver-save', 'SenderReceiverController.save')
  Route.post('/sender-receiver-delete', 'SenderReceiverController.delete')
  Route.get('/sender-receiver-downloadExcel', 'SenderReceiverController.downloadExcel')
  Route.post('/sender-receiver-import', 'SenderReceiverController.import')

  // Type Service
  //Route.get('/type-service', 'TypeServiceController.show')
  //Route.post('/type-service-save', 'TypeServiceController.save')
  //Route.post('/type-service-delete', 'TypeServiceController.delete')
  //Route.get('/type-service-downloadExcel', 'TypeServiceController.downloadExcel')
  //Route.post('/type-service-import', 'TypeServiceController.import')
  //Route.post('/type-service-load', 'TypeServiceController.load')

   //Type transport
  Route.get('/type-transport', 'TypeTransportController.show')
  Route.post('/type-transport-save', 'TypeTransportController.save')
  Route.post('/type-transport-delete', 'TypeTransportController.delete')
  Route.get('/type-transport-downloadExcel', 'TypeTransportController.downloadExcel')
  Route.post('/type-transport-import', 'TypeTransportController.import')
  Route.post('/type-transport-load', 'TypeTransportController.load')

  // Transport
  Route.get('/transport', 'TransportController.show')
  Route.post('/transport-save', 'TransportController.save')
  Route.post('/transport-delete', 'TransportController.delete')
  Route.get('/transport-downloadExcel', 'TransportController.downloadExcel')
  Route.post('/transport-import', 'TransportController.import')
  Route.post('/transport-load', 'TransportController.load')
  // Payment Method
  Route.get('/payment-method', 'PaymentMethodController.show')
  Route.post('/payment-method-save', 'PaymentMethodController.save')
  Route.post('/payment-method-delete', 'PaymentMethodController.delete')
  Route.get('/payment-method-downloadExcel', 'PaymentMethodController.downloadExcel')
  Route.post('/payment-method-import', 'PaymentMethodController.import')

  // Distric
  //Route.get('/distric', 'DistricController.show')
  //Route.post('/distric-save', 'DistricController.save')
  //Route.post('/distric-delete', 'DistricController.delete')
  //Route.get('/distric-downloadExcel', 'DistricController.downloadExcel')
  //Route.post('/distric-import', 'DistricController.import')
  //Route.post('/distric-load', 'DistricController.load')

  // Parcel volumes
  //Route.get('/parcel-volumes', 'ParcelVolumesController.show')
  //Route.post('/parcel-volumes-save', 'ParcelVolumesController.save')
  //Route.post('/parcel-volumes-delete', 'ParcelVolumesController.delete')
  //Route.get('/parcel-volumes-downloadExcel', 'ParcelVolumesController.downloadExcel')
  //Route.post('/parcel-volumes-import', 'ParcelVolumesController.import')
  //Route.post('/parcel-volumes-load', 'ParcelVolumesController.load')

  // Shift
  Route.get('/shift', 'ShiftController.show')
  Route.post('/shift-save', 'ShiftController.save')
  Route.post('/shift-delete', 'ShiftController.delete')
  Route.get('/shift-downloadExcel', 'ShiftController.downloadExcel')
  Route.post('/shift-import', 'ShiftController.import')

  // Transfer Receipt Inventory General
    Route.get('/tranfer-receipt-inventory-general', 'TransferReceiptInventoryGeneralController.show')
    Route.post('/transfer-receipt-inventory-general-get', 'TransferReceiptInventoryGeneralController.get')
    Route.post('/transfer-receipt-inventory-general-get-detail', 'TransferReceiptInventoryGeneralController.detail')
    Route.post('/transfer-receipt-inventory-general-print', 'TransferReceiptInventoryGeneralController.prints')

    // Transfer Issue Inventory Voucher
    Route.get('/tranfer-receipt-inventory-voucher', 'TransferReceiptInventoryVoucherController.show')
    Route.post('/transfer-receipt-inventory-voucher-save', 'TransferReceiptInventoryVoucherController.save')
    Route.post('/transfer-receipt-inventory-voucher-bind', 'TransferReceiptInventoryVoucherController.bind')
    Route.post('/transfer-receipt-inventory-voucher-print', 'TransferReceiptInventoryGeneralController.prints')
    Route.post('/transfer-receipt-inventory-voucher-scan', 'TransferReceiptInventoryVoucherController.scan')

    // Transfer Issue Inventory General
  Route.get('/tranfer-issue-inventory-general', 'TransferIssueInventoryGeneralController.show')
  Route.post('/transfer-issue-inventory-general-get', 'TransferIssueInventoryGeneralController.get')
  Route.post('/transfer-issue-inventory-general-get-detail', 'TransferIssueInventoryGeneralController.detail')
  Route.post('/transfer-issue-inventory-general-write', 'TransferIssueInventoryGeneralController.write')
  Route.post('/transfer-issue-inventory-general-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
  Route.post('/transfer-issue-inventory-general-delete', 'TransferIssueInventoryGeneralController.delete')
  Route.post('/transfer-issue-inventory-general-print', 'TransferIssueInventoryGeneralController.prints')

  // Transfer Issue Inventory Voucher
  Route.get('/tranfer-issue-inventory-voucher', 'TransferIssueInventoryVoucherController.show')
  Route.post('/transfer-issue-inventory-voucher-load', 'TransferIssueInventoryVoucherController.load')
  Route.post('/transfer-issue-inventory-voucher-scan', 'TransferIssueInventoryVoucherController.scan')
  Route.post('/transfer-issue-inventory-voucher-save', 'TransferIssueInventoryVoucherController.save')
  Route.post('/transfer-issue-inventory-voucher-bind', 'TransferIssueInventoryVoucherController.bind')
  Route.post('/transfer-issue-inventory-voucher-rbind', 'TransferIssueInventoryVoucherController.rbind')
  Route.post('/transfer-issue-inventory-voucher-reference', 'TransferIssueInventoryVoucherController.reference')
  Route.post('/transfer-issue-inventory-voucher-write', 'TransferIssueInventoryGeneralController.write')
  Route.post('/transfer-issue-inventory-voucher-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
  Route.post('/transfer-issue-inventory-voucher-delete', 'TransferIssueInventoryGeneralController.delete')
  Route.post('/transfer-issue-inventory-voucher-print', 'TransferIssueInventoryGeneralController.prints')

  // Transfer Issue Plan General
Route.get('/tranfer-issue-plan-general', 'TransferIssuePlanGeneralController.show')
Route.post('/transfer-issue-plan-general-get', 'TransferIssuePlanGeneralController.get')
Route.post('/transfer-issue-plan-general-get-detail', 'TransferIssuePlanGeneralController.detail')
Route.post('/transfer-issue-plan-general-write', 'TransferIssuePlanGeneralController.write')
Route.post('/transfer-issue-plan-general-unwrite', 'TransferIssuePlanGeneralController.unwrite')
Route.post('/transfer-issue-plan-general-delete', 'TransferIssuePlanGeneralController.delete')
Route.post('/transfer-issue-plan-general-print', 'TransferIssuePlanGeneralController.prints')

// Transfer Issue Plan Voucher
Route.get('/tranfer-issue-plan-voucher', 'TransferIssuePlanVoucherController.show')
Route.post('/transfer-issue-plan-voucher-load', 'TransferIssuePlanVoucherController.load')
Route.post('/transfer-issue-plan-voucher-scan', 'TransferIssuePlanVoucherController.scan')
Route.post('/transfer-issue-plan-voucher-save', 'TransferIssuePlanVoucherController.save')
Route.post('/transfer-issue-plan-voucher-bind', 'TransferIssuePlanVoucherController.bind')
Route.post('/transfer-issue-plan-voucher-write', 'TransferIssuePlanGeneralController.write')
Route.post('/transfer-issue-plan-voucher-unwrite', 'TransferIssuePlanGeneralController.unwrite')
Route.post('/transfer-issue-plan-voucher-delete', 'TransferIssuePlanGeneralController.delete')
Route.post('/transfer-issue-plan-voucher-print', 'TransferIssuePlanGeneralController.prints')


  // Receipt cash General
Route.get('/receipt-cash-general', 'ReceiptCashGeneralController.show')
Route.post('/receipt-cash-general-get', 'ReceiptCashGeneralController.get')
Route.post('/receipt-cash-general-get-detail', 'ReceiptCashGeneralController.detail')
Route.post('/receipt-cash-general-write', 'ReceiptCashGeneralController.write')
Route.post('/receipt-cash-general-unwrite', 'ReceiptCashGeneralController.unwrite')
Route.post('/receipt-cash-general-delete', 'ReceiptCashGeneralController.delete')
Route.post('/receipt-cash-general-print', 'ReceiptCashGeneralController.prints')

// Receipt cash Voucher
Route.get('/receipt-cash-voucher', 'ReceiptCashVoucherController.show')
Route.post('/receipt-cash-voucher-save', 'ReceiptCashVoucherController.save')
Route.post('/receipt-cash-voucher-bind', 'ReceiptCashVoucherController.bind')
Route.post('/receipt-cash-voucher-get', 'ReceiptCashVoucherController.get')
Route.post('/receipt-cash-voucher-reference', 'ReceiptCashVoucherController.reference')
Route.post('/receipt-cash-voucher-write', 'ReceiptCashGeneralController.write')
Route.post('/receipt-cash-voucher-unwrite', 'ReceiptCashGeneralController.unwrite')
Route.post('/receipt-cash-voucher-delete', 'ReceiptCashGeneralController.delete')
Route.post('/receipt-cash-voucher-print', 'ReceiptCashGeneralController.prints')

// Payment cash General
Route.get('/payment-cash-general', 'PaymentCashGeneralController.show')
Route.post('/payment-cash-general-get', 'PaymentCashGeneralController.get')
Route.post('/payment-cash-general-get-detail', 'PaymentCashGeneralController.detail')
Route.post('/payment-cash-general-write', 'PaymentCashGeneralController.write')
Route.post('/payment-cash-general-unwrite', 'PaymentCashGeneralController.unwrite')
Route.post('/payment-cash-general-delete', 'PaymentCashGeneralController.delete')
Route.post('/payment-cash-general-print', 'PaymentCashGeneralController.prints')

// Payment cash Voucher
Route.get('/payment-cash-voucher', 'PaymentCashVoucherController.show')
Route.post('/payment-cash-voucher-save', 'PaymentCashVoucherController.save')
Route.post('/payment-cash-voucher-bind', 'PaymentCashVoucherController.bind')
Route.post('/payment-cash-voucher-get', 'PaymentCashVoucherController.get')
Route.post('/payment-cash-voucher-reference', 'PaymentCashVoucherController.reference')
Route.post('/payment-cash-voucher-write', 'PaymentCashGeneralController.write')
Route.post('/payment-cash-voucher-unwrite', 'PaymentCashGeneralController.unwrite')
Route.post('/payment-cash-voucher-delete', 'PaymentCashGeneralController.delete')
Route.post('/payment-cash-voucher-voucher-print', 'PaymentCashGeneralController.prints')

  // Report Shift Revenue
  Route.get('/report-shift-revenue', 'ReportShiftRevenueController.show')
  Route.post('/report-shift-revenue-get', 'ReportShiftRevenueController.get')
  // Report General Inventory
  Route.get('/report-general-inventory', 'ReportGeneralInventoryController.show')
  Route.post('/report-general-inventory-get', 'ReportGeneralInventoryController.get')

  // Report Detail Inventory
  Route.get('/report-detail-inventory', 'ReportDetailInventoryController.show')
  Route.post('/report-detail-inventory-get', 'ReportDetailInventoryController.get')

  // Report Detail Debt
  Route.get('/report-detail-debt', 'ReportDetailDebtController.show')
  Route.post('/report-detail-debt-get', 'ReportDetailDebtController.get')
  // Report Detail Debt
  Route.get('/report-general-debt', 'ReportGeneralDebtController.show')
  Route.post('/report-general-debt-get', 'ReportGeneralDebtController.get')

  // Report Detail Debt Suplier
  Route.get('/report-detail-debt-suplier', 'ReportDetailDebtSuplierController.show')
  Route.post('/report-detail-debt-suplier-get', 'ReportDetailDebtSuplierController.get')
  // Report Detail Debt Suplier
  Route.get('/report-general-debt-suplier', 'ReportGeneralDebtSuplierController.show')
  Route.post('/report-general-debt-suplier-get', 'ReportGeneralDebtSuplierController.get')

  // Report List Freight
  Route.get('/report-list-freight', 'ReportListFreightController.show')
  Route.post('/report-list-freight-get', 'ReportListFreightController.get')
  Route.post('/report-list-freight-print', 'ReportListFreightController.prints')
  Route.post('/report-list-freight-excel', 'ReportListFreightController.excel')
  Route.get('/report-list-freight-downloadExcel', 'ReportListFreightController.downloadExcel')

  // Report Sale
  Route.get('/report-revenue-sale', 'ReportRevenueController.show')
  Route.post('/report-revenue-sale-get', 'ReportRevenueController.get')
  // Report Area
  Route.get('/report-revenue-area', 'ReportRevenueAreaController.show')
  Route.post('/report-revenue-area-get', 'ReportRevenueAreaController.get')

  // Report Transport
  Route.get('/report-revenue-transport', 'ReportTransportRevenueController.show')
  Route.post('/report-revenue-transport-get', 'ReportTransportRevenueController.get')
  // Report Area
  Route.get('/report-revenue-customer', 'ReportRevenueCustomerController.show')
  Route.post('/report-revenue-customer-get', 'ReportRevenueCustomerController.get')

  // Report Area
  Route.get('/report-list-transport', 'ReportListTransportController.show')
  Route.post('/report-list-transport-get', 'ReportListTransportController.get')

  // Report Customer
  Route.get('/report-list-customer', 'ReportListCustomerController.show')
  Route.post('/report-list-customer-get', 'ReportListCustomerController.get')

  // Report Detail Debt
  Route.get('/history-goods', 'HistoryGoodsController.show')
  Route.post('/history-goods-get', 'HistoryGoodsController.get')

  //Closing
  //Route.get('/closing', 'ClosingController.show')
  //Route.post('/closing-save', 'ClosingController.save')
  //Route.post('/closing-delete', 'ClosingController.delete')
  // Status goods
  Route.get('/status-goods', 'StatusGoodsController.show')
  Route.post('/status-goods-page', 'StatusGoodsController.page')
  Route.post('/status-goods-filter', 'StatusGoodsController.filter')
  Route.post('/status-goods-get', 'StatusGoodsController.get')
  Route.post('/status-goods-save', 'StatusGoodsController.save')
  Route.post('/status-goods-print', 'PosShopHomeController.prints')

  Route.get('/tax-money', 'TaxMoneyController.show')
  Route.post('/tax-money-save', 'TaxMoneyController.save')
  Route.post('/tax-money-page', 'StatusGoodsController.page')
  Route.post('/tax-money-filter', 'StatusGoodsController.filter')
  Route.post('/tax-money-get', 'StatusGoodsController.get')
  Route.post('/tax-money-print', 'PosShopHomeController.prints')

  Route.get('/barcode', 'PosBarcodeController.show')
  Route.get('/test', 'PosBarcodeController.test')

  Route.get('/config', 'ConfigController.show')
  Route.post('/config-save', 'ConfigController.save')
  Route.post('/config-cancel', 'ConfigController.cancel')

}).prefix('trans').middleware('auth_inventory')

Route.group('pos-shop-group', function () {
  Route.get('/index', 'PosShopHomeController.show')
  Route.get('/', 'PosShopHomeController.show')
  Route.get('/profile', 'HomeController.profile')
  Route.get('/login', 'PosShopHomeController.login')
  Route.get('/block', 'HomeController.block')
  Route.post('/login', 'PosShopUserController.login')
  //Route.post('/login', 'PosShopUserController.login').middleware('recaptcha')
  Route.post('/profile', 'UserController.updateProfile')
  Route.post('/avatar-profile', 'UserController.updateAvatar')
  Route.post('/changepassword', 'UserController.changePassword')
  Route.post('/timeline', 'ChatTimelineController.timeline')
  Route.post('/chat', 'ChatTimelineController.chat')
  Route.post('/view-more-timeline', 'ChatTimelineController.viewMore')
  Route.post('/load-chat-user', 'ChatTimelineController.loadChatUser')

  // Transfer Issue Inventory General
    Route.get('/tranfer-issue-inventory-general', 'TransferIssueInventoryGeneralController.show')
    Route.post('/transfer-issue-inventory-general-get', 'TransferIssueInventoryGeneralController.get')
    Route.post('/transfer-issue-inventory-general-get-detail', 'TransferIssueInventoryGeneralController.detail')
    Route.post('/transfer-issue-inventory-general-write', 'TransferIssueInventoryGeneralController.write')
    Route.post('/transfer-issue-inventory-general-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
    Route.post('/transfer-issue-inventory-general-delete', 'TransferIssueInventoryGeneralController.delete')
    Route.post('/transfer-issue-inventory-general-print', 'TransferIssueInventoryGeneralController.prints')

    // Transfer Issue Inventory Voucher
    Route.get('/tranfer-issue-inventory-voucher', 'TransferIssueInventoryVoucherController.show')
    Route.post('/transfer-issue-inventory-voucher-load', 'TransferIssueInventoryVoucherController.load')
    Route.post('/transfer-issue-inventory-voucher-scan', 'TransferIssueInventoryVoucherController.scan')
    Route.post('/transfer-issue-inventory-voucher-save', 'TransferIssueInventoryVoucherController.save')
    Route.post('/transfer-issue-inventory-voucher-bind', 'TransferIssueInventoryVoucherController.bind')
    Route.post('/transfer-issue-inventory-voucher-write', 'TransferIssueInventoryGeneralController.write')
    Route.post('/transfer-issue-inventory-voucher-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
    Route.post('/transfer-issue-inventory-voucher-delete', 'TransferIssueInventoryGeneralController.delete')
    Route.post('/transfer-issue-inventory-voucher-print', 'TransferIssueInventoryGeneralController.prints')

    // Transfer Receipt Inventory General
    Route.get('/tranfer-receipt-inventory-general', 'TransferReceiptInventoryGeneralController.show')
    Route.post('/transfer-receipt-inventory-general-get', 'TransferReceiptInventoryGeneralController.get')
    Route.post('/transfer-receipt-inventory-general-get-detail', 'TransferReceiptInventoryGeneralController.detail')
    Route.post('/transfer-receipt-inventory-general-print', 'TransferReceiptInventoryGeneralController.prints')

    // Transfer Issue Inventory Voucher
    Route.get('/tranfer-receipt-inventory-voucher', 'TransferReceiptInventoryVoucherController.show')
    Route.post('/transfer-receipt-inventory-voucher-save', 'TransferReceiptInventoryVoucherController.save')
    Route.post('/transfer-receipt-inventory-voucher-bind', 'TransferReceiptInventoryVoucherController.bind')
    Route.post('/transfer-receipt-inventory-voucher-print', 'TransferReceiptInventoryGeneralController.prints')
    Route.post('/transfer-receipt-inventory-voucher-scan', 'TransferReceiptInventoryVoucherController.scan')

    // Report Shift Revenue
    Route.get('/report-shift-revenue', 'ReportShiftRevenueController.show')
    Route.post('/report-shift-revenue-get', 'ReportShiftRevenueController.get')

    // Report Detail Debt
    Route.get('/history-goods', 'HistoryGoodsController.show')
    Route.post('/history-goods-get', 'HistoryGoodsController.get')

    // Report General Inventory
    Route.get('/report-general-inventory', 'ReportGeneralInventoryController.show')
    Route.post('/report-general-inventory-get', 'ReportGeneralInventoryController.get')

    // Report Detail Inventory
    Route.get('/report-detail-inventory', 'ReportDetailInventoryController.show')
    Route.post('/report-detail-inventory-get', 'ReportDetailInventoryController.get')

    // Lấy receiver & sender
    Route.post('/store-post-get', 'PosShopHomeController.get')
    // Lấy subject
    Route.post('/store-post-load', 'PosShopHomeController.load')
    // Lưu thanh toán payment
    Route.post('/store-post-payment', 'PosShopHomeController.payment')
    // Lưu thanh toán payment
    Route.post('/store-post-print', 'PosShopHomeController.prints')
    // Trả hàng
    Route.get('/return', 'PosShopReturnController.show')
    // Quét mã bưu kiện
    Route.post('/store-return-scan', 'PosShopReturnController.scan')
    // Load bưu kiện
    Route.post('/store-return-load', 'PosShopReturnController.load')
    // Trả bưu kiện
    Route.post('/store-return-payment', 'PosShopReturnController.payment')
    // Trả bưu kiện
    Route.post('/store-return-print', 'PosShopReturnController.prints')

    Route.get('/config', 'ConfigController.show')
    Route.post('/config-save', 'ConfigController.save')
    Route.post('/config-cancel', 'ConfigController.cancel')

}).prefix('store').middleware('auth_inventory')
