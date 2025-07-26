# General Setup

I follow along the Twitter Clone Tutorial project (from the udemy course [100 Hours Web Development Bootcamp](https://www.udemy.com/course/the-web-dev-bootcamp)), but I'll try to do it completely in TypeScript (and with the current versions of the packages at the time I'm doing this tutorial - July 2025).

## My Testdata:

### Users

- username: johndoe, email: johndoe@email.com, pw: 123456
- username: janedoe, email: janedoe@email.com, pw: 123456

... and no, I don't use this passwords anywhere in production environments or with my real accounts ;-) ...

## Setup NodeJS to use Typescript

After `npm init -y` you need to install Typescript by `npm i --save-dev typescript`. After this you should run the following line `npm i -D tsx @types/node @types/express @types/jsonwebtoken`.

1. _tsx_: enables running TypeScript files directly without pre-compiling to JavaScript (I didn't manage to get it running with ts-node which seems to be the natural choice)
2. _@types/node_: Provides TypeScript type definitions for Node.js core modules
3. _@types/express_: Provides TypeScript type definitions for the Express framework
4. _@types/jsonwebtoken_: Provides TypeScript type definitions for the jsonwebtoken package
5. _@types/cookie-parser_: Provides TypeScript type definitions for the cookie-parser package

After this you should run `npx tsc --init` (which will give you the tsconfig.json file in the root folder). There you should set target and module as follows:

```
    "target": "es2020",   /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    ...
    "module": "commonjs",      /* Specify what module code is generated. */
```

### Packages I will use (these might differ from the course because of the usage of TypeScript)

#### bcrypt-ts (instead of _bcryptjs_)

And as bcrypt-ts does not provide a default export you have to import the needed functions direct (in auth.controller.ts): `import { genSalt, hash } from 'bcrpyt-ts';` (and - of course - also use the direct: `const salt = await genSalt(10);`).

## Setup nodemon

In the root folder of the project add a nodemon.json file with this content:

```json
{
  "watch": ["server.ts", "backend/**/*"],
  "ext": "ts",
  "exec": "tsx backend/server.ts"
}
```

This will watch for all changes of server.ts and all ts files under the backend directory (and it's sub directories). And if it detects that one of these files were changed it will execute tsx backend/server.ts (which basically restarts our Application server).

With this json the script for dev in package.json becomes as simple as `"dev": "nodemon",`.

# Express with TypeScript

We can define our controller functions for the different routes following this pattern:

```ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const signUp = async (
  req: Request,
  res: Response,
  //next?: NextFunction, // - this does not work
  //err?: ErrorRequestHandler // - this does not work
) => {
  ...
};
```

_THIS DOES NOT WORK: As you not always will have a next function or an error handler, you should define them as optional (which is done by the `?` after the name of the corresponding parameter)._ So I had to remove the next? and the err? parameter. For now I don't know how I will handle those, where I need them.

This scenario works as long as we have no need to extend the request or the response with additional data. We will cover how to face this issue, when we first need to (and to use the full strength of TypeScript we will have to give at least the response a proper type (so it will warn us, if you try to access an attribute which should not be in the given response).

## Typed body or route params or query params

The `Request` and the `Response` are generic types. You can "sharpen" them by adding additional information, for example this is the "real" definition of the Request interface:

```ts
    interface e.Request<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = QueryString.ParsedQs, Locals extends Record<string, any> = Record<string, any>>
```

Which is quite complex. It has a type for the route params, one for the response body, one for the request body, one for the query strings and a "Locals" (where I don't have an idea what it is used for).

If we only want to type the body, we can define our own type (based on this complex one):

```ts
export interface TypedRequestBody<T> extends Express.Request {
  body: T; // body refers to req.body - if you name the request parameter as req
}
```

Now we can break down the `req: Request` line to something like this: `req: TypedRequesBody<{fullName:string,username:string}>` and this will give you type safety: if you write `const { fullName, username, email } = req.body;` you will get an TypeScript error telling you, that email is not defined for req.body.

Right now I don't know, how we should structure all this information:

- Should we define an interface for each body of each possible request or should we go with the "inline syntax" in the paragraph above).
- Should we collect these interfaces in a seperate file? And if so, should we have one file per Router or one for the whole application?
- ...

### Typing the Response

For the Response the previous approach didn't work, but the Response Type of express itself is a generic, where the body of the response is the parameter. So you can use `Response<{fullName:string,username:string}>` if you want to return the same body structure.

# Error handling with Typescript

If you have a try catch block and don't know the type of the error that might occur, it is best to type the error as `unknown` in the `catch(error:unknown) { ... }`. Inside the catch block you can test for the different types of errors with instanceof (e.g. `if (error instanceof MongooseError) { /* here you know that error is of type MongooseError and it is safe to use all the attributes and methods of a MongooseError */ })`.

Another possibility is to test for a particular attribute or method (and eventually also for its type): `if (error instanceof Error && 'message' in error && typeof error.message === 'string') { /* here you know that the error object is of type Error and has an attribute message and that it is of type string */ }`.

It is generally a good practice to put a type guard around the catch content to check if error is an instance of Error (otherwise you can't even check for an attribute - as long as error is of type "unknown):

```ts
catch (error) {
  if (error instanceof Error) {
    // the real catch routine
  } else {
    // maybe a fallback? like: console.log('Got this in the catch block - but it is not an error:',error);
  }
}
```

# Mongoose with TypeScript

You can find the official documentation about [Mongoose and TypeScript](https://mongoosejs.com/docs/typescript.html) at the homepage of mongoose.

## Defining a model with references to (other) models

Mongoose infers the type of the schema, but it has some limitations so it is best practice to define an interface for the schema. When the schema has references to (other) mongoDB documents you should use the ObjectId type from mongoose, e. g. the definition of the user schema can be written this way:

```ts
import mongoose, { ObjectId, Types } from 'mongoose';

interface IUser {
  username: string;
  ...
  followers?: ObjectId[];
  ...
}
export type IUserWithId = IUser & { _id: Types.ObjectId }; // add the _id attribute to the IUser interface (this type we will get back from mongoose for User objects in the database)

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    ...
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
    ],
  } as const,
  { timestamps: true}
);

const User = mongoose.model<IUser>('User',userSchema);
```

The followers are technically optional, because required is not set to true - but because of the default value it will always exist. I'm not sure if you should define the attribute as optional or not in the interface (I will go with defining it as optional and look if I ran into problems caused by this procedure).

The documentation recommends to add `as const` in the schema definition and they also type the mongoose.model with the same interface which was used in the schema definition.

## Enabling "automatic" versioning (not TypeScript related)

MongoDB (or mongoose?) comes with an integrated versioning of documents. By default each document has an attribute \_\_v (which is an integer and defaults to 0). The idea is, to increment this number at each save of the document - but this is not done automatically. You have to take two steps to make this happen:

1. you need to add the versionKey property in the options of the schema
2. you need a middleware to increase the versionKey before saving it to the database

```typescript
const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    ...
  } as const,
  { timestamps: true, versionKey: '__v' }
);
// increase __v at every save
userSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.__v += 1;
  }
  next();
});
```

You can also define a "custom" versionKey (e.g. `revision`) - then you have to add the attribute to the document schema as well: `{revision:{ type: Number, default: 0 }` and also adapt the middleware to use this attribute.

For more information about the Mongoose Versioning see this [article](https://moldstud.com/articles/p-harnessing-mongoose-best-practices-for-effective-versioning-of-your-models).

I've added the versioning of the user documents for reference purpose (maybe I will later add the VersionHistorySchema as well - which enables you to also see the historic versions of the document).

## Defining a model with an attribute which is an enum

To define an attribute in the model, which is an enum you first define the TypeScript enum (and export it, because you will use it in other files too), e.g.:

```typescript
export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
}
```

Then you can use this enum in the schema definition (and because our enum values are strings the type of the attribute is `String`. If it were numbers the type would be `Number`)

```typescript
    type: {
      type: String,
      required: true,
      enum: NotificationType,
    },
```

# Typing Express Responses body with reference to the database design

Therefore I added a types.ts file for each route "group" (in the beginning only auth). Within this file I declare the types for the controllers respones body types. In the auth part these types correspond with the IUserWithId type (but without the password, because we don't want to send this back to the client). I use the _Omit_ utility type for this (`Omit<IUserWithId,'password'>`).

Additional I declared an ApplicationError interface (so I can extend the informations, which will be returned by the application in a central place - `express.types.ts`):

```typescript
export interface ApplicationError {
  error: string;
}
```

In the controller file I use `res: Response<IUserAsResponse | ApplicationError>` (maybe it would be better to define an type for the union with the ApplicationError type and call it ApplicationResponse - which should be a generic taking the type of the "normal" response. With this you don't have to do the union with the ApplicationError everytime yourself and maybe later we want to add more information ...)

```typescript
interface ApplicationResponse<T> extends Response<T | ApplicationError> {}
```

Here we say, that the body of the response should be either of type T (the "normal" case if no error occurs) or of type ApplictionError (which only allows - at the moment - one error attribute which has to be a string).

It took some time(and the help of two AIs) to figure out how to achieve this - because I first didn't realize, that the ApplicationError is also "only" the type of the body not the type of the complete response (so I've started with something like `interface ApplicationResponse<T> extends Response<T>|ApplicationError {}` - which throws some TypeScript errors at you and whenever you try to "work around" these you get new ones).

Beside the ApplicationError interface (which defines a body for an express response) I also defined a IMessageAsResponse (which defines a message:string as body for an express response). I've added this definition to the express.types.ts because it is generic - and not specific to a single route "group" (like `IUserAsResponse` is - and so it is located in `auth.types.ts`).

# Cookies in Express Request (in combination with TypedRequestBody)

Right now - as we only have one cookie (jwt) I allow each TypedRequestBody to have an attribute cookie which might contain a jwt as a string. If we have different cookies in different requests we could make the cookies also a type parameter (like we did for the body).

```typescript
export interface TypedRequestBody<T> extends Express.Request {
  cookies: { jwt?: string };
  body: T;
}
```

# Params in Express Request (in combination with TypedAuthorizedRequestBody)

The next extension to the TypedAuthorizedRequestBody is the possibility to process route params. To avoid a new type I've changed the TypedAuthoroizedRequestBody a little bit with a second type parameter (which defaults to an empty object - in case no route parameters are present in the given route and to keep the auth routes - which don't have a route parameter - fully functional without a change).

```typescript
export interface TypedAuthorizedRequestBody<T, P = {}> extends Express.Request {
  cookies?: { jwt?: string };
  user?: IUserAsResponse;
  body: T;
  params: P;
}
```

# Modifications to the source code (which were not obvious to me)

In this section I note the modifications which I needed to make to the source code because of the usage of TypeScript. If I figured out a general rule of the modification I have also noted this somewhere above. If it is a "single" noteworthy modification I will document them here (a section for each file and within this a subsection for each function). If I had to do the same modification multiple times I'm not sure if I post all occurences of this particular modification inside this readme. And maybe I will put this modifications into a separate file for the front- and the backend (depending how long this section will be at the end).

## user.controller.ts

### followUnfollowUser function

I had a little typing problem with `import("mongoose").Types.ObjectId` and `import("mongoose").Schema.Types.ObjectId` (the followers and following are an Array of the second, but the \_id of the currentUser is of the first type). The only way to get around this (for me) was to change the type of the userToModify, so that the followers match the first type. To do so, we must Omit the original followers type definition and add a new one to the userToModify. Maybe this will lead to a trouble later on (when I want to save the userToModify).

```typescript
const userToModify = (await User.findById(id)) as Omit<
  IUserAsResponse,
  'followers'
> & {
  followers: Types.ObjectId[];
};
```

## notification.model.ts

I've decided to implement the comment interface as a "standalone" interface (but within the notification.model.ts file), because I think it might be useful (later on).

## post.controller.ts

In the **commentOnPost** controller function TypeScript get's struggled to sort out Types.ObjectId and ObjectId. I was not able to figure out a way to get this correct - without changing the ObjectId to Types.ObjectId in all the interfaces. So I've decided to expect this error (when it comes to create a new comment):

```typescript
const comment = { user: new Types.ObjectId(userId), text };
// @ts-expect-error
post.comments.push(comment);
```

In addition I've also added a notification for a new comment (which is - beside a new value in the NotificationType enum mainly the same as the notification for the following/unfollowing of a user). While testing this implementation I've realised that the current code allows a comment on your own post. I'm not sure, if this is a good decission, but I'll go with it (but in this case no notification will be sent, because you know that you commented your post ...).

In the **likeUnlikePost** I've struggled again with Types.ObjectId and Schema.Types.ObjectId - but didn't find away around (except using @ts-ignore two times).

For the function **getUserPosts** I've created a stripped down User type (`IForeignUser` defined in `types/user.types.ts`) where I omit "secret" attributes:

```typescript
export type IForeignUser = Omit<
  IUserWithId,
  'username' | 'password' | 'email' | 'likedPosts'
>;
```

In the `post.controller.ts` I've created a type for the populated posts `IPopulatedPost`:

```typescript
interface IPopulatedPost {
  _id: Types.ObjectId;
  user: IForeignUser;
  likes: IForeignUser[];
  comments: (ICreateComment & { user: IForeignUser })[];
  text: string;
  img: string;
  // createdAt: Date;
  // updatedAt: Date;
  __v: number;
}
```

But this does not match exactly what I get back from my mongoDB search and so I ended with one more `// @ts-expect-error` (above the return statement) in the **getUserPosts**.
