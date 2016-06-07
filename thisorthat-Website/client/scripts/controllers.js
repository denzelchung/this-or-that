'use strict';

angular.module('confusionApp')

.controller('QuestionTimelineController', ['$scope', '$localStorage', '$window', 'Questions', 'Votes', 'AuthFactory', 'ngDialog', function ($scope, $localStorage, $window, Questions, Votes, AuthFactory, ngDialog) {
    
    var duplicateVote = false;
    $scope.loggedIn = false;
    $scope.userId = $localStorage.get('$LoopBack$currentUserId', "");
    
    if(AuthFactory.isAuthenticated() && $scope.userId != "") {
        $scope.loggedIn = true;
        
        $scope.doVote = function (questionId, choice) {
            console.log(questionId);
            console.log(choice);
            
            Votes.find()
            .$promise.then(
            function (response) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i].userId == $scope.userId && response[i].questionId == questionId) {
                        // remove vote
                        console.log("USER ALREADY VOTED FOR THIS QUESTION");
                        Votes.deleteById({id: response[i].id})
                        .$promise.then(
                        function (response) {
                            console.log("DELETED VOTE");
                            $window.location.href = '/';
                        },
                        function (response) {
                            console.log("FAILED TO DELETE VOTE");
                        })
                        
                        duplicateVote = true;
                        break;
                    }
                }
                
                if (!duplicateVote) {
                    console.log("VOTING...");
                    Votes.create({choice: choice, questionId: questionId, userId: $scope.userId, questionsId: questionId})
                    .$promise.then(
                    function (response) {
                        $window.location.href = '/';
                    },
                    function (response) {
                        console.log("ERROR WHEN VOTING");
                    });
                }
            },
            function (response) {
                console.log("ERR: " + response);
            });
        };
    }
    
    $scope.showTimeline = false;
    $scope.message = "Loading ...";

    Questions.find()
        .$promise.then(
        function (response) {
            $scope.questions = response;
            $scope.showTimeline = true;
            
            for (var i = 0; i < $scope.questions.length; i++) {
                // initialize votes for each question
                $scope.questions[i].voteThis = 0;
                $scope.questions[i].voteThat = 0;
                
                Questions.votes({id: $scope.questions[i].id})
                .$promise.then(
                    function (responseVotes) {
                        if (responseVotes[0] !== undefined) {
                            for (var j = 0; j < $scope.questions.length; j++) {
                                 if ($scope.questions[j].id == responseVotes[0].questionId) {
                                     $scope.questions[j].votes = responseVotes;
                                     break;
                                 }
                            }
                            
                            for (var k = 0; k < $scope.questions[j].votes.length; k++) {
                                if ($scope.questions[j].votes[k].choice == 0) {
                                    $scope.questions[j].voteThis = $scope.questions[j].voteThis + 1;
                                } else if ($scope.questions[j].votes[k].choice == 1) {
                                    $scope.questions[j].voteThat = $scope.questions[j].voteThat + 1;
                                }
                            }
                        }
                    },
                    function (errResponse) {
                        console.log(errResponse.status + " " + errResponse.statusText);
                    }
                );
            }
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );
}])

