"use client";

import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";

const Page = () => {
  const { toast } = useToast();

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

      <Button
        onClick={() => {
          toast({
            title: "Test Toast",
            description: "This is a toast",
            variant: "destructive",
          });
        }}
      >
        Toast
      </Button>
    </MaxWidthContainer>
  );
};

export default Page;
