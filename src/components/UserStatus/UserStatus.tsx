import "./UserStatus.css";

function UserStatus({ status }: { status: string }) {
  return (
    <div className={`user-status`}>
      <div
        className={status}
        onClick={() => {
          console.log(status);
        }}
      ></div>
    </div>
  );
}

export default UserStatus;
