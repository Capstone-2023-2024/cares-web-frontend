# Bootstrapped with Create T3 App [T3 Stack](https://create.t3.gg/)

# **TODO:**

1. `AuthProvider`

- Fix Role handling

2. `Permissions`

- Add options to set section for each year levels
- Add confirmation button in Permission edittable fields
- Optimize UI, `AssignAdviser` share similarities with `AssignMayors` and even some with AssignFaculty

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

|\_libs<br>
|\_web<br>
|**|\_\_**frontend<br>
Planning to move the ContextProviders and api from `web/frontend` into `web/backend`

# References

- Trying to create Dynamic Role Renderer

```
const object: { [x: string]: any } = {
    array: [
      {
        dateCreated: 1234324234234,
      },
    ],
    heading: adminHeadings,
  };

  const specialDateKeys = ["dateCreated", "dateEdited"] as const;
  const specialArrayKeys = ["heading", "array"] as const;
  const specialEditableKeys = ["yearLevel", "section"] as const;

  Object.keys(object).forEach((key) => {
    const typedKey = key as keyof typeof object;
    function handleOutputForSpecialKeys() {
      const arrayKeysResult = specialArrayKeys.filter((props) => key === props);

      if (arrayKeysResult.length > 0) {
        switch (arrayKeysResult[0] as (typeof specialArrayKeys)[0]) {
          case "heading":
            return renderTableHeading(arrayKeysResult);
          default:
            return;
        }
      }
      // return key;
    }

    function renderOtherKeys(props: (typeof object)[number]) {
      const key = Object.keys(props)[0];
      const dateKeysResult = specialDateKeys.filter((props) => key === props);

      if (dateKeysResult.length > 0) {
        const date = new Date();
        date.setTime(Number(props));
        return <p>{formatTime(date)}</p>;
      }
      return <input value={props} onChange={handleState({ key })} />;
    }
  });

  function handleState({ key }: { key: keyof typeof object }) {
    const value = state[key];
    console.log(value);
  }
```
