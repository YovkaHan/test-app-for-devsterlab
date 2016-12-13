/**
 * Created by MarineJ on 13.12.2016.
 */
import angular from 'angular';

let directivesModule = angular.module('app.directives', []);

import numberInput from './numberInput.directive.js';
directivesModule.directive('numberInput',numberInput);

import numberInputPlus from './numberInputPlus.direcive.js';
directivesModule.directive('numberInputPlus',numberInputPlus);

export default directivesModule;