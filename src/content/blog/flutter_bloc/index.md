---
title: "Typescript - Tips & Tricks"
summary: "Tips and tricks to write safer code"
date: "Apr 02 2023"
draft: false
tags:
- Typescript
- Tutorial
---


![](https://cdn-images-1.medium.com/max/1600/1*8bMBURfHkM0tZ3n6-txHaA.png)

In this article, we’ll delve into practical examples of using TypeScript to enhance code safety. TypeScript is a programming language that extends JavaScript, acting as a superset of it. It’s only a compile-time language though! So nothing related to types ( such as interfaces, type declaration, type assignment..) is transpiled to JavaScript. Instead it’s a super powerful tool that helps us developers to do less mistakes and thus reduce bugs on runtime.

With that said, let’s embark on our journey to explore the power of TypeScript through practical examples.

**2- Any vs unknown**

```typescript
let a:any = 1;
a = '1'
a = null
a = undefined
a = {}
a = function(){}

// Let's use `a`
a() // we can call it
a.toUpperCase() // we an use string methods on it
a.non_existing_property.nested_non_existing_property // 🤔
```

```typescript
a:unkown = 1;
a = '1'
a = null;
a = undefined
a = {}
a = function(){}

// let's use `a`
a() // error: 'a' is of type 'unknown'.
a.toUpperCase() // error: 'a' is of type 'unknown'.
a.non_existing_property // error 'a' is of type 'unknown'.
```

Did you spot the difference? If so congrats 🎉

If not, no worries it’s super easy.

`any` and `unkown` can be anything. ( string, number, object, function …)

The difference is when you try to use `any` it will represent itself as anything.

When you declare a variable or a function parameter with the `any` type, it essentially means the TypeScript compiler won't enforce any type-checking rules for that variable or parameter. This allows you to use the variable as if it were of any type, such as a string, number, or function, without triggering any type-related errors.

On the other hand, when you declare it as `unkown` the compiler will enforce you to do a type check before using it. `error: 'a' is of type 'unkown'`

Let’s see a practical example:

```typescript
const fetchUsers = async ():Promise<User[]> => {
  try {
    ... call server
  } catch(e){ // e:unkown
     
  }
}
```

In this example, `e` our error is of type unknown. In a modern version of TS, the error type in any catch block is by default `unkown` instead of `any` in previous versions.

Already spotted the reason?

```typescript
// With any
const fetchUsers = async ():Promise<User[]> => {
  try {
    ... call server
  } catch(e:any){ 
     console.error(e.message) // the compiler is happy. 
                              // even if we don't have a property message
                              // on e
   }
}


// With unknown
const fetchUsers = async ():Promise<User[]> => {
  try {
    ... call server
  } catch(e:unknown){ 

     console.error(e.message) // error: 'e' is of type unkown

     // fix
     if(e != null 
        && typeof e ==='object' 
        && 'message' in e 
        && typeof e['message'] === 'string'){
         console.error(e.message) // compiler is happy.
       }
   }
}
```

**3 — Use type predicates in all your Type Guards.**

We’ve seen in the previous example that unknown can not be used unless we check the type before.

```typescript
const fetchUsers = async ():Promise<User[]> => {
  try {
    ... call server
  } catch(e:unknown){ 
     if(e != null 
        && typeof e ==='object' 
        && 'message' in e 
        && typeof e['message'] === 'string'){
         console.error(e.message) // compiler is happy.
       }
   }
}
```

I know it’s a bit messy right? We also might need to check errors in other catch blocks in our code. So we’re not respecting the DRY ( don’t repeat yourself principal)

Let’s make it a bit better:

```typescript
const isErrorWithMessage(e:unkown):boolean {
  return e != null && typeof e ==='object' && 'message' in e 
        && typeof e['message'] === 'string';
}
const fetchUsers = async ():Promise<User[]> => {
  try {
    ... call server
  } catch(e:unknown){ 
     if(isErrorWithMessage(e)){
         console.error(e.message) // error: 'e' is of type 'unknown'.
       }
   }
}
```

wait! why? it was working just fine before refactoring the condition into a function? What happened?

Well, TypeScript, unfortunately, won’t run your function and check what’s inside to make sure you can safely access ‘message’ from an ‘unknown’ type `e` . In the previous example the logic was there, so TS is smart enough to analyze it and treat `e` as an object with a property message of type string. but once we refactor the logic into a function TS can’t do much.

```typescript
type ErrorWithMessage = {
  message:string;
}
const isErrorWithMessage(e:unkown):e is ErrorWithMessage {
  return e != null && typeof e ==='object' && 'message' in e 
        && typeof e['message'] === 'string';
}
const fetchUsers = async ():Promise<User[]> => {
  try {
    ... call server
  } catch(e:unknown){ 
     if(isErrorWithMessage(e)){
         // e: ErrorWithMessage
         console.error(e.message) // error: 'e' is of type 'unknown'.
       }
   }
}
```

This is called the Type Predicate. `e is ErrorWithMessage`

It’s telling TS that if the function returns `true` you should treat `e` as an `ErrorWithMessage` so if we hover on `e` we’ll see that now it’s an `ErrorWithMessage` instead of `unknown`

> But be careful!!! You need to make sure you know what you’re doing inside your Type Guard.

```typescript
type ErrorWithMessage = {
  message:string;
}
const isErrorWithMessage(e:unkown):e is ErrorWithMessage {
  return true;
}
let a:unkown;
if(isErrorWithMessage(a)){
  a // ErrorWithMessage
}
```

If you return true! TS compiler will treat `a` as an `ErrorWithMessage` even if it doesn’t have a message property! It’s our responsibility to have safe type guards.

**4 — Use Satisfies operator to remove the ambiguity**

```typescript
type DbConfigKeys = 'port' | 'username' | 'pool'

export const DBConfiguration:Record<DbConfig, string | number>={
  'username':'root',
  'pool':3,
  'port':8080
}
```

We’re just creating an object of `DbConfiguration` which is a `Record.` A `Record` is just an object that takes as the first Argument the type of `Key` and as a second argument the type of `Value`

In this example our `DbConfiguration` is an object with `Key:DbConfigKeys`   
and the value might be whether a `string` or a `number` .

```typescript
import {DbConfiguration} from '...'
import db from 'db';

const initiDB = async ()=>{
  db.setPort(DBConfiguration.port) // setPort expects a number
 // Argument of type 'string' is not assignable to parameter of type 'number'.
 // Type 'string' is not assignable to type 'number'
  
}
```

The issue here is that all `values` will be inferred as a `string | number`even though we assigned `port` a number and `username`a string.

Why? because when we first initialized `DbConfiguration.` we already gave it a type of `Record<DbConfigKeys, string | number>` which means that the `key` will be of type `DbConfigKeys` and the value will be of type `string | number`. TS won’t take a look inside the object after initialization to infer the exact type of each Value. Instead, it will treat it indefinitely as a `string | number`

We can fix the issue by removing the type assignment

```typescript

export const DbConfiguration ={
  'username':'root',
  'pool':3,
  'port':8080
   // But now we can anything to our object 😢
   'randomProperty':1334343434
}

DbConfiguration.port // number
DbConfiguration.pool // number
DbConfiguration.username // string
```

To fix this we can use the satisfies Operator introduced in TS 4.9

```typescript

type DbConfigKeys = 'port' | 'username' | 'pool'
export const DbConfiguration={
  'username':'root',
  'pool':3,
  'port':8080
   'randomProperty':2333   // error: Object literal may only specify 
                          // known properties, and ''randomProperty'' 
                         // does not exist in type 
                        // 'Record<DbConfigKeys,string | number>

} satisfies :Record<DbConfigKeys, string | number>

DbConfiguration.port // number
DbConfiguration.pool // number
DbConfiguration.username // string
```

We successfully removed the ambiguity and maintained our type safety! We can’t add random values and properties while also having the correct and precise type inference for each value! Amazing 🎉

**5 — Use Generics instead of any**

We usually run into using any whenever we have a function that might accept different parameter types. For example when we want to make a function that filters an array of objects.

```typescript
const filter = (array:any, key:any, value:any)=>{
  return array.filter((item)=>item[key] === value);
}

const arr = [{'name':'hedi', age:24},{'name':'ahmed',age:25}]

filter(arr,'nam','hedi'); // TS can't sport the Typo.
filter(null,'name','ahmed'); // will throw an error on runtime
filter(arr,'name',24); // name is string! but we're filtering by a number
```

Seems familiar?

Let’s use Generics instead! and everything will follow like magic!

```typescript
const filter = <T extends object, Key extends keyof T>(arr:T[],
                                                        key:Key,
                                                        value:T[Key]){
 return arr.filter((item:T)=> item[key] === value);
}

// Here we're trying to make it generic
// 1 - T extends object is a constraint so we only pass objects! no primitve types
// 2 - Key extends keyof T: Key should be one of the keys of T
// 3 - arr:T[] is an array of T
// 4 - key is of type Key which is one of the keys of T
// 5 - value:T[Key] this is called indexed access type to get the value type of
// the key we're passing
```

![](https://cdn-images-1.medium.com/max/1600/1*VsG99yQPYw9HEScXmrr29w.png)

This is how typescript will infer the filter function when we call it with this array below.

```dart
const arr = [{'name':'hedi', age:24},{'name':'ahmed',age:25}]

filter(arr,'name','hedi');

// T is {'name':string, age:number}
// Key is keyof T = 'name' | 'age'
// T[key] is T[Key] = T['name' | 'age'] = string | number
```

Let’s try to call the function again with the same parameters we did before

```dart
const arr = [{'name':'hedi', age:24},{'name':'ahmed',age:25}]

filter(arr,'nam','hedi');
// error:Argument of type '"nam"' is not assignable to parameter of type '"name" | "age"
filter(null,'name','ahmed'); 
// error:Argument of type 'null' is not assignable to parameter of type 'object[]'
filter(arr,'name',24); 
// error:Argument of type 'number' is not assignable to parameter of type 'string'
```

And there you have it! Generics are incredibly powerful, so consider using them instead of the `any` type, which should be avoided whenever possible to maintain type safety and code quality.

**Conclusion**

In this article, we explored practical examples of using TypeScript to enhance code safety and readability. TypeScript, a superset of JavaScript, adds valuable features like type annotations and generics to improve error detection and code maintainability.

Throughout our examples, we demonstrated the power of TypeScript in enforcing type safety and avoiding common pitfalls. We showed how to specify return types, using the `unknown` type instead of `any`, implementing type predicates in type guards, leveraging the `satisfies` operator, and utilizing generics can all contribute to more robust and maintainable code.

In conclusion, TypeScript is a powerful tool for enhancing code safety and readability, but it requires careful use and understanding of its features to maximize its benefits. By embracing TypeScript’s capabilities and avoiding the `any` type whenever possible, you can improve your code quality and maintainability, resulting in more robust and reliable web applications.