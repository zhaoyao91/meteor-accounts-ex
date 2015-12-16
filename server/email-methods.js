const prefix = helpers.methodPrefix;

Meteor.methods({

    [prefix + 'sendEmailVerifyCode']: (function () {
        const schema = new SimpleSchema({
            email: helpers.emailSchemaDef,
            action: helpers.actionSchemaDef
        });
        const type = 'email';
        return function ({email, action}) {
            schema.validate({email, action});

            //  create verify code
            const options = helpers.getVerifyCodeOptions(type, action);
            let code = VerifyCodes.create({
                type: type,
                key: email,
                ttl: options.ttl,
                options: _.omit(options, 'ttl')
            });

            helpers.sender.sendEmail(email, action, {code: code, ttl: options.ttl});
        }
    }()),

    /**
     * create user by verifying email
     *
     * @pre
     * verify code is valid
     * email is not linked with any user
     *
     * @post
     * create user
     * set email verified
     * login user
     *
     * @param email
     * @param password
     * @param code
     * @param [callback] - function(err, userId)
     */
    [prefix + 'createUserWithEmail']: (function () {
        const schema = new SimpleSchema({
            email: helpers.emailSchemaDef,
            password: {type: helpers.hashedPasswordSchema},
            code: helpers.emailVerifyCodeSchemaDef
        });
        return function ({email, password, code}) {
            schema.validate({email, password, code});
            let self = this;
            return Accounts._loginMethod(
                self,
                prefix + 'createUserWithEmail',
                arguments,
                "password",
                function () {
                    // check email is not linked with any user
                    let emailUser = helpers.findUserByEmail(email);
                    if (emailUser) {
                        throw new Meteor.Error('email-already-linked-with-user', 'email is already linked with other user');
                    }

                    // verify email
                    let verifyOk = VerifyCodes.verify({
                        type: 'email',
                        key: email,
                        code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                    }

                    // create user
                    let userId = Accounts.createUser({email, password});
                    if (!userId) {
                        throw new Error("createUser failed to insert new user");
                    }

                    // set email verified
                    // as we create user by verify code, the email is thus verified
                    let updateCount = Meteor.users.update({
                        _id: userId,
                        'emails.address': email
                    }, {
                        $set: {
                            'emails.$.verified': true
                        }
                    });
                    if (updateCount !== 1) {
                        Meteor.users.remove(userId);
                        throw new Error('failed to create user');
                    }

                    return {userId};
                }
            );
        }
    }()),

    /**
     * reset password by verifying email
     *
     * @pre
     * verify code is valid
     * email is linked with some user
     *
     * @post
     * reset password
     * invalid all other sessions
     */
    [prefix + 'resetPasswordWithEmail']: (function () {
        const schema = new SimpleSchema({
            email: helpers.emailSchemaDef,
            code: helpers.emailVerifyCodeSchemaDef,
            newPassword: {type: helpers.hashedPasswordSchema}
        });
        return function ({email, code, newPassword}) {
            schema.validate({email, code, newPassword});
            let self = this;
            return Accounts._loginMethod(
                self,
                prefix + 'resetPasswordWithEmail',
                arguments,
                'password',
                function () {
                    // check email is linked with some user
                    let user = helpers.findUserByEmail(email);
                    if (!user) {
                        throw new Meteor.Error('no-user', 'email is not linked with any user');
                    }
                    let isCurrentUser = user._id === Meteor.userId();

                    // check verify code
                    let verifyOk = VerifyCodes.verify({
                        type: 'email',
                        key: email,
                        code: code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                    }

                    // reset password
                    Accounts.setPassword(user._id, newPassword);

                    // if current login user is the user whose password is reset, then reset the connection token
                    if (isCurrentUser) {
                        Accounts._setLoginToken(user._id, self.connection, null);
                    }

                    return {userId: user._id};
                }
            )
        }
    }()),

    /**
     * link email with some user
     * @pre
     * pass some strategy
     * @post
     * link email with some user
     */
    [prefix + '_linkEmail']: (function () {
        return function (options) {
            let result = helpers.checkStrategies('linkEmail', options);
            return helpers.addEmail(result.userId, result.email, result.verified);
        }
    }()),

    /**
     * unlink email with some user
     * @pre
     * pass some strategy
     * @post
     * unlink email with some user
     */
    [prefix + '_unlinkEmail']: (function () {
        return function (options) {
            let result = helpers.checkStrategies('unlinkEmail', options);
            return helpers.removeEmail(result.userId, result.email);
        }
    }())
});