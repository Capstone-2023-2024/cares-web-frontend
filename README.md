# Bootstrapped with Create T3 App [T3 Stack](https://create.t3.gg/)

# **TODO:**

- Optimize image by reducing size

```
const URL = "http://localhost:3000/api/file/upload";
const OPTIONS = {
method: "POST",
headers: {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "\*",
},
body: JSON.stringify({ file }),
};
const req = await fetch(URL, OPTIONS);
const output = await req.text();
console.log(output);
const FILE: Buffer = JSON.parse(output);
```

for ~/components/Announcements/PostForm.tsx -> uploadImage()

# Repository Structure:
|_libs<br>
|_web<br>
|__|____frontend<br>
Planning to move the ContextProviders and api from `web/frontend` into `web/backend`
