/**
 * default strategy for linkEmail
 *
 * @pre
 * 1 user login
 * 2 password is right
 * 3 email is not linked with any user
 * 4 user is not linked with any email
 * 5 verify code is valid
 *
 * @param args
 * @param args.type
 * @param args.email
 * @param args.code
 * @param args.password
 */
(function () {
    const schema = new SimpleSchema({
        email: helpers.emailSchemaDef,
        password: {type: helpers.hashedPasswordSchema},
        code: helpers.emailVerifyCodeSchemaDef
    });
    helpers.strategies.linkEmail.default = function (options) {
        if (options.type !== 'default') {
            return undefined; // don't handle
        }

        // check options
        let {email, code, password} = options;
        schema.validate({email, code, password});

        // check user login
        let user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-login', 'you must login');
        }

        // check password
        let result = Accounts._checkPassword(user, password);
        if (result.error) {
            throw result.error;
        }

        // check email is not linked with any user
        let emailUser = helpers.findUserByEmail(email);
        if (emailUser) {
            throw new Meteor.Error('email-already-linked-with-user', 'email is already linked with other user');
        }

        // check user is not linked with any email
        if (user.emails && user.emails.length > 0) {
            throw new Meteor.Error('user-already-linked-with-email', 'user is already linked with other email');
        }

        // check verify code
        result = VerifyCodes.verify({
            type: 'email',
            key: email,
            code: code
        });
        if (!result) {
            throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
        }

        // ok
        return {
            userId: user._id,
            email: email,
            verified: true
        }
    };
}());

/**
 * default strategy for unlinkEmail
 *
 * @pre
 * 1 user login
 * 2 password is right
 * 3 current user is linked with this email
 * 4 verify code is valid
 *
 * @param args
 * @param args.type
 * @param args.email
 * @param args.code
 * @param args.password
 */
(function () {
    const schema = new SimpleSchema({
        email: helpers.emailSchemaDef,
        password: {type: helpers.hashedPasswordSchema},
        code: helpers.emailVerifyCodeSchemaDef
    });
    helpers.strategies.unlinkEmail.default = function (options) {
        if (options.type !== 'default') {
            return undefined; // don't handle
        }

        // check options
        let {email, code, password} = options;
        schema.validate({email, code, password});

        // check user login
        let user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-login', 'you must login');
        }

        // check password
        let result = Accounts._checkPassword(user, password);
        if (result.error) {
            throw result.error;
        }

        // check user is linked with this email
        let emailUser = helpers.findUserByEmail(email);
        if (!emailUser) {
            throw new Meteor.Error('email-not-linked-with-user', 'email is not linked with any user');
        }
        if (emailUser._id !== user._id) {
            throw new Meteor.Error('user-not-linked-with-email', 'user is not linked with this email');
        }

        // check verify code
        result = VerifyCodes.verify({
            type: 'email',
            key: email,
            code: code
        });
        if (!result) {
            throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
        }

        // ok
        return {
            userId: user._id,
            email: email
        }
    };
}());

/**
 * default strategy for linkPhone
 *
 * @pre
 * 1 user login
 * 2 password is right
 * 3 phone is not linked with any user
 * 4 user is not linked with any phone
 * 5 verify code is valid
 *
 * @param args
 * @param args.type
 * @param args.phone
 * @param args.code
 * @param args.password
 */
(function () {
    const schema = new SimpleSchema({
        phone: helpers.phoneSchemaDef,
        password: {type: helpers.hashedPasswordSchema},
        code: helpers.phoneVerifyCodeSchemaDef
    });
    helpers.strategies.linkPhone.default = function (options) {
        if (options.type !== 'default') {
            return undefined; // don't handle
        }

        // check options
        let {phone, code, password} = options;
        schema.validate({phone, code, password});

        // check user login
        let user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-login', 'you must login');
        }

        // check password
        let result = Accounts._checkPassword(user, password);
        if (result.error) {
            throw result.error;
        }

        // check phone is not linked with any user
        let phoneUser = helpers.findUserByPhone(phone);
        if (phoneUser) {
            throw new Meteor.Error('phone-already-linked-with-user', 'phone is already linked with other user');
        }

        // check user is not linked with any phone
        if (user.phones && user.phones.length > 0) {
            throw new Meteor.Error('user-already-linked-with-phone', 'user is already linked with other phone');
        }

        // check verify code
        result = VerifyCodes.verify({
            type: 'phone',
            key: phone,
            code: code
        });
        if (!result) {
            throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
        }

        // ok
        return {
            userId: user._id,
            phone: phone,
            verified: true
        }
    };
}());

/**
 * default strategy for unlinkPhone
 *
 * @pre
 * 1 user login
 * 2 password is right
 * 3 current user is linked with this phone
 * 4 verify code is valid
 *
 * @param args
 * @param args.type
 * @param args.phone
 * @param args.code
 * @param args.password
 */
(function () {
    const schema = new SimpleSchema({
        phone: helpers.phoneSchemaDef,
        password: {type: helpers.hashedPasswordSchema},
        code: helpers.phoneVerifyCodeSchemaDef
    });
    helpers.strategies.unlinkPhone.default = function (options) {
        if (options.type !== 'default') {
            return undefined; // don't handle
        }

        // check options
        let {phone, code, password} = options;
        schema.validate({phone, code, password});

        // check user login
        let user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-login', 'you must login');
        }

        // check password
        let result = Accounts._checkPassword(user, password);
        if (result.error) {
            throw result.error;
        }

        // check user is linked with this phone
        let phoneUser = helpers.findUserByPhone(phone);
        if (!phoneUser) {
            throw new Meteor.Error('phone-not-linked-with-user', 'phone is not linked with any user');
        }
        if (phoneUser._id !== user._id) {
            throw new Meteor.Error('user-not-linked-with-phone', 'user is not linked with this phone');
        }

        // check verify code
        result = VerifyCodes.verify({
            type: 'phone',
            key: phone,
            code: code
        });
        if (!result) {
            throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
        }

        // ok
        return {
            userId: user._id,
            phone: phone
        }
    };
}());