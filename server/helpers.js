helpers = {
    methodPrefix: 'AccountsEx.methods.',

    publicationPrefix: 'AccountsEx.publications.',

    emailSchemaDef: {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },

    phoneSchemaDef: {
        type: String,
        regEx: SimpleSchema.RegEx.Phone
    },

    actionSchemaDef: {
        type: String
    },

    hashedPasswordSchema:new SimpleSchema({
        digest: {
            type: String
        },
        algorithm: {
            type: String
        }
    }),

    emailVerifyCodeSchemaDef: {
        type: String
    },

    phoneVerifyCodeSchemaDef: {
        type: String
    },

    findUserByPhone(phone) {
        return Meteor.users.findOne({'phones.number': phone});
    },

    findUserByEmail(email) {
        return Accounts.findUserByEmail(email);
    },

    addEmail(userId, email, verified) {
        return Accounts.addEmail(userId, email, verified);
    },

    removeEmail(userId, email) {
        return Accounts.removeEmail(userId, email);
    },

    addPhone: (function(){
        const schema = new SimpleSchema({
            userId: {
                type: String
            },
            phone: {
                type: String,
                regEx: SimpleSchema.RegEx.Phone
            },
            verified: {
                type: Boolean
            }
        });
        return function(userId, phone, verified = false) {
            schema.validate({userId, phone, verified});

            let user = Meteor.users.findOne(userId);
            if (!user) {
                throw new Meteor.Error(403, "User not found");
            }

            // if user is already linked with this phone, update it
            let didUpdateOwnPhone = _.any(user.phones, function (phoneData, key) {
                if (phoneData.number === phone) {
                    Meteor.users.update({
                        _id: user._id,
                        'phones.number': phoneData.number
                    }, {
                        $set: {
                            'phones.$.number': phone,
                            'phones.$.verified': verified
                        }
                    });
                    return true;
                }
                return false;
            });

            if (didUpdateOwnPhone) {
                return;
            }

            // link phone
            Meteor.users.update({
                _id: user._id,
                'phones.number': {$ne: phone}
            }, {
                $addToSet: {
                    phones: {
                        number: phone,
                        verified: verified
                    }
                }
            });

            // todo refer to last part of addEmail
        }
    }()),

    removePhone: (function(){
        const schema = new SimpleSchema({
            userId: {
                type: String
            },
            phone: {
                type: String,
                regEx: SimpleSchema.RegEx.Phone
            }
        });
        return function(userId, phone) {
            schema.validate({userId, phone});

            let user = Meteor.users.findOne(userId);
            if (!user) {
                throw new Meteor.Error(403, "User not found");
            }

            Meteor.users.update({_id: user._id}, {$pull: {phones: {number: phone}}});
        }
    }()),

    sender: {
        sendEmail(email, action, vars) {
            console.log('AccountsEx send email', {email, action, vars})
        },

        sendSMS(phone, action, vars) {
            console.log('AccountsEx send SMS', {phone, action, vars})
        }
    },

    /**
     * @param type - email, phone
     * @param action - user defined send verify code actions
     * @returns {{ttl: number, length: number, alphabet: string}}
     */
    getVerifyCodeOptions(type, action) {
        return {
            ttl: 10 * 60 * 1000,
            length: 6,
            alphabet: '1234567890'
        }
    },

    checkStrategies(action, options) {
        let strategyResult = false;

        _.forEach(helpers.strategies[action], (strategy, strategyName) => {
            if (strategy) {
                let result = strategy(options); // if throw, throw
                if (_.isUndefined(result)) {
                    // try next strategy
                }
                else if (!result) {
                    // failed
                    throw new Meteor.Error('failed-to-do-' + action, `failed to do ${action} due to strategy ${strategyName}`);
                }
                else {
                    // ok
                    strategyResult = result;
                    return false;
                }
            }
        });

        if (!strategyResult) {
            throw new Error('no strategy can handle action' + action);
        }

        return strategyResult;
    },

    /**
     * strategy - function(...args): undefined | throw | true | false
     * undefined - handle this request by next strategy
     * throw | false - failed to pass the strategy
     * result - ok
     */
    strategies: {
        linkEmail: {}, // {userId, email, verified}
        unlinkEmail: {}, // {userId, email}
        linkPhone: {}, // {userId, phone, verified}
        unlinkPhone: {}, // {userId, phone}
        linkService: {}, // {userId, serviceName, ...} todo
        unlinkService: {} // {userId, serviceName} todo
    }
};