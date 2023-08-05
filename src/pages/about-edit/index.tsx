import React, { useState } from "react";

const AdminPage = () => {
  const [content, setContent] = useState("PLACEHOLDER");
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div>
      <nav>{/* ... */}</nav>
      <div>
        <header>{/* ... */}</header>
        <div>
          {isEditing ? (
            <textarea value={content} onChange={handleContentChange} />
          ) : (
            <p>{content}</p>
          )}
          {isEditing ? (
            <button onClick={handleSaveClick}>Save</button>
          ) : (
            <button onClick={handleEditClick}>Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
