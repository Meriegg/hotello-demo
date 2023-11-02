import { api } from "~/trpc/server";

const Page = async () => {
  const cartItems = await api.cart.getProducts.query();

  return (
    <div>
      <p>Checkout!</p>
      <pre>{JSON.stringify(cartItems, null, 2)}</pre>
    </div>
  );
};

export default Page;
