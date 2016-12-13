// Компонент Bootstrap Dialog

export let BsDialogComponent = {
    templateUrl: 'components/bs-dialog/bs-dialog.template.html',
    selector: 'bsDialog',
    bindings: {
    },
    controller: class UDialogCtrl {

        constructor(AppConstants, $http, $uibModal, $q, $scope) {
            'ngInject';

            this._$http = $http;
            this._AppConstants = AppConstants;
            this._$uibModal = $uibModal;
            this._$q = $q;
            this._$scope = $scope;
            this.animationsEnabled = true;
            this.userInput = {
                id : '',
                name: '',
                username: '',
                email: '',
                address: {
                    street: '',
                    suite: '',
                    city: '',
                    zipcode: '',
                    geo: {
                        lat: '',
                        lng: ''
                    }
                },
                phone: {
                    phone1 : '',
                    phone2 : '',
                    phone3 : ''
                },
                website: {
                    website1: '',
                    website2: ''
                },
                company: {
                    name: '',
                    catchPhrase: '',
                    bs: ''
                }
            };
            this.userPost = {};
            this.uniqueFlag = false;
            this.validRules = {
                name : false,
                username : false,
                email : false,
                phone : false,
                website : false,
                companyName : false
            };
            this._$scope.onlyNumbers = /^[0-9]$/;
        }

        $onInit() {
            this.disabled = true;
        }

        // Открыть модалку
        open() {
            let parentElem = angular.element(document.body);
            let modalInstance = this._$uibModal.open({
                animation: this.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'components/bs-dialog/mdView.html',
                controller: ()=> this,
                controllerAs: '$ctrl',
                appendTo: parentElem,
                resolve: {}
            });
        }


                            //Набор проверок правил для полей
        nameCheck() {
            if(this.userInput.name.length > 0) {
                this.validRules.name = true;
            } else {
                this.validRules.name = false;
            }
        }

        usernameCheck() {
            if(this.userInput.username.length > 0) {
                this.validRules.username = true;
            } else {
                this.validRules.username = false;
            }
        }

        emailCheck() {
            if(this.userInput.email) {
                this.validRules.email = true;
            } else {
                this.validRules.email = false;
            }
        }

        companyNameCheck() {
            if(this.userInput.company.name.length > 0) {
                this.validRules.companyName = true;
            } else {
                this.validRules.companyName = false;
            }
        }
        
        phoneCheck() {

            /*for (let p in this.userInput.phone){
                if (!(/^[0-9]*$/g.test(this.userInput.phone[p]))){
                    this.userInput.phone[p] = this.userInput.phone[p].slice(0, -1);
                }
            }*/
            let phone = '';
            for (let p in this.userInput.phone){
                phone+=this.userInput.phone[p];
            }

            if(phone.length > 0 && phone.length < 10){
                this.validRules.phone = false;
            } else {
                this.validRules.phone = true;
            }
        }

        // Если начали писать в одном "поле" допишите и в другом иначе false
        websiteCheck() {
            if(this.userInput.website.website1.length > 0 || this.userInput.website.website2.length > 0) {
                if((this.userInput.website.website1.length > 0 && this.userInput.website.website2.length == 0) ||
                    (this.userInput.website.website1.length == 0 && this.userInput.website.website2.length > 0)) {

                    this.validRules.website = false;
                } else {
                    this.validRules.website = true;
                }

            } else {
                this.validRules.website = true;
            }
        }

        // Проверка флагов для полей с правилами (выше) если один false значит никто никуда не поедет (кнопка Submit не разблокируется)
        formValid() {
            for (let prop in this.validRules) {
                if (this.validRules[prop] != true){
                    return false;
                } else {
                    continue;
                }
            }
            return true;
        }

        checkingInput(set) {
            let promise;
            if(set){
                promise = this.checkUnique(); // проверка уникальности
            }
            // проверка правил написания
            this.nameCheck();
            this.usernameCheck();
            this.emailCheck();
            this.companyNameCheck();

            this.phoneCheck();
            this.websiteCheck();

            // При режиме "отсылки формы" срабатывает проверка уникальности и в итоге
            // передается дальше промис с результатом проверки
            if(set){
               return promise.then((res)=>{
                    if(this.formValid() && this.uniqueFlag) {

                        this.disabled = false;
                        return true;
                    } else {
                        this.disabled = true;
                        return false;
                    }
                });
            } else {
                // Разблокируется кнопка Submit или нет
                if(this.formValid()) {
                    this.disabled = false;
                    return true;
                } else {
                    this.disabled = true;
                    return false;
                }
            }
        }

        sendingForm() {
            this.checkingInput(1).then((res)=>{
                if(res) {
                    this.transformIput();
                    this.send();
                } else {
                    // Checking Failed
                }
            });
        }

        //Перевести данные с this.userInput в this.userPost для дальнейшего POSTа
        transformIput() {
            for(let prop in this.userInput) {
                if(prop == 'phone' || prop == 'website'){
                    let index = 0;
                    for(let p in this.userInput[prop]){
                        if(!index){
                            if(this.userInput[prop][p]){
                                this.userPost[prop]=this.userInput[prop][p];
                            } else {  // Если поля пусты сделаем так что бы не вбивало "undefined"
                                this.userPost[prop]='';
                                break;
                            }
                        } else{
                            this.userPost[prop]+='.'+this.userInput[prop][p];
                        }
                        index++;
                    }
                } else {
                    this.userPost[prop] = this.userInput[prop];
                }
            }

        }

        // Проверка требуемых полей на уникальность если все хорошо this.uniqueFlag == true
        checkUnique() {
            let deferred = this._$q.defer();
            this._$http({
                url: this._AppConstants.api,
                method: 'GET'
            }).then((res) => {
                let nonUnique = 0;
                this.users = res.data;
                this.users.map((elem) => {
                    if(elem.email == this.userInput.email){
                        console.log('Pick another "email"');
                        nonUnique++;
                    }
                    if (elem.username == this.userInput.username) {
                        console.log('Pick another "username"');
                        nonUnique++;
                    }
                    if (elem.company.name == this.userInput.company.name) {
                        console.log('Pick another "name"');
                        nonUnique++;
                    }
                });
                if(nonUnique>0){
                    this.uniqueFlag = false;
                } else {
                    this.uniqueFlag = true;
                }
                deferred.resolve();
            });
            return deferred.promise;
        }
        
        send(){
            this._$http({
                url: this._AppConstants.api,
                method: 'POST',
                data: this.userPost
            }).then((res) => {
                console.log(res.data);  // Вывод для себя в консоль результат передачи данных на сервис
            });
        }

        // Проверка на отсылку данных на сервис
        /*saveTestUnique(){
            this._$http({
                url: this._AppConstants.api,
                method: 'POST',
                data: {
                    id : '',
                    name: 'Test Name',
                    username: 'testUsername',
                    email: 'testemail@gmail.com',
                    address: {
                        street: 'Some Str.',
                        suite: 'Suite 9',
                        city: 'Monopolis',
                        zipcode: '31421-2211',
                        geo: {
                            lat: '-55',
                            lng: '-44'
                        }
                    },
                    phone: '345.455.5555',
                    website: 'testwebi.com',
                    company: {
                        name: 'TestCompany',
                        catchPhrase: 'Testing this service',
                        bs: 'somestuff test'
                    }
                }
            }).then((res) => {
                console.log(res.data);
            });
        }
        saveTestNonUnique(){
            this._$http({
                url: this._AppConstants.api,
                method: 'POST',
                data: {
                    id : '',
                    name: 'Test Name',
                    username: 'Moriah.Stanton',
                    email: 'testemail@gmail.com',
                    address: {
                        street: 'Some Str.',
                        suite: 'Suite 9',
                        city: 'Monopolis',
                        zipcode: '31421-2211',
                        geo: {
                            lat: '-55',
                            lng: '-44'
                        }
                    },
                    phone: '345.455.5555',
                    website: 'testwebi.com',
                    company: {
                        name: 'Johns Group',
                        catchPhrase: 'Testing this service',
                        bs: 'somestuff test'
                    }
                }
            }).then((res) => {
                console.log(res.data);
            });
        }*/
    }
}

