new accounts layer to support uniform styles of email, phone and external services

### features ###

common:

- abandon username ?
- based on and replace use of Accounts

client:

- uniform styles of email, phone, external services
- support sendVerifyCode, createUser, login/logout, link/unlink 

server:

- configurable link/unlink strategies
- configurable email/sms send methods
- configurable rate limit
- configurable verify code options
- helpers to support customized logic

### api ###

client: todo

server: todo

### concept ###

#### verify code #### 

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

#### strategies ####  
todo

#### methods and publications ####
todo
used to set rate limit