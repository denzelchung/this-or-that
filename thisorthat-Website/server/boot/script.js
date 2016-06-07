module.exports = function (app) {
    var cloudantDB = app.dataSources.cloudant;
    
    cloudantDB.automigrate('User', function (err) {
        if (err) throw (err);
        var User = app.models.User;
        
        User.find({where: {username: 'Admin'}, limit: 1}, function (err, users) {
            // create admin user if doesn't exist
            if (!users) {
                User.create([{username: 'Admin', email: 'admin@admin.com', password: 'abcdef'}, {username: 'test', email: 'test@test.com', password: 'test'}], function (err, users) {
                    if (err) throw (err);
                    var Role = app.models.Role;
                    var RoleMapping = app.models.RoleMapping;
                    
                    // create admin role
                    Role.create({name: 'admin'}, function (err, role) {
                        if (err) throw (err);
                        role.principals.create({
                            principalType: RoleMapping.USER,
                            principalId: users[0].id
                        }, function (err, principal) {
                            if (err) throw (err);
                        });
                    });
                });
            }
        });
    });
};