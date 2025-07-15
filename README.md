# General Setup

I follow along the Twitter Clone Tutorial Projekt (from the udemy course [100 Hours Web Development Bootcamp](https://www.udemy.com/course/the-web-dev-bootcamp)), but I'll try to do it completely in TypeScript (and with the current versions of the packages at the time I'm doing this tutorial - July 2025).

## Setup NodeJS to use Typescript

After `npm init -y` you need to install Typescript by `npm i --save-dev typescript`. After this you should run the following line `npm i -D tsx @types/node @types/express`.

1. _tsx_: enables running TypeScript files directly without pre-compiling to JavaScript (I didn't manage to get it running with ts-node which seems to be the natural choice)
2. _@types/node_: Provides TypeScript type definitions for Node.js core modules
3. _@types/express_: Provides TypeScript type definitions for the Express framework

After this you should run npx tsc --init (which will give you the tsconfig.json file in the root folder). There you should set target and module as follows:

```
    "target": "es2020",   /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    ...
    "module": "commonjs",      /* Specify what module code is generated. */
```

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

## Express with TypeScript

We can define our controller functions for the different routes following this pattern:

```ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const signUp = async (
  req: Request,
  res: Response,
  next?: NextFunction,
  err?: ErrorRequestHandler
) => {
  ...
};
```

As you not always will have a next function or an error handler, you should define them as optional (which is done by the `?` after the name of the corresponding parameter).

This scenario works as long as we have no need to extend the request or the response with additional data. We will cover how to face this issue, when we first need to (and to use the full strength of TypeScript we will have to give at least the response a proper type (so it will warn us, if you try to access an attribute which should not be in the given response).

## Error handling with Typescript

If you have a try catch block and don't know the type of the error that might occur, it is best to type the error as `unknown` in the `catch(error:unknown) { ... }`. Inside the catch block you can test for the different types of errors with instanceof (e.g. `if (error instanceof MongooseError) { /* here you know that error is of type MongooseError and it is safe to use all the attributes and methods of a MongooseError */ })`.

Another possibility is to test for a particular attribute or method (and eventually also for its type): `if ('message' in error && typeof error.message === 'string') { /* here you know that the error object has an attribute message and that it is of type string */ }`.
