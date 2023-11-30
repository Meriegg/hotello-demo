import * as React from "react";

interface VerificationCodeProps {
  code: string;
}

export const VerificationCode: React.FC<Readonly<VerificationCodeProps>> = ({
  code,
}) => (
  <div>
    <h1>Your verification code is: {code}</h1>
  </div>
);
