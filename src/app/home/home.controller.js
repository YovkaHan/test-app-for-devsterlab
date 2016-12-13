class HomeCtrl {

  constructor(AppConstants, $http, $state, $rootScope) {
    'ngInject';

    $rootScope.setPageTitle('Home page');
    this._$http = $http;
    this._$state = $state;
    this._AppConstants = AppConstants;
    this.formData = {
      name : '',
      username : '',
      email : ''
    }
    this.orderProp = 'username';
    this.reverse = 'false';
  }

  $onInit() {
    this._$http({
      url: this._AppConstants.api,
      method: 'GET'
    }).then((res) => {
      this.users = res.data;
    });
  }

  sortBy(){
    this.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    this.propertyName = propertyName;
  }
}

export default HomeCtrl;
