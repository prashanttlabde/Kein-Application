This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


go though the project and setup authentication 

Feature List by Role

1. Common User

Register / Login (single flow).

Browse Reels, Live Streams, or Product Feed.

Add to Cart & Checkout (payment gateway integration).

View Order History.

Settings → “Become Influencer” / “Become Seller” toggle → verification request.

2. Influencer (after verification)

Dashboard for Reels, Contracts, and Earnings.

Upload Reels (video + caption + tagged products).

Go Live (product selection + stream key + chat + buy link).

View performance analytics (views, sales conversion).

Withdraw earnings (linked wallet).

3. Seller (after verification)

Dashboard for Products, Contracts, and Live Sessions.

Add / Edit / Remove Products.

Create Contracts with Influencers.

Host Live Sessions.

Manage Orders and Revenue.

4. Admin

Approve/Reject Influencer or Seller verification requests.

Manage Users, Products, Contracts, Orders.

Monitor Live Sessions.

Handle Payouts & Disputes.

View Platform Analytics (total sales, active users, commission earned).



User Signup/Login → single unified entry.

Settings Page: Toggle “Become Influencer / Seller.”

Verification Workflow:

Upload KYC docs → Admin review → Update verification status.

Role Activation:

Influencer → gains access to Reel and Live tabs.

Seller → gains access to Product & Contract tabs.

Contract Creation:

Seller creates a contract with influencer + product list + commission.

Reels:

Influencer uploads a video linked to product(s).

Viewer can watch and buy via overlay “Buy Now” button.

Live Streams:

Seller or Influencer goes live.

Real-time chat and product showcase below the stream.

Orders & Payment:

Checkout via Razorpay / Stripe.

Seller receives payment minus platform commission.

Influencer gets commission based on contract.

Admin Oversight:

Manage verification requests, contracts, transactions.

View platform metrics (engagement, sales, revenues).