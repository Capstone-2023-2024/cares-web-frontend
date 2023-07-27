import React, { useState } from "react";

const AdminPage: React.FC = () => {
  const [folders, setFolders] = useState<
    {
      name: string;
      isOpen: boolean;
      files: string[];
    }[]
  >([]);

  const createFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      setFolders([...folders, { name: folderName, isOpen: false, files: [] }]);
    }
  };

  const toggleFolder = (index: number) => {
    const updatedFolders = [...folders];
    updatedFolders[index].isOpen = !updatedFolders[index].isOpen;
    setFolders(updatedFolders);
  };

  const addFile = (index: number) => {
    const fileName = prompt("Enter file name:");
    if (fileName) {
      const updatedFolders = [...folders];
      updatedFolders[index].files.push(fileName);
      setFolders(updatedFolders);
    }
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLSpanElement>,
    fileName: string
  ) => {
    event.dataTransfer.setData("text/plain", fileName);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    event.preventDefault();
    const fileName = event.dataTransfer.getData("text/plain");
    const updatedFolders = [...folders];
    updatedFolders[index].files.push(fileName);
    setFolders(updatedFolders);
  };

  return (
    <div className="flex flex-col">
      <header className="bg-red-700 text-white px-4 py-2 fixed top-0 left-0 w-full z-10">
        <h1 className="m-0">HITES</h1>
      </header>
      <div className="flex flex-1 mt-16">
        <nav className="bg-gray-800 text-white w-48 p-4 flex flex-col">
          <ul className="list-none p-0 m-0">
            <li className="p-2 cursor-pointer">Dashboard</li>
            <li className="p-2 cursor-pointer">Posts</li>
            <li className="p-2 cursor-pointer">Special-Class</li>
            <li className="p-2 pb-64 cursor-pointer">About</li>
          </ul>
        </nav>
        <div className="flex-1 p-4">
          <h2>Bulacan State University</h2>
          <p>{/* Your content here */}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer mb-4"
            onClick={createFolder}
          >
            Create Folder
          </button>
          <div>
            {folders.map((folder, index) => (
              <div key={index} className="mb-4">
                <div
                  className={`${
                    folder.isOpen
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-black"
                  } px-2 py-1 rounded-md cursor-pointer`}
                  onClick={() => toggleFolder(index)}
                >
                  {folder.name}
                </div>
                {folder.isOpen && (
                  <div
                    className="ml-4 mt-2 p-4 border-dashed border-gray-300 rounded-md"
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, index)}
                  >
                    {folder.files.map((file, fileIndex) => (
                      <span
                        key={fileIndex}
                        className="inline-block bg-blue-500 text-white px-2 py-1 rounded-md mr-2 cursor-move"
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
