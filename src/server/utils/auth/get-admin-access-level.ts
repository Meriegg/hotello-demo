export const getAdminAccessLevel = (accessLevelStr: string) => {
  const splitStr = accessLevelStr.split("_");
  if (splitStr.length !== 2) return null;

  const accessLevelNumber = parseInt(splitStr.at(1)!);
  if (Number.isNaN(accessLevelNumber)) return null;

  return accessLevelNumber;
};
