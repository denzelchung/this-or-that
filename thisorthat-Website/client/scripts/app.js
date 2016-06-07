'use strict';

angular.module('confusionApp', ['ui.router','ngResource','ngDialog', 'lbServices'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/main.html',
                        controller  : 'QuestionTimelineController'
                    }
                }

            })
        
            // route for the new question page
            .state('app.newquestion', {
                url: 'question/new',
                views: {
                    'content@': {
                        templateUrl : 'views/new-question.html',
                        controller  : 'NewQuestionController'
                   }
                }
            })
        
            // route for the individual question page
            .state('app.question', {
                url: 'question/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/question.html',
                        controller  : 'QuestionController'
                   }
                }
            })
        
        
        
            // route for the aboutus page
            .state('app.aboutus', {
                url:'aboutus',
                views: {
                    'content@': {
                        templateUrl : 'views/aboutus.html',
                        controller  : 'AboutController'                  
                    }
                }
            })
        
            // route for the contactus page
            .state('app.contactus', {
                url:'contactus',
                views: {
                    'content@': {
                        templateUrl : 'views/contactus.html',
                        controller  : 'ContactController'                  
                    }
                }
            })

            // route for the menu page
            .state('app.menu', {
                url: 'menu',
                views: {
                    'content@': {
                        templateUrl : 'views/menu.html',
                        controller  : 'MenuController'
                    }
                }
            })

            // route for the dishdetail page
            .state('app.dishdetails', {
                url: 'menu/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/dishdetail.html',
                        controller  : 'DishDetailController'
                   }
                }
            })
        
            // route for the dishdetail page
            .state('app.favorites', {
                url: 'favorites',
                views: {
                    'content@': {
                        templateUrl : 'views/favorites.html',
                        controller  : 'FavoriteController'
                   }
                }
            });
    
        $urlRouterProvider.otherwise('/');
    })
;
