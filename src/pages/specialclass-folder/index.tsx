import React, { useState } from "react";

interface FolderType {
  name: string;
  state: "open" | "close";
  files: string[];
}

const AdminPage = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);

  function createFolder() {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      const newFolderInfo: FolderType = {
        name: folderName,
        state: "close",
        files: [],
      };
      setFolders((previousState) => [...previousState, newFolderInfo]);
    }
  }

  function toggleFolder(index: number) {
    setFolders((previousState) => {
      const holder = [...previousState];
      const selectedFolder = holder[index];
      if (selectedFolder?.state) {
        selectedFolder.state =
          selectedFolder.state === "open" ? "close" : "open";
        holder[index] = selectedFolder;
      }
      return holder;
    });
  }

  // function addFile(index: number) {
  //   const fileName = prompt("Enter file name:");
  //   if (fileName) {
  //     const updatedFolders = [...folders];
  //     updatedFolders[index]?.files.push(fileName);
  //     setFolders(updatedFolders);
  //   }
  // }

  function handleDragStart(
    event: React.DragEvent<HTMLSpanElement>,
    fileName: string
  ) {
    event.dataTransfer.setData("text/plain", fileName);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    event.preventDefault();
    const fileName = event.dataTransfer.getData("text/plain");
    const updatedFolders = [...folders];
    updatedFolders[index]?.files.push(fileName);
    setFolders(updatedFolders);
  };

  return (
    <div className="flex flex-col">
      <header className="fixed left-0 top-0 z-10 w-full bg-red-700 px-4 py-2 text-white">
        <h1 className="m-0">HITES</h1>
      </header>
      <div className="mt-16 flex flex-1">
        <nav className="flex w-48 flex-col bg-gray-800 p-4 text-white">
          <ul className="m-0 list-none p-0">
            <li className="cursor-pointer p-2">Dashboard</li>
            <li className="cursor-pointer p-2">Posts</li>
            <li className="cursor-pointer p-2">Special-Class</li>
            <li className="cursor-pointer p-2 pb-64">About</li>
          </ul>
        </nav>
        <div className="flex-1 p-4">
          <h2>Bulacan State University</h2>
          <p>{/* Your content here */}</p>
          <button
            className="mb-4 cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={createFolder}
          >
            Create Folder
          </button>
          <div>
            {folders.map((folder, index) => (
              <div key={index} className="mb-4">
                <div
                  className={`${
                    folder.state === "open"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-black"
                  } cursor-pointer rounded-md px-2 py-1`}
                  onClick={() => toggleFolder(index)}
                >
                  {folder.name}
                </div>
                {folder.state === "open" && (
                  <div
                    className="ml-4 mt-2 rounded-md border-dashed border-gray-300 p-4"
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, index)}
                  >
                    {folder.files.map((file, fileIndex) => (
                      <span
                        key={fileIndex}
                        className="mr-2 inline-block cursor-move rounded-md bg-blue-500 px-2 py-1 text-white"
                        draggable
                        onDragStart={(event) => handleDragStart(event, file)}
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
