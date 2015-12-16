// support phone

/**
 * add fields below to Meteor.users (refer to emails)
 * phones - array
 * phones.$.number
 * phones.$.verified
 */

// add index
Meteor.users._ensureIndex({'phones.number': 1}, {unique: 1, sparse: 1});

// publish user phones
Meteor.publish(helpers.publicationPrefix + 'phones', function () {
    if (this.userId) {
        return Meteor.users.find({_id: this.userId}, {fields: {phones: 1}});
    } else {
        this.ready();
    }
});

// register login handle to enable user login with phone + password
(function () {
    const schema = new SimpleSchema({
        phone: helpers.phoneSchemaDef,
        password: {type: helpers.hashedPasswordSchema}
    });
    Accounts.registerLoginHandler('password', function ({phonePassword}) {
        if (!phonePassword) {
            return; // don't handle
        }

        let {phone, password} = phonePassword;
        schema.validate({phone, password});

        // find user linked with this phone
        let user = helpers.findUserByPhone(phone);
        if (!user) {
            throw new Meteor.Error(403, "User not found");
        }

        // check use has set password
        if (!user.services || !user.services.password) {
            throw new Meteor.Error(403, "User has no password set");
        }

        // check password
        return Accounts._checkPassword(
            user,
            password
        );
    });
}());
