const prefix = helpers.methodPrefix;

Meteor.methods({
    [prefix + 'resetPassword']: (function(){
        const schema = new SimpleSchema({
            oldPassword: {type: helpers.hashedPasswordSchema},
            newPassword: {type: helpers.hashedPasswordSchema}
        });
        return function({oldPassword, newPassword}) {
            schema.validate({oldPassword, newPassword});
            let self = this;
            return Accounts._loginMethod(
                self,
                prefix + 'resetPassword',
                arguments,
                'password',
                function () {
                    let user = Meteor.user();
                    if (!user) {
                        throw new Meteor.Error('not-login', 'you must login');
                    }

                    // check old password
                    let result = Accounts._checkPassword(user, oldPassword);
                    if (result.error) {
                        throw result.error;
                    }

                    // set new password
                    Accounts.setPassword(user._id, newPassword);

                    // reset token on connection
                    // important!, refer to Accounts.resetPassword
                    Accounts._setLoginToken(user._id, self.connection, null);

                    return {userId: user._id};
                }
            );
        }
    }())
});