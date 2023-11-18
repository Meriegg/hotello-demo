"use client";

import Link from "next/link";
import { Footer } from "~/components/Footer";
import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { CheckoutItems } from "./components/checkout-items";
import { Checkoutform } from "./components/checkout-form";
import { api } from "~/trpc/react";
import { Ghost } from "lucide-react";
import { Loader } from "~/components/ui/loader";

const Page = () => {
  const cartItems = api.cart.getProducts.useQuery(undefined, {
    retry: 0,
  });

  if (cartItems.isLoading) {
    return <Loader label="Fetching items" />;
  }

  if (
    (cartItems.isError && cartItems.error.data?.code === "NOT_FOUND") ||
    !cartItems.data?.products
  ) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-8 text-center">
        <Ghost className="h-11 w-11 text-neutral-700" strokeWidth={1} />
        <p className="max-w-[450px] text-lg tracking-wide text-neutral-700">
          It looks like you don't have any items in your cart.
        </p>
        <Link
          href="/rooms"
          className="text-red-400 hover:underline text-sm font-bold"
        >
          Take a look at our rooms!
        </Link>
      </div>
    );
  }

  return (
    <>
      <MaxWidthContainer className="border-l-[1px] border-neutral-100 min-h-screen">
        <p className="text-2xl font-bold text-neutral-900 p-12">Checkout</p>

        <div className="w-full flex items-start">
          <CheckoutItems items={cartItems.data.products} />
          <Checkoutform items={cartItems.data.products} />
        </div>

        {/* <pre>{JSON.stringify(cartItems, null, 2)}</pre> */}
      </MaxWidthContainer>
      <Footer theme="light" />
    </>
  );
};

export default Page;
