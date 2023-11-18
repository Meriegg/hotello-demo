import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const Page = () => {
  return (
    <MaxWidthContainer>
      <h1 className="py-12 text-3xl font-bold">Components</h1>

      <div className="w-[350px]">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="select something" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectItem value="item2">Item 2</SelectItem>
            <SelectItem value="item3">Item 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </MaxWidthContainer>
  );
};

export default Page;
