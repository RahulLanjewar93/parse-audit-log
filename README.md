
# parse-audit-logger  

A typescript framework that helps you audit log the changes to your parse objects as well as log queries on the objects. 📕📖

---
###  Installation

Simply install the package from the official npm repository 

```
npm install parse-audit-logger
```
---

### Usage

To use parse audit logger in your parse server, you need to create a `AuditLogger` object. Its recommended to create the auditLogger in a seperate file and imported it wherever required.
The constructor takes various options read about the [options] (#options) .

```ts
// utils/audit-logger.ts
export const auditLogger = new AuditLogger();
```

Now you can use `auditLogger.audit()` in your triggers to audit the request.

```ts
// controllers/myClass.ts
import { auditLogger } from '../utils/audit-logger'
    
Parse.Cloud.AfterSave('MyClass', async (req)=>{
    //Do your stuff here
    // .
    // .
    // .

    await auditLogger.audit();
})
``` 

---

#### Important note

If in your parse server `allowClientClassCreation`  is set to `false`, you either need to supply `useMasterKey: true` while creating the AuditLogger object, or else supply the audit schemas by using `getAuditLoggerSchemas` while creating schemas.

```ts
/*
* If allowClientClassCreation is set to false,
* either use masterKey to create the audit objects
*/
const auditLogger = new AuditLogger({
	// ...otherOptions
	useMasterKey:true,
});
	
/*
* Or,supply the returned schemas along with your schemas 
* to your parse server
*/ 
const auditLogger = newAuditLogger();
const auditSchemas = audit.getSchemas();
```

---

### Options 

The options taken by the constructor are given below

| option | description | type  |
|--|--|--|
| onSave | Array of classes that should be audited on save.|array  |
| onFind | Array of classes that should be audited on find. | array |
| onDelete | Array of classes that should be audited on delete.| array|
| useMasterKey | Wether to use master key while saving audit objects. Defaults to `false` | boolean |
| prefix | Prefix string to append to the schema. Defaults to `_Audit`|string  |
| postfix | Postfix string to append to the schema | string |
| parseClient | Parse client to use. Generally Parse is globally available and will be used. | Parse  |

---

### Issues & Contributions

Feel free to create issues 😵‍💫 or ask questions 🤨 in issues tab if you have any. You can also create pull requests 💻 to `main` branch if you have something to contribute. Thanks! 🙏 