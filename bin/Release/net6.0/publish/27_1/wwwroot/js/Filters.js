/**
 * Created by shreyasgombi on 02/03/20.
 */
angular.module("ebs.filters", [])
    .filter("managerFilter", function() {
        return function(items) { //items is the parameter that is fetched by default from ng-repeat x in y, here its x
            var result = [];
            if(items) {
                for (var i = 0; i < items.length; i++) {
                    if( items[i].manager != true) //bypass cash,cheque,noorder these are not to be displayed
                        continue;
                    result.push(items[i])
                }
            }
            //console.log("manager filteration completed");
            //console.log(result)
            if(result[0]!=undefined)
                return result;
        };
    })
    .filter('reverse', function() {
        //filter to reverse the order of ng-repeat
        return function(items) {
            if(items)
                return items.slice().reverse();
        };
    })
    .filter('getEnabled', function(){
        return function(items){
            var result = [];
            if(items)
                for(var i=0; i< items.length; i++){
                    if(items[i].enable)
                        result.push(items[i])
                }
            return result;
        }
    })
    .filter('INR', function(){
        return function(input){
            if(input){
                var currencySymbol = '₹';
                //var output = Number(input).toLocaleString('en-IN');   <-- This method is not working fine in all browsers!
                var result = input.toString().split('.');
                var lastThree = result[0].substring(result[0].length - 3);
                var otherNumbers = result[0].substring(0, result[0].length - 3);
                if (otherNumbers != '')
                    lastThree = ',' + lastThree;
                var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                if (result.length > 1) {
                    output += "." + result[1];
                }
                return currencySymbol + output;
            }
        }
    })
    .filter( 'camelCase', function ()
    {
        var camelCaseFilter = function ( input )
        {
            if(input){
                input = input.toString();
                if(input.split(' '))
                    var words = input.split( ' ' );
                else
                    var words = input;
                for ( var i = 0, len = words.length; i < len; i++ )
                    words[i] = words[i].charAt( 0 ).toUpperCase() + words[i].slice( 1 );
                return words.join( ' ' );
            }
        };
        return camelCaseFilter;
    })
    .filter('singular', function()
    {
        var singularString = function (value){
            if(value){
                value = value.toString();
                if(value[value.length-1] == 's') return value.slice(0, -1);
                else return value;
            }else return value;
        };
        return singularString;
    })
    .filter("multiKeyFilter",[ function(){
        return function(items, keySetObject, a){
            var filteredList = [];
            var matchFound;
            var numberOfItemsFound = 0;
            var numberOfMatchesFound ;
            var itemsList=[];
            itemsList = items;
            if(a){
                if(keySetObject[1].Product.length == 0 || keySetObject[1].Product[0]==''){
                    itemsList = items;
                }else{
                    itemsList = a;
                }
            }else{
                itemsList = items;
            }
            if( itemsList )
                for(var i =0; i< itemsList.length; i++)
                {
                    numberOfMatchesFound = 0;
                    for(var j = 0; j< keySetObject.length; j++)
                    {
                        matchFound = false;
                        for(key in keySetObject[j])
                        {
                            if( keySetObject[j][key].length == 0 && !keySetObject[j].strictWhenEmpty)
                                numberOfMatchesFound++;
                            for(var k=0; k < keySetObject[j][key].length; k++)
                            {
                                switch(keySetObject[j].type ) {
                                    case filterTagTypes.select :
                                    case filterTagTypes.valueString:
                                        if (itemsList[i][key].toString().toUpperCase().indexOf(keySetObject[j][key][k].toUpperCase()) != -1)
                                        {
                                            matchFound = true;
                                            numberOfMatchesFound++;
                                            continue;
                                        }
                                        break;
                                }
                            }
                            if(matchFound) continue;
                        }
                    }
                    if( numberOfMatchesFound == keySetObject.length ){
                        filteredList.push(itemsList[i]);
                    }
                }
            return filteredList;
        }
    }])
    .filter('statusFil',function(){
        return function(item,status){
            if(status){
                var arr = [];
                for(var i=0; i<=item.length-1; i++ ){
                    if(item[i].status !== status){
                        arr.push(item[i])
                    }
                }
            } else  return item;
            return arr
        }
    })
    //***************** inventory filter **************
    .filter( 'inventoryQty', function ()
    {
        var inventoryFilter = function (inv ,location) {
            if (inv){
                var  totalInventory = 0;
                if(location){
                    for (var i = 0; i < inv.length; i++) {
                        if (inv[i].location == location) {
                            totalInventory += inv[i].Qty;
                        }
                    }return totalInventory;
                }else{
                    for (var i = 0; i < inv.length; i++) {
                        if (inv[i].location == '') {
                            totalInventory += inv[i].Qty;
                        }
                    }return totalInventory;
                }
            }
        };
        return inventoryFilter;
    });
