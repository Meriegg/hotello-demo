import * as React from "react";

interface EmailChangeProps {
  token: string;
}

export const EmailChangeEmail: React.FC<Readonly<EmailChangeProps>> = ({
  token,
}) => {
  const link = `http://localhost:3000/account/changeEmail?token=${token}`;

  return (
    <div>
      <h1>Tap on the link below to change your email</h1>
      <a href={link}>{link}</a>
    </div>
  );
};