.controller('QuestionController', ['$scope', '$stateParams', 'Questions', 'Votes', function ($scope, $stateParams, Questions, Votes) {
    
    $scope.showQuestion = false;
    $scope.message = "Loading ...";

    Questions.findById({id: $stateParams.id})
        .$promise.then(
        function (response) {
            $scope.question = response;
            $scope.showQuestion = true;
            
            $scope.question.voteThis = 0;
            $scope.question.voteThat = 0;
                
            Questions.votes({id: $scope.question.id})
            .$promise.then(
                function (responseVotes) {
                    if (responseVotes[0] !== undefined) {
                        $scope.question.votes = responseVotes;
                        
                        for (var k = 0; k < $scope.question.votes.length; k++) {
                            if ($scope.question.votes[k].choice == 0) {
                                $scope.question.voteThis = $scope.question.voteThis + 1;
                            } else if ($scope.question.votes[k].choice == 1) {
                                $scope.question.voteThat = $scope.question.voteThat + 1;
                            }
                        }
                    }
                },
                function (errResponse) {
                    console.log(errResponse.status + " " + errResponse.statusText);
                }
            );
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    
    // not logged in
    $scope.doVote = function (questionId, choice) {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
}])

.controller('NewQuestionController', ['$scope', '$window', '$localStorage', 'Questions', 'Votes', 'AuthFactory', 'ngDialog', function ($scope, $window, $localStorage, Questions, Votes, AuthFactory, ngDialog) {
    
    $scope.username = '';
    $scope.userId = $localStorage.get('$LoopBack$currentUserId', "");
    
    if(AuthFactory.isAuthenticated() && $scope.userId != "") {
        $scope.username = AuthFactory.getUsername();
        
        $scope.doSubmitQuestion = function() {
            $scope.isDisabled = true;

            Questions.create({description: $scope.description, imageThis: $scope.URLThis, imageThat: $scope.URLThat, userId: $scope.userId, username: $scope.username})
            .$promise.then(
                function (response) {
                    $window.location.href = '/';
                },
                function (response) {
                    console.log("ERROR WHEN CREATING NEW QUESTION!");
                    $scope.isDisabled = false;
                }
            );
        };
    } else {
        $scope.doSubmitQuestion = function () {
            ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
        };
    }
}])



.controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory', function ($scope, menuFactory, favoriteFactory) {

    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showFavorites = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";

    menuFactory.query(
        function (response) {
            $scope.dishes = response;
            $scope.showMenu = true;

        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });

    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.toggleFavorites = function () {
        $scope.showFavorites = !$scope.showFavorites;
    };
    
    $scope.addToFavorites = function(dishid) {
        console.log('Add to favorites', dishid);
        favoriteFactory.save({_id: dishid});
        $scope.showFavorites = !$scope.showFavorites;
    };
}])

.controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    $scope.sendFeedback = function () {


        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
        }
    };
}])

.controller('DishDetailController', ['$scope', '$state', '$stateParams', 'menuFactory', 'commentFactory', function ($scope, $state, $stateParams, menuFactory, commentFactory) {

    $scope.dish = {};
    $scope.showDish = false;
    $scope.message = "Loading ...";

    $scope.dish = menuFactory.get({
            id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $scope.dish = response;
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );

    $scope.mycomment = {
        rating: 5,
        comment: ""
    };

    $scope.submitComment = function () {

        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $state.go($state.current, {}, {reload: true});
        
        $scope.commentForm.$setPristine();

        $scope.mycomment = {
            rating: 5,
            comment: ""
        };
    }
}])

// implement the IndexController and About Controller here

.controller('HomeController', ['$scope', 'menuFactory', 'corporateFactory', 'promotionFactory', function ($scope, menuFactory, corporateFactory, promotionFactory) {
    $scope.showDish = false;
    $scope.showLeader = false;
    $scope.showPromotion = false;
    $scope.message = "Loading ...";
    var leaders = corporateFactory.query({
            featured: "true"
        })
        .$promise.then(
            function (response) {
                var leaders = response;
                $scope.leader = leaders[0];
                $scope.showLeader = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    $scope.dish = menuFactory.query({
            featured: "true"
        })
        .$promise.then(
            function (response) {
                var dishes = response;
                $scope.dish = dishes[0];
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    var promotions = promotionFactory.query({
        featured: "true"
    })
    .$promise.then(
            function (response) {
                var promotions = response;
                $scope.promotion = promotions[0];
                $scope.showPromotion = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
}])

.controller('AboutController', ['$scope', 'corporateFactory', function ($scope, corporateFactory) {

    $scope.leaders = corporateFactory.query();

}])

.controller('FavoriteController', ['$scope', '$state', 'favoriteFactory', function ($scope, $state, favoriteFactory) {

    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showDelete = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";

    favoriteFactory.query(
        function (response) {
            $scope.dishes = response.dishes;
            $scope.showMenu = true;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });

    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.toggleDelete = function () {
        $scope.showDelete = !$scope.showDelete;
    };
    
    $scope.deleteFavorite = function(dishid) {
        console.log('Delete favorites', dishid);
        favoriteFactory.delete({id: dishid});
        $scope.showDelete = !$scope.showDelete;
        $state.go($state.current, {}, {reload: true});
    };
}])

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])
;