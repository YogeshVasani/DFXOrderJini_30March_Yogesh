/**
 * Created by shreyasgombi on 27/04/20.
 */
var TemplatePrefix = './apps/B2BOMS/pages/';
var default_location = {};
default_location['Salesperson'] = '/ui-orders';
default_location['Dealer'] = '/ui-orders';
default_location['Manager'] = '/ui-orders';
default_location['Fulfiller'] = '/ui-orders';
default_location['BranchManager'] = '/ui-orders';
default_location['Portal Access'] = '/ui-orders';
default_location['WarehouseAdmin'] = '/ui-orders';
var app = angular.module('ebs', ['ebs.controller', 'ebs.filters', 'ebs.services', 'ngRoute'])
    .config(function ($routeProvider) {
        //.... Dashboard.....
        $routeProvider
            .when('/overview', {
                templateUrl: TemplatePrefix + 'dashboard/dashboard.html',
                controller: 'ServicesCtrl',
                roles: ['Stockist'],
                index: 0
            })
            .when('/customer/overview', {
                templateUrl: TemplatePrefix + 'dashboard/customer-dashboard.html',
                controller: 'CustomerDashboardCtrl',
                roles: ['Dealer'],
                index: 0
            })
            .when('/', {
                redirectTo: '/overview'
            })
            //..... Customers.....
            .when('/customers', {
                templateUrl: TemplatePrefix + 'customers/customers.html',
                controller: 'CustomersCtrl',
                roles: ['Stockist', 'Salesperson', 'Manager', 'BranchManager'],
                index: 2
            })
            //.....New Customer.....
            .when('/new-customer', {
                templateUrl: TemplatePrefix + 'customers/new-customer.html',
                controller: 'NewCustomerCtrl',
                roles: ['Stockist', 'Salesperson', 'Manager', 'BranchManager'],
                index: 2
            })
            //..... Customers Details.....
            .when('/customer-detail/:id', {
                templateUrl: TemplatePrefix + 'customers/edit-customer.html',
                controller: 'CustomerDetailCtrl',
                roles: ['Stockist', 'Salesperson', 'Manager', 'BranchManager'],
                index: 2
            })
            //.... Catalog ......
            .when('/catalog', {
                templateUrl: TemplatePrefix + 'catalog/catalog.html',
                controller: 'CatalogCtrl',
                roles: ['Stockist', 'Salesperson', 'Dealer', 'Manager', 'BranchManager'],
                index: 3
            })
            //.... New Catalog ......
            .when('/new-catalog', {
                templateUrl: TemplatePrefix + 'catalog/new-product.html',
                controller: 'NewCatalogCtrl',
                roles: ['Stockist', 'Salesperson', 'Dealer', 'Manager', 'BranchManager'],
                index: 3
            })
            //..... Customers Details.....
            .when('/catalog-detail/:id', {
                templateUrl: TemplatePrefix + 'catalog/edit-product.html',
                controller: 'CatalogDetailCtrl',
                roles: ['Stockist', 'Salesperson', 'Dealer', 'Manager', 'BranchManager'],
                index: 2
            })
            //..... Customers Details.....
            .when('/catalog/details/:id', {
                templateUrl: TemplatePrefix + 'catalog/catalog-details.html',
                controller: 'CatalogDetailsCtrl',
                roles: ['Stockist', 'Salesperson', 'Dealer', 'Manager', 'BranchManager'],
                index: 2
            })
            .when('/edit-product1/:id', {
                templateUrl: TemplatePrefix + 'catalog/edit-product1.html',
                controller: 'EditCatalogCtrl',
                roles: ['Stockist', 'Salesperson', 'Dealer', 'Manager', 'BranchManager'],
                index: 2
            })
            //.... Orders ......
            .when('/ui-orders', {
                templateUrl: TemplatePrefix + 'orders/orders.html',
                controller: 'OrdersCtrl',
                roles: ['Salesperson', 'Stockist', 'Dealer', 'Manager', 'Fulfiller', 'Portal Access', 'BranchManager', 'WarehouseAdmin'],
                index: 4
            })
            //....New Orders ......
            .when('/new-order/:id', {
                templateUrl: TemplatePrefix + 'orders/new-order.html',
                controller: 'NewOrdersCtrl',
                roles: ['Salesperson', 'Stockist', 'Dealer', 'Manager', 'BranchManager'],
                index: 1
            })
            .when('/regal-rex-new-order/:id', {
                templateUrl: TemplatePrefix + 'orders/regal-rex-new-order.html',
                controller: 'RegalRexNewOrdersCtrl',
                roles: ['Salesperson', 'Stockist', 'Dealer', 'Manager', 'BranchManager'],
                index: 1
            })
            //....Duro Custom Orders ......
            .when('/duro-custom-order/:id', {
                templateUrl: TemplatePrefix + 'orders/duro-custom-order.html',
                controller: 'DuroNewOrdersCtrl',
                roles: ['Salesperson', 'Stockist', 'Dealer', 'Manager', 'BranchManager'],
                index: 1
            })
            //.... Order Details ......
            .when('/order-details/:id', {
                templateUrl: TemplatePrefix + 'orders/order-details.html',
                controller: 'OrdersDetailsCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'Fulfiller', 'BranchManager', 'Dealer', 'WarehouseAdmin'],
                index: 1
            })
            //.... POS ......
            .when('/pos', {
                templateUrl: TemplatePrefix + 'orders/pos.html',
                controller: 'PosCtrl',
                roles: ['Salesperson', 'BranchManager'],
                index: 1
            })
            //.... Order Route Plan ......
            .when('/order-route-plan', {
                templateUrl: TemplatePrefix + 'orders/order-route-plan.html',
                controller: 'OrderRoutePlanCtrl',
                roles: ['Salesperson', 'BranchManager', 'WarehouseAdmin'],
                index: 1
            })
            //.... Inventory .....
            .when('/inventory', {
                templateUrl: TemplatePrefix + 'inventory/inventory.html',
                controller: 'InventoryCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'BranchManager'],
                index: 13
            })
            .when('/inventory/receive', {
                templateUrl: TemplatePrefix + 'inventory/new-receive-inventory.html',
                controller: 'ReceiveInventoryCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'BranchManager'],
                index: 13
            })
            .when('/inventory/transfer', {
                templateUrl: TemplatePrefix + 'inventory/new-transfer-inventory.html',
                controller: 'InventoryTransferCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'BranchManager'],
                index: 13
            })
            .when('/inventory/transaction/history', {
                templateUrl: TemplatePrefix + 'inventory/new-inventory-transaction-history.html',
                controller: 'TransactionHistoryCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'BranchManager'],
                index: 13
            })
            //.... Service Complaints .....
            .when('/service/complaints/:tab', {
                templateUrl: TemplatePrefix + 'service-complaints/service-complaints.html',
                controller: 'ServiceComplaintsCtrl',
                roles: ['Dealer', 'Salesperson', 'Manager', 'BranchManager'],
                index: 10
            })
            .when('/service/new/ticket', {
                templateUrl: TemplatePrefix + 'service-complaints/new-complaint.html',
                controller: 'NewComplaintCtrl',
                roles: ['Dealer', 'Salesperson', 'Manager', 'BranchManager'],
                index: 10
            })
            .when('/service/new/ticket/:code', {
                templateUrl: TemplatePrefix + 'service-complaints/new-complaint.html',
                controller: 'NewComplaintCtrl',
                roles: ['Salesperson', 'Manager', 'BranchManager'],
                index: 10
            })
            .when('/service/ticket/details/:id', {
                templateUrl: TemplatePrefix + 'service-complaints/ticket-details.html',
                controller: 'TicketDetailsCtrl',
                roles: ['Dealer', 'Salesperson', 'Manager', 'BranchManager'],
                index: 10
            })
            //.... Beat Plan......
            .when('/beat-plan', {
                templateUrl: TemplatePrefix + 'beatPlan/beatplan-list.html',
                controller: 'BeatPlanCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager'],
                index: 11
            })
            //.... Beat Plan......
            .when('/add-beat/:id', {
                templateUrl: TemplatePrefix + 'beatPlan/add-beat.html',
                controller: 'AddBeatCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager'],
                index: 11
            })
            //.... Beat Plan......
            .when('/assign-sales/:id', {
                templateUrl: TemplatePrefix + 'beatPlan/assign-salesper.html',
                controller: 'AssignSalesPer',
                roles: ['Salesperson', 'Stockist', 'Manager'],
                index: 11
            })
            //.... Reports .....
            .when('/reports', {
                redirectTo: '/reports/0'
            })
            //.... Navigate to Particular Report Page ....
            //... TODO : Needs to be still implemented...
            //... Dashboard Reports......
            .when('/reports/:tab', {
                templateUrl: TemplatePrefix + 'reports/dashboard.html',
                controller: 'ReportsCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager', 'WarehouseAdmin'],
                index: 0
            })
            //.... Top Sold
            .when('/reports/top/sold', {
                templateUrl: TemplatePrefix + 'reports/top_sold.html',
                controller: 'TopSoldReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager', 'WarehouseAdmin'],
                index: 0
            })
            //.... Top Customers
            .when('/reports/top/customers', {
                templateUrl: TemplatePrefix + 'reports/top_customers.html',
                controller: 'TopCustomersReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager', 'WarehouseAdmin'],
                index: 0
            })
             //.... Top Customers
             .when('/reports/overall/summary', {
                templateUrl: TemplatePrefix + 'reports/summary.html',
                controller: 'SummaryReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager', 'WarehouseAdmin'],
                index: 0
            })
             //.... Top Users
            .when('/reports/top/users', {
                templateUrl: TemplatePrefix + 'reports/top_users.html',
                controller: 'TopUsersReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Payments
            .when('/reports/overall/payments', {
                templateUrl: TemplatePrefix + 'reports/payments.html',
                controller: 'PaymentsReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Check-ins
            .when('/reports/overall/checkins', {
                templateUrl: TemplatePrefix + 'reports/check_ins.html',
                controller: 'CheckinsReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            .when('/reports/overall/checkins/distance/calculation', {
                templateUrl: TemplatePrefix + 'reports/check_ins_distance.html',
                controller: 'CheckinsDistanceReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Expenses
            .when('/reports/overall/expenses', {
                templateUrl: TemplatePrefix + 'reports/expenses.html',
                controller: 'ExpenseReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Meetings
            .when('/reports/overall/meetings', {
                templateUrl: TemplatePrefix + 'reports/meetings.html',
                controller: 'MeetingsReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Items billed
            .when('/reports/overall/billed', {
                templateUrl: TemplatePrefix + 'reports/billed.html',
                controller: 'BilledReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Emplyoee time
            .when('/reports/overall/emplyoee', {
                templateUrl: TemplatePrefix + 'reports/employee.html',
                controller: 'EmployeeReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Overall report
            .when('/reports/overall/report', {
                templateUrl: TemplatePrefix + 'reports/overall.html',
                controller: 'OverallReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Attendance report
            .when('/reports/overall/attendance', {
                templateUrl: TemplatePrefix + 'reports/attendance.html',
                controller: 'AttendanceReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 0
            })
            //.... Distribution report
            .when('/reports/overall/distribution', {
                templateUrl: TemplatePrefix + 'reports/distribution.html',
                controller: 'DistributionReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager', 'WarehouseAdmin'],
                index: 0
            })
            //.... Rider Reconciliation report
            .when('/reports/rider/reconciliation', {
                templateUrl: TemplatePrefix + 'reports/rider_reconciliation.html',
                controller: 'RiderReconciliationReportCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager', 'WarehouseAdmin'],
                index: 0
            })
            //..... Stocks......
            .when('/stocks', {
                redirectTo: '/stocks/all'
            })
            .when('/stocks/:dealer', {
                templateUrl: TemplatePrefix + 'stocks/stocks.html',
                controller: 'StocksCtrl',
                roles: ['Stockist', 'Manager', 'BranchManager'],
                index: 12
            })
            //..... Archive.....
            .when('/archive', {
                templateUrl: TemplatePrefix + 'archive/archive.html',
                controller: 'ArchiveCtrl',
                roles: [],
                index: 14
            })
            .when('/archive_details/:orderId', {
                templateUrl: TemplatePrefix + 'archive/archive_details.html',
                controller: 'ArchiveDetailCtrl',
                roles: [],
                index: 14
            })
            //...... Invoices....
            .when('/ui-invoices', {
                templateUrl: TemplatePrefix + 'invoices/invoices.html',
                controller: 'InvoicesCtrl',
                roles: ['Dealer', 'Salesperson', 'BranchManager'],
                index: 34
            })
            .when('/new-invoice', {
                templateUrl: TemplatePrefix + 'invoices/new-invoice.html',
                controller: 'NewInvoiceCtrl',
                roles: ['Stockist'],
                index: 34
            })
            .when('/invoice-details/:invoice_id', {
                templateUrl: TemplatePrefix + 'invoices/invoice-details.html',
                controller: 'InvoiceDetailsCtrl',
                roles: ['Dealer', 'Salesperson', 'Stockist', 'BranchManager'],
                index: 34
            })
            //..... Messages / SMS .....
            .when('/messages', {
                templateUrl: TemplatePrefix + 'messages/messages.html',
                controller: 'MessagesCtrl',
                roles: [],
                index: 7
            })
            .when('/push_notif', {
                templateUrl: TemplatePrefix + 'messages/messages.html',
                controller: 'MessagesCtrl',
                roles: [],
                index: 7
            })
            //...... Settings...
            .when('/settings', {
                templateUrl: TemplatePrefix + 'settings/settings.html',
                controller: 'SettingsCtrl',
                roles: [],
                index: 5
            })
            //...... Settings...
            .when('/old/settings', {
                templateUrl: TemplatePrefix + 'settings/old-settings.html',
                controller: 'OldSettingsCtrl',
                roles: [],
                index: 5
            })
            //...... Company Settings...
            .when('/setting/company', {
                templateUrl: TemplatePrefix + 'settings/company.html',
                controller: 'CompanySettingsCtrl',
                roles: [],
                index: 5
            })
            //.... Data Upload Settings
            .when('/setting/data/uploads', {
                templateUrl: TemplatePrefix + 'settings/data-uploads.html',
                controller: 'DataUploadCtrl',
                roles: [],
                index: 5
            })
            //.... Shopify Settings
            .when('/setting/shopify', {
                templateUrl: TemplatePrefix + 'settings/shopify.html',
                controller: 'ShopifyCtrl',
                roles: [],
                index: 5
            })
            //.... QuickBooks Settings
            .when('/setting/quickbooks', {
                templateUrl: TemplatePrefix + 'settings/quickbooks.html',
                controller: 'QuickBooksCtrl',
                roles: [],
                index: 5
            })
            //.... FTP Settings
            .when('/setting/ftp', {
                templateUrl: TemplatePrefix + 'settings/ftp.html',
                controller: 'FTPCtrl',
                roles: [],
                index: 5
            })
            //.... Ecomm Settings
            .when('/setting/ecomm', {
                templateUrl: TemplatePrefix + 'settings/ecomm.html',
                controller: 'EcommCtrl',
                roles: [],
                index: 5
            })
            //.... Admin Settings....
            .when('/setting/admin/login', {
                templateUrl: TemplatePrefix + 'settings/admin/login.html',
                controller: 'AdminLoginCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/home', {
                templateUrl: TemplatePrefix + 'settings/admin/home.html',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/menu', {
                templateUrl: TemplatePrefix + 'settings/admin/menu.html',
                controller: 'NavCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/module', {
                templateUrl: TemplatePrefix + 'settings/admin/module.html',
                controller: 'ModuleAdminCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/notifications', {
                templateUrl: TemplatePrefix + 'settings/admin/notification.html',
                controller: 'NotificationsAdminCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/payments', {
                templateUrl: TemplatePrefix + 'settings/admin/payments.html',
                controller: 'PaymentsAdminCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/tax', {
                templateUrl: TemplatePrefix + 'settings/admin/tax.html',
                controller: 'TaxAdminCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/billing', {
                templateUrl: TemplatePrefix + 'settings/admin/billing.html',
                controller: 'BillingAdminCtrl',
                requireAuth: true,
                roles: [],
                index: 5
            })
            .when('/setting/admin/404', {
                templateUrl: TemplatePrefix + 'settings/admin/404.html',
                index: 5
            })
            //.... Cloudinary Setup Settings
            .when('/setting/cloudinary', {
                templateUrl: TemplatePrefix + 'settings/cloudinary.html',
                controller: 'CloudinaryCtrl',
                roles: [],
                index: 5
            })
            //....E-Invoice integration Setup Settings
            .when('/setting/e-invoice', {
                templateUrl: TemplatePrefix + 'settings/e-Invoice.html',
                controller: 'EInvoiceCtrl',
                roles: [],
                index: 5
            })
            //.... Cloudinary Manage Settings
            .when('/setting/manage/cloudinary', {
                templateUrl: TemplatePrefix + 'settings/manage-cloudinary.html',
                controller: 'ManageCloudinaryCtrl',
                roles: [],
                index: 5
            })
            //.... Leave ....
            .when('/leave', {
                templateUrl: TemplatePrefix + 'leave/leave.html',
                controller: 'LeaveCtrl',
                roles: [],
                index: 19
            })
            //..... Tasks.....
            .when('/tasks', {
                templateUrl: TemplatePrefix + 'tasks/tasks.html',
                controller: 'TasksCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'Portal Access', 'BranchManager'],
                index: 28
            })
            .when('/group', {
                templateUrl: TemplatePrefix + 'tasks/tasks.html',
                controller: 'TasksCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'BranchManager'],
                index: 28
            })
            //...... Maps ......
            .when('/maps', {
                templateUrl: TemplatePrefix + 'maps/maps.html',
                controller: 'MapsCtrl',
                roles: ['Salesperson', 'Stockist', 'Manager', 'Fulfiller', 'BranchManager'],
                index: 17
            })
            //.... Users .....
            .when('/users', {
                templateUrl: TemplatePrefix + 'users/users.html',
                controller: 'UsersCtrl',
                roles: [],
                index: 4
            })
            .when('/edit-user/:id', {
                templateUrl: TemplatePrefix + 'users/edit-user1.html',
                controller: 'EditUserCtrl',
                roles: [],
                index: 4
            })
            .when('/edit-user/', {
                templateUrl: TemplatePrefix + 'users/edit-user.html',
                controller: 'UsersCtrl',
                roles: [],
                index: 4
            })
            .when("/new-user", {
                templateUrl: TemplatePrefix + 'users/new-user.html',
                controller: 'NewUserCtrl',
                roles: [],
                index: 4
            })
            .when('/invite-users', {
                templateUrl: TemplatePrefix + 'users/invite-users.html',
                controller: 'InviteUsersCtrl',
                roles: [],
                index: 0
            })
            .when('/user/details/:id', {
                templateUrl: TemplatePrefix + 'users/user-details.html',
                controller: 'UserDetailsCtrl',
                roles: [],
                index: 0
            })
            //.... Enquiry .....
            .when('/enquiry/tracker', {
                templateUrl: TemplatePrefix + 'enquiry/enquiry.html',
                controller: 'EnquiryCtrl',
                roles: [],
                index: 18
            })
            .when('/enquiry/create', {
                templateUrl: TemplatePrefix + 'enquiry/new-enquiry.html',
                controller: 'NewEnquiryCtrl',
                roles: [],
                index: 18
            })
            .when('/enquiry/create/:code', {
                templateUrl: TemplatePrefix + 'enquiry/new-enquiry.html',
                controller: 'NewEnquiryCtrl',
                roles: [],
                index: 18
            })
            .when('/enquiry/details/:id', {
                templateUrl: TemplatePrefix + 'enquiry/enquiry-details.html',
                controller: 'EnquiryDetailsCtrl',
                roles: [],
                index: 18
            })
            .when('/bulk-subscription', {
                templateUrl: TemplatePrefix + 'orders/bulk_subscription.html',
                controller: 'NewOrdersCtrl',
                roles: ['Salesperson', 'Dealer'],
                index: 1
            })
            .when('/newRequest', {
                templateUrl: TemplatePrefix + 'asset/newRequest.html',
                controller: 'NewRequestCtrl',
                roles: ['Salesperson'],
                index: 39
            })
            .when('/checkStatus', {
                templateUrl: TemplatePrefix + 'asset/checkStatus.html',
                controller: 'CheckStatusCtrl',
                roles: ['Manager', 'Salesperson'],
                index: 40
            })
            .when('/approvalBucket', {
                templateUrl: TemplatePrefix + 'asset/approvalBucket.html',
                controller: 'ApprovalBucketCtrl',
                roles: ['Manager'],
                index: 41
            })
            .when('/customerAddresses', {
                templateUrl: TemplatePrefix + 'asset/customerAddresses.html',
                controller: 'CustomerAddressCtrl',
                roles: [],
                index: 42
            })
            .when('/customerAddress-detail/:id', {
                templateUrl: TemplatePrefix + 'asset/edit-customerAddresses.html',
                controller: 'CustomerAddressDetailCtrl',
                roles: [],
                index: 42
            })
            .when('/storeDiscount', {
                templateUrl: TemplatePrefix + 'customerDiscount/storeDiscount.html',
                controller: 'StoreDiscountCtrl',
                roles: [],
                index: 26
            })
            //......Atmosphere.....
            .when('/goals', {
                templateUrl: TemplatePrefix + 'atmosphere/goals.html',
                controller: 'AtmosphereGoalsCtrl',
                roles: [],
                index: 27
            })
            .when('/atmsDashboard', {
                templateUrl: TemplatePrefix + 'atmosphere/atmsDashboard.html',
                controller: 'AtmosphereDashboardCtrl',
                roles: [],
                index: 28
            })
            .when('/atmsReports', {
                templateUrl: TemplatePrefix + 'atmosphere/atmosphereReports.html',
                controller: 'AtmosphereReportsCtrl',
                roles: [],
                index: 29
            })
            //.... Profile Page .....
            .when('/profile', {
                templateUrl: TemplatePrefix + 'profile/profile.html',
                controller: 'ProfileDetailsCtrl',
                roles: [],
                index: 1
            })
    })
    app.run(['$rootScope', 'Settings', '$location', function ($rootScope, Settings, $location) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
            //console.log(next.requireAuth);
            Settings.getInstanceInfo(function (instance_details) {
                if (instance_details.coID == 'GATE') {
                    Settings.getUserInfo(function (user_details) {
                        if (user_details.role && user_details.role != "Admin") {
                            if (user_details.role == 'Salesperson') {
                                if (next.$$route.roles && next.$$route.roles.length) {
                                    var roles = JSON.stringify(next.$$route.roles);
                                    if (roles.indexOf(user_details.role) == -1) {
                                        console.log("User Not Allowed to access this page request !!!!!");
                                        $location.path('/newRequest');
                                    }
                                } else {
                                    console.log("User Not Allowed to access this page request !!!!!");
                                    $location.path('/newRequest');
                                }
                            }
                            else {
                                console.log("Inside else 1...");
                                if (next.$$route.roles && next.$$route.roles.length) {
                                    var roles = JSON.stringify(next.$$route.roles);
                                    if (roles.indexOf(user_details.role) == -1) {
                                        console.log("User Not Allowed to access this page request !!!!!");
                                        $location.path('/approvalBucket');
                                    }
                                } else {
                                    console.log("User Not Allowed to access this page request !!!!!");
                                    $location.path('/approvalBucket');
                                }
                            }
                        }
                    })
                } else {
                    Settings.getUserInfo(function (user_details) {
                        if(next && next.requireAuth){
                            if(!user_details.role || user_details.role == 'Admin'){
                                if(!Settings.getSuperAdminLogin()) $location.path('/setting/admin/login'); 
                            }else $location.path('/setting/admin/404');
                        } else if (user_details.role && user_details.role != "Admin") {
                            if (next.$$route.roles && next.$$route.roles.length) {
                                var roles = JSON.stringify(next.$$route.roles);
                                if (roles.indexOf(user_details.role) == -1) {
                                    console.log("User Not Allowed to access this page request !!!!!");
                                    if (instance_details.applicationType == 'Atmosphere') {
                                        $location.path('/atmsDashboard');
                                    }else
                                        $location.path(default_location[user_details.role]);
                                }
                            } else {
                                console.log("User Not Allowed to access this page request !!!!!");
                                if (instance_details.applicationType == 'Atmosphere') {
                                    $location.path('/atmsDashboard');
                                }else
                                    $location.path(default_location[user_details.role]);
                            }
                        }else{
                            if (instance_details.applicationType == 'Atmosphere') {
                                if (next.$$route.roles && next.$$route.roles.length) {
                                    var roles = JSON.stringify(next.$$route.roles);
                                    if (roles.indexOf(user_details.role) == -1) {
                                        $location.path('/atmsDashboard');
                                    }
                                }
                            }
                        }
                    })
                }
            });
        });
    }]);
    app.config(function (toastrConfig) {
        angular.extend(toastrConfig, {
            allowHtml: false,
            closeButton: true,
            closeHtml: '<button>&times;</button>',
            extendedTimeOut: 1000,
            iconClasses: {
                error: 'toast-error',
                info: 'toast-info',
                success: 'toast-success',
                warning: 'toast-warning'
            },
            messageClass: 'toast-message',
            newestOnTop: true,
            onHidden: null,
            onShown: null,
            onTap: null,
            progressBar: false,
            tapToDismiss: true,
            timeOut: 8000,
            titleClass: 'toast-title',
            toastClass: 'toast',
            showMethod: "fadeIn",
            showEasing: 'swing',
            hideMethod: "fadeOut"
        });
    })
    //Change AngularJS Material Theme
    app.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue');
    });
