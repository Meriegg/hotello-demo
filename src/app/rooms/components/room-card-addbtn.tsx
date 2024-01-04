"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CheckIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

interface Props {
  productId: string;
}

export const RoomCardAddBtn = ({ productId }: Props) => {
  const { toast } = useToast();
  const [parentRef] = useAutoAnimate<HTMLDivElement>();
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const apiUtils = api.useUtils();
  const productsInCart = api.cart.getProductIds.useQuery(undefined, {
    onSuccess: (data) => {
      if (!data?.length) {
        setIsInCart(false);
        return;
      }

      const idIdx = data?.findIndex((pid) => pid === productId);

      if (idIdx !== -1) {
        setIsInCart(true);
      } else {
        setIsInCart(false);
      }
    },
    onError: () => {
      setIsInCart(false);
    },
    retry: 0,
  });
  const addToCart = api.cart.addToCart.useMutation({
    onSuccess: (data) => {
      setIsLoading(true);
      fetch("/api/setcookie", {
        method: "POST",
        body: JSON.stringify({
          key: "cart",
          value: data.cartToken,
          verificationKey: data.cookieVerificationToken,
          args: {
            secure: false,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
          },
        }),
      })
        .then((res) => {
          setIsLoading(false);
          if (res.status === 500) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Could not add to cart.",
            });
          }

          apiUtils.cart.invalidate().catch((e) => console.error(e));
        })
        .catch((e) => {
          console.error(e);
          setIsLoading(false);
        });
    },
    retry: 0,
  });

  const buttonLoading = addToCart.isLoading || productsInCart.isLoading ||
    isLoading;

  return (
    <div ref={parentRef} className="w-full flex-1">
      {!isInCart && (
        <Button
          onClick={() => addToCart.mutate({ productId })}
          className="flex w-full items-center gap-2 font-bold"
          size="sm"
          disabled={buttonLoading}
        >
          {buttonLoading && (
            <Loader
              loaderClassName="text-white p-0"
              containerClassName="p-0 w-fit"
              labelClassName="p-0 w-0"
              label={null}
            />
          )}
          Add to cart <ShoppingCartIcon className="h-4 w-4 text-white" />
        </Button>
      )}

      {isInCart && (
        <Button
          className="flex w-full items-center gap-2 rounded-full font-bold"
          size="sm"
        >
          {addToCart.isLoading && (
            <Loader
              loaderClassName="text-white p-0"
              containerClassName="p-0 w-fit"
              labelClassName="p-0 w-0"
              label={null}
            />
          )}
          In your cart! <CheckIcon className="h-4 w-4 text-white" />
        </Button>
      )}
    </div>
  );
};
