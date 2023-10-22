import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  targetNode: HTMLElement;
}

export const Portal = ({ children, targetNode }: Props) => {
  if (typeof document === "undefined") {
    return children;
  }

  return (
    <>
      {createPortal(children, targetNode)}
    </>
  );
};
