const prefix = 'AccountsEx.methods.'; // methods prefix

AccountsEx = {
    logout() {
        Meteor.logout();
    },

    /**
     * reset password
     *
     * @pre
     * user is login
     * old password is right
     *
     * @post
     * reset password
     * invalid all other sessions
     *
     * @param oldPassword
     * @param newPassword
     * @param [callback]
     */
    resetPassword(oldPassword, newPassword, callback) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-login', 'you must login');
        }
        callback = ensureCallback(callback);
        oldPassword = AccountsEx._hashPassword(oldPassword);
        newPassword = AccountsEx._hashPassword(newPassword);
        Accounts.callLoginMethod({
            methodName: prefix + 'resetPassword',
            methodArguments: [{oldPassword, newPassword}],
            userCallback: callback
        })
    },

    // todo uniform login method

    _hashPassword(password) {
        if (!_.isString(password)) throw new Error('plaintext password must be a string');
        return Accounts._hashPassword(password);
    }
};

// about email

_.extend(AccountsEx, {
    /**
     * send email verify code
     * @param email
     * @param action
     * @param [callback]
     */
    sendEmailVerifyCode(email, action, callback) {
        callback = ensureCallback(callback);
        Meteor.call(prefix + 'sendEmailVerifyCode', {email, action}, callback);
    },

    /**
     * create user by verifying email
     *
     * @pre
     * verify code is valid
     * email is not linked with any user
     *
     * @post
     * create user
     * login user
     *
     * @param email
     * @param code
     * @param password
     * @param callback
     */
    createUserWithEmail(email, code, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        Accounts.callLoginMethod({
            methodName: prefix + 'createUserWithEmail',
            methodArguments: [{email, password, code}],
            userCallback: callback
        });
    },

    /**
     * login with email and password
     * @param email
     * @param password
     * @param [callback]
     */
    loginWithEmail(email, password, callback) {
        Meteor.loginWithPassword(email, password, ensureCallback(callback));
    },

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
     *
     * @param email
     * @param code
     * @param newPassword
     * @param [callback]
     */
    resetPasswordWithEmail(email, code, newPassword, callback) {
        newPassword = AccountsEx._hashPassword(newPassword);
        callback = ensureCallback(callback);
        Accounts.callLoginMethod({
            methodName: prefix + 'resetPasswordWithEmail',
            methodArguments: [{email, newPassword, code}],
            userCallback: callback
        })
    },

    /**
     * link email with default strategy
     * @param email
     * @param code
     * @param password
     * @param callback
     */
    linkEmail(email, code, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        return AccountsEx._linkEmail({type: 'default', email, code, password}, callback);
    },

    /**
     * unlink email with default strategy
     * @param email
     * @param code
     * @param password
     * @param callback
     */
    unlinkEmail(email, code, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        return AccountsEx._unlinkEmail({type: 'default', email, code, password}, callback);
    },

    /**
     * link email with some user
     * user can customize the strategy
     * @param options
     * @param callback
     * @private
     */
    _linkEmail(options, callback) {
        Meteor.call(prefix + '_linkEmail', options, ensureCallback(callback));
    },

    /**
     * unlink email with some user
     * user can customize the strategy
     * @param options
     * @param callback
     * @private
     */
    _unlinkEmail(options, callback) {
        Meteor.call(prefix + '_unlinkEmail', options, ensureCallback(callback));
    }
});

// about phone

_.extend(AccountsEx, {
    /**
     * send phone verify code via sms
     * @param phone
     * @param action
     * @param [callback]
     */
    sendPhoneVerifyCodeViaSMS(phone, action, callback) {
        callback = ensureCallback(callback);
        Meteor.call(prefix + 'sendPhoneVerifyCodeViaSMS', {phone, action}, callback);
    },

    /**
     * create user by verifying phone
     *
     * @pre
     * verify code is valid
     * phone is not linked with any user
     *
     * @post
     * create user
     * login user
     *
     * @param phone
     * @param code
     * @param password
     * @param callback
     */
    createUserWithPhone(phone, code, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        Accounts.callLoginMethod({
            methodName: prefix + 'createUserWithPhone',
            methodArguments: [{phone, password, code}],
            userCallback: callback
        });
    },

    /**
     * login with phone and password
     * @param phone
     * @param password
     * @param [callback]
     */
    loginWithPhone(phone, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        Accounts.callLoginMethod({
            methodArguments: [{phonePassword: {phone, password}}],
            userCallback: callback
        })
    },

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
     *
     * @param phone
     * @param code
     * @param newPassword
     * @param [callback]
     */
    resetPasswordWithPhone(phone, code, newPassword, callback) {
        newPassword = AccountsEx._hashPassword(newPassword);
        callback = ensureCallback(callback);
        Accounts.callLoginMethod({
            methodName: prefix + 'resetPasswordWithPhone',
            methodArguments: [{phone, newPassword, code}],
            userCallback: callback
        })
    },

    /**
     * link phone with default strategy
     * @param phone
     * @param code
     * @param password
     * @param callback
     */
    linkPhone(phone, code, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        return AccountsEx._linkPhone({type: 'default', phone, code, password}, callback);
    },

    /**
     * unlink phone with default strategy
     * @param phone
     * @param code
     * @param password
     * @param callback
     */
    unlinkPhone(phone, code, password, callback) {
        password = AccountsEx._hashPassword(password);
        callback = ensureCallback(callback);
        return AccountsEx._unlinkPhone({type: 'default', phone, code, password}, callback);
    },

    /**
     * link phone with some user
     * user can customize the strategy
     * @param options
     * @param callback
     * @private
     */
    _linkPhone(options, callback) {
        Meteor.call(prefix + '_linkPhone', options, ensureCallback(callback));
    },

    /**
     * unlink phone with some user
     * user can customize the strategy
     * @param options
     * @param callback
     * @private
     */
    _unlinkPhone(options, callback) {
        Meteor.call(prefix + '_unlinkPhone', options, ensureCallback(callback));
    }
});

// about external service

_.extend(AccountsEx, {
    loginWithService() {

    },

    linkService() {

    },

    unlinkService() {

    },

    _linkService() {

    },

    _unlinkService() {

    }
});

function defaultCallback(err) {
    if (err) {
        console.error(err);
    }
}

function ensureCallback(callback) {
    return callback || defaultCallback;
}