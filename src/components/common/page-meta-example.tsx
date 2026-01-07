// This is an example of how to use the metadata utility in your pages
// 
// In any page.tsx file, you can export metadata like this:
//
// import { generateMetadata } from "@/lib/metadata";
//
// export const metadata = generateMetadata({
//   title: "Dashboard",
//   description: "View your trading dashboard and portfolio",
//   keywords: "dashboard, portfolio, trading, analytics",
//   ogImage: "/dashboard-preview.png"
// });
//
// Example usage in different pages:
//
// ✅ Dashboard page: 
// export const metadata = generateMetadata({
//   title: "Dashboard",
//   description: "Your trading overview and portfolio analytics"
// });
//
// ✅ Profile page:
// export const metadata = generateMetadata({
//   title: "Profile Settings", 
//   description: "Manage your account settings and preferences"
// });
//
// ✅ Trading page:
// export const metadata = generateMetadata({
//   title: "Live Trading",
//   description: "Real-time cryptocurrency trading platform",
//   keywords: "crypto trading, live prices, bitcoin, ethereum"
// });
//
// The title will automatically become: "Dashboard | SwapHubu"
// And will include all Open Graph and Twitter meta tags!

export {}; // This makes the file a module 