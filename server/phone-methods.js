const prefix = helpers.methodPrefix;

let nid = Npm.require('nid');

Meteor.methods({
    [prefix + 'sendPhoneVerifyCodeViaSMS']: (function () {
        const schema = new SimpleSchema({
            phone: helpers.phoneSchemaDef,
            action: helpers.actionSchemaDef
        });
        const type = 'phone';
        return function ({phone, action}) {
            schema.validate({phone, action});

            //  create verify code
            const options = helpers.getVerifyCodeOptions(type, action);
            let code = VerifyCodes.create({
                type: type,
                key: phone,
                ttl: options.ttl,
                options: _.omit(options, 'ttl')
            });

            helpers.sender.sendSMS(phone, action, {code: code, ttl: options.ttl});
        }
    }()),

    /**
     * create user by verifying phone
     *
     * @pre
     * verify code is valid
     * phone is not linked with any user
     *
     * @post
     * create user
     * set phone verified
     * login user
     *
     * @param phone
     * @param password
     * @param code
     * @param [callback] - function(err, userId)
     */
    [prefix + 'createUserWithPhone']: (function () {
        const schema = new SimpleSchema({
            phone: helpers.phoneSchemaDef,
            password: {type: helpers.hashedPasswordSchema},
            code: helpers.phoneVerifyCodeSchemaDef
        });
        return function ({phone, password, code}) {
            schema.validate({phone, password, code});
            let self = this;
            return Accounts._loginMethod(
                self,
                prefix + 'createUserWithPhone',
                arguments,
                "password",
                function () {
                    // check phone is not linked with any user
                    let phoneUser = helpers.findUserByPhone(phone);
                    if (phoneUser) {
                        throw new Meteor.Error('phone-already-linked-with-user', 'phone is already linked with other user');
                    }

                    // check verify code
                    let verifyOk = VerifyCodes.verify({
                        type: 'phone',
                        key: phone,
                        code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                    }

                    // create user
                    // temperately use username to avoid hacking too much
                    let tempUserName = 'temp_' + nid(12);
                    let userId = Accounts.createUser({
                        username: tempUserName,
                        password: password
                    });
                    if (!userId) {
                        throw new Error('failed to create user');
                    }
                    // add phone and remove username
                    let update = {
                        $push: {
                            phones: {number: phone, verified: true}
                        },
                        $unset: {
                            username: ''
                        }
                    };
                    let updateCount = Meteor.users.update(userId, update);
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
     * reset password by verifying phone
     *
     * @pre
     * verify code is valid
     * phone is linked with some user
     *
     * @post
     * reset password
     * invalid all other sessions
     */
    [prefix + 'resetPasswordWithPhone']: (function () {
        const schema = new SimpleSchema({
            phone: helpers.phoneSchemaDef,
            code: helpers.phoneVerifyCodeSchemaDef,
            newPassword: {type: helpers.hashedPasswordSchema}
        });
        return function ({phone, code, newPassword}) {
            schema.validate({phone, code, newPassword});
            let self = this;
            return Accounts._loginMethod(
                self,
                prefix + 'resetPasswordWithPhone',
                arguments,
                'password',
                function () {
                    // check phone is linked with some user
                    let user = helpers.findUserByPhone(phone);
                    if (!user) {
                        throw new Meteor.Error('no-user', 'phone is not linked with any user');
                    }
                    let isCurrentUser = user._id === Meteor.userId();

                    // check verify code
                    let verifyOk = VerifyCodes.verify({
                        type: 'phone',
                        key: phone,
                        code: code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
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
     * link phone with some user
     * @pre
     * pass some strategy
     * @post
     * link phone with some user
     */
    [prefix + '_linkPhone']: (function () {
        return function (options) {
            let result = helpers.checkStrategies('linkPhone', options);
            return helpers.addPhone(result.userId, result.phone, result.verified);
        }
    }()),

    /**
     * unlink phone with some user
     * @pre
     * pass some strategy
     * @post
     * unlink phone with some user
     */
    [prefix + '_unlinkPhone']: (function () {
        return function (options) {
            let result = helpers.checkStrategies('unlinkPhone', options);
            return helpers.removePhone(result.userId, result.phone);
        }
    }())
});