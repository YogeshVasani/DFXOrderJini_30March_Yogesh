/**
 * Created by shreyasgombi on 05/03/20.
 */
'use strict';
angular.module('ebs.services', [])
.factory('Settings', function($rootScope, $http, $window) {
    //.... Declare all the services that you want to be session cached....
    //..... Use local variable as buckets to store session details like, role, access controls, instance details, etc...
    var instance_details = {};
    var user_details = null;
    var nav_details = null;
    var instance_info=null;
    var email_config = {};
    var item_data  = {};
    var company_details = {};
    var inventory_order_config = null;
    var standred_order_fulfil_config = false;
    var Id = null;
    var order_data = [];
    var order_lIst_data = [];
    var subscription_data = {};
    var UsercreatedFlag = false;
    var userRecord = {};
    var isAuthenticated = false;
    return {
        setLocal: function( key, value ){
            try{
                if( $window.Storage ){
                    $window.localStorage.setItem(key, value);
                    return true;
                } else {
                    return false;
                }
            } catch( error ){
                console.error( error, error.message );
            }
        },
        getLocal : function (key) {
            try{
                if( $window.Storage ){
                    $window.localStorage.getItem(key);
                    return true;
                } else {
                    return false;
                }
            } catch( error ){
                console.error( error, error.message );
            }
        },
        //.... For example, for any kind of simple formatting, we can use the below function for formatting the dates..
        // formatDate : function(){
        // },
        //.... Clear session will reset all the data when the page for example, is reloaded...
        clearSession : function(){
            instance_details = {};
            user_details = {};
            nav_details = {};
            email_config = {};
            company_details = {};
            item_data ={};
        },
        setId : function(details){
            Id = details;
        },
        getId : function(){
            return Id;
        },
        setInstance : function(details){
            instance_details = details;
        },
        setInstanceDetails : function(key, value){
            instance_details[key] = value;
        },
        getInstance : function(){
            return instance_details;
        },
        getInstanceDetails : function(key){
            if(instance_details)
                return instance_details[key];
            else return '';
        },
        getInstanceInfo : function(callback){
            if(!instance_info){
                $http.get("/dash/instanceDetails")
                    .success(function(res) {
                        instance_info = res;
                        callback(instance_info);
                    })
                    .error(function(error, status){
                        console.log(error, status);
                        if(status >= 400 && status < 500)
                            $window.location.href = '/404';
                        else if(status >= 500)
                            $window.location.href = '/500';
                    })
            }else{
                if(callback)
                    callback(instance_info);
                else
                    return instance_info;
            }
        },
        setUserInfo : function(details){
            user_details = details;
        },
        getUserInfo : function(callback){
            if(!user_details){
                $http.get("/dash/user/role/access")
                    .success(function(res) {
                        user_details = res;
                        if (res.role) {
                            if(callback)
                                callback(user_details);
                            else
                                return user_details;
                        }else{
                            if(callback)
                                callback({});
                            else
                                return {};
                        }
                    })
                    .error(function(error, status){
                        console.log(error, status);
                        if(status >= 400 && status < 500)
                            $window.location.href = '/404';
                        else if(status >= 500)
                            $window.location.href = '/500';
                    })
            }else{
                if(callback)
                    callback(user_details);
                else
                    return user_details;
            }
        },
        setSuperAdminLogin : () => {
            isAuthenticated = true;
            if($window.Storage){
                $window.localStorage.setItem("authExpiry", new Date().setMinutes(new Date().getMinutes() + 10));
                return true;
            } else {
                return false;
            }
        },
        getSuperAdminLogin : () => {
            if($window.Storage){
                let auth = new Date(parseInt($window.localStorage.getItem("authExpiry")));
                console.log('Auth - ', auth);
                if(!auth || auth == "Invalid Date" || auth.getTime() < new Date().getTime()) {
                    $window.localStorage.removeItem("authExpiry");
                    isAuthenticated = false;
                    return false;
                } else return true;
            } else return isAuthenticated;
        },
        getUserDetails : function(key){
            return user_details[key];
        },
        setNav : function(details){
            nav_details = details;
        },
        getNav : function(flag, callback){
            if(!nav_details || flag){
                $http.get("/dash/nav")
                    .success(function(nav){
                        nav_details = nav;
                        if (nav.length) {
                            if(callback)
                                callback(nav_details);
                            else
                                return nav_details;
                        }else{
                            if(callback)
                                callback([]);
                            else
                                return [];
                        }
                    })
                    .error(function(error, status){
                        console.log(error, status);
                        if(status >= 400 && status < 500)
                            $window.location.href = '/404';
                        else if(status >= 500)
                            $window.location.href = '/500';
                    });
            }else{
                if(callback)
                    callback(nav_details);
                else
                    return nav_details;
            }
        },
        setEmailConfig : function(details){
            email_config = details;
        },
        getEmailConfig : function(){
            return email_config;
        },
        getEmailDetails : function(key){
            return email_config[key]
        },
        setInventoryOrderConfig : function(key){
             inventory_order_config = key;
        },
        getInventoryOrderConfig : function(){
            return inventory_order_config;
        },
        setStandredOrderFulfilmentConfig : function(key){
            standred_order_fulfil_config = key;
        },
        getStandredOrderFulfilmentConfig : function(){
            return standred_order_fulfil_config;
        },
        set1to1Orders : function(key) {
            order_data = key
        },
        get1to1Orders : function() {
            return order_data;
        },
        setOrderData : function(key) {
            order_lIst_data = [];
            order_lIst_data.push(key);
        },
        getOrderData : function() {
            return order_lIst_data;
        },
        setSubscriptionData : function(key) {
            subscription_data = key
        },
        getSubscriptionData : function() {
            return subscription_data;
        },
        setUserCreatedFlag : function(key) {
            //covid set flag after created
            UsercreatedFlag = key
        },
        getUserCreatedFlag : function() {
            //covid get flag if created or not
            return UsercreatedFlag;
        },
        setRegisteredUser : function(key) {
            userRecord = key
        },
        getRegisteredUser : function() {
            return userRecord;
        },
        setItemData : function(details){
            item_data = details;
        },
        getItemData : function(){
            return item_data;
        },
        //.... Date formatting services....
        formatDate : (date) => {
            if(date){
                /* replace is used to ensure cross browser support*/
                let d = new Date(date.toString().replace("-","/").replace("-","/"));
                let monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                let dt = d.getDate();
                if(dt < 10)
                    dt = "0"+dt;
                return (dt + " - " + monthNames[d.getMonth()] + " - " + (d.getFullYear()));
            } else return '';
        },
        formatOnlyDate : date => {
            if(date) {
                /* replace is used to ensure cross browser support*/
                let d = new Date(date.toString().replace("-","/").replace("-","/"));
                let dt = d.getDate();
                let mon = d.getMonth() + 1;
                if(dt < 10)
                    dt = "0" + dt;
                if(mon < 10)
                    mon = "0" + mon;
                    return (dt + " - " + mon + " - " + (d.getFullYear()));
            } else return '';
        },
        //.... This is the service that gives you a start date and an end date where,
        //... for start date, the time will be 0:0:0:0 and for end dates it will be 23:59:59:999
        dateFilterFormat : (date, when) => {
            if (date) {
                //This is to format the date in dd-mm-yy hh:mm:ss format, also padding 0's if values are <10 using above function
                let _date = new Date(date);
                if (when == 'start') _date.setHours(0, 0, 0, 0);
                else if (when == 'end') _date.setHours(23, 59, 59, 999);
                let dformat = [_date.getFullYear(), (_date.getMonth() + 1).padLeft(), _date.getDate().padLeft()].join('-') + ' '
                    + [_date.getHours().padLeft(), _date.getMinutes().padLeft(), _date.getSeconds().padLeft()].join(':');
                return (dformat);
            } else
                return 0;
        },
        //.... This function will spit a date in the format - Thursday, January 27, 2022
        customDate : date => {
            let _date = date ? new Date(date) : new Date();
            let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let dformat = _date.toLocaleDateString("en-US", options);
            return (dformat);
        },
        newDate : date => {
            let _date = date ? new Date(date) : new Date();
            return [_date.getFullYear(), (_date.getMonth() + 1).padLeft(), _date.getDate().padLeft()].join('-') + ' '
            + [_date.getHours().padLeft(), _date.getMinutes().padLeft(), _date.getSeconds().padLeft()].join(':');
        },
        daysDifference : (startDate, endDate) => {
            let numberOfDays;
            if (startDate && endDate) {
                let d1 = moment(startDate);
                let d2 = moment(endDate);
                numberOfDays = moment.duration(d2.diff(d1)).asDays();
            }
            else if (!endDate) {
                let d1 = moment(startDate);
                let d2 = moment(new Date());
                numberOfDays = moment.duration(d2.diff(d1)).asDays();
            }
            else
                numberOfDays = 0;
            return numberOfDays;
        },
        generateId : (short, length) => {
            let date = new Date();
            let components = [
                date.getYear(),
                (date.getMonth() < 10)? '0' + date.getMonth() : date.getMonth(),
                (date.getDate() < 10)? '0' + date.getDate() : date.getDate(),
                (date.getHours() < 10)? '0' + date.getHours() : date.getHours(),
                (date.getMinutes() < 10)? '0' + date.getMinutes() : date.getMinutes(),
                (date.getSeconds() < 10)? '0' + date.getSeconds() : date.getSeconds(),
                (date.getMilliseconds() < 10)? '00' + date.getMilliseconds() : (date.getMilliseconds() < 100)? '0' + date.getMilliseconds() : date.getMilliseconds()
            ];
            let date_ = components.join("");
            if(short)
                date_ = date_.slice(length || 8);
            return date_;
        },
        zeroPad : (num, places) => String(num).padStart(places, '0'),
        success_toast : function(heading, text){
            $.toast({
                heading: heading,
                text: text,
                showHideTransition: 'slide',
                icon: 'success',
                loaderBg: '#f96868',
                position: 'top-right'
            })
        },
        fail_toast : function(heading, text){
            $.toast({
                heading: heading,
                text: text,
                showHideTransition: 'slide',
                icon: 'error',
                loaderBg: '#f2a654',
                position: 'top-right'
            })
        },
        info_toast : function(heading, text){
            $.toast({
                heading: heading,
                text: text,
                showHideTransition: 'slide',
                icon: 'info',
                loaderBg: '#46c35f',
                position: 'top-right'
            })
        },
        warning_toast : function(heading, text){
            $.toast({
                heading: heading,
                text: text,
                showHideTransition: 'slide',
                icon: 'warning',
                loaderBg: '#57c7d4',
                position: 'top-right'
            })
        },
        popupAlert : function(text){
            swal({
                text: text,
                button: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "btn btn-primary"
                }
            })
        },
        alertPopup : function(title, text){
            swal({
                title: title,
                text: text,
                button: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "btn btn-primary"
                }
            })
        },
        confirmPopup : function(title, text, callback){
            swal({
                title: title,
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3f51b5',
                cancelButtonColor: '#ff4081',
                confirmButtonText: 'Great ',
                buttons: {
                    cancel: {
                        text: "Cancel",
                        value: null,
                        visible: true,
                        className: "btn btn-danger",
                        closeModal: true,
                    },
                    confirm: {
                        text: "OK",
                        value: true,
                        visible: true,
                        className: "btn btn-primary",
                        closeModal: true
                    }
                }
            }).then(
                function(result) {
                    if(callback)
                        callback(result);
                }
            )
        },
        confirmCustomPopup : function(title, text, data, callback){
            swal({
                title: title,
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3f51b5',
                cancelButtonColor: '#ff4081',
                confirmButtonText: 'Great ',
                buttons: {
                    cancel: {
                        text: data ? (data.cancel || "Cancel") : "Cancel",
                        value: null,
                        visible: true,
                        className: data ? (data.cancel_class || "btn btn-danger") : "btn btn-danger",
                        closeModal: true
                    },
                    confirm: {
                        text: data ? (data.confirm || "OK") : "OK",
                        value: true,
                        visible: true,
                        className: data ? (data.confirm_class || "btn btn-primary") : "btn btn-primary",
                        closeModal: true
                    }
                }
            }).then(
                function(result) {
                    console.log(result);
                    if(callback)
                        callback(result);
                }
            )
        },
        loginRedirectPopup : function(title, text, data, callback){
            swal({
                title: title,
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3f51b5',
                cancelButtonColor: '#ff4081',
                confirmButtonText: 'Great ',
                buttons: {
                    confirm: {
                        text: data ? (data.confirm || "OK") : "OK",
                        value: true,
                        visible: true,
                        className: data ? (data.confirm_class || "btn btn-primary") : "btn btn-primary",
                        closeModal: true
                    }
                }
            }).then(
                function(result) {
                    console.log(result);
                    if(callback)
                        callback(result);
                }
            )
        },
        successPopup : function(title, text){
            swal({
                title: title,
                text: text,
                icon: "success",
                button: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "btn btn-success"
                }
            })
        },
        failurePopup : function(title, text){
            swal({
                title: title,
                text: text,
                icon: "warning",
                button: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "btn btn-danger"
                }
            })
        },
        buttonConfigPopup : function(title, text,Label1,label2, callback){
            swal({
                title: title,
                text: text,
                icon: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3f51b5',
                cancelButtonColor: '#ff4081',
                confirmButtonText: 'Great ',
                buttons: {
                    cancel: {
                        text: Label1,
                        value: 'id',
                        visible: true,
                        className: "btn btn-primary",
                        closeModal: true,
                    },
                    confirm: {
                        text: label2,
                        value: true,
                        visible: true,
                        className: "btn btn-success",
                        closeModal: true
                    }
                }
            }).then(
                function(result) {
                    if(callback)
                        callback(result);
                }
            )
        },
        inputPrompt : function (title, placeholder, callback) {
            swal({
                title: title,
                content: {
                    element: "input",
                    attributes: {
                        placeholder: placeholder,
                        type: "password",
                        class: 'form-control'
                    },
                },
                button: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "btn btn-primary"
                }
            }).then(
                function(result) {
                    if(callback)
                        callback(result);
                }
            )
        }
    }
});