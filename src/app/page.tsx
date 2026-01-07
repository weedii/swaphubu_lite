import { generateMetadata } from "@/lib/metadata";
import LandingPage from "./landing-page/page";

export const metadata = generateMetadata({
  title: "Home",
  description:
    "SwapHubu - Seamless fiat to crypto exchange. Buy and sell cryptocurrencies instantly with the best rates.",
  keywords:
    "crypto exchange, buy bitcoin, sell crypto, fiat to crypto, exchange platform",
});

export default function Home() {
  return <LandingPage />;
}
