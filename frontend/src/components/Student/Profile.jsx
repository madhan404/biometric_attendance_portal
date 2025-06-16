import React from "react";

const Profile = ({ user }) => {
  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name || "N/A"}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Department:</strong> {user.department || "N/A"}</p>
    </div>
  );
};

export default Profile;
