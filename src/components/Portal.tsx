import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  targetNode: HTMLElement;
}

export const Portal = ({ children, targetNode }: Props) => {
  return <>{createPortal(children, targetNode)}</>;
};
