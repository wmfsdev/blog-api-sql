# BLOG API

LIVE: [https://wheres-wally-frontend-xi.vercel.app/](https://wheres-wally-frontend-xi.vercel.app/)<br>
BACKEND REPO: [https://github.com/wmfsdev/wheres-wally-backend](https://github.com/wmfsdev/wheres-wally-backend)<br>
FRONTEND REPO: [https://github.com/wmfsdev/wheres-wally-frontend](https://github.com/wmfsdev/wheres-wally-frontend)

## OUTLINE

This project consists of an API accessible via two separate frontends to create a blogging platform with both a content management system for an administrative user (the blogger) and a public site for viewing blog content with optional account creation to allow for posting comments. The primary focus of this project is the creation of an API that can serve JSON to potentially any request origin but with protected routes for a privileged admin user *and* standard users who have created their own accounts.

The CMS begins with a login portal requiring a username and password wherein the admin user can do the following: create brand new blog posts, retrieve and edit previously saved posts as well as toggle their publication status to add/remove visibility from the public site. The public facing site allows anyone to view the blog content but optional account creation also provides the ability to leave comments on individual posts with their registered username (and secured with password).<br><br>

## IMPLEMENTATION

[![JS](https://img.shields.io/badge/-JAVASCRIPT-000?style=for-the-badge&logo=javascript&logoColor=F0DB4F)](#) [![EXPRESS](https://img.shields.io/badge/-express-000?style=for-the-badge&logo=express)](#) [![REACT](https://img.shields.io/badge/react-black?style=for-the-badge&logo=react&)](#) [![VITE](https://img.shields.io/badge/vite-black?style=for-the-badge&logo=vite&)](#) [![PRISMA](https://img.shields.io/badge/postgres-black?style=for-the-badge&logo=postgresql&)](#) [![PRISMA](https://img.shields.io/badge/prisma-black?style=for-the-badge&logo=prisma&)](#) [![PASSPORT](https://img.shields.io/badge/passport-black?style=for-the-badge&logo=passport&)](#) 

To achieve the above functionality the server uses an Express framework to serve up a REST API (to be consumed by two separate React frontends) with blog content and user data stored server side in a PostreSQL database using Prisma ORM.

The key concern for the backend was how to create an API that would be publicly available whilst also providing protected routes for limiting certain types of interactions with the API depending on the request origin, authentication outcome and authorisation status. Below is a table of privileged actions available to different user types:

| ROLE            | PRIVILEGES                        | RESOURCE              | ORIGIN |
| --------------- | --------------------------------- | --------------------- | ------ |
| ADMIN           | CREATE, UPDATE, DELETE            | Blog Post             | CMS    |
|                 | READ: published *and* unpublished | Blog Post             | CMS    |
| REGISTERED USER | CREATE, DELETE                    | Blog Comment          | -      |
|                 | READ: published	only              | Blog Post             | -      |
| ANY USER        | READ: published only              | Blog Post and Comment | -      |

## Account Creation

For this application users need to know their accounts are safe and secure, that they are the only person with access, but without continually being required to authenticate with every site visit and every privileged action taken. To achieve this passwords need to remain readily accessible yet secure and obfuscated at all times. For such a task I will be using JWTs.

To create an account the user can sign-up by submitting a username and password. The submitted password undergoes a hashing algorithm utilising the bcrypt library and is stored server side, along with the plaintext username. At the same time a web token is created using the jsonwebtoken library, signed with a payload (user ID , username and user role) and *secret* (accessed via a secured environment variable), and sent back to the client ready for future authentication requests.

## Authentication and Authorisation

For authentication and authorisation I utilised a combination of state and stateless methods with the aid of PassportJS and two of its (many) auth *strategies*: local and JWT. 

The following are the API's protected routes:

| METHOD | ROUTE                      | STRATEGY |
| ------ | -------------------------- | -------- |
| POST   | /login-form                | local    |
| POST   | /articles                  | jwt      |
| POST   | /articles/:id/comments     | jwt      |
| PUT    | /articles/:id              | jwt      |
| DELETE | /articles/:id              | jwt      |
| DELETE | /articles/:id/comments/:id | jwt      |

The 'local' strategy is invoked upon login and requires a call to the database to verify the user submitted password against the stored password hash with a successful match generating and returning a web token for the client. This token now assumes authentication responsibility, it can be attached in the authorisation header for all future requests, except these requests are verified exclusively by the API (no database calls) via the 'jwt' strategy. This persists until the user either manually logs out or the token expires. The decision to pursue this approach was in recognising the benefits of reduced database usage, both requests made and data storage, but also in wanting to gain familiarity with authentication middleware for an Express based app. To this extent I could see that Passport would allow for a seamless switch between two strategies that would fulfil the aforementioned needs of both a state *and* stateless system.

The use of JWTs also makes it simple to determine if the authenticated user has the authorisation to perform specific actions since the assigned role type, "user" or "admin", is part of the data baked into the token's payload. This role is checked for in the routes respective controller. In addition, privileged actions taken against a resource exclusive to the admin (i.e. a blog post) can only be carried out if the request origin is that of the CMS site address.

## PRISMA SCHEMA

![image](https://github.com/user-attachments/assets/9c397373-c529-4293-8af3-0acb765e4d0e)

## ADDITIONAL NOTES

The methods described above are suitable for securing user accounts and protecting API routes, but for more general site security concerns I am utilising Prisma's ORM methods for generating parameterised queries to prevent SQL injection and DOMPurify for sanitising *potentially* dangerous HTML to deal with XSS attacks. The latter I have implemented in both of the blogging platform's frontends where the HTML only needs escaping in it's execution context.


| ROLE            | PRIVILEGES                                          | RESOURCE              |
| --------------- | --------------------------------------------------- | --------------------- |
| ADMIN           | CREATE, UPDATE, DELETE, READ (includes unpublished) | Blog Post             |
| REGISTERED USER | CREATE, DELETE, READ (published only)               | Blog Comment          |
| ANY USER        | READ (published only)                               | Blog Post and Comment |
