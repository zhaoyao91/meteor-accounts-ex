Package.describe({
    name: 'zhaoyao91:accounts-ex',
    version: '0.0.1',
    summary: '',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');
    api.use('ecmascript');
    api.use('mongo', 'server');
    api.use('accounts-password');
    api.use('stevezhu:lodash@3.10.1');
    api.use('aldeed:simple-schema@1.5.0', 'server');

    api.addFiles('lib/VerifyCodes_server.js', 'server');

    api.addFiles('server/helpers.js', 'server');
    api.addFiles('server/support-phone.js', 'server');
    api.addFiles('server/default-strategies.js', 'server');
    api.addFiles('server/methods.js', 'server');
    api.addFiles('server/email-methods.js', 'server');
    api.addFiles('server/phone-methods.js', 'server');
    api.addFiles('server/AccountsEx.js', 'server');

    api.addFiles('client/support-phone.js', 'client');
    api.addFiles('client/AccountsEx.js', 'client');

    api.export('AccountsEx');
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('zhaoyao91:accounts-ex');
    api.addFiles('accounts-ex-tests.js');
});

Npm.depends({
    nid: '0.3.2'
});