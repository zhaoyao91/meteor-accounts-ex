/**
 * verify code system
 * help you verify that the use indeed hold the account of some service
 */

// schema:
// _id: (type key code)
// expiredAt: Date
let collection = new Mongo.Collection('accounts_ex_verify_codes');
collection._ensureIndex({expiredAt: 1}, {expireAfterSeconds: 0}); // auto remove expired code

let nid = Npm.require('nid');

VerifyCodes = {
    /**
     * create a verify code
     * @param type - such as: email、phone……
     * @param key - target to be verified
     * @param ttl - valid duration, by ms
     * @param {Number | Object} [options] - nid options, refer to https://www.npmjs.com/package/nid#options
     * @return {String} code - generated verify code
     */
    create({type, key, ttl, options}) {
        let code = _.isObject(options) ? nid(options)() : nid(options);
        let id = buildId(type, key, code);
        let expiredAt = new Date((new Date).getTime() + ttl);

        collection.upsert({_id: id}, {$set: {expiredAt: expiredAt}});

        return code;
    },

    /**
     * do verification
     * if ok, remove the code
     * @param type
     * @param key
     * @param code
     * @return {Boolean} result
     */
    verify({type, key, code}) {
        let id = buildId(type, key, code);
        let doc = collection.findOne(id);
        if (!doc) return false;

        let expiredAt = doc.expiredAt;
        collection.remove(doc._id);

        return new Date < expiredAt;
    }
};

function buildId(type, key, code) {
    return `${type}:${key}:${code}`;
}