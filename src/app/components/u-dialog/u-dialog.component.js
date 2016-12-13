/**
 * Created by MarineJ on 09.12.2016.
 */
//import template from './u-dialog.template.html';
//import view from './mdView.html';

export let UDialogComponent = {
    templateUrl: 'components/u-dialog/u-dialog.template.html',
    selector: 'uDialog',
    bindings: {
        user: '='
    },
    controller: class UDialogCtrl {

        constructor($http, $window, $q, $mdDialog) {
            'ngInject';

            this._$http = $http;
            this._$window = $window;
            this._$q = $q;
            this._$mdDialog = $mdDialog;

        }

        $onInit() {
        }

        // в купе с  getPosition() применяется для получения текущих координат
        // только если Вы этого хотите (должно выскочить предупреждение)
        get() {
            let deferred = this._$q.defer();

            if (!this._$window.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            } else {
                this._$window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        deferred.resolve(position);
                    },
                    function (err) {
                        deferred.reject(err);
                    });
            }

            return deferred.promise;
        }

        openDialog($event) {
            let parentEl = angular.element(document.body);
            this._$mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'components/u-dialog/mdView.html',

                clickOutsideToClose: true,

                preserveScope: true,
                controller: () => this,
                controllerAs: 'ctrl'
            });

        };

        closeDialog() {
            this._$mdDialog.hide();
        }

        getPosition() {
            this.promise = this.get();
            this.promise.then((res) => {
                this.position = res.coords;
                this.distance = Math.round(this.getDistanceFromLatLonInKm(this.position.latitude, this.position.longitude, this.user.address.geo.lat, this.user.address.geo.lng));
            });

        }

        // Взял с инета метод определения расстояниям по координатам
        getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lon2-lon1);
            var a =
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2)
                ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d;
        }

        deg2rad(deg) {
            return deg * (Math.PI/180)
        }
    }
}

