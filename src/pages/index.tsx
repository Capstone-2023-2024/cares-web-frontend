import React from "react";

const AdminPage: React.FC = () => {
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
        <div className="flex-1 p-20 bg-gray-200 min-h-screen">
          <h2 className="mb-8">Dashboard</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-300 p-4 rounded-lg shadow-md">
              <h3 className="text-red-700">Stats 1</h3>
              <p>Some information about stats 1.</p>
            </div>
            <div className="bg-yellow-300 p-4 rounded-lg shadow-md">
              <h3 className="text-red-700">Stats 2</h3>
              <p>Some information about stats 2.</p>
            </div>
            <div className="bg-red-300 p-4 rounded-lg shadow-md">
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
