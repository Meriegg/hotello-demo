import { RoomsFilter } from "./filter";

export const DesktopFilter = () => {
  return (
    <div className="hidden min-h-[500px] min-w-[250px] flex-col gap-4 rounded-br-[50px] border-b-[1px] border-r-[1px] border-neutral-100 bg-white px-4 py-6 md:flex">
      <p className="w-full text-center text-xs font-semibold text-neutral-700">
        filter
      </p>
      <RoomsFilter />
    </div>
  );
};
