interface Props {
  pathname: string;
}

type NavbarTheme = "light" | "dark";

export const NavbarContent = ({ pathname }: Props) => {
  const themesByRoute: { [route: string]: NavbarTheme } = {
    "/": "dark",
    "/test": "light",
  };

  const getTheme = (): NavbarTheme => {
    const routeKeys = Object.keys(themesByRoute);

    const foundRouteKey = routeKeys.find((route) => {
      const pathRegExp = new RegExp(pathname.replace("/", "\\/"), "g");

      return pathRegExp.test(route);
    }) ?? "NOT_FOUND";

    return themesByRoute[foundRouteKey] || "light";
  };

  return (
    <div className="sticky top-0 w-full h-24 bg-white">
      <p>{pathname}: {getTheme()}</p>
    </div>
  );
};
