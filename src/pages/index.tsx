import React from "react";

const AdminPage = () => {
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
        <div className="min-h-screen flex-1 bg-gray-200 p-20">
          <h2 className="mb-8">Dashboard</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-green-300 p-4 shadow-md">
              <h3 className="text-red-700">Stats 1</h3>
              <p>Some information about stats 1.</p>
            </div>
            <div className="rounded-lg bg-yellow-300 p-4 shadow-md">
              <h3 className="text-red-700">Stats 2</h3>
              <p>Some information about stats 2.</p>
            </div>
            <div className="rounded-lg bg-red-300 p-4 shadow-md">
              <h3 className="text-red-700">Stats 3</h3>
              <p>Some information about stats 3.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
