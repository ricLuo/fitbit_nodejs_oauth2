angular.module('controller',[])

  .controller('ctrler', ['$scope', '$http', function($scope, $http){
  // $scope.authenticate = function(){
  //   $http.get('/fitbit');
  // };

    $http.get('/fb-profile')
      .success(function(data){
        $scope.profile = data;
        if(data!=null){
          $scope.show=true;
        }
      });
    $scope.logout = function(){
      $http.get('/logout')
        .success(function(data){
          $scope.profile = null;
        });
    };

    $scope.show = true;

}]);
