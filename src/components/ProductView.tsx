import Image from "next/image";
import Link from "next/link";
import { RouterOutputs } from "~/utils/api";

type ProductProps = RouterOutputs["products"]["getAll"][number];

export const ProductView = (props: ProductProps) => {
  const { id, name, description, imageUrl } = props;
  return (
    <div key={id}>
      <p> {name}</p>
      <p> {description}</p>
      <p> {imageUrl}</p>
    </div>
  );
};
