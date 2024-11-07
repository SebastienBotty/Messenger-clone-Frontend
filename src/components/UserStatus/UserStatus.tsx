import React from "react";
import "./UserStatus.css";

function UserStatus({ status }: { status: string }) {
  return (
    <div className={`user-status`}>
      <div className={status}></div>
    </div>
  );
}

export default UserStatus;
