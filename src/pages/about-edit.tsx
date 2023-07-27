import React, { useState } from "react";

const AdminPage: React.FC = () => {
  const [content, setContent] = useState(
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id aliquet tortor, non lacinia elit. Quisque feugiat tempus felis malesuada cursus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec sit amet arcu urna. Integer tristique vel odio id luctus. Maecenas in interdum nulla. Duis sed consequat velit. Nunc vehicula sit amet lorem sed tincidunt. Vivamus sagittis euismod mi, sit amet tempus metus consectetur non. Nunc fringilla malesuada nisi tincidunt congue. Donec hendrerit arcu a massa volutpat, sed aliquet nisl blandit. Nullam lobortis quam eu ipsum egestas fermentum. Nulla consequat rhoncus justo eu vestibulum. Nullam sit amet lectus enim. Pellentesque non lobortis dolor. Fusce at libero pulvinar, sollicitudin nisi vitae, scelerisque eros.`
  );
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
    <div style={{ display: "flex" }}>
      <nav
        style={{
          backgroundColor: "#333",
          color: "#fff",
          width: "200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        {/* ... */}
      </nav>
      <div style={{ flex: 1 }}>
        <header
          style={{
            backgroundColor: "#333",
            color: "#fff",
            padding: "10px",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1,
          }}
        >
          {/* ... */}
        </header>
        <div style={{ marginTop: "60px", padding: "20px" }}>
          {isEditing ? (
            <textarea
              value={content}
              onChange={handleContentChange}
              style={{ width: "100%", minHeight: "200px" }}
            />
          ) : (
            <p>{content}</p>
          )}
          {isEditing ? (
            <button
              onClick={handleSaveClick}
              style={{
                backgroundColor: "green",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                marginTop: "10px",
              }}
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleEditClick}
              style={{
                backgroundColor: "blue",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                marginTop: "10px",
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
