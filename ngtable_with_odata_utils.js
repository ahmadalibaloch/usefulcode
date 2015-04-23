angular.module('ahmadalibaloch')
.factory('utils', ['$q', '$resource', , function ($q, $resource) {

    return {
        //=======Query convertor method-- from NGtable params query to Odata query
        /*if using ng-table filters and you also need to override then remember to add override like this
        var customfilters = [];
        customfilters.push({ filter: 'Probability gt 20', override: 'Probability' });
		USAGE:
		$scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,           // count per page, default 10 objects on one page
			},
		   {
			   total: 0,
			   getData: function ($defer, params) {
				   // ajax request to api for customer
					var select = 'Id,FirstName,LastName,MobileNo,Email,' +
								'Country/Id,Country/Name';
					expand = 'Country,Branch';
				    get_list_for_ngtable(ng_resource_api,params.$params, expand, select, customfilters).then(function (data) {
					   params.total(data.length);
					   // set new data
					   $defer.resolve(data);
				    });
			   }//getData
		   }//ng-params setting
		  );//ng-params intialization
		
        //it will override the ng-table Probability filter
		*/
        query: function (query) {
            var filter = "true";
            var order = "ID";
            var skip = 0;
            var count = 1000;
            var expand = "";
            var select = "";
            //== Custom or Manual Params
            filter = query.filter ? query.filter : filter;
            order = query.order ? query.order : order;
            skip = query.skip ? query.skip : skip;
            count = query.count ? query.count : count;
            expand = query.expand ? query.expand : expand;
            select = query.select ? query.select : select;
            //===========NG-Table params
            if (query.params) {
                var params = query.params;//ng-table params
                count = params.count;
                //====================================================paging
                skip = (params.page - 1) * params.count;
                //====================================================filtering
                //add custom filters

                var ignorefs = ['customfilters'];
                if (angular.isArray(filter) && filter.length > 0) {
                    var filterString = "";
                    angular.forEach(filter, function (key, value) {
                        //custom filter
                        if (key && key.filter)
                            filterString = filterString + key.filter + " and ";
                        ignorefs.push(key.override);
                    });
                    filter = filterString;
                }
                else
                    filter = "";

                //override ng-table filters which are given in custom filters
                var truefs = _.omit(params.filter, ignorefs);

                //add ng-table filters
                angular.forEach(truefs, function (key, value) {
                    if (key && value && ignorefs.filter)
                        filter = filter + "substringof('" + key + "'," + (value.replace('.', '/')) + ") and ";
                });
                filter = filter == "" ? "true" : filter.substring(0, filter.lastIndexOf('a'));
                filter = filter.trim() == "" ? "true" : filter;
                //====================================================sorting
                var order = "Id";
                angular.forEach(params.sorting, function (value, key) {
                    if (key && value)
                        order = key.replace('.', '/') + " " + value
                });
                //====================================================selection
            }
            return { $inlinecount: 'allpages', $top: count, $skip: skip, $expand: expand, $filter: filter, $orderby: order, $select: select };
        },    
        get_list_for_ngtable: function (resource_api, ngTable_params, expand, select, filter) {

            var deferred = $q.defer();
            resource_api.query(this.query({ params: ngTable_params, expand: expand, select: select, filter: filter }), function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
       
    },

}
}]);
