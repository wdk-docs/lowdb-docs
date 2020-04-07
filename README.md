# Lowdb

[![](http://img.shields.io/npm/dm/lowdb.svg?style=flat)](https://www.npmjs.org/package/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg?branch=master)](https://travis-ci.org/typicode/lowdb) [![npm](https://img.shields.io/npm/v/lowdb.svg)](https://www.npmjs.org/package/lowdb)

> 小 JSON 数据库节点，电子和浏览器。 技术 Lodash。 :zap:

```js
db.get("posts").push({ id: 1, title: "lowdb is awesome" }).write();
```

## 用法

```sh
npm install lowdb
```

```js
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ posts: [], user: {}, count: 0 }).write();

// Add a post
db.get("posts").push({ id: 1, title: "lowdb is awesome" }).write();

// Set a user using Lodash shorthand syntax
db.set("user.name", "typicode").write();

// Increment count
db.update("count", (n) => n + 1).write();
```

Data is saved to `db.json`

```json
{
  "posts": [{ "id": 1, "title": "lowdb is awesome" }],
  "user": {
    "name": "typicode"
  },
  "count": 1
}
```

You can use any of the powerful [lodash](https://lodash.com/docs) functions, like [`_.get`](https://lodash.com/docs#get) and [`_.find`](https://lodash.com/docs#find) with shorthand syntax.

```js
// For performance, use .value() instead of .write() if you're only reading from db
db.get("posts").find({ id: 1 }).value();
```

Lowdb is perfect for CLIs, small servers, Electron apps and npm packages in general.

It supports **Node**, the **browser** and uses **lodash API**, so it's very simple to learn. Actually, if you know Lodash, you already know how to use lowdb :wink:

- [Usage examples](https://github.com/typicode/lowdb/tree/master/examples)
  - [CLI](https://github.com/typicode/lowdb/tree/master/examples#cli)
  - [Browser](https://github.com/typicode/lowdb/tree/master/examples#browser)
  - [Server](https://github.com/typicode/lowdb/tree/master/examples#server)
  - [In-memory](https://github.com/typicode/lowdb/tree/master/examples#in-memory)
- [JSFiddle live example](https://jsfiddle.net/typicode/4kd7xxbu/)

**Important** lowdb doesn't support Cluster and may have issues with very large JSON files (~200MB).

## 安装

```sh
npm install lowdb
```

Alternatively, if you're using [yarn](https://yarnpkg.com/)

```sh
yarn add lowdb
```

A UMD build is also available on [unpkg](https://unpkg.com/) for testing and quick prototyping:

```html
<script src="https://unpkg.com/lodash@4/lodash.min.js"></script>
<script src="https://unpkg.com/lowdb@0.17/dist/low.min.js"></script>
<script src="https://unpkg.com/lowdb@0.17/dist/LocalStorage.min.js"></script>
<script>
  var adapter = new LocalStorage("db");
  var db = low(adapter);
</script>
```

## API

**low(adapter)**

Returns a lodash [chain](https://lodash.com/docs/4.17.4#chain) with additional properties and functions described below.

**db.[...].write()** and **db.[...].value()**

`write()` writes database to state.

On the other hand, `value()` is just [\_.prototype.value()](https://lodash.com/docs/4.17.4#prototype-value) and should be used to execute a chain that doesn't change database state.

```js
db.set("user.name", "typicode").write();
```

Please note that `db.[...].write()` is syntactic sugar and equivalent to

```js
db.set("user.name", "typicode").value();

db.write();
```

**db.\_**

Database lodash instance. Use it to add your own utility functions or third-party mixins like [underscore-contrib](https://github.com/documentcloud/underscore-contrib) or [lodash-id](https://github.com/typicode/lodash-id).

```js
db._.mixin({
  second: function (array) {
    return array[1];
  },
});

db.get("posts").second().value();
```

**db.getState()**

Returns database state.

```js
db.getState(); // { posts: [ ... ] }
```

**db.setState(newState)**

Replaces database state.

```js
const newState = {};
db.setState(newState);
```

**db.write()**

Persists database using `adapter.write` (depending on the adapter, may return a promise).

```js
// With lowdb/adapters/FileSync
db.write();
console.log("State has been saved");

// With lowdb/adapters/FileAsync
db.write().then(() => console.log("State has been saved"));
```

**db.read()**

Reads source using `storage.read` option (depending on the adapter, may return a promise).

```js
// With lowdb/FileSync
db.read();
console.log("State has been updated");

// With lowdb/FileAsync
db.read().then(() => console.log("State has been updated"));
```

## Adapters API

Please note this only applies to adapters bundled with Lowdb. Third-party adapters may have different options.

For convenience, `FileSync`, `FileAsync` and `LocalBrowser` accept the following options:

- **defaultValue** if file doesn't exist, this value will be used to set the initial state (default: `{}`)
- **serialize/deserialize** functions used before writing and after reading (default: `JSON.stringify` and `JSON.parse`)

```js
const adapter = new FileSync("array.yaml", {
  defaultValue: [],
  serialize: (array) => toYamlString(array),
  deserialize: (string) => fromYamlString(string),
});
```

## 指南

### 如何查询

With lowdb, you get access to the entire [lodash API](http://lodash.com/), so there are many ways to query and manipulate data. Here are a few examples to get you started.

Please note that data is returned by reference, this means that modifications to returned objects may change the database. To avoid such behaviour, you need to use `.cloneDeep()`.

Also, the execution of methods is lazy, that is, execution is deferred until `.value()` or `.write()` is called.

### 从现有的 JSON 文件中读取

If you are reading from a file adapter, the path is relative to execution path (CWD) and not to your code.

```sh
my_project/
  src/
    my_example.js
  db.json
```

So then you read it like this:

```js
// file src/my_example.js
const adapter = new FileSync("db.json");

// With lowdb/FileAsync
db.read().then(() => console.log("Content of my_project/db.json is loaded"));
```

#### 例子

检查`posts`是否存在。

```js
db.has("posts").value();
```

设置 `posts`.

```js
db.set("posts", []).write();
```

排序前五名`posts`。

```js
db.get("posts").filter({ published: true }).sortBy("views").take(5).value();
```

查询 `post` 标题.

```js
db.get("posts").map("title").value();
```

获取`posts`的数量。

```js
db.get("posts").size().value();
```

使用路径获得第一个`POST`标题.

```js
db.get("posts[0].title").value();
```

更新`POST`。

```js
db.get("posts").find({ title: "low!" }).assign({ title: "hi!" }).write();
```

移除 `posts`.

```js
db.get("posts").remove({ title: "low!" }).write();
```

删除属性。

```js
db.unset("user.name").write();
```

`posts`的深克隆。

```js
db.get("posts").cloneDeep().value();
```

### 如何使用基于 ID 的资源

Being able to get data using an id can be quite useful, particularly in servers. To add id-based resources support to lowdb, you have 2 options.

[shortid](https://github.com/dylang/shortid) is more minimalist and returns a unique id that you can use when creating resources.

```js
const shortid = require("shortid");

const postId = db
  .get("posts")
  .push({ id: shortid.generate(), title: "low!" })
  .write().id;

const post = db.get("posts").find({ id: postId }).value();
```

[lodash-id](https://github.com/typicode/lodash-id) provides a set of helpers for creating and manipulating id-based resources.

```js
const lodashId = require("lodash-id");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

db._.mixin(lodashId);

// We need to set some default values, if the collection does not exist yet
// We also can store our collection
const collection = db.defaults({ posts: [] }).get("posts");

// Insert a new post...
const newPost = collection.insert({ title: "low!" }).write();

// ...and retrieve it using its id
const post = collection.getById(newPost.id).value();
```

### 如何创建自定义适配器

`low()` accepts custom Adapter, so you can virtually save your data to any storage using any format.

```js
class MyStorage {
  constructor() {
    // ...
  }

  read() {
    // Should return data (object or array) or a Promise
  }

  write(data) {
    // Should return nothing or a Promise
  }
}

const adapter = new MyStorage(args);
const db = low(adapter);
```

See [src/adapters](src/adapters) for examples.

### 如何对数据进行加密

`FileSync`, `FileAsync` and `LocalStorage` accept custom `serialize` and `deserialize` functions. You can use them to add encryption logic.

```js
const adapter = new FileSync("db.json", {
  serialize: (data) => encrypt(JSON.stringify(data)),
  deserialize: (data) => JSON.parse(decrypt(data)),
});
```

## 更新日志

See changes for each version in the [release notes](https://github.com/typicode/lowdb/releases).

## 范围

Lowdb is a convenient method for storing data without setting up a database server. It is fast enough and safe to be used as an embedded database.

However, if you seek high performance and scalability more than simplicity, you should probably stick to traditional databases like MongoDB.

## 执照

MIT - [Typicode :cactus:](https://github.com/typicode)
