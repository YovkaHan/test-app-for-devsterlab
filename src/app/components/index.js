import angular from 'angular';

let componentsModule = angular.module('app.components', []);

import {BsDialogComponent} from './bs-dialog/bs-dialog.component.js';
componentsModule.component(BsDialogComponent.selector, BsDialogComponent);

import {UDialogComponent} from './u-dialog/u-dialog.component.js';
componentsModule.component(UDialogComponent.selector, UDialogComponent);

export default componentsModule;
