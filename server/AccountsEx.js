AccountsEx = {
    methodPrefix: helpers.methodPrefix,
    publicationPrefix: helpers.publicationPrefix,

    setSender(sender) {
        _.extend(helpers.sender, sender);
    },

    /**
     * @param builder - function(type, action): {ttl, length, alphabet}
     */
    setVerifyCodeOptions(builder) {
        helpers.getVerifyCodeOptions = builder;
    },

    /**
     * get all strategies used by this system
     * you can customize them directly
     * @return {Object} strategies - key: action, value: strategies of this action
     */
    getStrategies() {
        return helpers.strategies;
    }
};