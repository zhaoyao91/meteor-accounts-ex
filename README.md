# AccountsEx 

New accounts layer to support uniform styles of email, phone and external services.

## features

common:

- based on and replace Accounts

client:

- uniform styles of email, phone, external services
- support sendVerifyCode, createUser, login/logout, link/unlink 

server:

- configurable link/unlink strategies
- configurable email/sms send methods
- configurable rate limit
- configurable verify code options
- helpers to support customized logic

## api

client:  
todo

server:  
todo

## concept

### verify code

The main purpose of verify code is to verify that the user **indeed** holds the account of some service.  
There are some **types** of verify code, you can send them via different **ways** and for different **actions**(purposes).

**types**

- email
- phone

**ways**

- email: via email
- phone: via sms (may add more in the future)

**actions**

Up to you. By defining your actions, you can control the verify code options(format, ttl) and how to send the them by 
different actions.

### strategies

Some actions can be controlled by customizing the corresponding strategies. These actions are: 

- linkEmail: {userId, email, verified}
- unlinkEmail: {userId, email}
- linkPhone: {userId, phone, verified}
- unlinkPhone: {userId, phone}
- linkService todo
- unlinkService todo

When you invoke some method, it will check all his strategies one by one. One strategy can determine if this invocation 
is bad or good, and return the data needed to do the action, or, it can just return and let the next strategy to have a try.

Strategy can receive any options, and must return specified data as described before.

You can use `AccountsEx.getStrategies()` on server to get all strategies and add or remove as you like.

There are pre-defined default strategies. You can check the code to see if they are ok for your needs and learn how to use
strategies.

### methods and publications

todo
used to set rate limit

## todo

- think about how to support external service
- think about whether to support username